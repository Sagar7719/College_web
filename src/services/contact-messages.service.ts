import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { sanitizeForFirestore } from '@/lib/firestore-utils';
import { ContactMessage, ContactMessageStatus } from '@/types';

const COLLECTION_NAME = 'contactMessages';

export const contactMessagesService = {
  /** Create a new contact message document in Firestore */
  create: async (data: { name: string; email: string; subject: string; message: string }): Promise<string> => {
    const id = doc(collection(db, COLLECTION_NAME)).id;
    const now = new Date().toISOString();
    const payload: ContactMessage = {
      id,
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, COLLECTION_NAME, id), sanitizeForFirestore(payload));
    return id;
  },

  /** Fetch all contact messages ordered by creation timestamp descending */
  getAll: async (): Promise<ContactMessage[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as ContactMessage));
    } catch (err) {
      console.warn(`Firestore ${COLLECTION_NAME} query warning:`, err);
      return [];
    }
  },

  /** Update message status (e.g. new -> read -> replied -> archived) */
  updateStatus: async (id: string, status: ContactMessageStatus): Promise<void> => {
    const now = new Date().toISOString();
    await updateDoc(doc(db, COLLECTION_NAME, id), sanitizeForFirestore({ status, updatedAt: now }));
  },

  /** Delete a contact message by ID */
  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },
};
