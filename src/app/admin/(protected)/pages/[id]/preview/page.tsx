'use client';

import React, { useEffect, useState, use } from 'react';
import { Page } from '@/types';
import { pagesService } from '@/services/pages.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Badge, Skeleton, EmptyState } from '@/components/ui';

interface PreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminPagePreviewScreen({ params }: PreviewPageProps) {
  const { id } = use(params);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreviewPage = async () => {
      setLoading(true);
      const data = await pagesService.getPageById(id);
      setPage(data);
      setLoading(false);
    };
    loadPreviewPage();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <Skeleton height="3rem" width="40%" style={{ marginBottom: '1rem' }} />
        <Skeleton height="200px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (!page) {
    return (
      <EmptyState
        title="Preview Unavailable"
        description="The requested page document could not be found for preview."
      />
    );
  }

  return (
    <div>
      {/* Top Protected Preview Banner */}
      <div
        style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--border-dark)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Badge variant="info">👁️ Admin Preview Mode</Badge>
            <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
              {page.status.toUpperCase()}
            </Badge>
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '0.375rem' }}>
            {page.title} (/{page.slug})
          </h2>
          <p className="small-text" style={{ color: 'var(--text-muted)' }}>
            This live preview reuses the exact public PageSectionRenderer component.
          </p>
        </div>
      </div>

      {/* Featured Header */}
      {page.featuredImage && (
        <div style={{ marginBottom: '2.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img
            src={page.featuredImage}
            alt={page.title}
            style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Actual Public Page Renderer */}
      <PageSectionRenderer sections={page.sections || []} />
    </div>
  );
}
