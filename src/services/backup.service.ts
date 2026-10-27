import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sanitizeForFirestore } from '@/lib/firestore-utils';

export interface BackupManifest {
  schemaVersion: string;
  timestamp: string;
  collegeName?: string;
  totalRecords: number;
  collections: Record<string, Record<string, unknown>[]>;
}

export interface BackupValidationResult {
  valid: boolean;
  manifest?: BackupManifest;
  error?: string;
}

const ALL_COLLECTIONS = [
  'site_settings',
  'navigation',
  'pages',
  'departments',
  'courses',
  'faculty',
  'notices',
  'news',
  'events',
  'gallery',
  'downloads',
  'contact_messages',
];

export const backupService = {
  /**
   * Generates a full database backup manifest containing records from all collections.
   */
  async createFullBackup(collegeName?: string): Promise<BackupManifest> {
    const collectionsData: Record<string, Record<string, unknown>[]> = {};
    let totalRecords = 0;

    for (const colName of ALL_COLLECTIONS) {
      try {
        const snap = await getDocs(collection(db, colName));
        const docsData = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        collectionsData[colName] = docsData;
        totalRecords += docsData.length;
      } catch (err) {
        console.warn(`Backup warning fetching collection ${colName}:`, err);
        collectionsData[colName] = [];
      }
    }

    return {
      schemaVersion: '2.0',
      timestamp: new Date().toISOString(),
      collegeName: collegeName || 'Shivaji University, Kolhapur',
      totalRecords,
      collections: collectionsData,
    };
  },

  /**
   * Generates a selective backup for chosen CMS collections.
   */
  async createModuleBackup(selectedCollections: string[], collegeName?: string): Promise<BackupManifest> {
    const collectionsData: Record<string, Record<string, unknown>[]> = {};
    let totalRecords = 0;

    for (const colName of selectedCollections) {
      try {
        const snap = await getDocs(collection(db, colName));
        const docsData = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        collectionsData[colName] = docsData;
        totalRecords += docsData.length;
      } catch (err) {
        console.warn(`Selective backup warning fetching ${colName}:`, err);
        collectionsData[colName] = [];
      }
    }

    return {
      schemaVersion: '2.0',
      timestamp: new Date().toISOString(),
      collegeName: collegeName || 'Shivaji University, Kolhapur',
      totalRecords,
      collections: collectionsData,
    };
  },

  /**
   * Validates uploaded backup JSON file structure and schema.
   */
  validateBackupManifest(jsonContent: string): BackupValidationResult {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Invalid JSON file structure.' };
      }

      if (!parsed.schemaVersion || !parsed.collections || typeof parsed.collections !== 'object') {
        return { valid: false, error: 'File is not a valid College CMS backup manifest.' };
      }

      return {
        valid: true,
        manifest: parsed as BackupManifest,
      };
    } catch (err) {
      return { valid: false, error: 'Malformed JSON content. Unable to parse file.' };
    }
  },

  /**
   * Restores Firestore database records from a validated BackupManifest.
   * Uses chunked writeBatch (up to 400 operations per batch for Firestore safety).
   */
  async restoreBackup(
    manifest: BackupManifest,
    selectedCollections?: string[]
  ): Promise<{ success: boolean; restoredCount: number }> {
    const collectionsToRestore = selectedCollections && selectedCollections.length > 0
      ? selectedCollections
      : Object.keys(manifest.collections);

    let restoredCount = 0;

    for (const colName of collectionsToRestore) {
      const records = manifest.collections[colName];
      if (!records || !Array.isArray(records)) continue;

      // Process in batches of 400
      const BATCH_SIZE = 400;
      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const chunk = records.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        for (const item of chunk) {
          const docId = (item.id as string) || doc(collection(db, colName)).id;
          const payload = { ...item };
          delete payload.id; // Keep Firestore document ID separate
          const sanitized = sanitizeForFirestore(payload);
          const docRef = doc(db, colName, docId);
          batch.set(docRef, sanitized, { merge: true });
          restoredCount++;
        }

        await batch.commit();
      }
    }

    return { success: true, restoredCount };
  },
};
