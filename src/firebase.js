// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//(firebase contains multiple services we are accessing these alone from the firestore service)
import { getFirestore, collection } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC52UyKM7sEwWtK6IdrGgQWp-6KV0Ntugo",
  authDomain: "notes-b67bb.firebaseapp.com",
  projectId: "notes-b67bb",
  storageBucket: "notes-b67bb.appspot.com",
  messagingSenderId: "61990352949",
  appId: "1:61990352949:web:997070107e8d156700597c",
}

// Initialize Firebase
    //reference to app in firebase 
const app = initializeApp(firebaseConfig)
//we pass the app we initialised above and it returns an instance of database we call db
export const db = getFirestore(app)
//we get access to our notes collection in our database by supplying the database and name of collection
export const notesCollection = collection(db, "notes")
