import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  Timestamp,
  getFirestore,
  getDocs,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteField,
  getDoc,
  where,
  query,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDepG6dD1B4bOCoMqsdZN-qskzl93bp3MM",
  authDomain: "lumbarlordosis-9b9e5.firebaseapp.com",
  projectId: "lumbarlordosis-9b9e5",
  storageBucket: "lumbarlordosis-9b9e5.appspot.com",
  messagingSenderId: "153642057096",
  appId: "1:153642057096:web:37d2d89eff9886acb80e3d",
  measurementId: "G-YQLNERJ40V",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage();
// Create a storage reference from our storage service
const storageRef = ref(storage);

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const logout = () => {
  signOut(auth);
};
export {
  auth,
  db,
  logInWithEmailAndPassword,
  sendPasswordReset,
  logout,
  storageRef,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  getStorage,
  ref,
  getDownloadURL,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  where,
  query,
};
