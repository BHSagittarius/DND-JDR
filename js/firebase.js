import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, collection, onSnapshot, setDoc, addDoc, deleteDoc, updateDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, MJ_EMAIL } from "./config.js";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { MJ_EMAIL, doc, collection, onSnapshot, setDoc, addDoc, deleteDoc, updateDoc, getDoc,
  signInWithEmailAndPassword, signOut, onAuthStateChanged };

// Abonnement à une collection : renvoie [{id, ...data}]
export const watchCol = (name, cb) =>
  onSnapshot(collection(db, name), s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
export const watchDoc = (path, cb) =>
  onSnapshot(doc(db, ...path.split("/")), s => cb(s.exists() ? s.data() : {}));
export const saveDoc = (path, data) => setDoc(doc(db, ...path.split("/")), data, { merge: true });
export const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
