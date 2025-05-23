/**
 * Test Case 2: Mixed JSX + JS; analyze only JS
 * Bot should extract and analyze JS parts only,
 * ignoring JSX tags like <div>, <h1>.
 */
import React from 'react';
const MyComponent = () => {
  const user = getUser();
  return (
    <div>
      <h1>Hello {user.name}</h1>
    </div>
  );
};

// Extended functionality with mixed JSX and JavaScript
const UserProfile = ({ userId }) => {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const fetchUserProfile = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const handleRefresh = () => {
    fetchUserProfile(userId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span>Loading user profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error occurred</h2>
        <p>{error}</p>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header>
        <h1>{profile?.name || 'Unknown User'}</h1>
        <img src={profile?.avatar} alt="User avatar" />
      </header>
      <main>
        <section className="bio">
          <h2>Biography</h2>
          <p>{profile?.bio}</p>
        </section>
        <section className="stats">
          <div className="stat-item">
            <span className="label">Posts:</span>
            <span className="value">{profile?.postCount}</span>
          </div>
          <div className="stat-item">
            <span className="label">Followers:</span>
            <span className="value">{profile?.followerCount}</span>
          </div>
        </section>
      </main>
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const loadPosts = async (pageNum) => {
    const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
    const newPosts = await response.json();
    
    if (pageNum === 1) {
      setPosts(newPosts);
    } else {
      setPosts(prev => [...prev, ...newPosts]);
    }
    
    setHasMore(newPosts.length === 10);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="post-list">
      <h2>Recent Posts</h2>
      {posts.map(post => (
        <article key={post.id} className="post-item">
          <header>
            <h3>{post.title}</h3>
            <time>{formatDate(post.createdAt)}</time>
          </header>
          <div className="post-content">
            <p>{truncateText(post.content, 150)}</p>
          </div>
          <footer>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{post.likeCount} likes</span>
              <span>{post.commentCount} comments</span>
            </div>
          </footer>
        </article>
      ))}
      {hasMore && (
        <button onClick={handleLoadMore} className="load-more-btn">
          Load More Posts
        </button>
      )}
    </div>
  );
};

const CommentForm = ({ postId, onCommentAdded }) => {
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });
      
      if (response.ok) {
        setComment('');
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="form-group">
        <label htmlFor="comment">Add a comment:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={handleInputChange}
          placeholder="Write your comment here..."
          rows={4}
          disabled={submitting}
        />
      </div>
      <button type="submit" disabled={submitting || !comment.trim()}>
        {submitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  );
};

const SearchComponent = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [filters, setFilters] = React.useState({
    type: 'all',
    sortBy: 'relevance',
    dateRange: 'all'
  });

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const performSearch = async (searchQuery, searchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchFilters.type,
        sort: searchFilters.sortBy,
        date: searchFilters.dateRange
      });

      const response = await fetch(`/api/search?${params}`);
      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const debouncedSearch = React.useMemo(
    () => debounce(performSearch, 300),
    []
  );

  React.useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, users, or topics..."
          className="search-input"
        />
        <div className="search-filters">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="posts">Posts</option>
            <option value="users">Users</option>
            <option value="topics">Topics</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>
      
      {searching && (
        <div className="search-loading">
          <span>Searching...</span>
        </div>
      )}

      <div className="search-results">
        {results.length > 0 ? (
          results.map(result => (
            <div key={result.id} className="search-result-item">
              <h3>{result.title}</h3>
              <p dangerouslySetInnerHTML={{
                __html: highlightMatch(result.excerpt, query)
              }} />
              <div className="result-meta">
                <span className="result-type">{result.type}</span>
                <span className="result-date">{formatDate(result.date)}</span>
              </div>
            </div>
          ))
        ) : query && !searching ? (
          <div className="no-results">
            <p>No results found for "{query}"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      message,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      addNotification('info', 'This is a test notification', 3000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-system">
      <div className="notification-header">
        <h3>Notifications ({unreadCount})</h3>
        <button onClick={clearAllNotifications}>Clear All</button>
      </div>
      
      <div className="notification-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markAsRead(notification.id)}
          >
            <span className="notification-icon">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="notification-content">
              <p>{notification.message}</p>
              <small>{notification.timestamp.toLocaleTimeString()}</small>
            </div>
            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DataTable = ({ data, columns, sortable = true }) => {
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);

  const sortData = (data, config) => {
    if (!config.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[config.key];
      const bValue = b[config.key];

      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = sortData(data, sortConfig);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const renderCellValue = (value, column) => {
    if (column.render) {
      return column.render(value);
    }
    return value;
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                onClick={() => handleSort(column.key)}
                className={sortable ? 'sortable' : ''}
              >
                {column.label}
                {sortConfig.key === column.key && (
                  <span className="sort-indicator">
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              {columns.map(column => (
                <td key={column.key}>
                  {renderCellValue(row[column.key], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const FileUploader = ({ onFileUpload, acceptedTypes = [], maxSize = 5 * 1024 * 1024 }) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const fileInputRef = React.useRef(null);

  const validateFile = (file) => {
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not supported`);
    }
    
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }
  };

  const handleFileUpload = async (files) => {
    const file = files[0];
    if (!file) return;

    try {
      validateFile(file);
      setUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        onFileUpload(result);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-uploader">
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <h3>Drop files here or click to browse</h3>
            <p>Maximum file size: {formatFileSize(maxSize)}</p>
            {acceptedTypes.length > 0 && (
              <p>Accepted types: {acceptedTypes.join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility functions for data processing
const analytics = {
  calculateAverage: (numbers) => {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },

  findTrends: (data, timeField, valueField) => {
    const sortedData = data.sort((a, b) => new Date(a[timeField]) - new Date(b[timeField]));
    const trends = [];
    
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i][valueField];
      const previous = sortedData[i - 1][valueField];
      const change = ((current - previous) / previous) * 100;
      
      trends.push({
        date: sortedData[i][timeField],
        change: change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      });
    }
    
    return trends;
  },

  groupByPeriod: (data, dateField, period = 'month') => {
    const groups = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      let key;
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    
    return groups;
  }
};

export { MyComponent, UserProfile, PostList, CommentForm, SearchComponent, NotificationSystem, DataTable, FileUploader, analytics };
