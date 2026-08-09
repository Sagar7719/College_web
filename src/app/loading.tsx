import React from 'react';
import { Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <Skeleton height="2.5rem" width="40%" style={{ marginBottom: '1rem' }} />
      <Skeleton height="1.25rem" width="70%" style={{ marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Skeleton height="200px" />
        <Skeleton height="200px" />
        <Skeleton height="200px" />
      </div>
    </div>
  );
}
