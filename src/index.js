import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import UploadImage from "./components/UploadImage.js";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOmIaWjaNtgOoeIzum1ZGU6eIijaZweco",
  authDomain: "segment-c7428.firebaseapp.com",
  projectId: "segment-c7428",
  storageBucket: "segment-c7428.appspot.com",
  messagingSenderId: "915624438241",
  appId: "1:915624438241:web:9800bdd6a6bb842d7d8aa0",
  measurementId: "G-CQTRYQE1YM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const Scan = () => {
  return <UploadImage />;
};

ReactDOM.render(<Scan />, document.getElementById("root"));
