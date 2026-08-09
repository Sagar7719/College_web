'use client';

import React, { useEffect, useState } from 'react';
import { DocumentItem } from '@/types';
import { downloadsService } from '@/services/cms-modules.service';
import { Badge, Button, EmptyState, Skeleton } from '@/components/ui';

export function DownloadsClient() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    downloadsService.getPublished().then((data) => {
      setDocs(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Derive categories from actual Firestore data — never hardcoded
  const categories = ['All', ...Array.from(new Set(docs.map((d) => d.category || 'General'))).sort()];

  const filtered = activeCategory === 'All'
    ? docs
    : docs.filter((d) => (d.category || 'General') === activeCategory);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>Resource Centre</Badge>
        <h1>Document Downloads</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Official forms, syllabi, exam schedules, circulars, and academic documents.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="24px" style={{ width: '60%', marginBottom: '1rem' }} />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          title="No Documents Available"
          description="Downloadable documents will be uploaded shortly by the college administrator."
        />
      ) : (
        <>
          {/* Category filter tabs — derived from actual data */}
          {categories.length > 1 && (
            <div
              role="tablist"
              aria-label="Filter documents by category"
              style={{
                display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
                marginBottom: '1.75rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.4375rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid',
                    borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: activeCategory === cat ? 'var(--primary)' : 'transparent',
                    color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                    fontWeight: activeCategory === cat ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {filtered.length} document{filtered.length !== 1 ? 's' : ''}{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              title={`No documents in "${activeCategory}"`}
              description="Try selecting a different category above."
              actionLabel="View all documents"
              onAction={() => setActiveCategory('All')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map((docItem) => (
                <div
                  key={docItem.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    backgroundColor: 'var(--card-bg)',
                    transition: 'box-shadow 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* File icon */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--neutral-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.375rem', flexShrink: 0,
                    }}>
                      📄
                    </div>
                    <div>
                      <Badge variant="default" style={{ marginBottom: '0.375rem' }}>
                        {docItem.category || 'General'}
                      </Badge>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)', margin: '0 0 0.25rem' }}>
                        {docItem.title}
                      </h3>
                      {docItem.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>
                          {docItem.description}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        {docItem.fileName}
                        {(docItem.fileType || docItem.fileSizeFormatted) && (
                          <> · {[docItem.fileType, docItem.fileSizeFormatted].filter(Boolean).join(', ')}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {docItem.fileUrl ? (
                    <a
                      href={docItem.fileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Download ${docItem.title} (${docItem.fileType || 'document'})`}
                      style={{ textDecoration: 'none', flexShrink: 0 }}
                    >
                      <Button variant="primary" size="sm">
                        📥 Download
                      </Button>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      File unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
