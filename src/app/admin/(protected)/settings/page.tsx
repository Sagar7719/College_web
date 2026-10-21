'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SiteSettings,
  CollegeInfo,
  SocialLinks,
  FooterConfig,
  GlobalSeoConfig,
  HomepageConfig,
  AboutPageConfig,
  ContactPageConfig,
  AdmissionsConfig,
  GatewayCard,
  FeaturePillar,
  WhyChooseUsCard,
  StatItem,
  AccreditationItem,
  QuickLinkItem,
  HeroStatItem,
  AboutHighlightItem,
  AboutPillarCard,
  HelpdeskEntry,
  EmergencyCard,
  AdmissionStep,
  EligibilityTab,
  AdmissionScheduleItem,
  AdmissionFAQ,
} from '@/types';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Modal,
  Skeleton,
} from '@/components/ui';

type SettingsTab =
  | 'general'
  | 'branding'
  | 'contact'
  | 'principal'
  | 'homepage'
  | 'aboutPage'
  | 'admissionsPage'
  | 'contactPage'
  | 'social'
  | 'footer'
  | 'seo'
  | 'maintenance';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo>(defaultSettings.collegeInfo);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSettings.socialLinks);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultSettings.footerConfig);
  const [seoConfig, setSeoConfig] = useState<GlobalSeoConfig>(defaultSettings.seoConfig || {});
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(defaultSettings.maintenanceMessage || '');

  // Dynamic Page Configurations State
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(defaultSettings.homepage || {});
  const [aboutConfig, setAboutConfig] = useState<AboutPageConfig>(defaultSettings.aboutPage || {});
  const [contactConfig, setContactConfig] = useState<ContactPageConfig>(defaultSettings.contactPage || {});
  const [admissionsConfig, setAdmissionsConfig] = useState<AdmissionsConfig>(defaultSettings.admissions || {});

  // Media Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'favicon' | 'principal' | 'ogImage' | null>(null);

  // Maintenance Confirm Modal
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Load Settings
  useEffect(() => {
    let alive = true;
    siteSettingsService.getSettings()
      .then((data) => {
        if (alive) {
          setCollegeInfo(data.collegeInfo);
          setSocialLinks(data.socialLinks || {});
          setFooterConfig(data.footerConfig || defaultSettings.footerConfig);
          setSeoConfig(data.seoConfig || defaultSettings.seoConfig || {});
          setMaintenanceMode(Boolean(data.maintenanceMode));
          setMaintenanceMessage(data.maintenanceMessage || defaultSettings.maintenanceMessage || '');
          setHomepageConfig(data.homepage || defaultSettings.homepage || {});
          setAboutConfig(data.aboutPage || defaultSettings.aboutPage || {});
          setContactConfig(data.contactPage || defaultSettings.contactPage || {});
          setAdmissionsConfig(data.admissions || defaultSettings.admissions || {});
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  const handleOpenMediaPicker = (target: 'logo' | 'favicon' | 'principal' | 'ogImage') => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelected = (url: string) => {
    if (mediaPickerTarget === 'logo') {
      setCollegeInfo((prev) => ({ ...prev, logoUrl: url }));
    } else if (mediaPickerTarget === 'favicon') {
      setCollegeInfo((prev) => ({ ...prev, faviconUrl: url }));
    } else if (mediaPickerTarget === 'principal') {
      setCollegeInfo((prev) => ({ ...prev, principalPhotoUrl: url }));
    } else if (mediaPickerTarget === 'ogImage') {
      setSeoConfig((prev) => ({ ...prev, defaultOgImageUrl: url }));
    }
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  const handleSaveSettings = async () => {
    setStatusMessage(null);

    if (!collegeInfo.name.trim()) {
      setStatusMessage({ type: 'error', text: 'College Name is required.' });
      setActiveTab('general');
      return;
    }

    setIsSaving(true);
    try {
      const updatedPayload: Partial<SiteSettings> = {
        collegeInfo,
        socialLinks,
        footerConfig,
        seoConfig,
        maintenanceMode,
        maintenanceMessage,
        homepage: homepageConfig,
        aboutPage: aboutConfig,
        contactPage: contactConfig,
        admissions: admissionsConfig,
      };

      await siteSettingsService.updateSettings(updatedPayload);
      setStatusMessage({ type: 'success', text: 'All CMS settings saved successfully!' });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save settings.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = () => {
    if (!maintenanceMode) {
      setIsMaintenanceModalOpen(true);
    } else {
      setMaintenanceMode(false);
    }
  };

  const confirmEnableMaintenance = () => {
    setMaintenanceMode(true);
    setIsMaintenanceModalOpen(false);
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'College Info', icon: '🏛️' },
    { id: 'branding', label: 'Branding & Logo', icon: '🎨' },
    { id: 'contact', label: 'Contact Details', icon: '📍' },
    { id: 'principal', label: 'Principal Info', icon: '👨‍🏫' },
    { id: 'homepage', label: 'Homepage Editor', icon: '🏠' },
    { id: 'aboutPage', label: 'About Page Editor', icon: '📖' },
    { id: 'admissionsPage', label: 'Admissions Editor', icon: '🎓' },
    { id: 'contactPage', label: 'Contact Page Editor', icon: '📞' },
    { id: 'social', label: 'Social Handles', icon: '🌐' },
    { id: 'footer', label: 'Footer & Notice', icon: '📄' },
    { id: 'seo', label: 'Default SEO', icon: '🔍' },
    { id: 'maintenance', label: 'Maintenance Mode', icon: '🚨' },
  ];

  if (loading) {
    return (
      <div>
        <Skeleton height="3rem" width="30%" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="50px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="350px" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Global CMS Configuration</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Site Content &amp; CMS Manager</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Directly manage college identity, dynamic homepage cards, admissions guidelines, about page pillars, and contact desks.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save All Changes'}
        </Button>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${statusMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>{statusMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <p style={{ margin: 0, fontWeight: 500 }}>{statusMessage.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Settings categories"
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-main)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem' }}>
          {/* TAB 1: COLLEGE INFO */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🏛️ General College Information
              </h3>
              <Input
                label="Official College Name *"
                placeholder="e.g. Shivaji University, Kolhapur"
                value={collegeInfo.name}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Short Name / Abbreviation *"
                  placeholder="e.g. Shivaji University"
                  value={collegeInfo.shortName}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, shortName: e.target.value })}
                  required
                />
                <Input
                  label="Established Year"
                  placeholder="e.g. 1972"
                  value={collegeInfo.establishedYear || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, establishedYear: e.target.value })}
                />
                <Input
                  label="NAAC Accreditation Grade"
                  placeholder="e.g. A"
                  value={collegeInfo.naacGrade || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, naacGrade: e.target.value })}
                />
              </div>
              <Input
                label="College Tagline / Motto"
                placeholder="e.g. Empowering Education & Innovation"
                value={collegeInfo.tagline || ''}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, tagline: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  College Description
                </label>
                <textarea
                  rows={4}
                  placeholder="A brief overview about the college institution..."
                  value={collegeInfo.description || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, description: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Institutional Vision Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the vision statement..."
                  value={collegeInfo.vision || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, vision: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Institutional Mission Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the mission statement..."
                  value={collegeInfo.mission || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, mission: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🎨 College Branding &amp; Visual Identity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>College Logo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {collegeInfo.logoUrl ? (
                    <div style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
                      <img src={collegeInfo.logoUrl} alt="College Logo" style={{ height: '64px', maxWidth: '200px', objectFit: 'contain', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: '1.5rem' }}>
                      🏫
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('logo')}>
                      {collegeInfo.logoUrl ? 'Change Logo' : 'Select Logo'}
                    </Button>
                    {collegeInfo.logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setCollegeInfo({ ...collegeInfo, logoUrl: '' })}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 'contact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                📍 Campus Contact &amp; Location Details
              </h3>
              <Input
                label="Street / Campus Address *"
                value={collegeInfo.address}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, address: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="City"
                  value={collegeInfo.city || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, city: e.target.value })}
                />
                <Input
                  label="State / Province"
                  value={collegeInfo.state || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, state: e.target.value })}
                />
                <Input
                  label="Postal / PIN Code"
                  value={collegeInfo.postalCode || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, postalCode: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Primary Contact Phone *"
                  value={collegeInfo.phone}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, phone: e.target.value })}
                  required
                />
                <Input
                  label="Alternate Phone"
                  value={collegeInfo.alternatePhone || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, alternatePhone: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Official Email *"
                  type="email"
                  value={collegeInfo.email}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, email: e.target.value })}
                  required
                />
                <Input
                  label="Office Working Hours"
                  value={collegeInfo.officeHours || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, officeHours: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 4: PRINCIPAL */}
          {activeTab === 'principal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                👨‍🏫 Principal Information &amp; Welcome Message
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Principal Name"
                  value={collegeInfo.principalName || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalName: e.target.value })}
                />
                <Input
                  label="Designation / Title"
                  value={collegeInfo.principalDesignation || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalDesignation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Principal Official Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {collegeInfo.principalPhotoUrl ? (
                    <img
                      src={collegeInfo.principalPhotoUrl}
                      alt="Principal"
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      👤
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('principal')}>
                    {collegeInfo.principalPhotoUrl ? 'Change Photo' : 'Select Photo'}
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Principal Message
                </label>
                <textarea
                  rows={5}
                  value={collegeInfo.principalMessage || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalMessage: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 5: HOMEPAGE EDITOR */}
          {activeTab === 'homepage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🏠 Dynamic Homepage Sections &amp; CTAs
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Hero Button 1 Label"
                  value={homepageConfig.heroCta1Label || ''}
                  onChange={(e) => setHomepageConfig({ ...homepageConfig, heroCta1Label: e.target.value })}
                />
                <Input
                  label="Hero Button 2 Label"
                  value={homepageConfig.heroCta2Label || ''}
                  onChange={(e) => setHomepageConfig({ ...homepageConfig, heroCta2Label: e.target.value })}
                />
              </div>

              <Input
                label="Admissions Banner Badge"
                value={homepageConfig.admissionCtaBadge || ''}
                onChange={(e) => setHomepageConfig({ ...homepageConfig, admissionCtaBadge: e.target.value })}
              />
              <Input
                label="Admissions Banner Title"
                value={homepageConfig.admissionCtaTitle || ''}
                onChange={(e) => setHomepageConfig({ ...homepageConfig, admissionCtaTitle: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Admissions Banner Description
                </label>
                <textarea
                  rows={2}
                  value={homepageConfig.admissionCtaDesc || ''}
                  onChange={(e) => setHomepageConfig({ ...homepageConfig, admissionCtaDesc: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT PAGE EDITOR */}
          {activeTab === 'aboutPage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                📖 About Page Content &amp; Pillars
              </h3>
              <Input
                label="Hero Badge Text"
                value={aboutConfig.heroBadge || ''}
                onChange={(e) => setAboutConfig({ ...aboutConfig, heroBadge: e.target.value })}
              />
              <Input
                label="Hero Subtitle"
                value={aboutConfig.heroSubtitle || ''}
                onChange={(e) => setAboutConfig({ ...aboutConfig, heroSubtitle: e.target.value })}
              />
              <Input
                label="Institutional Legacy Card Title"
                value={aboutConfig.legacyTitle || ''}
                onChange={(e) => setAboutConfig({ ...aboutConfig, legacyTitle: e.target.value })}
              />
              <Input
                label="Pillars Section Title"
                value={aboutConfig.pillarsTitle || ''}
                onChange={(e) => setAboutConfig({ ...aboutConfig, pillarsTitle: e.target.value })}
              />
            </div>
          )}

          {/* TAB 7: ADMISSIONS EDITOR */}
          {activeTab === 'admissionsPage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🎓 Admissions Page Content &amp; Guidelines
              </h3>
              <Input
                label="Admissions Hero Badge"
                value={admissionsConfig.heroBadge || ''}
                onChange={(e) => setAdmissionsConfig({ ...admissionsConfig, heroBadge: e.target.value })}
              />
              <Input
                label="Admissions Hero Title"
                value={admissionsConfig.heroTitle || ''}
                onChange={(e) => setAdmissionsConfig({ ...admissionsConfig, heroTitle: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={admissionsConfig.heroSubtitle || ''}
                  onChange={(e) => setAdmissionsConfig({ ...admissionsConfig, heroSubtitle: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 8: CONTACT PAGE EDITOR */}
          {activeTab === 'contactPage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                📞 Contact Page Hero &amp; Helpdesks
              </h3>
              <Input
                label="Hero Badge"
                value={contactConfig.heroBadge || ''}
                onChange={(e) => setContactConfig({ ...contactConfig, heroBadge: e.target.value })}
              />
              <Input
                label="Hero Title"
                value={contactConfig.heroTitle || ''}
                onChange={(e) => setContactConfig({ ...contactConfig, heroTitle: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Hero Subtitle
                </label>
                <textarea
                  rows={2}
                  value={contactConfig.heroSubtitle || ''}
                  onChange={(e) => setContactConfig({ ...contactConfig, heroSubtitle: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 9: SOCIAL */}
          {activeTab === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🌐 Official Social Media Profiles
              </h3>
              <Input
                label="Facebook Page URL"
                value={socialLinks.facebook || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              />
              <Input
                label="Instagram Profile URL"
                value={socialLinks.instagram || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              />
              <Input
                label="LinkedIn Organization URL"
                value={socialLinks.linkedin || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              />
              <Input
                label="YouTube Channel URL"
                value={socialLinks.youtube || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              />
              <Input
                label="Twitter / X Profile URL"
                value={socialLinks.twitter || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              />
            </div>
          )}

          {/* TAB 10: FOOTER */}
          {activeTab === 'footer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                📄 Footer Text &amp; Copyright Notice
              </h3>
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong>🦶 Manage Footer Columns &amp; Links</strong>
                </div>
                <Link href="/admin/footer">
                  <Button variant="outline" size="sm">
                    Open Footer Links Manager →
                  </Button>
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Footer About / Mission Summary
                </label>
                <textarea
                  rows={3}
                  value={footerConfig.aboutText || ''}
                  onChange={(e) => setFooterConfig({ ...footerConfig, aboutText: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
              <Input
                label="Footer Copyright Text"
                value={footerConfig.copyrightText || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
              />
            </div>
          )}

          {/* TAB 11: SEO */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🔍 Global Default SEO &amp; Social Metadata
              </h3>
              <Input
                label="Default Website Meta Title"
                value={seoConfig.defaultMetaTitle || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, defaultMetaTitle: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  value={seoConfig.defaultMetaDescription || ''}
                  onChange={(e) => setSeoConfig({ ...seoConfig, defaultMetaDescription: e.target.value })}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 12: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🚨 Maintenance Mode Controls
              </h3>
              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: maintenanceMode ? '#FEF2F2' : 'var(--bg-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: maintenanceMode ? '#991B1B' : 'var(--primary)' }}>
                      Maintenance Mode: {maintenanceMode ? 'ACTIVE (Public Locked)' : 'DISABLED (Public Live)'}
                    </strong>
                  </div>
                  <Button
                    variant={maintenanceMode ? 'danger' : 'outline'}
                    size="md"
                    onClick={handleToggleMaintenance}
                  >
                    {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                  </Button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Maintenance Banner Message
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  style={{
                    padding: '0.625rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'inherit',
                    fontSize: '0.9375rem',
                  }}
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
        onSelectMedia={handleMediaSelected}
        allowedType="image"
      />

      {/* Maintenance Confirmation Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Activate Maintenance Mode?"
        description="Are you sure you want to activate Maintenance Mode?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmEnableMaintenance}>
              Yes, Enable Maintenance Mode
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Activating Maintenance Mode will immediately redirect public visitors to the maintenance screen.
        </p>
      </Modal>
    </div>
  );
}
