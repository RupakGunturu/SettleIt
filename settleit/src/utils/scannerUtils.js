/**
 * Scanner utility functions for QR code and OCR processing
 */

/**
 * Parse UPI QR code data
 * UPI QR format: upi://pay?pa=merchant@upi&pn=Merchant Name&am=100&tn=Transaction Note
 */
export function parseUpiQrCode(qrData) {
    try {
        const url = new URL(qrData)

        if (!url.protocol.includes('upi')) {
            return null
        }

        const params = new URLSearchParams(url.search)

        return {
            merchantUpi: params.get('pa') || '',
            merchantName: params.get('pn') || params.get('pa')?.split('@')[0] || 'Unknown Merchant',
            amount: params.get('am') ? parseFloat(params.get('am')) : 0,
            transactionNote: params.get('tn') || '',
            transactionRef: params.get('tr') || '',
            currency: params.get('cu') || 'INR'
        }
    } catch (error) {
        console.error('Error parsing UPI QR code:', error)
        return null
    }
}

/**
 * Extract expense data from OCR text
 * Looks for patterns like:
 * - Total: ₹500, Total 500, Rs. 500
 * - Date: 14/01/2024, 14-01-2024
 * - Merchant names (usually at top of receipt)
 */
export function extractExpenseFromOcr(ocrText) {
    const lines = ocrText.split('\n').filter(line => line.trim())

    // Extract amount
    const amount = extractAmount(ocrText)

    // Extract date
    const date = extractDate(ocrText)

    // Extract merchant name (usually one of the first few lines)
    const merchantName = extractMerchantName(lines)

    // Detect category based on keywords
    const category = detectCategory(ocrText)

    // Extract tax/gst if possible
    const taxInfo = extractTax(ocrText)

    // Extract line items
    const items = extractLineItems(lines)

    // If we found tax but it's not in items, add it
    if (taxInfo.amount > 0 && !items.some(i => i.name.toLowerCase().includes('tax') || i.name.toLowerCase().includes('gst'))) {
        items.push({
            id: Date.now() + 9999,
            name: taxInfo.label || 'Tax / GST',
            quantity: 1,
            amount: taxInfo.amount
        })
    }

    // If no items extracted, create a single item from total
    const finalItems = items.length > 0 ? items : [{
        id: Date.now(),
        name: merchantName || 'Scanned Item',
        quantity: 1,
        amount: amount
    }]

    return {
        amount,
        date,
        merchantName,
        category,
        items: finalItems,
        tax: taxInfo,
        rawText: ocrText
    }
}

/**
 * Extract line items from text lines
 */
