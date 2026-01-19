/**
 * Utility functions for URL slug generation
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert
 * @returns {string} - URL-friendly slug
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
}

/**
 * Generate a unique slug by appending a short ID
 * @param {string} name - The name to slugify
 * @param {string} id - Optional ID to append for uniqueness
 * @returns {string} - Unique slug
 */
export function generateUniqueSlug(name, id = null) {
    const baseSlug = slugify(name)
    if (id) {
        // Use first 6 characters of ID for uniqueness
        const shortId = id.substring(0, 6)
        return `${baseSlug}-${shortId}`
    }
    return baseSlug
}

/**
 * Extract the ID from a slug (if it contains one)
 * @param {string} slug - The slug to parse
 * @returns {string|null} - The extracted ID or null
 */
export function extractIdFromSlug(slug) {
    const parts = slug.split('-')
    const lastPart = parts[parts.length - 1]
    // Check if last part looks like an ID (6 alphanumeric characters)
    if (lastPart && lastPart.length === 6 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
        return lastPart
    }
    return null
}
