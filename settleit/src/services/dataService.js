import { db } from '../firebase'
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    onSnapshot,
    orderBy,
    limit,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore'

export const dataService = {
    // Real-time Subscriptions
    subscribeGroups(userId, callback) {
        if (!db) return () => { }
        console.log(`[dataService] Subscribing to groups for user: ${userId}`)
        const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId))
        return onSnapshot(q, (snapshot) => {
            const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            console.log(`[dataService] Received ${groups.length} groups update`)
            callback(groups)
        }, (err) => {
            console.error('[dataService] Firestore Subscribe Groups Error:', err)
        })
    },

    subscribeExpenses(groupId, callback) {
        if (!db) return () => { }
        console.log(`[dataService] Subscribing to expenses for group: ${groupId}`)
        const q = query(collection(db, 'expenses'), where('groupId', '==', groupId))
        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            console.log(`[dataService] Received ${expenses.length} expenses update`)
            callback(expenses)
        })
    },

    subscribeActivity(userId, callback) {
        if (!db) return () => { }
        const q = query(
            collection(db, 'activity'),
            where('involvedUserIds', 'array-contains', userId),
            orderBy('timestamp', 'desc'),
            limit(100)
        )
        return onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            callback(activities)
        }, (err) => {
            if (err.code === 'failed-precondition') {
                window.dispatchEvent(new CustomEvent('firestore-error', {
                    detail: 'Please create the required Firestore index via the link in console.'
                }))
            }
        })
    },

    subscribeFriends(userId, callback) {
        if (!db) return () => { }
        const q = query(collection(db, 'friends'), where('userId', '==', userId))
        return onSnapshot(q, (snapshot) => {
            const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            callback(friends)
        })
    },

    async addFriend(userId, friendUser) {
        if (!db) return
        console.log(`[dataService] Adding friend: ${friendUser.email} for user: ${userId}`)
        const friendData = {
            userId,
            friendId: friendUser.id || friendUser.uid,
            name: friendUser.displayName || friendUser.name,
            email: friendUser.email,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            addedAt: serverTimestamp()
        }
        await addDoc(collection(db, 'friends'), friendData)
        console.log(`[dataService] Friend added successfully`)
    },

    async searchAllExpenses(userId, queryText) {
        if (!db) return []
        // In real firestore, we'd need a more complex query or multiple queries
        // For this demo/app, we'll fetch all expenses for groups user is in
        const groups = await this.getGroups(userId)
        const groupIds = groups.map(g => g.id)

        const q = query(collection(db, 'expenses'), where('groupId', 'in', groupIds))
        const snapshot = await getDocs(q)
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(e => e.description.toLowerCase().includes(queryText.toLowerCase()))
    },

    subscribeAllExpenses(userId, callback) {
        if (!db) return () => { }
        const q = query(
            collection(db, 'expenses'),
            where('involvedUserIds', 'array-contains', userId),
            orderBy('date', 'desc')
        )
        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            callback(expenses)
        })
    },

    async logActivity(activityData) {
        if (!db) return
        console.log(`[dataService] Logging activity: ${activityData.type}`, activityData)
        await addDoc(collection(db, 'activity'), {
            ...activityData,
            timestamp: serverTimestamp()
        })
        console.log(`[dataService] Activity logged`)
    },
    // Groups
    async getGroups(userId) {
        if (!db) return [
            {
                id: '1',
                name: 'Circle 2024',
                description: 'Expenses for the gang',
                members: [
                    { id: 'guest_user', name: 'You (Guest)', color: '#6366f1' },
                    { id: 'u2', name: 'Yth Rizal', color: '#ec4899' },
                    { id: 'u3', name: 'Bayu Sas', color: '#22c55e' },
                    { id: 'u4', name: 'Lina Punk', color: '#f59e0b' }
                ],
                totalSpent: 1453035,
                currency: 'INR'
            }
        ]
        const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },

    async createGroup(groupData) {
        if (!db) return { id: Date.now().toString(), ...groupData }
        console.log(`[dataService] Creating group: ${groupData.name}`)
        const docRef = await addDoc(collection(db, 'groups'), groupData)
        console.log(`[dataService] Group created with ID: ${docRef.id}`)
        return { id: docRef.id, ...groupData }
    },

    // Expenses
    async getExpenses(groupId) {
        if (!db) return [
            {
                id: 'e1',
                groupId: '1',
                description: 'Ngopi ever',
                amount: 1453035,
                paidBy: 'u2',
                date: '2023-12-16',
                category: 'Coffee',
                splitMethod: 'equal',
                status: '20% Paid'
            },
            {
                id: 'e2',
                groupId: '1',
                description: 'Pizza time',
                amount: 250750,
                paidBy: 'u4',
                date: '2023-12-12',
                category: 'Food',
                splitMethod: 'equal',
                status: '20% Paid'
            },
            {
                id: 'e3',
                groupId: '1',
                description: 'Spotify Family',
                amount: 567000,
                paidBy: 'guest_user',
                date: '2023-12-02',
                category: 'Music',
                splitMethod: 'all',
                status: '100% Paid'
            }
        ]
        const q = query(collection(db, 'expenses'), where('groupId', '==', groupId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },

    async addExpense(expenseData) {
        if (!db) return { id: Date.now().toString(), ...expenseData }
        console.log(`[dataService] Adding expense: ${expenseData.description}`, expenseData)
        const docRef = await addDoc(collection(db, 'expenses'), expenseData)
        console.log(`[dataService] Expense added with ID: ${docRef.id}`)
        return { id: docRef.id, ...expenseData }
    },

    async updateExpense(expenseId, expenseData) {
        if (!db) return expenseData
        const docRef = doc(db, 'expenses', expenseId)
        await updateDoc(docRef, expenseData)
        return { id: expenseId, ...expenseData }
    },

    async deleteExpense(expenseId) {
        if (!db) return
        const docRef = doc(db, 'expenses', expenseId)
        // Note: For real firebase, use deleteDoc(docRef)
        // But updateDoc with status: 'deleted' is safer for history
        await updateDoc(docRef, { deleted: true })
    },

    // Member Management
    async findUserByEmail(email) {
        if (!db) return null
        const q = query(collection(db, 'users'), where('email', '==', email))
        const snapshot = await getDocs(q)
        if (snapshot.empty) return null
        const userDoc = snapshot.docs[0]
        return { id: userDoc.id, ...userDoc.data() }
    },

    async addMemberToGroup(groupId, userObj) {
        // Handled via updateGroup now
    },

    async updateGroup(groupId, groupData) {
        if (!db) return
        const groupRef = doc(db, 'groups', groupId)
        await updateDoc(groupRef, groupData)
    }
}