function extractLineItems(lines) {
    const items = []
    // Relaxed price pattern: allow optional decimals (e.g. 50, 50.00, 50.5), optional whitespace
    // Relaxed price pattern: allow optional decimals and trailing non-digit noise (e.g. 240.0C)
    const pricePattern = /[₹rs.]?\s*(\d+(?:[.,]\d{1,2})?)\s*[^0-9]*$/i
    const quantityPattern = /^(\d+)\s*([xX*@]|pcs|nos|units)?\s*/i

    // 1. Robust Header Detection
    // Look for the "Item" header line which is standard in these receipts
    let startIndex = 0
    let foundHeader = false
    for (let i = 0; i < lines.length; i++) {
        const lowerLine = lines[i].toLowerCase()
        if (lowerLine.includes('item') && (lowerLine.includes('qty') || lowerLine.includes('price') || lowerLine.includes('amount') || lowerLine.includes('rate'))) {
            startIndex = i + 1
            foundHeader = true
            break
        }
    }

    // Fallback if no specific header found: Skip known metadata lines
    if (!foundHeader) {
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const lowerLine = lines[i].toLowerCase()
            if (/date|time|invoice|bill no|token|cashier|name:|table/i.test(lowerLine)) {
                startIndex = i + 1
            }
        }
    }

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        const lowerLine = line.toLowerCase()

        // Stop processing if we hit footer markers
        if (/thank you|visit again|have a nice day|customer copy/i.test(lowerLine)) break

        // Skip empty lines or total/tax/header strings
        if (!line || /total|subtotal|amount due|change return/i.test(lowerLine)) continue
        if (/^date|^invoice|^bill/i.test(lowerLine)) continue

        // Skip location/address lines (common false positives)
        if (/hyderabad|telangana|road|st\.|street|marg|pincode|pin\s*code|ph:|phone|gstin|fssai/i.test(lowerLine)) continue

        // Skip specific metadata
        if (/cashier|token no|bill no|name:/i.test(lowerLine)) continue

        const priceMatch = line.match(pricePattern)
        if (priceMatch) {
            let lineTotal = parseFloat(priceMatch[1].replace(',', ''))

            // "Eat from right" strategy
            // 1. Remove the total amount matched at the end
            let remainingText = line.substring(0, line.length - priceMatch[0].length).trim()

            let quantity = 1
            let unitPrice = lineTotal

            // 2. Check for Unit Price (optional second number from right)
            // Matches: space + number at end of remaining text
            // e.g. "Chicken 1 240.00" -> matches 240.00
            const unitPriceMatch = remainingText.match(/\s+(\d+(?:[.,]\d{1,2})?)\s*$/)
            if (unitPriceMatch) {
                const val = parseFloat(unitPriceMatch[1].replace(',', ''))
                // Heuristic: If this value is close to lineTotal (qty 1) OR less (qty > 1)
                if (val <= lineTotal) {
                    unitPrice = val
                    const potentialRemaining = remainingText.substring(0, remainingText.length - unitPriceMatch[0].length).trim()

                    // Verify if this leaves a name or just empty/quantity
                    if (potentialRemaining.length > 0) {
                        remainingText = potentialRemaining
                    }
                }
            }

            // 3. Check for Quantity (number at end of remaining text OR at start of original text)
            // Check end first (common in these receipts: Name Qty Price Total)
            const qtyAtEndMatch = remainingText.match(/\s+(\d+)\s*$/)
            if (qtyAtEndMatch) {
                const q = parseInt(qtyAtEndMatch[1])
                // Sanity: Qty usually < 50 for food
                if (q > 0 && q < 50) {
                    quantity = q
                    remainingText = remainingText.substring(0, remainingText.length - qtyAtEndMatch[0].length).trim()

                    // Recalculate unit price logic
                    if (unitPrice === lineTotal && quantity > 1) {
                        unitPrice = parseFloat((lineTotal / quantity).toFixed(2))
                    }
                }
            } else {
                // Fallback: Check quantity at start (e.g. "2 x Burger")
                const qtyAtStartMatch = remainingText.match(/^(\d+)\s*([xX*@]|pcs|nos|units)?\s*/)
                if (qtyAtStartMatch) {
                    const q = parseInt(qtyAtStartMatch[1])
                    if (q > 0 && q < 50) {
                        quantity = q
                        remainingText = remainingText.substring(qtyAtStartMatch[0].length).trim()
                        if (unitPrice === lineTotal && quantity > 1) {
                            unitPrice = parseFloat((lineTotal / quantity).toFixed(2))
                        }
                    }
                }
            }

            // Cleanup name
            let name = remainingText
            name = name.replace(/^\d+[.)-]\s*/, '') // Remove "1." list markers
            name = name.replace(/^[^a-zA-Z0-9(]+/, '') // Remove leading symbols
            name = name.replace(/[:.-]+$/, '')
            name = name.trim()

            if (name.length > 2 && lineTotal > 0) {
                items.push({
                    id: Date.now() + i,
                    name: name,
                    quantity: quantity,
                    amount: unitPrice
                })
            }
        }
    }

    return items
}

/**
 * Extract Tax/GST from text
 */
function extractTax(text) {
    // Look for GST, Tax, VAT keywords associated with amounts
    // Use word boundaries \b to avoid matching inside words
    const taxPatterns = [
        /\b(?:cgst|sgst|gst|tax|vat)[:\s]*[₹rs.]*\s*(\d+(?:[.,]\d{2})?)/i,
        /tax\s*amount[:\s]*(\d+(?:[.,]\d{2})?)/i
    ]

    for (const pattern of taxPatterns) {
        const match = text.match(pattern)
        if (match) {
            const val = parseFloat(match[1].replace(',', ''))
            if (val > 0) {
                return { amount: val, label: match[0].split(':')[0].trim() || 'Tax' }
            }
        }
    }
    return { amount: 0, label: null }
}

