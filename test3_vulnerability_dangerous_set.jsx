/**
 * Test Case 3: Detect JS vulnerability
 * Bot should flag use of dangerouslySetInnerHTML as XSS risk.
 */

const Login = ({ username }) => {
  return (
    <div dangerouslySetInnerHTML={{ __html: username }} />
  );
};
