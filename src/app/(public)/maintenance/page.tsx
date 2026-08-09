import React from 'react';

export default function MaintenancePage({ message }: { message?: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          padding: '3rem 2rem',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-light)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔧</div>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          Website Under Maintenance
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {message ||
            'We are currently performing scheduled maintenance to improve your experience. Please check back shortly.'}
        </p>

      </div>
    </div>
  );
}
