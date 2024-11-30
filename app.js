// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "christmas-wishlist-e4d46.firebaseapp.com",
    projectId: "christmas-wishlist-e4d46",
    storageBucket: "christmas-wishlist-e4d46.appspot.com", // Corrected
    messagingSenderId: "74340929706",
    appId: "1:74340929706:web:d53d686bc7d85212d980d3",
    measurementId: "G-P71EZG24QD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ensure the DOM is fully loaded before running the script
window.addEventListener('DOMContentLoaded', () => {
    // Get references to your form and list elements
    const dataForm = document.getElementById('dataForm');
    const dataList = document.getElementById('dataList');

    // Submit data to Firestore
    dataForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('nameInput').value.trim();
        const wishInput = document.getElementById('wishInput').value.trim();
        const priceInput = document.getElementById('priceInput').value.trim();
        const urlInput = document.getElementById('urlInput').value.trim();

        if (!nameInput || !wishInput) {
            alert("Bitte Name und Wunsch eingeben");
            return;
        }

        // Optional: Validate URL if provided
        if (urlInput) {
            try {
                new URL(urlInput);
            } catch (_) {
                alert("Bitte eine gültige URL eingeben oder das Feld leer lassen");
                return;
            }
        }

        const data = {
            name: nameInput,
            content: wishInput,
            timestamp: serverTimestamp(),
            reserved: false // Initialize reserved status as false
        };
        if (priceInput) {
            data.price = priceInput;
        }
        if (urlInput) {
            data.url = urlInput;
        }

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
        snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const li = document.createElement('li');

            let content = `<strong>${data.name}</strong>: ${data.content}`;
            if (data.price !== undefined && data.price !== '') {
                content += ` - CHF ${data.price}`;
            }
            if (data.url) {
                content += ` - <a href="${data.url}" target="_blank">Link</a>`;
            }

            li.innerHTML = content;

            const reserveButton = document.createElement('button');
            reserveButton.textContent = "Reservieren";
            reserveButton.style.marginLeft = "10px";

            // Message element
            const messageSpan = document.createElement('span');
            messageSpan.style.marginLeft = "10px";

            // Handle Reserve button click
            reserveButton.addEventListener('click', async () => {
                const wishReference = doc(db, 'sharedData', docSnapshot.id);
                try {
                    await runTransaction(db, async (transaction) => {
                        const wishDoc = await transaction.get(wishReference);
                        if (!wishDoc.exists()) {
                            throw "Document does not exist!";
                        }
                        const currentReserved = wishDoc.data().reserved;
                        if (!currentReserved) {
                            // Update the reserved status to true
                            transaction.update(wishReference, { reserved: true });
                            messageSpan.textContent = "Du hast den Wunsch reserviert!";
                            messageSpan.style.color = "green";
                        } else {
                            messageSpan.textContent = "Der Wunsch ist bereits reserviert!";
                            messageSpan.style.color = "red";
                        }
                    });
                } catch (error) {
                    console.error("Transaction failed: ", error);
                    messageSpan.textContent = "Fehler beim Reservieren!";
                    messageSpan.style.color = "red";
                }
            });

            // Remove button disabling logic
            // The button remains enabled even if the wish is reserved

            // Do not set messageSpan content in onSnapshot callback

            // Append button and message to the list item
            li.appendChild(reserveButton);
            li.appendChild(messageSpan);

            dataList.appendChild(li);
        });
    });
});
