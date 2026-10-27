import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { pagesService } from '@/services/pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { homepageConfigService } from '@/services/enterprise-cms.service';
import {
  noticesService,
  eventsService,
  departmentsService,
  coursesService,
  galleryService,
  facultyService,
  downloadsService,
} from '@/services/cms-modules.service';
import { ArrowRight, Download, BellOff, FileText, FolderDown, Bell, Landmark, Mail, Quote, MapPin, PhoneCall, Map, Compass, Sparkles, GraduationCap, BookOpen, FileCheck } from 'lucide-react';
import { resolveIcon } from '@/lib/icon-resolver';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { ProgrammesCarousel } from '@/components/common/ProgrammesCarousel';
import { DepartmentsCarousel } from '@/components/common/DepartmentsCarousel';
import { EventsCarousel } from '@/components/common/EventsCarousel';
import { GalleryCarousel } from '@/components/common/GalleryCarousel';
import { QuickLinksCarousel } from '@/components/common/QuickLinksCarousel';
import { InteractiveDotGrid } from '@/components/common/InteractiveDotGrid';
import { VerticalNoticeTicker } from '@/components/common/VerticalNoticeTicker';
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
  const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
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

const colorVariantMap: Record<string, { card: string; icon: string }> = {
  Terracotta: { card: styles.gatewayCardTerracotta, icon: styles.gatewayIconTerracotta },
  Emerald: { card: styles.gatewayCardEmerald, icon: styles.gatewayIconEmerald },
  Sapphire: { card: styles.gatewayCardSapphire, icon: styles.gatewayIconSapphire },
  Gold: { card: styles.gatewayCardGold, icon: styles.gatewayIconGold },
};

