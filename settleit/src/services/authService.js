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
        console.log(`[authService] Registering user: ${email}`)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        console.log(`[authService] Setting display name: ${name}`)
        await updateProfile(user, { displayName: name })

        // Create user document in Firestore
        if (db) {
            console.log(`[authService] Creating Firestore user document for: ${user.uid}`)
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                photoURL: user.photoURL || null,
                createdAt: new Date().toISOString()
            })
        }

        console.log(`[authService] Registration complete for: ${user.uid}`)
        return user
    },

    async login(email, password) {
        if (!auth) throw new Error("Firebase Auth not initialized. Check your config in firebase.js")
        console.log(`[authService] Logging in user: ${email}`)
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log(`[authService] Login successful for: ${userCredential.user.uid}`)
        return userCredential.user
    },

    async logout() {
        if (!auth) return
        console.log(`[authService] Logging out user`)
        await signOut(auth)
        console.log(`[authService] Logout successful`)
    },

    onAuthStateChanged(callback) {
        if (!auth) {
            console.warn("Firebase Auth not initialized. Authentication will not work.")
            return () => { } // Return dummy unsubscribe
        }
        return onAuthStateChanged(auth, callback)
    },

    async updateUserProfile(name) {
        if (!auth || !auth.currentUser) throw new Error("No user logged in")
        console.log(`[authService] Updating profile name to: ${name}`)
        await updateProfile(auth.currentUser, { displayName: name })

        if (db) {
            console.log(`[authService] Updating Firestore user document for: ${auth.currentUser.uid}`)
            const userRef = doc(db, 'users', auth.currentUser.uid)
            await setDoc(userRef, { displayName: name }, { merge: true })
        }
        console.log(`[authService] Profile update successful`)
    }
}
