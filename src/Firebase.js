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
  apiKey: "AIzaSyDVqVB44kzktqwetedzTDFHAmseS5I2860",
  authDomain: "lumbarlordosis-7cd2e.firebaseapp.com",
  projectId: "lumbarlordosis-7cd2e",
  storageBucket: "lumbarlordosis-7cd2e.appspot.com",
  messagingSenderId: "222234504555",
  appId: "1:222234504555:web:9d32fd6285cd4f171ab02e",
  measurementId: "G-ES7TVCEZLP",
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
