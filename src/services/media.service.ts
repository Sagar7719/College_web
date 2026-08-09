import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MediaAsset } from '@/types';

const COLLECTION_NAME = 'media';

export const mediaService = {
  async getAll(): Promise<MediaAsset[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MediaAsset));
    } catch (err) {
      console.warn('Firestore media fetch warning:', err);
      return [];
    }
  },

  async getByType(type: 'image' | 'document' | 'raw'): Promise<MediaAsset[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('resourceType', '==', type),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MediaAsset));
    } catch (err) {
      console.warn(`Firestore media fetch warning for type ${type}:`, err);
      return [];
    }
  },

  async saveMediaAsset(asset: Partial<MediaAsset> & { url: string; fileName: string }): Promise<string> {
    const id = asset.id || doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();

    const payload: MediaAsset = {
      id,
      publicId: asset.publicId || `media_${id}`,
      resourceType: asset.resourceType || 'image',
      url: asset.url,
      secureUrl: asset.secureUrl || asset.url,
      format: asset.format || 'jpg',
      bytes: asset.bytes || 1024,
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
      originalName: asset.originalName || asset.fileName,
      altText: asset.altText || '',
      caption: asset.caption || '',
      createdAt: asset.createdAt || now,
      uploadedBy: asset.uploadedBy || 'Admin',
    };

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
