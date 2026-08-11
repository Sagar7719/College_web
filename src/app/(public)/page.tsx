import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import {
  noticesService,
  eventsService,
  departmentsService,
  coursesService,
  announcementsService,
  galleryService,
  facultyService,
  downloadsService,
} from '@/services/cms-modules.service';
import { PageSectionRenderer } from '@/components/page-builder';
import { GraduationCap, Megaphone, Building2, FileText, ArrowRight, Users, Microscope, Rocket, BookOpen, Award, FlaskConical, Briefcase, Sparkles, Landmark, Bell, Download, FileCheck, FolderDown, BellOff, Pin, Calendar, Camera, Mail, ArrowUpRight, Quote, CheckCircle2, Scroll, MapPin, PhoneCall, Map, Compass } from 'lucide-react';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { ProgrammesCarousel } from '@/components/common/ProgrammesCarousel';
import { DepartmentsCarousel } from '@/components/common/DepartmentsCarousel';
import { EventsCarousel } from '@/components/common/EventsCarousel';
import { GalleryCarousel } from '@/components/common/GalleryCarousel';
import { QuickLinksCarousel } from '@/components/common/QuickLinksCarousel';
import styles from './home.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const homePage = (await pagesService.getPageById('sys_page_home')) || (await pagesService.getPageBySlug(''));
  if (homePage && homePage.status === 'published' && (homePage.seo?.metaTitle || homePage.title)) {
    return {
      title: homePage.seo?.metaTitle || homePage.title,
      description: homePage.seo?.metaDescription,
      alternates: { canonical: '/' },
      openGraph: homePage.seo?.ogImageUrl ? { images: [{ url: homePage.seo.ogImageUrl }] } : undefined,
    };
  }
  const settings = await siteSettingsService.getSettings();
  const collegeName = settings.collegeInfo?.name || 'Jaysingpur College';
  const title = settings.seoConfig?.defaultMetaTitle || `${collegeName} | Official Institutional Website`;
  const description = settings.seoConfig?.defaultMetaDescription || settings.collegeInfo?.description || `Official website of ${collegeName}.`;
  return { title, description, alternates: { canonical: '/' } };
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr.slice(0, 10);
  }
}

function getEventDateParts(dateStr: string) {
  if (!dateStr) return { month: 'TBD', day: '--' };
  try {
    const d = new Date(dateStr);
    return { month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), day: String(d.getDate()).padStart(2, '0') };
  } catch {
    return { month: 'TBD', day: '--' };
  }
}

