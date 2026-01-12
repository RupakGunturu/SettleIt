/**
 * Advanced algorithm to calculate settlements and minimize transactions.
 * Handles equal, percentage, and custom splits.
 */
export const calculateSettlements = (members, expenses) => {
    const balances = {}
    members.forEach(m => balances[m.id] = 0)

    // 1. Calculate net balance for each member
    expenses.forEach(exp => {
        const amount = parseFloat(exp.amount)
        const paidBy = exp.paidBy
        const participants = exp.splitWith || members.map(m => m.id)

        // Member who paid gets a credit
        balances[paidBy] += amount

        // Calculate each person's share
        if (exp.splitMethod === 'percentage' && exp.splitData) {
            participants.forEach(pId => {
                const percent = exp.splitData[pId] || 0
                balances[pId] -= (amount * percent) / 100
            })
        } else if (exp.splitMethod === 'custom' && exp.splitData) {
            participants.forEach(pId => {
                balances[pId] -= exp.splitData[pId] || 0
            })
        } else {
            // Default to equal split among participants
            const share = amount / participants.length
            participants.forEach(pId => {
                balances[pId] -= share
            })
        }
    })

    // 2. Separate into creditors and debtors
    const creditors = []
    const debtors = []

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance > 0.01) creditors.push({ id, balance })
        else if (balance < -0.01) debtors.push({ id, balance: Math.abs(balance) })
    })

    // Sort by largest balance first to minimize transactions
    creditors.sort((a, b) => b.balance - a.balance)
    debtors.sort((a, b) => b.balance - a.balance)

    // 3. Match debtors to creditors
    const transactions = []
    let cIdx = 0
    let dIdx = 0

    while (cIdx < creditors.length && dIdx < debtors.length) {
        const creditor = creditors[cIdx]
        const debtor = debtors[dIdx]

        const amount = Math.min(creditor.balance, debtor.balance)
        if (amount > 0.01) {
            transactions.push({
                from: debtor.id,
                to: creditor.id,
                amount: parseFloat(amount.toFixed(2))
            })
        }

        creditor.balance -= amount
        debtor.balance -= amount

        if (creditor.balance < 0.01) cIdx++
        if (debtor.balance < 0.01) dIdx++
    }

    return transactions
}
