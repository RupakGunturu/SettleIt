import { auth, db } from '../firebase'
import {
    collection,
    doc,
    setDoc
} from 'firebase/firestore'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'

export const authService = {
    async register(email, password, name) {
        if (!auth) throw new Error("Firebase Auth not initialized. Check your config in firebase.js")
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        await updateProfile(user, { displayName: name })

        // Create user document in Firestore
        if (db) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                photoURL: user.photoURL || null,
                createdAt: new Date().toISOString()
            })
        }

        return user
    },

    async login(email, password) {
        if (!auth) throw new Error("Firebase Auth not initialized. Check your config in firebase.js")
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user
    },

    async logout() {
        if (!auth) return
        await signOut(auth)
    },

    onAuthStateChanged(callback) {
        if (!auth) {
            console.warn("Firebase Auth not initialized. Authentication will not work.")
            return () => { } // Return dummy unsubscribe
        }
        return onAuthStateChanged(auth, callback)
    }
}