/**
 * Extract amount from text
 */
function extractAmount(text) {
    // Patterns to match: ₹500, Rs. 500, Rs 500, 500.00, Total: 500
    const patterns = [
        /total[:\s]*[₹rs.]*\s*(\d+(?:[.,]\d{2})?)/i,
        /amount[:\s]*[₹rs.]*\s*(\d+(?:[.,]\d{2})?)/i,
        /[₹]\s*(\d+(?:[.,]\d{2})?)/,
        /rs\.?\s*(\d+(?:[.,]\d{2})?)/i,
        /(\d+\.\d{2})/
    ]

    for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
            const amount = parseFloat(match[1].replace(',', ''))
            if (amount > 0 && amount < 1000000) { // Sanity check
                return amount
            }
        }
    }

    return 0
}

/**
 * Extract date from text
 */
function extractDate(text) {
    // Patterns: 14/01/2024, 14-01-2024, 01/14/2024, 2024-01-14, 14 Jan 2024
    // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YY (support 2 digit year)
    const match1 = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/)
    if (match1) {
        const d = match1[1].padStart(2, '0')
        const m = match1[2].padStart(2, '0')
        let y = match1[3]
        if (y.length === 2) y = '20' + y
        return `${y}-${m}-${d}`
    }

    // Pattern 2: YYYY-MM-DD
    const match2 = text.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
    if (match2) {
        return `${match2[1]}-${match2[2].padStart(2, '0')}-${match2[3].padStart(2, '0')}`
    }

    // Pattern 3: DD Mon YYYY (SPACE or DASH or SLASH)
    const match3 = text.match(/\b(\d{1,2})[\s\-\/\.]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\-\/\.]+(\d{4})\b/i)
    if (match3) {
        const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' }
        const d = match3[1].padStart(2, '0')
        const m = months[match3[2].toLowerCase().substring(0, 3)]
        const y = match3[3]
        return `${y}-${m}-${d}`
    }

    return new Date().toISOString().split('T')[0]
}

/**
 * Extract merchant name from first few lines
 */
function extractMerchantName(lines) {
    // Usually merchant name is in first 3 lines and has more than 3 characters
    for (let i = 0; i < Math.min(3, lines.length); i++) {
        const line = lines[i].trim()
        if (line.length > 3 && line.length < 50 && !line.match(/^\d+$/)) {
            return line
        }
    }

    return 'Scanned Receipt'
}

/**
 * Detect category based on keywords
 */
function detectCategory(text) {
    const lowerText = text.toLowerCase()

    const categoryKeywords = {
        'Food & Dining': ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'dining', 'swiggy', 'zomato', 'kitchen', 'tiffin', 'bhavan', 'mess', 'hotel', 'dhaba', 'bakery', 'sweets', 'coffee', 'tea', 'bistro'],
        'Shopping': ['mall', 'store', 'retail', 'shop', 'amazon', 'flipkart', 'clothes', 'apparel'],
        'Groceries': ['grocery', 'supermarket', 'mart', 'vegetables', 'fruits', 'provisions'],
        'Transportation': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'parking', 'toll'],
        'Entertainment': ['movie', 'cinema', 'ticket', 'bookmyshow', 'netflix', 'spotify'],
        'Health': ['hospital', 'clinic', 'pharmacy', 'medical', 'doctor', 'medicine'],
        'Utilities': ['electricity', 'water', 'gas', 'internet', 'mobile', 'recharge']
    }

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category
        }
    }

    return 'Other'
}

/**
 * Validate extracted data
 */
export function validateExpenseData(data) {
    const errors = []

    if (!data.amount || data.amount <= 0) {
        errors.push('Amount must be greater than 0')
    }

    if (!data.merchantName || data.merchantName.trim() === '') {
        errors.push('Merchant name is required')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
