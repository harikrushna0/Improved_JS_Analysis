/**
 * Test Case 6: Large real-world-like .jsx file
 * Bot should analyze hooks, fetch calls, state logic,
 * ignoring JSX tags.
 */

import React, { useState, useEffect } from 'react';

const DataFetcher = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {data ? <pre>{JSON.stringify(data)}</pre> : 'Loading...'}
    </div>
  );
};
