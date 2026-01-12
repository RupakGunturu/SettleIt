import { db } from '../firebase'
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    doc,
    updateDoc
} from 'firebase/firestore'

export const dataService = {
    // Groups
    async getGroups(userId) {
        if (!db) return [
            {
                id: '1',
                name: 'Roommates 2024',
                description: 'Monthly shared expenses for the apartment',
                members: [
                    { id: 'guest_user', name: 'You (Guest)', color: '#6366f1' },
                    { id: 'u2', name: 'John', color: '#ec4899' },
                    { id: 'u3', name: 'Sarah', color: '#22c55e' }
                ],
                totalSpent: 450.00,
                currency: 'USD'
            }
        ]
        const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', userId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },

    async createGroup(groupData) {
        if (!db) return { id: Date.now().toString(), ...groupData }
        const docRef = await addDoc(collection(db, 'groups'), groupData)
        return { id: docRef.id, ...groupData }
    },

    // Expenses
    async getExpenses(groupId) {
        if (!db) return [
            {
                id: 'e1',
                groupId: '1',
                description: 'Electricity Bill',
                amount: 120,
                paidBy: 'guest_user',
                date: '2024-03-15',
                category: 'Utilities',
                splitMethod: 'equal',
                splitData: {}
            },
            {
                id: 'e2',
                groupId: '1',
                description: 'Weekly Groceries',
                amount: 85.50,
                paidBy: 'u2',
                date: '2024-03-16',
                category: 'Food',
                splitMethod: 'equal',
                splitData: {}
            }
        ]
        const q = query(collection(db, 'expenses'), where('groupId', '==', groupId))
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    },

    async addExpense(expenseData) {
        if (!db) return { id: Date.now().toString(), ...expenseData }
        const docRef = await addDoc(collection(db, 'expenses'), expenseData)
        return { id: docRef.id, ...expenseData }
    }
}
