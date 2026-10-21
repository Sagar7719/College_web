'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DocumentItem } from '@/types';
import { downloadsService } from '@/services/cms-modules.service';
import { Badge, EmptyState, Skeleton } from '@/components/ui';
import {
  Download,
  Search,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FolderDown,
  Sparkles,
  Filter,
  CheckCircle2,
  Calendar,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import styles from '../inner.module.css';

function getFileIcon(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf')) return <FileText size={22} color="#DC2626" />;
  if (t.includes('xls') || t.includes('csv')) return <FileSpreadsheet size={22} color="#16A34A" />;
  if (t.includes('zip') || t.includes('rar')) return <FileArchive size={22} color="#9333EA" />;
  if (t.includes('doc') || t.includes('txt')) return <FileCode size={22} color="#2563EB" />;
  return <FolderDown size={22} color="#C85A32" />;
}

function getFormatBadgeColor(type?: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf')) return { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' };
  if (t.includes('xls') || t.includes('csv')) return { bg: '#F0FDF4', border: '#86EFAC', text: '#166534' };
  if (t.includes('zip') || t.includes('rar')) return { bg: '#FAF5FF', border: '#D8B4FE', text: '#6B21A8' };
  if (t.includes('doc') || t.includes('txt')) return { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF' };
  return { bg: '#FFF5F0', border: '#FCD3C1', text: '#C85A32' };
}

export function DownloadsClient() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    downloadsService
      .getPublished()
      .then((data) => {
        setDocs(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Derive categories dynamically from Firestore documents
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(docs.map((d) => d.category || 'General'))).sort()];
  }, [docs]);

  // Filter documents by Category and Search Query
  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchesCategory = activeCategory === 'All' || (d.category || 'General') === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.fileName && d.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [docs, activeCategory, searchQuery]);

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* ==============================================================================
         1. HERO HEADER BANNER (INSTITUTIONAL THEME)
         ============================================================================== */}
      <section className={styles.innerDarkHeroBanner}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '30px',
                backgroundColor: 'rgba(200, 90, 50, 0.2)',
                border: '1.5px solid rgba(200, 90, 50, 0.5)',
                color: '#FCD3C1',
                fontSize: '0.8125rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={14} color="#FCD3C1" />
              <span>Official Institutional Resource Centre</span>
            </div>

            <h1
              style={{
                fontSize: '2.75rem',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 1rem 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Document Downloads &amp; Downloads Archive
            </h1>

            <p style={{ fontSize: '1.0625rem', color: '#DED4C5', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
              Access official college application forms, course syllabi, fee structures, academic calendars, circulars, and prospectus.
            </p>

            {/* UNIFIED SEARCH BOX */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                padding: '6px 8px 6px 18px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
                border: '2px solid #C85A32',
                maxWidth: '640px',
                margin: '0 auto',
              }}
            >
              <Search size={20} color="#C85A32" style={{ flexShrink: 0, marginRight: '10px' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by title, syllabus, form name..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9375rem',
                  color: '#24221F',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================================
         2. CATEGORIES FILTER BAR & CONTENT AREA
         ============================================================================== */}
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 0 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="3rem" style={{ borderRadius: '12px', marginBottom: '1rem' }} />
            <Skeleton height="100px" style={{ borderRadius: '14px' }} />
            <Skeleton height="100px" style={{ borderRadius: '14px' }} />
            <Skeleton height="100px" style={{ borderRadius: '14px' }} />
          </div>
        ) : docs.length === 0 ? (
          <EmptyState
            title="No Documents Available"
            description="Downloadable documents will be uploaded shortly by the college administrator."
          />
        ) : (
          <>
            {/* CATEGORY FILTER PILLS */}
            {categories.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '1.75rem',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #E8DFD1',
                  boxShadow: '0 4px 16px rgba(36, 34, 31, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#706A61', fontWeight: 800, fontSize: '0.8125rem', marginRight: '8px' }}>
                  <Filter size={15} color="#C85A32" />
                  <span>Category:</span>
                </div>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      style={{
                        padding: '7px 16px',
                        borderRadius: '24px',
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                        border: isActive ? '1.5px solid #C85A32' : '1px solid #E8DFD1',
                        backgroundColor: isActive ? '#C85A32' : '#FAF7F2',
                        color: isActive ? '#FFFFFF' : '#24221F',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(200, 90, 50, 0.25)' : 'none',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* RESULTS COUNT STRIP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', color: '#706A61', fontSize: '0.875rem', fontWeight: 700 }}>
              <span>
                Showing {filtered.length} document{filtered.length !== 1 ? 's' : ''}{activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#C85A32', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> Verified Official Files
              </span>
            </div>

            {/* DOCUMENT LIST CARDS */}
            {filtered.length === 0 ? (
              <EmptyState
                title={searchQuery ? `No Documents Matching "${searchQuery}"` : `No documents in "${activeCategory}"`}
                description="Try clearing your search keyword or selecting a different category above."
                actionLabel="Reset Filters"
                onAction={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map((docItem) => {
                  const formatBadge = getFormatBadgeColor(docItem.fileType || docItem.fileName);

                  return (
                    <div
                      key={docItem.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1.25rem 1.5rem',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1.5px solid #E8DFD1',
                        boxShadow: '0 4px 16px rgba(36, 34, 31, 0.04)',
                        transition: 'all 0.2s ease',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                      }}
                    >
                      {/* Left File Icon & Info */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
                        {/* File Format Icon Box */}
                        <div
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: formatBadge.bg,
                            border: `1.5px solid ${formatBadge.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getFileIcon(docItem.fileType || docItem.fileName)}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#FFF5F0',
                                color: '#C85A32',
                                border: '1px solid #FCD3C1',
                              }}
                            >
                              {docItem.category || 'General'}
                            </span>
                            {docItem.tag && (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#92400E',
                                  border: '1px solid #FCD34D',
                                }}
                              >
                                {docItem.tag}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: formatBadge.bg,
                                color: formatBadge.text,
                                border: `1px solid ${formatBadge.border}`,
                              }}
                            >
                              {(docItem.fileType || 'FILE').toUpperCase()}
                            </span>
                          </div>

                          <h3
                            style={{
                              fontSize: '1.0625rem',
                              fontWeight: 800,
                              color: '#1F1914',
                              margin: '2px 0 0 0',
                              lineHeight: 1.3,
                            }}
                          >
                            {docItem.title}
                          </h3>

                          {docItem.description && (
                            <p style={{ fontSize: '0.875rem', color: '#68705A', margin: 0, lineHeight: 1.4 }}>
                              {docItem.description}
                            </p>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#706A61', marginTop: '4px', flexWrap: 'wrap' }}>
                            {docItem.fileName && (
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4B5563' }}>
                                {docItem.fileName}
                              </span>
                            )}
                            {docItem.fileSizeFormatted && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <HardDrive size={12} color="#C85A32" /> {docItem.fileSizeFormatted}
                              </span>
                            )}
                            {docItem.createdAt && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Calendar size={12} color="#C85A32" /> {new Date(docItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Download Button */}
                      <div>
                        {docItem.fileUrl ? (
                          <a
                            href={docItem.fileUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            download={docItem.fileName || docItem.title}
                            style={{ textDecoration: 'none' }}
                          >
                            <button
                              type="button"
                              style={{
                                backgroundColor: '#C85A32',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 20px',
                                fontSize: '0.875rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 14px rgba(200, 90, 50, 0.25)',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <Download size={16} strokeWidth={2.5} />
                              <span>Download</span>
                            </button>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontWeight: 600, padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F3F4F6' }}>
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
