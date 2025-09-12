const { v4: uuidv4 } = require('uuid');

/**
 * Patient model class
 * Represents the Patient entity with validation and business logic
 */
class Patient {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.birthDate = data.birth_date || data.birthDate || null;
    this.email = data.email || '';
    this.address = data.address || '';
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  /**
   * Convert model to database format
   * @returns {Object} Database-formatted object
   */
  toDatabase() {
    return {
      id: this.id,
      name: this.name.trim(),
      birth_date: this.birthDate,
      email: this.email.toLowerCase().trim(),
      address: this.address.trim(),
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Convert model to API response format
   * @returns {Object} API-formatted object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      birthDate: this.birthDate,
      email: this.email,
      address: this.address,
      age: this.getAge(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create Patient instance from database row
   * @param {Object} row - Database row
   * @returns {Patient} Patient instance
   */
  static fromDatabase(row) {
    return new Patient({
      id: row.id,
      name: row.name,
      birth_date: row.birth_date,
      email: row.email,
      address: row.address,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }

  /**
   * Calculate patient's age
   * @returns {number} Age in years
   */
  getAge() {
    if (!this.birthDate) return null;
    
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  /**
   * Get formatted birth date
   * @param {string} format - Date format (default: 'YYYY-MM-DD')
   * @returns {string} Formatted date
   */
  getFormattedBirthDate(format = 'YYYY-MM-DD') {
    if (!this.birthDate) return null;
    
    const date = new Date(this.birthDate);
    
    switch (format) {
      case 'DD/MM/YYYY':
        return date.toLocaleDateString('pt-BR');
      case 'MM/DD/YYYY':
        return date.toLocaleDateString('en-US');
      case 'YYYY-MM-DD':
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get patient's initials
   * @returns {string} Patient initials
   */
  getInitials() {
    return this.name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
  }

  /**
   * Get formatted full name (title case)
   * @returns {string} Formatted name
   */
  getFormattedName() {
    return this.name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if patient is adult (18+ years)
   * @returns {boolean} True if adult
   */
  isAdult() {
    return this.getAge() >= 18;
  }

  /**
   * Check if patient is senior (65+ years)
   * @returns {boolean} True if senior
   */
  isSenior() {
    return this.getAge() >= 65;
  }

  /**
   * Get patient's email domain
   * @returns {string} Email domain
   */
  getEmailDomain() {
    return this.email.split('@')[1] || '';
  }

  /**
   * Update patient data
   * @param {Object} data - New patient data
   */
  update(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.birthDate !== undefined) this.birthDate = data.birthDate;
    if (data.birth_date !== undefined) this.birthDate = data.birth_date;
    if (data.email !== undefined) this.email = data.email;
    if (data.address !== undefined) this.address = data.address;
    
    this.updatedAt = new Date();
  }

  /**
   * Validate patient data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    // Name validation
    if (!this.name || this.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 2 characters long'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
      errors.push({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    }

    // Birth date validation
    if (!this.birthDate) {
      errors.push({
        field: 'birthDate',
        message: 'Birth date is required'
      });
    } else {
      const birthDate = new Date(this.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        errors.push({
          field: 'birthDate',
          message: 'Birth date cannot be in the future'
        });
      }
      
      if (this.getAge() > 150) {
        errors.push({
          field: 'birthDate',
          message: 'Invalid birth date'
        });
      }
    }

    // Address validation
    if (!this.address || this.address.trim().length < 10) {
      errors.push({
        field: 'address',
        message: 'Address must be at least 10 characters long'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get search-friendly representation
   * @returns {Object} Search data
   */
  getSearchData() {
    return {
      id: this.id,
      name: this.name.toLowerCase(),
      email: this.email.toLowerCase(),
      age: this.getAge(),
      isAdult: this.isAdult(),
      isSenior: this.isSenior()
    };
  }
}

module.exports = Patient;