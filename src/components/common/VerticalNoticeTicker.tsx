'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Notice, DocumentItem } from '@/types';
import { Bell, FolderDown, ArrowRight, Download, BellOff, FileText, FileCheck } from 'lucide-react';
import styles from './VerticalNoticeTicker.module.css';

interface VerticalNoticeTickerProps {
  notices: Notice[];
  downloads: DocumentItem[];
}

function formatDateBox(dateStr: string) {
  if (!dateStr) return { day: '14', month: 'AUG' };
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
    return { day, month };
  } catch {
    return { day: '14', month: 'AUG' };
  }
}

// Helper to determine badge styling based on tag text
export function renderTagBadge(rawTag?: string, isUrgent?: boolean) {
  const tag = (rawTag || '').toUpperCase().trim();

  if (isUrgent || tag === 'IMP' || tag === 'IMPORTANT' || tag === 'URGENT' || tag === 'HOT') {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeImp}`}>
        🔥 {tag || 'IMP'}
      </span>
    );
  }

  if (tag === 'NEW') {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeNew}`}>
        <span className={styles.pulseDot} />
        NEW
      </span>
    );
  }

  if (tag === 'EXAM' || tag === 'EXAMINATION' || tag === 'RESULT' || tag === 'RESULTS') {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeExam}`}>
        📝 {tag || 'EXAM'}
      </span>
    );
  }

  if (tag === 'ADMISSION' || tag === 'ADMISSIONS' || tag === 'PROSPECTUS') {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeAdmission}`}>
        🎓 {tag || 'ADMISSION'}
      </span>
    );
  }

  if (tag === 'SYLLABUS' || tag === 'FORM' || tag === 'FORMS' || tag === 'CIRCULAR') {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeSyllabus}`}>
        📚 {tag || 'SYLLABUS'}
      </span>
    );
  }

  if (tag) {
    return (
      <span className={`${styles.badgeBase} ${styles.badgeDefault}`}>
        ✨ {tag}
      </span>
    );
  }

  return null;
}

// Sub-component for individual column ticker
function ColumnTicker<T extends { id: string; title: string }>({
  title,
  icon,
  viewAllHref,
  items,
  renderItem,
  emptyTitle,
  emptyDesc,
  emptyIcon,
}: {
  title: string;
  icon: React.ReactNode;
  viewAllHref: string;
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  emptyTitle: string;
  emptyDesc: string;
  emptyIcon: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll loop effect
  useEffect(() => {
    if (isHovered || items.length <= 3) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const interval = setInterval(() => {
      if (viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 5) {
        viewport.scrollTop = 0;
      } else {
        viewport.scrollTop += 1.5;
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isHovered, items.length]);

  return (
    <div
      className={styles.tickerColumn}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className={styles.tickerHeader}>
        <div className={styles.tickerTitleGroup}>
          <span className={styles.tickerHeaderIcon}>{icon}</span>
          <h2 className={styles.tickerTitle}>{title}</h2>
        </div>

        <div className={styles.tickerControls}>
          <Link href={viewAllHref} className={styles.viewAllLink}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Viewport */}
      <div className={styles.scrollViewport} ref={viewportRef}>
        {items.length > 0 ? (
          <div className={styles.scrollTrack}>
            {items.map((item, idx) => renderItem(item, idx))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div style={{ marginBottom: '12px', color: '#C85A32' }}>{emptyIcon}</div>
            <strong style={{ fontSize: '1rem', color: '#24221F', marginBottom: '4px' }}>{emptyTitle}</strong>
            <p style={{ fontSize: '0.84375rem', margin: 0 }}>{emptyDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function VerticalNoticeTicker({ notices, downloads }: VerticalNoticeTickerProps) {
  // Infer fallback tags if not present in existing DB records
  const processedNotices = notices.map((n) => {
    let inferredTag = n.tag || '';
    if (!inferredTag) {
      if (n.isUrgent) inferredTag = 'IMP';
      else if (n.category === 'Examinations' || n.category === 'Exam') inferredTag = 'EXAM';
      else if (n.category === 'Admissions' || n.category === 'Admission') inferredTag = 'ADMISSION';
      else inferredTag = 'NEW';
    }
    return { ...n, tag: inferredTag };
  });

  const processedDownloads = downloads.map((d) => {
    let inferredTag = d.tag || '';
    if (!inferredTag) {
      if (d.category === 'Prospectus') inferredTag = 'PROSPECTUS';
      else if (d.category === 'Syllabus') inferredTag = 'SYLLABUS';
      else if (d.category === 'Forms' || d.category === 'Admissions') inferredTag = 'FORM';
      else inferredTag = 'NEW';
    }
    return { ...d, tag: inferredTag };
  });

  return (
    <div className={styles.tickerSection}>
      {/* Column 1: Latest Updates & Notices */}
      <ColumnTicker<Notice>
        title="Latest Updates & Notices"
        icon={<Bell size={22} />}
        viewAllHref="/notices"
        items={processedNotices}
        emptyTitle="No Active Circulars"
        emptyDesc="Official circulars and announcements will appear here when published."
        emptyIcon={<BellOff size={32} />}
        renderItem={(notice) => {
          const { day, month } = formatDateBox(notice.publishDate);
          return (
            <div
              key={notice.id}
              className={`${styles.cardItem} ${notice.isUrgent ? styles.urgentCard : ''}`}
            >
              <div className={styles.dateBox}>
                <span className={styles.dateDay}>{day}</span>
                <span className={styles.dateMonth}>{month}</span>
              </div>

              <div className={styles.cardBody}>
                <Link href="/notices" className={styles.cardTitle}>
                  {notice.title}
                </Link>
                <div className={styles.cardMeta}>
                  <span className={styles.categoryTag}>{notice.category}</span>
                  {renderTagBadge(notice.tag, notice.isUrgent)}
                </div>
              </div>

              {notice.attachmentUrl ? (
                <a
                  href={notice.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                  aria-label="Download Attachment"
                  title="Download File"
                >
                  <Download size={16} />
                </a>
              ) : (
                <Link href="/notices" className={styles.actionBtn} aria-label="View Notice">
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          );
        }}
      />

      {/* Column 2: Official Downloads */}
      <ColumnTicker<DocumentItem>
        title="Official Downloads"
        icon={<FolderDown size={22} />}
        viewAllHref="/downloads"
        items={processedDownloads}
        emptyTitle="No Downloads Available"
        emptyDesc="Syllabus PDFs, prospectus, and application forms will be listed here."
        emptyIcon={<FileText size={32} />}
        renderItem={(docItem) => (
          <div key={docItem.id} className={styles.cardItem}>
            <div className={styles.fileBox}>
              <FileCheck size={24} />
            </div>

            <div className={styles.cardBody}>
              <a
                href={docItem.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardTitle}
              >
                {docItem.title}
              </a>
              <div className={styles.cardMeta}>
                <span className={styles.categoryTag}>
                  {docItem.category}
                  {docItem.fileSizeFormatted ? ` • ${docItem.fileSizeFormatted}` : ''}
                </span>
                {renderTagBadge(docItem.tag)}
              </div>
            </div>

            <a
              href={docItem.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              aria-label="Download Document"
              title="Download File"
            >
              <Download size={16} />
            </a>
          </div>
        )}
      />
    </div>
  );
}
