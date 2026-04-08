import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const COLLECTION = "usuarios";

// GET
export const getUsuarios = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// CREATE
export const createUsuario = async (data) => {
  return await addDoc(collection(db, COLLECTION), data);
};

// UPDATE
export const updateUsuario = async (id, data) => {
  return await updateDoc(doc(db, COLLECTION, id), data);
};

// DELETE
export const deleteUsuario = async (id) => {
  return await deleteDoc(doc(db, COLLECTION, id));
};
