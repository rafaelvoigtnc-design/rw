import { getDoc, doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function getAdminByEmail(email: string) {
  const q = query(collection(db, 'admins'), where('email', '==', email));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function createAdminRecord(data: any) {
  const docRef = doc(collection(db, 'admins'), data.id);
  await setDoc(docRef, data);
  return { id: data.id, ...data };
}
