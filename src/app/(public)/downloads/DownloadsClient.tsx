'use client';

import React, { useEffect, useState } from 'react';
import { DocumentItem } from '@/types';
import { downloadsService } from '@/services/cms-modules.service';
import { Badge, Button, EmptyState, Skeleton } from '@/components/ui';
import styles from '../inner.module.css';

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
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className={styles.pageHeader}>
        <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Resource Centre</Badge>
        <h1 className={styles.pageTitle}>Document Downloads</h1>
        <p className={styles.pageSubtitle}>
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
              className={styles.filterTabs}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`${styles.filterTab} ${activeCategory === cat ? styles.filterTabActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Results count */}
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
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
            <div className={styles.downloadsList}>
              {filtered.map((docItem) => (
                <div key={docItem.id} className={styles.downloadRow}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    {/* File icon */}
                    <div className={styles.resourceIcon}>
                      📄
                    </div>
                    <div>
                      <Badge variant="default" style={{ marginBottom: '0.375rem' }}>
                        {docItem.category || 'General'}
                      </Badge>
                      <h3 className={styles.downloadTitle}>
                        {docItem.title}
                      </h3>
                      {docItem.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0' }}>
                          {docItem.description}
                        </p>
                      )}
                      <p className={styles.downloadInfo}>
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
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
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
