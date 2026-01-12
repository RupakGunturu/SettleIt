/**
 * Simple algorithm to calculate settlements in a group.
 * It takes the list of expenses and members and returns a list of transactions to settle up.
 */
export const calculateSettlements = (members, expenses) => {
    const balances = {}
    members.forEach(m => balances[m.id] = 0)

    // 1. Calculate net balance for each member
    expenses.forEach(exp => {
        const amount = parseFloat(exp.amount)
        const paidBy = exp.paidBy

        // Member who paid gets a credit
        balances[paidBy] += amount

        // Split based on method (simplifying to equal split for now)
        const share = amount / members.length
        members.forEach(m => {
            balances[m.id] -= share
        })
    })

    // 2. Separate into creditors and debtors
    const creditors = []
    const debtors = []

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance > 0.01) creditors.push({ id, balance })
        else if (balance < -0.01) debtors.push({ id, balance: Math.abs(balance) })
    })

    // 3. Match debtors to creditors
    const transactions = []
    let cIdx = 0
    let dIdx = 0

    while (cIdx < creditors.length && dIdx < debtors.length) {
        const creditor = creditors[cIdx]
        const debtor = debtors[dIdx]

        const amount = Math.min(creditor.balance, debtor.balance)
        transactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: parseFloat(amount.toFixed(2))
        })

        creditor.balance -= amount
        debtor.balance -= amount

        if (creditor.balance < 0.01) cIdx++
        if (debtor.balance < 0.01) dIdx++
    }

    return transactions
}
