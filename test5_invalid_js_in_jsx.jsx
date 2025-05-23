/**
 * Test Case 5: Invalid JS inside JSX expressions
 * Bot should catch syntax error but not crash.
 */

const App = () => {
  return (
    <div>
      { if (true) { return 'Hi'; } }  {/* Invalid JS */}
    </div>
  );
};
