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
