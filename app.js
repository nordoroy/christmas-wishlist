import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";


// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAjk9lfkW2Pt2K38fRvTyZKNzIyFY2M0O4",
  authDomain: "christmas-wishlist-e4d46.firebaseapp.com",
  projectId: "christmas-wishlist-e4d46",
  storageBucket: "christmas-wishlist-e4d46.firebasestorage.app",
  messagingSenderId: "74340929706",
  appId: "1:74340929706:web:d53d686bc7d85212d980d3",
  measurementId: "G-P71EZG24QD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get references to your form and list elements
const dataForm = document.getElementById('dataForm');
const dataList = document.getElementById('dataList');

// Submit data to Firestore
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('nameInput').value.trim();
    const stringInput = document.getElementById('wishInput').value.trim();
    const urlInput = document.getElementById('urlInput').value.trim();
    if (!nameInput || !stringInput) {
        alert("Bitte Name und Wunsch eingeben");
        return;
    }
    const data = {
        name: nameInput,
        content: wishInput,
        timestamp: serverTimestamp()
    };
    if (urlInput) {
        data.url = urlInput;
    };
    try {
        await addDoc(collection(db, 'sharedData'), data);
        dataForm.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});

// Retrieve and display data in real-time
const q = query(collection(db, 'sharedData'), orderBy('timestamp', 'desc'));
onSnapshot(q, (snapshot) => {
    dataList.innerHTML = '';
    snapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');

        let content = `<strong>${data.name}</strong>: ${data.content}`;
        if(data.url) {
            content += ` - <a href="${data.url}" target="_blank">Link</a>`;
        }

        li.innerHTML = content;
        dataList.appendChild(li);
    });
});