import firebase from 'firebase'

const firebaseConfig = {
  apiKey: process.env.VUE_FIRESTORE_API_KEY,
  authDomain: "lets-split-35ac6.firebaseapp.com",
  databaseURL: "https://lets-split-35ac6-default-rtdb.firebaseio.com",
  projectId: "lets-split-35ac6",
  storageBucket: "lets-split-35ac6.appspot.com",
  messagingSenderId: "29822952989",
  appId: "1:29822952989:web:f51a0aa5b6ccc20b4248f4"
}

firebase.initializeApp(firebaseConfig)
const db = firebase.firestore()

export default db;
