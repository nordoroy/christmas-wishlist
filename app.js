import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, runTransaction } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";


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
    const wishInput = document.getElementById('wishInput').value.trim();
    const priceInput = document.getElementById('priceInput').value.trim();
    const urlInput = document.getElementById('urlInput').value.trim();
    if (!nameInput || !wishInput) {
        alert("Bitte Name und Wunsch eingeben");
        return;
    }
    if (urlInput) {
        // Simple URL validation
        const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR IP (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

        if (!urlPattern.test(urlInput)) {
            alert("Bitte eine gültige URL eingeben oder das Feld leer lassen");
            return;
        }
    }
    const data = {
        name: nameInput,
        content: wishInput,
        timestamp: serverTimestamp(),
        reserved: false
    };
    if (priceInput) {
        data.price = priceInput;
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
        if(data.price !== undefined && data.price !== '') {
            content += ` - CHF ${data.price}`;
        }
        if(data.url) {
            content += ` - <a href="${data.url}" target="_blank">Link</a>`;
        }

        li.innerHTML = content;

        const reserveButton = document.createElement('button');
        reserveButton.textContent = "Reservieren";
        reserveButton.style.marginLeft = "10px";

        //Message element
        const messageSpan = document.createElement('span');
        messageSpan.style.marginLeft = "10px";

        //handle Reserve button click
        reserveButton.addEventListener('click', async () => {
            const wishReference = doc(db, 'sharedData', doc.id);
            try {
                await runTransaction(db, async (transaction) => {
                    const wishDoc = await transaction.get(wishReference);
                    if (!wishDoc.exists()) {
                        throw "Document does not exist!";
                    }
                    const currentReserved = wishDoc.data().reserved;
                    if (!currentReserved) {
                        transaction.update(wishReference, {reserved: true});
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

        //disable button if already reserved
        if (data.reserved) {
            reserveButton.disabled = true;
            messageSpan.textContent = "Der Wunsch ist bereits reserviert!";
            messageSpan.style.color = "red";
        }
        //Append button and message to the list item
        li.appendChild(reserveButton);
        li.appendChild(messageSpan);
    
        dataList.appendChild(li);
    });
});