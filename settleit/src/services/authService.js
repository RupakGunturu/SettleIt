import { auth } from '../firebase'
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
        await updateProfile(userCredential.user, { displayName: name })
        return userCredential.user
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
