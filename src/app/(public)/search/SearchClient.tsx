'use client';

import React, { useState } from 'react';
import { Input, Button, Badge, Card, CardBody, EmptyState } from '@/components/ui';

export function SearchClient() {
  const [queryStr, setQueryStr] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryStr.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Global Search</Badge>
        <h1>Search College Website</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Find notices, courses, departments, faculty profiles, and news.
        </p>
      </div>

      <Card variant="bordered" style={{ marginBottom: '2.5rem' }}>
        <CardBody>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <Input
                placeholder="Search by keyword (e.g. Admission, Computer Science, Exam)..."
                value={queryStr}
                onChange={(e) => setQueryStr(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit">Search</Button>
          </form>
        </CardBody>
      </Card>

      {hasSearched && (
        <EmptyState
          title={`No Results Found for "${queryStr}"`}
          description="Try searching with a different term such as 'Admissions', 'Courses', 'Notices', or 'Faculty'."
        />
      )}
    </div>
  );
}
