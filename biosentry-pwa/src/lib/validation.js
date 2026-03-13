/**
 * Validates an email address using a standard regex.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates a phone number.
 * Supports international format (+), and standard digits.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    // Basic regex for phone: Optional +, followed by 7 to 15 digits
    // Allows for spaces, dashes, and parentheses which are later stripped or handled
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(cleanPhone);
}

/**
 * Validates if a string is either a valid email or a valid phone number.
 * @param {string} contact
 * @returns {boolean}
 */
export function isValidContact(contact) {
    if (!contact) return false;
    return isValidEmail(contact) || isValidPhone(contact);
}
