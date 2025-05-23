/**
 * CRITICAL TEST CASE: Mixed JSX + JS - Return Statement Preservation
 * 
 * This file tests whether analysis tools properly preserve JavaScript return statements
 * when extracting JS from mixed JSX+JS code. The bot should:
 * 
 * 1. PRESERVE all return statements in JavaScript functions
 * 2. IGNORE JSX markup tags like <div>, <h1>, <span>, etc.
 * 3. EXTRACT JavaScript expressions within JSX (like {user.name})
 * 4. MAINTAIN function structure and logic flow
 * 
 * EXPECTED BEHAVIOR: Return statements should NEVER be removed during analysis
 * BUG TO DETECT: If return statements are being stripped out incorrectly
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// TEST 1: Simple return statement preservation
const SimpleComponent = () => {
  const user = getUser();
  const status = checkAuthStatus();
  
  // CRITICAL: This return statement must be preserved
  return (
    <div className="simple-container">
      <h1>Hello {user.name}</h1>
      <p>Status: {status ? 'Active' : 'Inactive'}</p>
    </div>
  );
};

// TEST 2: Multiple return statements with conditions
const ConditionalComponent = ({ isLoading, error, data }) => {
  const hasData = data && data.length > 0;
  const errorMessage = error?.message || 'Unknown error';
  
  // CRITICAL: Early return statements must be preserved
  if (isLoading) {
    return (
      <div className="loading-state">
        <span>Loading...</span>
      </div>
    );
  }

  // CRITICAL: Another return statement must be preserved
  if (error) {
    return (
      <div className="error-state">
        <h2>Error Occurred</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  // CRITICAL: Final return statement must be preserved
  return (
    <div className="data-container">
      <h1>Data Display</h1>
      {hasData ? (
        <ul>
          {data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

// TEST 3: Complex component with nested functions and multiple returns
const ComplexDataProcessor = ({ rawData, filters, sortOptions }) => {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Nested function with return statement
  const filterData = (data, filterCriteria) => {
    if (!data || !filterCriteria) {
      return data;  // CRITICAL: Return statement must be preserved
    }
    
    const filtered = data.filter(item => {
      const matchesCategory = !filterCriteria.category || item.category === filterCriteria.category;
      const matchesPrice = item.price >= (filterCriteria.minPrice || 0) && 
                          item.price <= (filterCriteria.maxPrice || Infinity);
      const matchesSearch = !filterCriteria.search || 
                           item.name.toLowerCase().includes(filterCriteria.search.toLowerCase());
      
      return matchesCategory && matchesPrice && matchesSearch;  // CRITICAL: Return must be preserved
    });
    
    return filtered;  // CRITICAL: Return statement must be preserved
  };
  
  // Another nested function with complex return logic
  const sortData = (data, options) => {
    if (!options || !options.field) {
      return data;  // CRITICAL: Return statement must be preserved
    }
    
    const sorted = [...data].sort((a, b) => {
      const aValue = a[options.field];
      const bValue = b[options.field];
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return options.direction === 'desc' ? -comparison : comparison;  // CRITICAL: Return must be preserved
      }
      
      if (typeof aValue === 'number') {
        const result = aValue - bValue;
        return options.direction === 'desc' ? -result : result;  // CRITICAL: Return must be preserved
      }
      
      return 0;  // CRITICAL: Return statement must be preserved
    });
    
    return sorted;  // CRITICAL: Return statement must be preserved
  };
  
  // Function with early returns and complex logic
  const validateAndProcessData = async (data) => {
    if (!data) {
      console.error('No data provided');
      return null;  // CRITICAL: Return statement must be preserved
    }
    
    if (!Array.isArray(data)) {
      console.error('Data must be an array');
      return [];  // CRITICAL: Return statement must be preserved
    }
    
    try {
      setLoading(true);
      
      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const filtered = filterData(data, filters);
      const sorted = sortData(filtered, sortOptions);
      const paginated = paginateData(sorted, currentPage, 20);
      
      setProcessedData(paginated.items);
      
      return {  // CRITICAL: Return statement with object must be preserved
        items: paginated.items,
        totalPages: paginated.totalPages,
        currentPage: paginated.currentPage,
        totalItems: sorted.length
      };
    } catch (error) {
      console.error('Processing failed:', error);
      return null;  // CRITICAL: Return statement must be preserved
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination helper function
  const paginateData = (data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    return {  // CRITICAL: Return statement with object must be preserved
      items,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  };
  
  // Calculate statistics
  const calculateStats = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return {  // CRITICAL: Return statement in useMemo must be preserved
        total: 0,
        average: 0,
        min: 0,
        max: 0
      };
    }
    
    const values = processedData.map(item => item.price || 0);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {  // CRITICAL: Return statement in useMemo must be preserved
      total,
      average: parseFloat(average.toFixed(2)),
      min,
      max,
      count: processedData.length
    };
  }, [processedData]);
  
  // Event handlers with returns
  const handlePageChange = useCallback((newPage) => {
    if (newPage < 1 || newPage > Math.ceil(rawData.length / 20)) {
      return false;  // CRITICAL: Return statement must be preserved
    }
    
    setCurrentPage(newPage);
    validateAndProcessData(rawData);
    return true;  // CRITICAL: Return statement must be preserved
  }, [rawData, filters, sortOptions]);
  
  const handleItemClick = (item) => {
    if (!item || !item.id) {
      return;  // CRITICAL: Early return must be preserved
    }
    
    const updatedItem = {
      ...item,
      lastClicked: new Date().toISOString(),
      clickCount: (item.clickCount || 0) + 1
    };
    
    // Update the item in processed data
    setProcessedData(prev => prev.map(prevItem => 
      prevItem.id === item.id ? updatedItem : prevItem
    ));
    
    return updatedItem;  // CRITICAL: Return statement must be preserved
  };
  
  // Effect hook
  useEffect(() => {
    if (rawData && rawData.length > 0) {
      validateAndProcessData(rawData);
    }
  }, [rawData, filters, sortOptions, currentPage]);
  
  // Conditional rendering with early returns
  if (loading) {
    return (  // CRITICAL: Return statement in loading condition must be preserved
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Processing data...</p>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    );
  }
  
  if (!rawData || rawData.length === 0) {
    return (  // CRITICAL: Return statement in empty data condition must be preserved
      <div className="empty-state">
        <h2>No Data Available</h2>
        <p>Please provide data to display</p>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
  }
  
  if (processedData.length === 0) {
    return (  // CRITICAL: Return statement in no results condition must be preserved
      <div className="no-results">
        <h2>No Results Found</h2>
        <p>Try adjusting your filters or search criteria</p>
        <button onClick={() => setCurrentPage(1)}>
          Reset Filters
        </button>
      </div>
    );
  }
  
  // Main component return
  return (  // CRITICAL: Main return statement must be preserved
    <div className="complex-data-processor">
      <header className="processor-header">
        <h1>Data Processor Dashboard</h1>
        <div className="stats-summary">
          <div className="stat-item">
            <label>Total Items:</label>
            <span>{calculateStats.count}</span>
          </div>
          <div className="stat-item">
            <label>Average Price:</label>
            <span>${calculateStats.average}</span>
          </div>
          <div className="stat-item">
            <label>Price Range:</label>
            <span>${calculateStats.min} - ${calculateStats.max}</span>
          </div>
        </div>
      </header>
      
      <main className="processor-content">
        <div className="data-grid">
          {processedData.map(item => (
            <div 
              key={item.id} 
              className="data-item"
              onClick={() => handleItemClick(item)}
            >
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-meta">
                <span className="category">{item.category}</span>
                <span className="price">${item.price}</span>
                <span className="clicks">Clicks: {item.clickCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pagination-controls">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {currentPage}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(rawData.length / 20)}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

// TEST 4: Async component with promise returns
const AsyncDataFetcher = ({ endpoint, params }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Async function with multiple return paths
  const fetchData = async (url, parameters) => {
    if (!url) {
      return Promise.reject(new Error('URL is required'));  // CRITICAL: Return must be preserved
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const queryString = new URLSearchParams(parameters).toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        return Promise.reject(new Error(errorData.message));  // CRITICAL: Return must be preserved
      }
      
      const result = await response.json();
      setData(result);
      
      return result;  // CRITICAL: Return statement must be preserved
    } catch (err) {
      setError(err);
      return Promise.reject(err);  // CRITICAL: Return must be preserved
    } finally {
      setLoading(false);
    }
  };
  
  // Retry logic with returns
  const retryFetch = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await fetchData(endpoint, params);
        return result;  // CRITICAL: Return on success must be preserved
      } catch (error) {
        if (attempt === maxRetries) {
          return Promise.reject(error);  // CRITICAL: Final return must be preserved
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  };
  
  // Cache management
  const getCachedData = (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) {
        return null;  // CRITICAL: Return statement must be preserved
      }
      
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > 300000; // 5 minutes
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;  // CRITICAL: Return statement must be preserved
      }
      
      return parsed.data;  // CRITICAL: Return statement must be preserved
    } catch (error) {
      console.error('Cache read error:', error);
      return null;  // CRITICAL: Return statement must be preserved
    }
  };
  
  const setCachedData = (key, data) => {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));
      return true;  // CRITICAL: Return statement must be preserved
    } catch (error) {
      console.error('Cache write error:', error);
      return false;  // CRITICAL: Return statement must be preserved
    }
  };
  
  // Data transformation functions
  const transformData = (rawData) => {
    if (!rawData) {
      return [];  // CRITICAL: Return statement must be preserved
    }
    
    if (Array.isArray(rawData)) {
      return rawData.map(item => transformItem(item));  // CRITICAL: Return must be preserved
    }
    
    if (typeof rawData === 'object') {
      return [transformItem(rawData)];  // CRITICAL: Return statement must be preserved
    }
    
    return [];  // CRITICAL: Return statement must be preserved
  };
  
  const transformItem = (item) => {
    if (!item || typeof item !== 'object') {
      return null;  // CRITICAL: Return statement must be preserved
    }
    
    return {  // CRITICAL: Return with object must be preserved
      id: item.id || generateId(),
      title: item.title || item.name || 'Untitled',
      description: item.description || '',
      timestamp: item.timestamp || Date.now(),
      metadata: {
        source: endpoint,
        processed: true,
        transformedAt: new Date().toISOString()
      }
    };
  };
  
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);  // CRITICAL: Return must be preserved
  };
  
  // Effect for data fetching
  useEffect(() => {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      setData(cached);
      return;  // CRITICAL: Early return in useEffect must be preserved
    }
    
    retryFetch().then(result => {
      const transformed = transformData(result);
      setCachedData(cacheKey, transformed);
    });
  }, [endpoint, params]);
  
  // Component render with early returns
  if (loading) {
    return (  // CRITICAL: Return in loading state must be preserved
      <div className="async-loader">
        <div className="spinner-large"></div>
        <p>Fetching data from {endpoint}...</p>
      </div>
    );
  }
  
  if (error) {
    return (  // CRITICAL: Return in error state must be preserved
      <div className="async-error">
        <h2>Failed to Load Data</h2>
        <p>{error.message}</p>
        <button onClick={() => retryFetch()}>
          Retry
        </button>
      </div>
    );
  }
  
  if (!data) {
    return (  // CRITICAL: Return for no data must be preserved
      <div className="async-empty">
        <p>No data available</p>
      </div>
    );
  }
  
  return (  // CRITICAL: Main return statement must be preserved
    <div className="async-data-container">
      <h2>Fetched Data from {endpoint}</h2>
      <div className="data-list">
        {data.map(item => (
          <div key={item.id} className="data-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>Processed: {new Date(item.metadata.transformedAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

// TEST 5: Higher-order component with function returns
const withDataLoader = (WrappedComponent) => {
  return (props) => {  // CRITICAL: Return of HOC function must be preserved
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await props.dataLoader();
        setData(result);
        return result;  // CRITICAL: Return statement must be preserved
      } catch (error) {
        console.error('Data loading failed:', error);
        return null;  // CRITICAL: Return statement must be preserved
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      if (props.dataLoader) {
        loadData();
      }
    }, [props.dataLoader]);
    
    if (loading) {
      return <div>Loading...</div>;  // CRITICAL: Return must be preserved
    }
    
    return (  // CRITICAL: Final return of HOC must be preserved
      <WrappedComponent 
        {...props} 
        data={data} 
        loading={loading}
        onReload={loadData}
      />
    );
  };
};

// TEST 6: Utility functions with various return patterns
const DataUtils = {
  processArray: (arr) => {
    if (!Array.isArray(arr)) {
      return [];  // CRITICAL: Return statement must be preserved
    }
    
    return arr.filter(Boolean).map(item => {  // CRITICAL: Return must be preserved
      if (typeof item === 'string') {
        return item.trim();  // CRITICAL: Return in map must be preserved
      }
      return item;  // CRITICAL: Return statement must be preserved
    });
  },
  
  validateInput: (input, rules) => {
    if (!input || !rules) {
      return { valid: false, errors: ['Invalid input or rules'] };  // CRITICAL: Return must be preserved
    }
    
    const errors = [];
    
    if (rules.required && !input) {
      errors.push('This field is required');
    }
    
    if (rules.minLength && input.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength}`);
    }
    
    if (rules.pattern && !rules.pattern.test(input)) {
      errors.push('Invalid format');
    }
    
    return {  // CRITICAL: Return with validation result must be preserved
      valid: errors.length === 0,
      errors
    };
  },
  
  formatCurrency: (amount, currency = 'USD') => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 'Invalid amount';  // CRITICAL: Return statement must be preserved
    }
    
    try {
      return new Intl.NumberFormat('en-US', {  // CRITICAL: Return must be preserved
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;  // CRITICAL: Return must be preserved
    }
  }
};

// Export all components for testing
export { 
  SimpleComponent, 
  ConditionalComponent, 
  ComplexDataProcessor, 
  AsyncDataFetcher, 
  withDataLoader, 
  DataUtils 
};
