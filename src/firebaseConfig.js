import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDa-pkfi2f5P74pXNcvcvRZ9PLi9LmTfhA",
  authDomain: "flamesandburns-aec19.firebaseapp.com",
  databaseURL: "https://flamesandburns-aec19-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "flamesandburns-aec19",
  storageBucket: "flamesandburns-aec19.appspot.com",
  messagingSenderId: "562522488875",
  appId: "1:562522488875:web:45d472459ef9b7766f6a6e",
  measurementId: "G-X1FYN2L39H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
