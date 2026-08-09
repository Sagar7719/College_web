import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset } from '@/types';

const COLLECTION_NAME = 'media';

export const mediaService = {
  async getAll(): Promise<MediaAsset[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MediaAsset));
      // Sort in-memory to ensure documents without createdAt are never omitted by Firestore index
      return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch (err) {
      console.error('Firestore media fetch error:', err);
      throw err;
    }
  },

  async getByType(type: 'image' | 'document' | 'raw'): Promise<MediaAsset[]> {
    try {
      const all = await this.getAll();
      return all.filter((item) => {
        if (type === 'image') {
          return item.resourceType === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(item.format?.toLowerCase());
        }
        if (type === 'document') {
          return item.resourceType === 'document' || ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(item.format?.toLowerCase());
        }
        return item.resourceType === type;
      });
    } catch (err) {
      console.error(`Firestore media fetch error for type ${type}:`, err);
      return [];
    }
  },

  async saveMediaAsset(asset: Partial<MediaAsset> & { url: string; fileName: string }): Promise<string> {
    const id = asset.id || doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();

    const payload: Record<string, unknown> = {
      id,
      publicId: asset.publicId || `media_${id}`,
      resourceType: asset.resourceType || 'image',
      url: asset.url,
      secureUrl: asset.secureUrl || asset.url,
      format: asset.format || 'jpg',
      bytes: asset.bytes || 1024,
      fileName: asset.fileName,
      originalName: asset.originalName || asset.fileName,
      altText: asset.altText || '',
      caption: asset.caption || '',
      createdAt: asset.createdAt || now,
      uploadedBy: asset.uploadedBy || 'Admin',
    };

    if (asset.width !== undefined) payload.width = asset.width;
    if (asset.height !== undefined) payload.height = asset.height;

    await setDoc(doc(db, COLLECTION_NAME, id), payload, { merge: true });
    return id;
  },

  async updateMetadata(id: string, altText: string, caption?: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      altText,
      caption: caption || '',
    });
  },

  async deleteMediaAsset(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  },
};
