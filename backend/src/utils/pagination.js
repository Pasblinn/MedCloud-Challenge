/**
 * Pagination utility class
 */
class Pagination {
    /**
     * Parse pagination parameters from request query
     * @param {Object} query - Request query object
     * @param {number} defaultLimit - Default items per page
     * @param {number} maxLimit - Maximum items per page
     * @returns {Object} Parsed pagination parameters
     */
    static parseParams(query, defaultLimit = 10, maxLimit = 100) {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit) || defaultLimit));
      const offset = (page - 1) * limit;
  
      return {
        page,
        limit,
        offset
      };
    }
  
    /**
     * Generate SQL LIMIT and OFFSET clause
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @returns {Object} SQL pagination params
     */
    static getSqlParams(page, limit) {
      const offset = (page - 1) * limit;
      return {
        limit,
        offset,
        sql: `LIMIT ${limit} OFFSET ${offset}`
      };
    }
  
    /**
     * Calculate pagination metadata
     * @param {number} total - Total number of items
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @returns {Object} Pagination metadata
     */
    static getMetadata(total, page, limit) {
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;
      const startIndex = (page - 1) * limit + 1;
      const endIndex = Math.min(page * limit, total);
  
      return {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        startIndex,
        endIndex,
        showing: `${startIndex}-${endIndex} of ${total}`,
      };
    }
  
    /**
     * Generate pagination links
     * @param {string} baseUrl - Base URL for pagination links
     * @param {number} page - Current page
     * @param {number} totalPages - Total number of pages
     * @param {Object} queryParams - Additional query parameters
     * @returns {Object} Pagination links
     */
    static generateLinks(baseUrl, page, totalPages, queryParams = {}) {
      const buildUrl = (pageNum) => {
        const params = new URLSearchParams({
          ...queryParams,
          page: pageNum.toString()
        });
        return `${baseUrl}?${params.toString()}`;
      };
  
      const links = {
        self: buildUrl(page),
        first: buildUrl(1),
        last: buildUrl(totalPages),
      };
  
      if (page > 1) {
        links.prev = buildUrl(page - 1);
      }
  
      if (page < totalPages) {
        links.next = buildUrl(page + 1);
      }
  
      return links;
    }
  
    /**
     * Validate pagination parameters
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @param {number} maxLimit - Maximum allowed limit
     * @throws {Error} If parameters are invalid
     */
    static validate(page, limit, maxLimit = 100) {
      if (!Number.isInteger(page) || page < 1) {
        throw new Error('Page must be a positive integer');
      }
  
      if (!Number.isInteger(limit) || limit < 1) {
        throw new Error('Limit must be a positive integer');
      }
  
      if (limit > maxLimit) {
        throw new Error(`Limit cannot exceed ${maxLimit}`);
      }
    }
  
    /**
     * Get page numbers for pagination UI
     * @param {number} currentPage - Current page
     * @param {number} totalPages - Total pages
     * @param {number} visiblePages - Number of visible page numbers
     * @returns {Array} Array of page numbers to display
     */
    static getPageNumbers(currentPage, totalPages, visiblePages = 5) {
      const pages = [];
      
      if (totalPages <= visiblePages) {
        // Show all pages if total is less than visible pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const halfVisible = Math.floor(visiblePages / 2);
        let start = Math.max(1, currentPage - halfVisible);
        let end = Math.min(totalPages, start + visiblePages - 1);
  
        // Adjust start if we're near the end
        if (end - start < visiblePages - 1) {
          start = Math.max(1, end - visiblePages + 1);
        }
  
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
  
        // Add ellipsis and first/last pages if needed
        const result = [];
        
        if (start > 1) {
          result.push(1);
          if (start > 2) result.push('...');
        }
        
        result.push(...pages);
        
        if (end < totalPages) {
          if (end < totalPages - 1) result.push('...');
          result.push(totalPages);
        }
  
        return result;
      }
  
      return pages;
    }
  }
  
  module.exports = Pagination;