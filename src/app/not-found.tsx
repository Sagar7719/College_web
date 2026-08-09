import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: '1.75rem', margin: '1rem 0 0.5rem' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The website page or document you are looking for doesn&apos;t exist or may have been unpublished.
        </p>
        <Link href="/">
          <Button variant="primary">Return To Home Page</Button>
        </Link>
      </div>
    </div>
  );
}