export default async function HomePage() {
  const [settings, hpData, notices, upcomingEvents, departments, courses, galleryAlbums, faculty, downloads] =
    await Promise.all([
      siteSettingsService.getSettings(),
      homepageConfigService.get(),
      noticesService.getPublished(6),
      eventsService.getUpcoming(),
      departmentsService.getPublished(),
      coursesService.getPublished(),
      galleryService.getPublished(),
      facultyService.getPublished(),
      downloadsService.getPublished(),
    ]);

  const info = settings?.collegeInfo;
  const collegeName = info?.name || 'Shivaji University, Kolhapur';
  const displayCollegeName = collegeName.replace(/\b\w/g, (c) => c.toUpperCase());
  const estYear = info?.establishedYear || '1972';
  const naacGrade = info?.naacGrade || 'A';
  const tagline = hpData.hero.headline || info?.tagline || 'Empowering Minds, Building Futures';
  const description = hpData.hero.subtitle || info?.description || 'A premier higher education institution dedicated to academic rigor, pioneering research, and holistic student growth.';
  const badgeText = hpData.hero.badgeText || `EST. ${estYear} • NAAC '${naacGrade}' GRADE`;
  const principalName = info?.principalName || '';
  const principalTitle = info?.principalDesignation || 'Principal';
  const principalPhoto = info?.principalPhotoUrl || '';
  const principalMsg = info?.principalMessage || '';
  const socialLinks = settings?.socialLinks || {};

  const publishedCourses = courses.filter((c) => c.status === 'published' || !c.status);
  const publishedFaculty = faculty.filter((f) => f.status === 'published' || !f.status);
  const recentDownloads = downloads.slice(0, 4);

  const autoStatValues = [
    estYear ? (new Date().getFullYear() - parseInt(estYear, 10)) : 25,
    publishedCourses.length > 0 ? publishedCourses.length : 1,
    departments.length > 0 ? departments.length : 1,
    publishedFaculty.length > 0 ? publishedFaculty.length : 1,
  ];

  return (
    <div className={styles.homePage}>
      {/* HERO SECTION */}
      <section className={styles.heroFullBleed}>
        <div className={styles.glowBlob1} />
        <div className={styles.glowBlob2} />
        <div className={styles.glowBlob3} />
        <InteractiveDotGrid />
        <div className={styles.heroFullOverlay} />
        
        <div className={`container ${styles.heroUnifiedContainer}`}>
          <div className={styles.heroGlassCard}>
            <div className={styles.heroBadgePill}>
              <span>🏛️</span> {badgeText}
            </div>
            <h1 className={styles.heroHeadlineLightCentered}>
              <span className={styles.gradientText}>{tagline}</span>
            </h1>
            <p className={styles.heroSubtitleLightCentered}>{description}</p>
            <div className={styles.heroCtaGroupCentered}>
              <Link href={hpData.hero.cta1Href || '/courses'} className={styles.btnPrimaryTerracotta}>
                <span>{hpData.hero.cta1Label || 'Explore Programmes'}</span>
                <ArrowRight size={18} strokeWidth={2.2} className={styles.ctaArrowSvg} />
              </Link>
              <Link href={hpData.hero.cta2Href || '/about'} className={styles.btnGlassOutline}>
                <span>{hpData.hero.cta2Label || 'About Our College'}</span>
                <ArrowRight size={18} strokeWidth={2.2} className={styles.ctaArrowSvg} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* GATEWAYS BAR */}
      <section id="gateways" className={styles.heroGatewaysBar}>
        <div className="container">
          <div className={styles.masterGlassDeck}>
            <div className={styles.gatewaysGrid}>
              {hpData.gatewayCards.map((card, idx) => {
                const variant = colorVariantMap[card.colorVariant] || colorVariantMap.Terracotta;
                return (
                  <Link key={idx} href={card.href} className={`${styles.gatewayCardModern} ${variant.card}`}>
                    <div className={`${styles.gatewayIconBox} ${variant.icon}`}>
                      {resolveIcon(card.iconKey, 26, 1.8)}
                    </div>
                    <div className={styles.gatewayTitleModern}>{card.title}</div>
                    <p className={styles.gatewaySubModern}>{card.subtitle}</p>
                    <div className={styles.gatewayArrowBottom}>
                      <span>{card.ctaLabel}</span>
                      <ArrowRight size={16} strokeWidth={2.2} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section id="stats" className={styles.statsBar} aria-label="Key Highlights">
        <div className={`container ${styles.statsRow}`}>
          {hpData.stats.map((stat, idx) => (
            <div key={idx} className={styles.stat}>
              <span className={styles.statNum}>
                <AnimatedCounter
                  end={stat.valueType === 'manual' && stat.manualValue != null ? stat.manualValue : autoStatValues[idx] ?? 0}
                  suffix={stat.suffix || ''}
                />
              </span>
              <span className={styles.statLbl}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section id="features" className={styles.featureStrip} aria-label="Key Pillars">
        <div className={`container ${styles.featureRow}`}>
          {hpData.featurePillars.map((f) => (
            <div key={f.title} className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${(styles as Record<string, string>)[f.colorClass] || ''}`}>
                {resolveIcon(f.iconKey, 24)}
              </div>
              <div>
                <strong className={styles.featureName}>{f.title}</strong>
                <p className={styles.featureSub}>{f.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className={styles.secAlt} aria-label="Why Choose Us">
        <div className="container">
          <div className={styles.secHead}>
            <span className={styles.eyebrow}>Why Choose Us</span>
            <h2 className={styles.secTitle}>Why {displayCollegeName}?</h2>
            <p className={styles.secSub}>Pillars of academic leadership, modern learning, and student success.</p>
          </div>
          <div className={styles.whyGrid}>
            {hpData.whyChooseUs.map((item) => (
              <div key={item.title} className={`${styles.whyCard} ${(styles as Record<string, string>)[item.colorClass] || ''}`}>
                <div className={styles.whyIcon}>{resolveIcon(item.iconKey, 26)}</div>
                <h3 className={styles.whyCardTitle}>{item.title}</h3>
                <p className={styles.whyCardDesc}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMMES SECTION */}
      {publishedCourses.length > 0 && (
        <ProgrammesCarousel courses={publishedCourses} />
      )}

      {/* LATEST NOTICES & DOWNLOADS (VERTICAL TICKER MARQUEE) */}
      <section id="notices" className={styles.secAlt} aria-label="Notices and Downloads">
        <div className="container">
          <VerticalNoticeTicker notices={notices} downloads={downloads} />
        </div>
      </section>

      {/* QUICK ACCESS LINKS */}
      <QuickLinksCarousel quickLinks={hpData.quickLinks} />

      {/* ABOUT / EDITORIAL */}
      <section id="about" className={styles.secWhite} aria-label="About and Leadership Message">
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
              <h2 className={styles.secTitle}>{principalMsg ? `Welcome to ${displayCollegeName}` : `About ${displayCollegeName}`}</h2>
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
                <span>{hpData.aboutCtaLabel || 'Read More About Us'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENTS */}
      {departments.length > 0 && (
        <DepartmentsCarousel departments={departments} />
      )}

      {/* EVENTS */}
      <EventsCarousel events={upcomingEvents} />

      {/* GALLERY */}
      {galleryAlbums.length > 0 && (
        <GalleryCarousel albums={galleryAlbums} collegeName={collegeName} />
      )}

      {/* ACCREDITATION & RECOGNITION */}
      <section id="accreditations" className={styles.accredBar} aria-label="Accreditation & Recognition">
        <div className={`container ${styles.accredRow}`}>
          {hpData.accreditations.map((item, idx) => (
            <div key={idx} className={styles.accredItem}>
              <div className={styles.accredIcon}>
                {resolveIcon(item.iconKey, 24)}
              </div>
              <div className={styles.accredItemText}>
                <strong className={styles.accredTitle}>{idx === 3 ? `${item.title} ${estYear}` : item.title}</strong>
                <p className={styles.accredSub}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className={styles.sec} aria-label="Contact and Location">
        <div className="container">
          <div className={styles.contactRow}>
            <div className={styles.contactLeft}>
              <span className={styles.eyebrow}>Get in Touch</span>
              <h2 className={styles.secTitle}>{hpData.contactSectionTitle || 'Contact Admissions & Helpdesk'}</h2>
              <p className={styles.contactSub}>{hpData.contactSectionSubtitle || 'Reach out to our administrative team for admission guidance and official inquiries.'}</p>
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
                <h3 className={styles.mapCardTitle}>{hpData.mapCardTitle || 'Campus Address & Directions'}</h3>
                <p className={styles.mapCardDesc}>{hpData.mapCardDesc || 'Interactive campus map, building locations, and visiting hours guidance.'}</p>
                <Link href="/contact" className={styles.btnOutlineDark}>
                  <span>View Location & Directions</span>
                  <Compass size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMISSIONS CTA */}
      <section className={styles.ctaSection} aria-label="Admissions Call to Action">
        <div className="container">
          <div className={styles.ctaCardBanner}>
            <div className={styles.ctaBadge}>
              <Sparkles size={16} />
              <span>{hpData.admissionCtaBadge || 'Admissions 2026–27 Now Open'}</span>
            </div>
            <h2 className={styles.ctaTitle}>{hpData.admissionCtaTitle || 'Start Your Academic Journey With Us'}</h2>
            <p className={styles.ctaDesc}>{hpData.admissionCtaDesc || 'Applications for the 2026–27 academic session are now open. Secure your admission into our accredited programmes.'}</p>
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
