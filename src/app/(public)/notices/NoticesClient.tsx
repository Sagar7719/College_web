'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Download,
  Search,
  AlertCircle,
  Calendar,
  Tag,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Filter,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Notice } from '@/types';
import styles from '../inner.module.css';
import homeStyles from '../home.module.css';

interface NoticesClientProps {
  initialNotices: Notice[];
}

const FALLBACK_NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: 'Schedule for End-Semester Examinations 2026–27 & Hall Ticket Distribution',
    slug: 'exam-schedule-2026',
    category: 'Exam',
    content: 'All undergraduate and postgraduate students are hereby informed that the end-semester written examinations will commence from September 10, 2026. Hall tickets can be collected from respective department desks upon clearance of college dues.',
    attachmentUrl: '#',
    attachmentName: 'Exam_Schedule_Sep_2026.pdf',
    isUrgent: true,
    publishDate: '2026-08-10T09:00:00.000Z',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    title: 'First Merit List & Scrutiny Schedule for B.Sc & BCA Admissions 2026–27',
    slug: 'merit-list-admissions-2026',
    category: 'Admission',
    content: 'The first provisional merit list for admission into B.Sc (Computer Science) and BCA degree programmes has been published. Selected candidates must report to the administrative building for document verification with original transcripts before August 25, 2026.',
    attachmentUrl: '#',
    attachmentName: 'Merit_List_UG_2026.pdf',
    isUrgent: false,
    publishDate: '2026-08-08T11:30:00.000Z',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n-3',
    title: 'Submission Guidelines for Final Year Research Projects & Thesis Reports',
    slug: 'thesis-submission-guidelines',
    category: 'Academic',
    content: 'Final year M.Sc and B.Tech candidates are required to submit two hardbound copies of their research dissertation along with soft copies to their respective department HOD office.',
    attachmentUrl: '#',
    attachmentName: 'Project_Format_Guidelines.pdf',
    isUrgent: false,
    publishDate: '2026-08-05T14:00:00.000Z',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n-4',
    title: 'Independence Day Flag Hoisting Ceremony & Cultural Celebration Notice',
    slug: 'independence-day-celebration',
    category: 'General',
    content: 'All faculty members, administrative staff, and students are invited to join the 80th Independence Day Flag Hoisting Ceremony on August 15, 2026 at 7:30 AM at the main campus ground.',
    attachmentUrl: '#',
    attachmentName: 'Circular_Independence_Day.pdf',
    isUrgent: false,
    publishDate: '2026-08-02T10:00:00.000Z',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function NoticesClient({ initialNotices }: NoticesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'urgent' | 'Academic' | 'Exam' | 'Admission' | 'General'>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const noticesList = initialNotices && initialNotices.length > 0
    ? initialNotices
    : FALLBACK_NOTICES;

  const filteredNotices = useMemo(() => {
    return noticesList.filter((notice) => {
      const matchesSearch =
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notice.content && notice.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        notice.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === 'urgent') return notice.isUrgent;
      if (activeCategory !== 'all') return notice.category.toLowerCase() === activeCategory.toLowerCase();

      return true;
    });
  }, [noticesList, searchQuery, activeCategory]);

  const toggleExpand = (id: string) => {
    setExpandedNoticeId(expandedNoticeId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        day: d.getDate().toString().padStart(2, '0'),
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        year: d.getFullYear(),
        full: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    } catch {
      return { day: '12', month: 'AUG', year: 2026, full: 'August 12, 2026' };
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 1. HERO BANNER */}
      <section className={styles.heroBanner}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={16} />
              <span>Official Bulletin & Administrative Circulars Desk</span>
            </div>
            <h1 className={styles.heroTitle}>College Notices & Circulars</h1>
            <p className={styles.heroSubtitle}>
              Stay informed with real-time academic circulars, examination timetables, admissions notices, and administrative announcements.
            </p>
            <div className={styles.heroStatsRow}>
              <div className={styles.heroStatItem}>
                <FileText size={20} className={styles.statIcon} />
                <div>
                  <strong>{noticesList.length} Active Circulars</strong>
                  <span>Official Announcements</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <AlertCircle size={20} className={styles.statIcon} style={{ color: '#E29578' }} />
                <div>
                  <strong>{noticesList.filter((n) => n.isUrgent).length} Urgent Alerts</strong>
                  <span>Immediate Action Required</span>
                </div>
              </div>
              <div className={styles.heroStatItem}>
                <ShieldCheck size={20} className={styles.statIcon} />
                <div>
                  <strong>Verified PDFs</strong>
                  <span>Digitally Signed Documents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CATEGORY FILTER TOOLBAR */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.toolbarBox}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search circulars by title, keyword, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>

            <div className={styles.categoryTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'all' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Bulletins ({noticesList.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'urgent' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('urgent')}
                style={{ position: 'relative' }}
              >
                <span className={styles.urgentDot} />
                Urgent Alerts ({noticesList.filter((n) => n.isUrgent).length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'Academic' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('Academic')}
              >
                Academic
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'Exam' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('Exam')}
              >
                Exams
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'Admission' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('Admission')}
              >
                Admissions
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeCategory === 'General' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveCategory('General')}
              >
                General
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NOTICES LIST FEED */}
      <section className={styles.contentSection}>
        <div className="container">
          {filteredNotices.length > 0 ? (
            <div className={styles.noticesFeedList}>
              {filteredNotices.map((notice) => {
                const dateInfo = formatDate(notice.publishDate);
                const isExpanded = expandedNoticeId === notice.id;

                return (
                  <article
                    key={notice.id}
                    className={`${styles.noticeFeedCard} ${notice.isUrgent ? styles.urgentNoticeFeedCard : ''}`}
                  >
                    <div className={styles.noticeDateBlock}>
                      <span className={styles.noticeDay}>{dateInfo.day}</span>
                      <span className={styles.noticeMonth}>{dateInfo.month}</span>
                      <span className={styles.noticeYear}>{dateInfo.year}</span>
                    </div>

                    <div className={styles.noticeMainBody}>
                      <div className={styles.noticeTagsRow}>
                        {notice.isUrgent && (
                          <span className={styles.urgentTag}>
                            <AlertCircle size={14} />
                            <span>URGENT ALERT</span>
                          </span>
                        )}
                        <span className={styles.categoryTag}>
                          <Tag size={12} />
                          <span>{notice.category || 'General'}</span>
                        </span>
                        <span className={styles.noticeDateFull}>
                          <Calendar size={13} />
                          <span>Published {dateInfo.full}</span>
                        </span>
                      </div>

                      <h2 className={styles.noticeFeedTitle}>{notice.title}</h2>

                      {notice.content && (
                        <div className={styles.noticeContentBox}>
                          <p className={isExpanded ? styles.contentFull : styles.contentClamped}>
                            {notice.content}
                          </p>
                          {notice.content.length > 160 && (
                            <button
                              type="button"
                              className={styles.readMoreBtn}
                              onClick={() => toggleExpand(notice.id)}
                            >
                              <span>{isExpanded ? 'Show Less' : 'Read Full Announcement'}</span>
                              <ChevronDown size={14} className={isExpanded ? styles.rotateUp : ''} />
                            </button>
                          )}
                        </div>
                      )}

                      <div className={styles.noticeActionRow}>
                        {notice.attachmentUrl ? (
                          <a
                            href={notice.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={homeStyles.btnPrimaryTerracotta}
                          >
                            <Download size={16} />
                            <span>{notice.attachmentName || 'Download Official PDF'}</span>
                          </a>
                        ) : (
                          <span className={styles.verifiedNoticeBadge}>
                            <CheckCircle2 size={14} />
                            <span>Verified Administrative Circular</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyResultsBox}>
              <FileText size={44} className={styles.emptyIcon} />
              <h3>No Circulars Found</h3>
              <p>No notice matches your filter criteria "{searchQuery}".</p>
              <button
                type="button"
                className={homeStyles.btnOutlineDark}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. OFFICIAL NOTIFICATION SUBSCRIPTION CTA */}
      <section className={styles.ctaBannerSection}>
        <div className="container">
          <div className={styles.ctaBannerCard}>
            <div className={styles.ctaBadge}>
              <BellRing size={16} />
              <span>Official Circulars Bulletin Board</span>
            </div>
            <h2>Never Miss an Important College Update</h2>
            <p>Subscribe to our official broadcast list or bookmark this desk for real-time exam schedules, merit lists, and administrative notices.</p>
            <div className={styles.ctaBtns}>
              <Link href="/contact" className={homeStyles.btnPrimaryTerracotta}>
                <BellRing size={18} />
                <span>Contact Administrative Office</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/admissions" className={homeStyles.btnOutlineDark}>
                <Sparkles size={16} />
                <span>Admissions 2026 Desk</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
