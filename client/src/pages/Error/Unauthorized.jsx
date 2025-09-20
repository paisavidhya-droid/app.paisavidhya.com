import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '60px 20px',
    },
    heading: {
      fontSize: '48px',
      color: '#e74c3c',
    },
    message: {
      fontSize: '18px',
      marginBottom: '20px',
    },
    link: {
      textDecoration: 'none',
      color: '#3498db',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>403 - Unauthorized</h1>
      <p style={styles.message}>You do not have permission to access this page.</p>
      <Link to="/welcome" style={styles.link}>← Go Back to Dashboard</Link>
    </div>
  );
};

export default Unauthorized;
