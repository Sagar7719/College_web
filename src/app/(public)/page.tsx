import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { noticesService, eventsService, departmentsService } from '@/services/cms-modules.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { Badge } from '@/components/ui';
import styles from './home.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const homePage = (await pagesService.getPageById('sys_page_home')) || (await pagesService.getPageBySlug(''));
  if (homePage && homePage.status === 'published' && (homePage.seo?.metaTitle || homePage.title)) {
    return {
      title: homePage.seo?.metaTitle || homePage.title,
      description: homePage.seo?.metaDescription,
      alternates: {
        canonical: '/',
      },
      openGraph: homePage.seo?.ogImageUrl
        ? {
            images: [{ url: homePage.seo.ogImageUrl }],
          }
        : undefined,
    };
  }

  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'College';
  const title = settings.seoConfig?.defaultMetaTitle || `${collegeName} | Official Portal`;
  const description = settings.seoConfig?.defaultMetaDescription || settings.collegeInfo?.description || `Official website of ${collegeName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/',
    },
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr.slice(0, 10);
  }
}

function getEventDateParts(dateStr: string) {
  if (!dateStr) return { month: 'EVT', day: '01' };
  try {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate().toString();
    return { month, day };
  } catch {
    return { month: 'EVT', day: dateStr.slice(8, 10) || '01' };
  }
}

export default async function HomePage() {
  // Try fetching dynamic home page from Firestore if created by Admin
  const homePage = (await pagesService.getPageById('sys_page_home')) || (await pagesService.getPageBySlug(''));

  if (homePage && homePage.status === 'published' && homePage.sections?.length > 0) {
    return <PageSectionRenderer sections={homePage.sections} />;
  }

  // Fallback Academic College Home Layout when Firestore is initially empty or default
  const [notices, upcomingEvents, departments, settings] = await Promise.all([
    noticesService.getPublished(5),
    eventsService.getUpcoming(),
    departmentsService.getPublished(),
    siteSettingsService.getSettings(),
  ]);

  const collegeInfo = settings?.collegeInfo;
  const collegeName = collegeInfo?.name || 'College of Academic Excellence';
  const collegeTagline = collegeInfo?.tagline || 'Empowering Minds, Shaping Futures';
  const collegeDesc =
    collegeInfo?.description ||
    'Dedicated to academic rigor, pioneering research, and producing global leaders across science, technology, and humanities.';
  const estYear = collegeInfo?.establishedYear || '';
  const principalName = collegeInfo?.principalName || '';
  const principalTitle = collegeInfo?.principalDesignation || 'Principal';
  const principalPhoto = collegeInfo?.principalPhotoUrl || '';
  const principalMsg = collegeInfo?.principalMessage || '';

  return (
    <div>
      {/* Hero Banner Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBgOverlay} />
        {homePage?.featuredImage && (
          <div
            className={styles.heroImageBg}
            style={{ backgroundImage: `url(${homePage.featuredImage})` }}
          />
        )}

        <div className={styles.heroContentGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <span>🎓</span>
              <span>Official Institutional Portal</span>
            </div>

            <h1 className={styles.heroTitle}>{collegeName}</h1>
            <p className={styles.heroTagline}>{collegeTagline}</p>
            <p className={styles.heroDescription}>{collegeDesc}</p>

            <div className={styles.heroActions}>
              <Link href="/admissions" className={styles.heroBtnPrimary}>
                Admissions 2026 →
              </Link>
              <Link href="/departments" className={styles.heroBtnSecondary}>
                Explore Academics
              </Link>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.heroStatCard}>
              <div className={styles.heroStatIcon}>🏛️</div>
              <div>
                <div className={styles.heroStatValue}>{estYear ? `Est. ${estYear}` : 'Top Rank'}</div>
                <div className={styles.heroStatLabel}>Institutional Heritage</div>
              </div>
            </div>

            <div className={styles.heroStatCard}>
              <div className={styles.heroStatIcon}>📚</div>
              <div>
                <div className={styles.heroStatValue}>{departments.length}+</div>
                <div className={styles.heroStatLabel}>Academic Faculties</div>
              </div>
            </div>

            <div className={styles.heroStatCard}>
              <div className={styles.heroStatIcon}>📢</div>
              <div>
                <div className={styles.heroStatValue}>{notices.length}+</div>
                <div className={styles.heroStatLabel}>Live Circulars</div>
              </div>
            </div>

            <div className={styles.heroStatCard}>
              <div className={styles.heroStatIcon}>📅</div>
              <div>
                <div className={styles.heroStatValue}>{upcomingEvents.length}+</div>
                <div className={styles.heroStatLabel}>Campus Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section: Notices & Events */}
      <div className={styles.infoGrid}>
        {/* Notice Board */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionTitleIcon}>📋</span> Latest Notices
              </h2>
            </div>
            <Link href="/notices" className={styles.viewAllBtn}>
              View All →
            </Link>
          </div>

          <div className={styles.infoCardBody}>
            {notices.length > 0 ? (
              <ul className={styles.noticeList}>
                {notices.map((notice) => (
                  <li key={notice.id} className={styles.noticeItem}>
                    <div className={styles.noticeMeta}>
                      <Badge variant={notice.isUrgent ? 'danger' : 'info'}>
                        {notice.category}
                      </Badge>
                      {notice.isUrgent && <Badge variant="danger">URGENT</Badge>}
                      <span className={styles.noticeDate}>{formatDate(notice.publishDate)}</span>
                    </div>
                    <Link href={`/notices/${notice.id}`} className={styles.noticeTitleLink}>
                      {notice.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small-text" style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
                No published notices at the moment.
              </p>
            )}
          </div>
        </div>

        {/* Campus Events */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionTitleIcon}>📅</span> Upcoming Events
              </h2>
            </div>
            <Link href="/events" className={styles.viewAllBtn}>
              View All →
            </Link>
          </div>

          <div className={styles.infoCardBody}>
            {upcomingEvents.length > 0 ? (
              <ul className={styles.eventList}>
                {upcomingEvents.map((evt) => {
                  const { month, day } = getEventDateParts(evt.eventDate);
                  return (
                    <li key={evt.id} className={styles.eventItem}>
                      <div className={styles.eventDateBadge}>
                        <span className={styles.eventDateMonth}>{month}</span>
                        <span className={styles.eventDateDay}>{day}</span>
                      </div>
                      <div className={styles.eventDetails}>
                        <div className={styles.eventVenue}>
                          📍 {evt.venue || 'Campus Auditorium'} • {formatDate(evt.eventDate)}
                        </div>
                        <h4 className={styles.eventTitle}>{evt.title}</h4>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="small-text" style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
                No upcoming events scheduled at the moment.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Academic Departments Overview */}
      <section className={styles.departmentsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionTitleIcon}>🏛️</span> Academic Departments
            </h2>
            <p className={styles.sectionSubtitle}>
              Explore our specialized faculties, research divisions, and academic programs.
            </p>
          </div>
          <Link href="/departments" className={styles.viewAllBtn}>
            All Departments →
          </Link>
        </div>

        {departments.length > 0 ? (
          <div className={styles.departmentGrid}>
            {departments.map((dept) => (
              <div key={dept.id} className={styles.deptCard}>
                <div>
                  <span className={styles.deptCodeBadge}>{dept.code}</span>
                  <h3 className={styles.deptName}>{dept.name}</h3>
                  <p className={styles.deptDesc}>
                    {dept.description || 'Fostering academic excellence, innovation, and holistic student growth.'}
                  </p>
                </div>

                <div>
                  {dept.hodName && (
                    <div className={styles.deptHodInfo}>
                      👤 Head: <strong>{dept.hodName}</strong>
                    </div>
                  )}
                  <Link href={`/departments/${dept.id}`} className={styles.deptActionBtn}>
                    View Department →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="small-text" style={{ color: 'var(--text-muted)' }}>
            Department information will be available soon.
          </p>
        )}
      </section>

      {/* Leadership / Message Section (Rendered when Principal Info is configured) */}
      {(principalName || principalMsg) && (
        <section className={styles.leadershipSection}>
          <div className={styles.leadershipGrid}>
            <div className={styles.leadershipImageWrapper}>
              {principalPhoto ? (
                <img
                  src={principalPhoto}
                  alt={principalName}
                  className={styles.leadershipImage}
                />
              ) : (
                <div className={styles.leadershipFallbackIcon}>🎓</div>
              )}
            </div>

            <div className={styles.leadershipContent}>
              <span className={styles.leadershipTag}>Leadership Message</span>
              {principalMsg ? (
                <p className={styles.leadershipQuote}>&ldquo;{principalMsg}&rdquo;</p>
              ) : (
                <p className={styles.leadershipQuote}>
                  &ldquo;Our institution is committed to inspiring intellectual curiosity, fostering creative innovation, and cultivating compassionate global leaders.&rdquo;
                </p>
              )}
              {principalName && (
                <div>
                  <div className={styles.leadershipAuthor}>{principalName}</div>
                  <div className={styles.leadershipRole}>{principalTitle}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