export default async function HomePage() {
  const homePage = (await pagesService.getPageById('sys_page_home')) || (await pagesService.getPageBySlug(''));
  if (homePage && homePage.status === 'published' && homePage.sections?.length > 0) {
    return <PageSectionRenderer sections={homePage.sections} />;
  }

  const [settings, notices, upcomingEvents, departments, courses, announcements, galleryAlbums, faculty, downloads] =
    await Promise.all([
      siteSettingsService.getSettings(),
      noticesService.getPublished(6),
      eventsService.getUpcoming(),
      departmentsService.getPublished(),
      coursesService.getAll(),
      announcementsService.getActive(),
      galleryService.getPublished(),
      facultyService.getAll(),
      downloadsService.getPublished(),
    ]);

  const info = settings?.collegeInfo;
  const collegeName = info?.name || 'Jaysingpur College';
  const tagline = info?.tagline || 'Empowering Minds, Building Futures';
  const description = info?.description || 'A premier higher education institution dedicated to academic rigor, pioneering research, and holistic student growth.';
  const estYear = info?.establishedYear || '2001';
  const principalName = info?.principalName || '';
  const principalTitle = info?.principalDesignation || 'Principal';
  const principalPhoto = info?.principalPhotoUrl || '';
  const principalMsg = info?.principalMessage || '';
  const socialLinks = settings?.socialLinks || {};

  const publishedCourses = courses.filter((c) => c.status === 'published' || !c.status);
  const publishedFaculty = faculty.filter((f) => f.status === 'published' || !f.status);
  const recentDownloads = downloads.slice(0, 4);

  const heroMasterpieceImage = '/images/hero_masterpiece.png';

  return (
    <div className={styles.homePage}>
      {/* 2. ULTRA-PREMIUM FULL-WIDTH PANORAMIC HERO SECTION */}
      <section
        className={styles.heroFullBleed}
        style={{ backgroundImage: `url('/images/fullwidth_hero_students.png')` }}
      >
        <div className={styles.heroFullOverlay} />
        <div className={`container ${styles.heroFullContentGrid}`}>
          {/* Left Text Column */}
          <div className={styles.heroLeftBlock}>
            <div className={styles.heroBadgePill}>
              <span>🏛️</span> {collegeName.toUpperCase()} • EST. {estYear} • NAAC 'A' GRADE
            </div>
            <h1 className={styles.heroHeadlineLight}>{tagline}</h1>
            <p className={styles.heroSubtitleLight}>{description}</p>
            <div className={styles.heroCtaGroup}>
              <Link href="/courses" className={styles.btnPrimaryTerracotta}>
                <span>Explore Programmes</span>
                <ArrowRight size={18} strokeWidth={2.2} className={styles.ctaArrowSvg} />
              </Link>
              <Link href="/about" className={styles.btnGlassOutline}>
                <span>About Our College</span>
                <ArrowRight size={18} strokeWidth={2.2} className={styles.ctaArrowSvg} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. UNIFIED ULTRA-PREMIUM GLASSMORPHISM DECK */}
      <section className={styles.heroGatewaysBar}>
        <div className="container">
          <div className={styles.masterGlassDeck}>
            <div className={styles.gatewaysGrid}>
              <Link href="/courses" className={styles.gatewayCardModern}>
                <div className={styles.gatewayIconBox}>
                  <GraduationCap size={26} strokeWidth={1.8} />
                </div>
                <div className={styles.gatewayTitleModern}>Academic Degrees</div>
                <div className={styles.gatewayArrowBottom}>
                  <span>Explore</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </div>
              </Link>
              <Link href="/admissions" className={styles.gatewayCardModern}>
                <div className={styles.gatewayIconBox}>
                  <Megaphone size={26} strokeWidth={1.8} />
                </div>
                <div className={styles.gatewayTitleModern}>Admissions 2026</div>
                <div className={styles.gatewayArrowBottom}>
                  <span>Apply Now</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </div>
              </Link>
              <Link href="/departments" className={styles.gatewayCardModern}>
                <div className={styles.gatewayIconBox}>
                  <Building2 size={26} strokeWidth={1.8} />
                </div>
                <div className={styles.gatewayTitleModern}>Departments</div>
                <div className={styles.gatewayArrowBottom}>
                  <span>View All</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </div>
              </Link>
              <Link href="/notices" className={styles.gatewayCardModern}>
                <div className={styles.gatewayIconBox}>
                  <FileText size={26} strokeWidth={1.8} />
                </div>
                <div className={styles.gatewayTitleModern}>Academic Bulletins</div>
                <div className={styles.gatewayArrowBottom}>
                  <span>Circulars</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC STATS STRIP (#FFFFFF Surface) */}
      <section className={styles.statsBar} aria-label="Key Highlights">
        <div className={`container ${styles.statsRow}`}>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              <AnimatedCounter end={estYear ? (new Date().getFullYear() - parseInt(estYear, 10)) : 25} suffix="+" />
            </span>
            <span className={styles.statLbl}>Years of Excellence</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              <AnimatedCounter end={publishedCourses.length > 0 ? publishedCourses.length : 1} suffix="+" />
            </span>
            <span className={styles.statLbl}>Academic Programmes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              <AnimatedCounter end={departments.length > 0 ? departments.length : 1} suffix="" />
            </span>
            <span className={styles.statLbl}>Departments</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              <AnimatedCounter end={publishedFaculty.length > 0 ? publishedFaculty.length : 1} suffix="+" />
            </span>
            <span className={styles.statLbl}>Faculty Members</span>
          </div>
        </div>
      </section>

      {/* 4. FEATURE STRIP (#EFE7DA Warm Sand) */}
      <section className={styles.featureStrip} aria-label="Key Pillars">
        <div className={`container ${styles.featureRow}`}>
          {[
            {
              icon: <GraduationCap size={24} />,
              title: 'Academic Excellence',
              sub: 'Rigorous curriculum aligned with industry standards',
            },
            {
              icon: <Users size={24} />,
              title: 'Experienced Faculty',
              sub: 'Distinguished educators and active researchers',
            },
            {
              icon: <Microscope size={24} />,
              title: 'Modern Infrastructure',
              sub: 'Tech labs, digital classrooms, and central archive',
            },
            {
              icon: <Rocket size={24} />,
              title: 'Student Success',
              sub: 'Dedicated placement cell and career guidance',
            },
          ].map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <div>
                <strong className={styles.featureName}>{f.title}</strong>
                <p className={styles.featureSub}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE US (#EFE7DA Sand Background with White Cards) */}
      <section className={styles.secAlt} aria-label="Why Choose Us">
        <div className="container">
          <div className={styles.secHead}>
            <span className={styles.eyebrow}>Why Choose Us</span>
            <h2 className={styles.secTitle}>Why {collegeName}?</h2>
            <p className={styles.secSub}>Pillars of academic leadership, modern learning, and student success.</p>
          </div>
          <div className={styles.whyGrid}>
            {[
              {
                icon: <BookOpen size={26} />,
                title: 'Academic Excellence',
                desc: 'Comprehensive undergraduate, postgraduate, and diploma courses across diverse faculties.',
              },
              {
                icon: <Award size={26} />,
                title: 'Expert Faculty',
                desc: 'Accomplished mentors fostering scientific inquiry, critical thinking, and innovation.',
              },
              {
                icon: <FlaskConical size={26} />,
                title: 'Modern Laboratories',
                desc: 'State-of-the-art facilities for computer science, physical sciences, and practical research.',
              },
              {
                icon: <Briefcase size={26} />,
                title: 'Placement Support',
                desc: 'Proactive career guidance cell driving campus hiring drives with leading recruiters.',
              },
              {
                icon: <Sparkles size={26} />,
                title: 'Holistic Development',
                desc: 'Active NSS, NCC, sports, cultural societies, and community development initiatives.',
              },
              {
                icon: <Landmark size={26} />,
                title: 'Vibrant Campus Life',
                desc: 'Engaging student clubs, seminars, annual youth festivals, and academic symposiums.',
              },
            ].map((item) => (
              <div key={item.title} className={styles.whyCard}>
                <div className={styles.whyIcon}>{item.icon}</div>
                <h3 className={styles.whyCardTitle}>{item.title}</h3>
                <p className={styles.whyCardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PROGRAMMES SECTION (#F7F2E9 Warm Ivory Background) */}
      {publishedCourses.length > 0 && (
        <ProgrammesCarousel courses={publishedCourses} />
      )}

      {/* 7. LATEST NOTICES & DOWNLOADS (#EFE7DA Sand Background) */}
      <section className={styles.secAlt} aria-label="Notices and Downloads">
        <div className="container">
          <div className={styles.noticeDownloadGrid}>
            {/* Left: Latest Notices */}
            <div className={styles.ndColumn}>
              <div className={styles.ndHeader}>
                <h2 className={styles.ndTitle}>
                  <Bell size={20} className={styles.ndHeaderIcon} />
                  <span>Latest Updates & Notices</span>
                </h2>
                <Link href="/notices" className={styles.ndViewAll}>
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.ndList}>
                {notices.length > 0 ? (
                  notices.slice(0, 5).map((n) => (
                    <div key={n.id} className={`${styles.ndItem} ${n.isUrgent ? styles.ndUrgent : ''}`}>
                      <div className={styles.ndDate}>{formatDate(n.publishDate)}</div>
                      <div className={styles.ndBody}>
                        <Link href="/notices" className={styles.ndItemTitle}>{n.title}</Link>
                        <span className={`${styles.ndCat} ${n.isUrgent ? styles.ndCatRed : ''}`}>{n.category}</span>
                      </div>
                      {n.attachmentUrl && (
                        <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.ndDownloadBtn} aria-label="Download Attachment">
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.ndEmptyBox}>
                    <div className={styles.ndEmptyIconBadge}>
                      <BellOff size={24} />
                    </div>
                    <strong className={styles.ndEmptyTitle}>No Active Circulars</strong>
                    <p className={styles.ndEmptyDesc}>Official circulars and announcements will appear here when published.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Downloads */}
            <div className={styles.ndColumn}>
              <div className={styles.ndHeader}>
                <h2 className={styles.ndTitle}>
                  <FolderDown size={20} className={styles.ndHeaderIcon} />
                  <span>Official Downloads</span>
                </h2>
                <Link href="/downloads" className={styles.ndViewAll}>
                  <span>View All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className={styles.ndList}>
                {recentDownloads.length > 0 ? (
                  recentDownloads.map((d) => (
                    <div key={d.id} className={styles.ndItem}>
                      <div className={styles.ndFileIcon}>
                        <FileCheck size={20} />
                      </div>
                      <div className={styles.ndBody}>
                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.ndItemTitle}>{d.title}</a>
                        <span className={styles.ndCat}>{d.category}{d.fileSizeFormatted ? ` • ${d.fileSizeFormatted}` : ''}</span>
                      </div>
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.ndDownloadBtn} aria-label="Download File">
                        <Download size={16} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className={styles.ndEmptyBox}>
                    <div className={styles.ndEmptyIconBadge}>
                      <FileText size={24} />
                    </div>
                    <strong className={styles.ndEmptyTitle}>No Downloads Available</strong>
                    <p className={styles.ndEmptyDesc}>Syllabus PDFs, prospectus, and application forms will be listed here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUICK ACCESS LINKS (#F7F2E9 Warm Ivory Background) */}
      <QuickLinksCarousel />

      {/* 9. ABOUT / EDITORIAL (#FFFFFF White Surface Background) */}
      <section className={styles.secWhite} aria-label="About and Leadership Message">
        <div className="container">
          <div className={styles.aboutRow}>
            <div className={styles.aboutImg}>
              {principalPhoto ? (
                <img src={principalPhoto} alt={principalName || 'College Principal'} className={styles.aboutImage} loading="lazy" />
              ) : (
                <div className={styles.aboutFallbackCard}>
                  <div className={styles.aboutFallbackIconBadge}>
                    <Landmark size={44} />
                  </div>
                  <strong className={styles.aboutFallbackTitle}>{collegeName}</strong>
                  <span className={styles.aboutFallbackTag}>Official Leadership Portal</span>
                </div>
              )}
            </div>
            <div className={styles.aboutText}>
              <span className={styles.eyebrow}>{principalMsg ? "Principal's Message" : 'About Our College'}</span>
              <h2 className={styles.secTitle}>{principalMsg ? `Welcome to ${collegeName}` : `About ${collegeName}`}</h2>
              {principalMsg ? (
                <div className={styles.quoteWrapper}>
                  <Quote size={28} className={styles.quoteIcon} />
                  <blockquote className={styles.aboutQuote}>&ldquo;{principalMsg}&rdquo;</blockquote>
                  {principalName && (
                    <p className={styles.aboutAuthor}>
                      — <strong>{principalName}</strong>, <span>{principalTitle}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className={styles.aboutDesc}>{description}</p>
              )}
              <Link href="/about" className={styles.btnPrimaryTerracotta}>
                <span>Read More About Us</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. DEPARTMENTS (#EFE7DA Sand Background) */}
      {departments.length > 0 && (
        <DepartmentsCarousel departments={departments} />
      )}

      {/* 11. EVENTS (#F7F2E9 Warm Ivory Background) */}
      <EventsCarousel events={upcomingEvents} />

      {/* 12. GALLERY (#EFE7DA Sand Background) */}
      {galleryAlbums.length > 0 && (
        <GalleryCarousel albums={galleryAlbums} collegeName={collegeName} />
      )}

      {/* 13. ACCREDITATION STRIP (#FFFFFF Surface) */}
      <section className={styles.accredBar} aria-label="Accreditation & Recognition">
        <div className={`container ${styles.accredRow}`}>
          <div className={styles.accredItem}>
            <div className={styles.accredIcon}>
              <Landmark size={22} />
            </div>
            <div>
              <strong>Affiliated Institution</strong>
              <p>University Recognition</p>
            </div>
          </div>
          <div className={styles.accredItem}>
            <div className={styles.accredIcon}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <strong>UGC Recognized</strong>
              <p>Section 2(f) & 12(B)</p>
            </div>
          </div>
          <div className={styles.accredItem}>
            <div className={styles.accredIcon}>
              <Award size={22} />
            </div>
            <div>
              <strong>NAAC Accredited</strong>
              <p>Quality Benchmark</p>
            </div>
          </div>
          <div className={styles.accredItem}>
            <div className={styles.accredIcon}>
              <Scroll size={22} />
            </div>
            <div>
              <strong>Established {estYear}</strong>
              <p>Legacy of Learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. CONTACT (#F7F2E9 Background) */}
      <section className={styles.sec} aria-label="Contact and Location">
        <div className="container">
          <div className={styles.contactRow}>
            <div className={styles.contactLeft}>
              <span className={styles.eyebrow}>Get in Touch</span>
              <h2 className={styles.secTitle}>Contact Admissions & Helpdesk</h2>
              <p className={styles.contactSub}>Reach out to our administrative team for admission guidance and official inquiries.</p>
              <div className={styles.contactList}>
                {info?.address && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconBadge}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <strong>Campus Address</strong>
                      <span>{info.address}{info.city ? `, ${info.city}` : ''}{info.state ? `, ${info.state}` : ''}</span>
                    </div>
                  </div>
                )}
                {info?.phone && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconBadge}>
                      <PhoneCall size={20} />
                    </div>
                    <div>
                      <strong>Admission Helpline</strong>
                      <a href={`tel:${info.phone}`}>{info.phone}</a>
                    </div>
                  </div>
                )}
                {info?.email && (
                  <div className={styles.contactItem}>
                    <div className={styles.contactIconBadge}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <strong>Official Email Desk</strong>
                      <a href={`mailto:${info.email}`}>{info.email}</a>
                    </div>
                  </div>
                )}
              </div>
              {Object.values(socialLinks).some(Boolean) && (
                <div className={styles.socialIcons}>
                  {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className={styles.socialIcon}>FB</a>}
                  {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.socialIcon}>IG</a>}
                  {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className={styles.socialIcon}>YT</a>}
                  {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className={styles.socialIcon}>TW</a>}
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={styles.socialIcon}>IN</a>}
                </div>
              )}
              <Link href="/contact" className={styles.btnPrimaryTerracotta}>
                <span>Contact Us Directly</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className={styles.contactRight}>
              <div className={styles.mapCardBox}>
                <div className={styles.mapIconBadge}>
                  <Map size={40} />
                </div>
                <h3 className={styles.mapCardTitle}>Campus Address & Directions</h3>
                <p className={styles.mapCardDesc}>Interactive campus map, building locations, and visiting hours guidance.</p>
                <Link href="/contact" className={styles.btnOutlineDark}>
                  <span>View Location & Directions</span>
                  <Compass size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15. ADMISSIONS CTA (#EFE7DA Sand Background) */}
      <section className={styles.ctaSection} aria-label="Admissions Call to Action">
        <div className="container">
          <div className={styles.ctaCardBanner}>
            <div className={styles.ctaBadge}>
              <Sparkles size={16} />
              <span>Admissions 2026–27 Now Open</span>
            </div>
            <h2 className={styles.ctaTitle}>Start Your Academic Journey With Us</h2>
            <p className={styles.ctaDesc}>Applications for the 2026–27 academic session are now open. Secure your admission into our accredited programmes.</p>
            <div className={styles.ctaBtns}>
              <Link href="/admissions" className={styles.btnPrimaryTerracotta}>
                <GraduationCap size={18} />
                <span>Apply Online Now</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/courses" className={styles.btnOutlineDark}>
                <BookOpen size={16} />
                <span>Explore Programmes</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
