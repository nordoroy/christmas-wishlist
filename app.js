// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyAjk9lfkW2Pt2K38fRvTyZKNzIyFY2M0O4",

  authDomain: "christmas-wishlist-e4d46.firebaseapp.com",

  projectId: "christmas-wishlist-e4d46",

  storageBucket: "christmas-wishlist-e4d46.firebasestorage.app",

  messagingSenderId: "74340929706",

  appId: "1:74340929706:web:d53d686bc7d85212d980d3",

  measurementId: "G-P71EZG24QD"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');

// Submit data to Firestore
dataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userInput = document.getElementById('userInput').value;
    db.collection('sharedData').add({
        content: userInput,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        dataForm.reset();
    });
});

// Retrieve and display data in real-time
db.collection('sharedData').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
    dataList.innerHTML = '';
    snapshot.forEach((doc) => {
        const li = document.createElement('li');
        li.textContent = doc.data().content;
        dataList.appendChild(li);
    });
});