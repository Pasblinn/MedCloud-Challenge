const { query, getClient, transaction } = require('../config/database');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Patient Repository - Data Access Layer
 * Handles all database operations for Patient entity
 */
class PatientRepository {
  
  /**
   * Create a new patient
   * @param {Object} patientData - Patient data to create
   * @returns {Patient} Created patient
   */
  static async create(patientData) {
    try {
      const patient = new Patient(patientData);
      const dbData = patient.toDatabase();
      
      const sql = `
        INSERT INTO patients (id, name, birth_date, email, address, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        dbData.id,
        dbData.name,
        dbData.birth_date,
        dbData.email,
        dbData.address,
        dbData.created_at,
        dbData.updated_at
      ];
      
      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        throw new AppError('Failed to create patient', 500, 'CREATE_FAILED');
      }
      
      logger.info(`Patient created successfully: ${result.rows[0].id}`);
      return Patient.fromDatabase(result.rows[0]);
      
    } catch (error) {
      logger.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Find patient by ID
   * @param {string} id - Patient ID
   * @returns {Patient|null} Found patient or null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM patients WHERE id = $1';
      const result = await query(sql, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return Patient.fromDatabase(result.rows[0]);
      
    } catch (error) {
      logger.error(`Error finding patient by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find patient by email
   * @param {string} email - Patient email
   * @returns {Patient|null} Found patient or null
   */
  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM patients WHERE email = $1';
      const result = await query(sql, [email.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return Patient.fromDatabase(result.rows[0]);
      
    } catch (error) {
      logger.error(`Error finding patient by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Get all patients with pagination and search
   * @param {Object} options - Query options
   * @returns {Object} Patients and pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc',
        minAge,
        maxAge
      } = options;

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let values = [];
      let valueIndex = 1;

      // Search functionality
      if (search) {
        whereConditions.push(`(
          LOWER(name) LIKE $${valueIndex} OR 
          LOWER(email) LIKE $${valueIndex}
        )`);
        values.push(`%${search.toLowerCase()}%`);
        valueIndex++;
      }

      // Age filtering
      if (minAge !== undefined) {
        whereConditions.push(`DATE_PART('year', AGE(birth_date)) >= $${valueIndex}`);
        values.push(minAge);
        valueIndex++;
      }

      if (maxAge !== undefined) {
        whereConditions.push(`DATE_PART('year', AGE(birth_date)) <= $${valueIndex}`);
        values.push(maxAge);
        valueIndex++;
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Validate sort column
      const allowedSortColumns = ['name', 'email', 'birth_date', 'created_at', 'updated_at'];
      const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Count query for pagination
      const countSql = `
        SELECT COUNT(*) as total
        FROM patients
        ${whereClause}
      `;
      
      const countResult = await query(countSql, values);
      const total = parseInt(countResult.rows[0].total);

      // Main query
      const sql = `
        SELECT *
        FROM patients
        ${whereClause}
        ORDER BY ${validSortBy} ${validSortOrder}
        LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
      `;
      
      values.push(limit, offset);
      const result = await query(sql, values);
      
      const patients = result.rows.map(row => Patient.fromDatabase(row));
      
      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
      
    } catch (error) {
      logger.error('Error finding patients:', error);
      throw error;
    }
  }

  /**
   * Update patient by ID
   * @param {string} id - Patient ID
   * @param {Object} updateData - Data to update
   * @returns {Patient|null} Updated patient or null if not found
   */
  static async update(id, updateData) {
    try {
      // First check if patient exists
      const existingPatient = await this.findById(id);
      if (!existingPatient) {
        return null;
      }

      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let valueIndex = 1;

      // Map frontend field names to database field names
      const fieldMapping = {
        name: 'name',
        birthDate: 'birth_date',
        email: 'email',
        address: 'address'
      };

      Object.keys(updateData).forEach(key => {
        const dbField = fieldMapping[key] || key;
        if (fieldMapping[key] || key === 'birth_date') {
          updateFields.push(`${dbField} = $${valueIndex}`);
          values.push(updateData[key]);
          valueIndex++;
        }
      });

      if (updateFields.length === 0) {
        throw new AppError('No valid fields to update', 400, 'NO_UPDATE_FIELDS');
      }

      // Add updated_at field
      updateFields.push(`updated_at = $${valueIndex}`);
      values.push(new Date());
      valueIndex++;

      // Add ID for WHERE clause
      values.push(id);

      const sql = `
        UPDATE patients 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        throw new AppError('Failed to update patient', 500, 'UPDATE_FAILED');
      }

      logger.info(`Patient updated successfully: ${id}`);
      return Patient.fromDatabase(result.rows[0]);
      
    } catch (error) {
      logger.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete patient by ID
   * @param {string} id - Patient ID
   * @returns {boolean} True if deleted, false if not found
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM patients WHERE id = $1 RETURNING id';
      const result = await query(sql, [id]);
      
      const deleted = result.rows.length > 0;
      
      if (deleted) {
        logger.info(`Patient deleted successfully: ${id}`);
      }
      
      return deleted;
      
    } catch (error) {
      logger.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if email exists (excluding specific patient ID)
   * @param {string} email - Email to check
   * @param {string} excludeId - Patient ID to exclude from check
   * @returns {boolean} True if email exists
   */
  static async emailExists(email, excludeId = null) {
    try {
      let sql = 'SELECT id FROM patients WHERE email = $1';
      const values = [email.toLowerCase()];
      
      if (excludeId) {
        sql += ' AND id != $2';
        values.push(excludeId);
      }
      
      const result = await query(sql, values);
      return result.rows.length > 0;
      
    } catch (error) {
      logger.error(`Error checking email existence ${email}:`, error);
      throw error;
    }
  }

  /**
   * Get patients count by age groups
   * @returns {Object} Age group statistics
   */
  static async getAgeGroupStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN DATE_PART('year', AGE(birth_date)) < 18 THEN 1 END) as minors,
          COUNT(CASE WHEN DATE_PART('year', AGE(birth_date)) BETWEEN 18 AND 64 THEN 1 END) as adults,
          COUNT(CASE WHEN DATE_PART('year', AGE(birth_date)) >= 65 THEN 1 END) as seniors,
          ROUND(AVG(DATE_PART('year', AGE(birth_date))), 1) as average_age
        FROM patients
      `;
      
      const result = await query(sql);
      const stats = result.rows[0];
      
      return {
        total: parseInt(stats.total),
        minors: parseInt(stats.minors),
        adults: parseInt(stats.adults),
        seniors: parseInt(stats.seniors),
        averageAge: parseFloat(stats.average_age)
      };
      
    } catch (error) {
      logger.error('Error getting age group stats:', error);
      throw error;
    }
  }

  /**
   * Get recent patients
   * @param {number} limit - Number of recent patients to get
   * @returns {Array<Patient>} Recent patients
   */
  static async getRecent(limit = 5) {
    try {
      const sql = `
        SELECT * FROM patients 
        ORDER BY created_at DESC 
        LIMIT $1
      `;
      
      const result = await query(sql, [limit]);
      return result.rows.map(row => Patient.fromDatabase(row));
      
    } catch (error) {
      logger.error('Error getting recent patients:', error);
      throw error;
    }
  }

  /**
   * Bulk operations using transactions
   * @param {Array} patients - Array of patient data for bulk creation
   * @returns {Array<Patient>} Created patients
   */
  static async bulkCreate(patients) {
    return await transaction(async (client) => {
      const createdPatients = [];
      
      for (const patientData of patients) {
        const patient = new Patient(patientData);
        const dbData = patient.toDatabase();
        
        const sql = `
          INSERT INTO patients (id, name, birth_date, email, address, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;
        
        const values = [
          dbData.id,
          dbData.name,
          dbData.birth_date,
          dbData.email,
          dbData.address,
          dbData.created_at,
          dbData.updated_at
        ];
        
        const result = await client.query(sql, values);
        createdPatients.push(Patient.fromDatabase(result.rows[0]));
      }
      
      logger.info(`Bulk created ${createdPatients.length} patients`);
      return createdPatients;
    });
  }
}

module.exports = PatientRepository;