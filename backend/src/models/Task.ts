import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const tasksCollection = collection(db, 'tasks');

export const createTask = async (taskData: any) => {
  const docRef = await addDoc(tasksCollection, taskData);
  return { id: docRef.id, ...taskData };
};

export const getTasks = async () => {
  const querySnapshot = await getDocs(tasksCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTaskById = async (id: string) => {
  const docRef = doc(db, 'tasks', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error('Task not found');
  }
};

export const updateTask = async (id: string, updates: any) => {
  const docRef = doc(db, 'tasks', id);
  await updateDoc(docRef, updates);
  return { id, ...updates };
};

export const deleteTask = async (id: string) => {
  const docRef = doc(db, 'tasks', id);
  await deleteDoc(docRef);
};