import React from 'react';
import Link from 'next/link';

export default function AdminForbiddenPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9' }}>
          403 — Access Denied
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          Administrator privileges are required to view this portal. Your current account is authenticated but does not have administrator authorization.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.625rem 1.25rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '0.875rem',
            }}
          >
            Return to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
