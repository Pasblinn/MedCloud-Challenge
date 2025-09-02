import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../utils/constants';

/**
 * Custom hook for pagination logic
 */
export const usePagination = (initialConfig = {}) => {
  const {
    initialPage = PAGINATION.DEFAULT_PAGE,
    initialLimit = PAGINATION.DEFAULT_LIMIT,
    maxLimit = PAGINATION.MAX_LIMIT,
    total = 0
  } = initialConfig;

  // State
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(total);

  // Computed values
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / limit);
  }, [totalItems, limit]);

  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrev = useMemo(() => {
    return page > 1;
  }, [page]);

  const startIndex = useMemo(() => {
    return totalItems === 0 ? 0 : offset + 1;
  }, [offset, totalItems]);

  const endIndex = useMemo(() => {
    return Math.min(offset + limit, totalItems);
  }, [offset, limit, totalItems]);

  const isFirstPage = useMemo(() => {
    return page === 1;
  }, [page]);

  const isLastPage = useMemo(() => {
    return page === totalPages || totalPages === 0;
  }, [page, totalPages]);

  // Actions
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => prev - 1);
    }
  }, [hasPrev]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages]);

  const changeLimit = useCallback((newLimit) => {
    const validLimit = Math.min(Math.max(1, newLimit), maxLimit);
    setLimit(validLimit);
    
    // Adjust page if necessary to prevent showing empty results
    const newTotalPages = Math.ceil(totalItems / validLimit);
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages);
    }
  }, [maxLimit, totalItems, page]);

  const updateTotal = useCallback((newTotal) => {
    setTotalItems(newTotal);
    
    // Adjust page if necessary
    const newTotalPages = Math.ceil(newTotal / limit);
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages);
    } else if (page > 1 && newTotalPages === 0) {
      setPage(1);
    }
  }, [limit, page]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotalItems(0);
  }, [initialPage, initialLimit]);

  // Get pagination info for API calls
  const getPaginationParams = useCallback(() => {
    return {
      page,
      limit,
      offset
    };
  }, [page, limit, offset]);

  // Get page numbers for pagination UI
  const getPageNumbers = useCallback((visiblePages = 5) => {
    const pages = [];
    
    if (totalPages <= visiblePages) {
      // Show all pages if total is less than visible pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(visiblePages / 2);
      let start = Math.max(1, page - halfVisible);
      let end = Math.min(totalPages, start + visiblePages - 1);

      // Adjust start if we're near the end
      if (end - start < visiblePages - 1) {
        start = Math.max(1, end - visiblePages + 1);
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [page, totalPages]);

  // Get pagination summary text
  const getSummaryText = useCallback(() => {
    if (totalItems === 0) {
      return 'No items';
    }
    
    return `Showing ${startIndex}-${endIndex} of ${totalItems} items`;
  }, [startIndex, endIndex, totalItems]);

  // Validate current state
  const isValidState = useMemo(() => {
    return page >= 1 && 
           limit >= 1 && 
           limit <= maxLimit && 
           totalItems >= 0 &&
           (totalItems === 0 || page <= totalPages);
  }, [page, limit, maxLimit, totalItems, totalPages]);

  return {
    // State
    page,
    limit,
    totalItems,
    
    // Computed values
    totalPages,
    offset,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    isFirstPage,
    isLastPage,
    isValidState,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    changeLimit,
    updateTotal,
    reset,
    
    // Utilities
    getPaginationParams,
    getPageNumbers,
    getSummaryText,
    
    // Pagination object (useful for API responses)
    paginationInfo: {
      page,
      limit,
      total: totalItems,
      totalPages,
      hasNext,
      hasPrev,
      startIndex,
      endIndex
    }
  };
};

/**
 * Hook for infinite scrolling pagination
 */
export const useInfinitePagination = (initialConfig = {}) => {
  const {
    initialLimit = PAGINATION.DEFAULT_LIMIT,
    maxLimit = PAGINATION.MAX_LIMIT
  } = initialConfig;

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load more items
  const loadMore = useCallback(async (fetchFn) => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchFn({ page, limit });
      const newItems = response.data || [];
      const pagination = response.pagination || {};
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setHasMore(pagination.hasNext || false);
      
      return newItems;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, isLoading, hasMore]);

  // Reset to initial state
  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Change limit and reset
  const changeLimit = useCallback((newLimit) => {
    const validLimit = Math.min(Math.max(1, newLimit), maxLimit);
    setLimit(validLimit);
    reset();
  }, [maxLimit, reset]);

  return {
    items,
    page,
    limit,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
    changeLimit,
    totalLoaded: items.length
  };
};

export default usePagination;