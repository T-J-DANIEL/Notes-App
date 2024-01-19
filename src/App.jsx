import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import { notesCollection, db } from "./firebase"

// On snapshot keeps “one source of truth” in the database and keeps in sync with our local data
// It listens for changes in the firestore database and lets us act accordingly in local code
//so for example when we send a delete request to database our onSnapshot event listener which is running will then react to this by updating the data in our local code. and if it fails then our local data is not updated
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore"

export default function App() {
  const [notes, setNotes] = React.useState([])
  const [currentNoteId, setCurrentNoteId] = React.useState("")
  //this is used for debounce
  const [tempNoteText, setTempNoteText] = React.useState("")

  const currentNote =
    notes.find((note) => note.id === currentNoteId) || notes[0]
  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)
  React.useEffect(() => {
    //onSnapshot listens for changes to notes collection and calls function when changes occur and supplyu snapshot data to it
    //websocket listener with firebase
    const unsubscribe = onSnapshot(notesCollection, function (snapshot) {
      // Sync up our local notes array with the snapshot data
      //take snapshot and rearrange the shape of data (its diffrent in our databse to how we want)
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      setNotes(notesArr)
    })
    //snpashot returns a clean up function
    // we return this function to unsubscrinbe and clean up sideeffect
    return unsubscribe
  }, [])
  React.useEffect(() => {
    //anytime my notes array changes check if theres is no current note id set it to the first note
    if (!currentNoteId) {
      setCurrentNoteId(notes[0]?.id)
    }
  }, [notes])
  React.useEffect(() => {
    if (currentNote) {
      setTempNoteText(currentNote.body)
    }
  }, [currentNote])

  React.useEffect(() => {
    /**
      runs any time the tempNoteText changes
     * Delay the sending of the request to Firebase
     *  uses setTimeout
     * use clearTimeout to cancel the timeout
     */
    //The cleanup function is called when useEffect is called again or on unmount.
    const timeoutId = setTimeout(() => {
      //stops simply selecting a note triggering a updated
      if (tempNoteText !== currentNote.body) {
        updateNote(tempNoteText)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [tempNoteText])

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    //addDOc pushes new doc to firestore, it returns a promise which resolves a ref to the new note id
    const newNoteRef = await addDoc(notesCollection, newNote)

    setCurrentNoteId(newNoteRef.id)
  }

  async function updateNote(text) {
    //we just need to push updates to firestore and our firestore snapshot listener will react
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true })
    //old code:
    // setNotes((oldNotes) => {
    //   const newArray = []
    //   for (let i = 0; i < oldNotes.length; i++) {
    //     const oldNote = oldNotes[i]
    //     if (oldNote.id === currentNoteId) {
    //       // Put the most recently-modified note at the top
    //       newArray.unshift({ ...oldNote, body: text })
    //     } else {
    //       newArray.push(oldNote)
    //     }
    //   }
    //   return newArray
    // })
  }

  async function deleteNote(noteId) {
    //doc gets a reference to a document (we want to delete) inside of a collection in firestore
    //we pass it the databse, name of collection and and id of document top delete
    const docRef = doc(db, "notes", noteId)
    await deleteDoc(docRef)
  }
  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar
            notes={sortedNotes}
            currentNote={currentNote}
            setCurrentNoteId={setCurrentNoteId}
            newNote={createNewNote}
            deleteNote={deleteNote}
          />
          <Editor
            tempNoteText={tempNoteText}
            setTempNoteText={setTempNoteText}
          />
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  )
}
