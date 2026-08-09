'use client';

import React, { useEffect, useState } from 'react';
import { SiteSettings, CollegeInfo, SocialLinks, FooterConfig, GlobalSeoConfig } from '@/types';
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

type SettingsTab = 'general' | 'branding' | 'contact' | 'principal' | 'social' | 'footer' | 'seo' | 'maintenance';

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
      };

      await siteSettingsService.updateSettings(updatedPayload);
      setStatusMessage({ type: 'success', text: 'Global site settings saved successfully!' });
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
      // Opening maintenance mode -> ask confirmation
      setIsMaintenanceModalOpen(true);
    } else {
      // Turning off maintenance mode
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
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Global Configuration</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Site Settings &amp; Branding</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Configure college identity, contact information, social links, and public branding.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save Settings'}
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

      {/* Maintenance Mode Warning Banner */}
      {maintenanceMode && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: '#FFFBEB',
            color: '#92400E',
            border: '1px solid #FCD34D',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong>🚨 Maintenance Mode is Currently Active</strong>
            <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Public visitors are redirected to the maintenance page. Admin CMS remains accessible.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('maintenance')}>
            Manage Mode
          </Button>
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
                placeholder="e.g. Imperial Institute of Technology"
                value={collegeInfo.name}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Short Name / Abbreviation *"
                  placeholder="e.g. IIT or CAE"
                  value={collegeInfo.shortName}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, shortName: e.target.value })}
                  required
                />
                <Input
                  label="Established Year"
                  placeholder="e.g. 1985"
                  value={collegeInfo.establishedYear || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, establishedYear: e.target.value })}
                />
              </div>
              <Input
                label="College Tagline / Motto"
                placeholder="e.g. Empowering Minds, Shaping Global Futures"
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
            </div>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🎨 College Branding &amp; Visual Identity
              </h3>

              {/* Logo Selection */}
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
                      {collegeInfo.logoUrl ? 'Change Logo' : 'Select Logo from Media Library'}
                    </Button>
                    {collegeInfo.logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setCollegeInfo({ ...collegeInfo, logoUrl: '' })}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                  Recommended: High-resolution PNG or SVG logo with transparent background.
                </p>
              </div>

              {/* Favicon Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Browser Favicon Icon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {collegeInfo.faviconUrl ? (
                    <div style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fff' }}>
                      <img src={collegeInfo.faviconUrl} alt="Favicon" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', fontSize: '1rem' }}>
                      🌐
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('favicon')}>
                      {collegeInfo.faviconUrl ? 'Change Favicon' : 'Select Favicon Icon'}
                    </Button>
                    {collegeInfo.faviconUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setCollegeInfo({ ...collegeInfo, faviconUrl: '' })}>
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
                placeholder="e.g. 123 University Boulevard, Knowledge Park"
                value={collegeInfo.address}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, address: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="City"
                  placeholder="e.g. Boston"
                  value={collegeInfo.city || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, city: e.target.value })}
                />
                <Input
                  label="State / Province"
                  placeholder="e.g. Massachusetts"
                  value={collegeInfo.state || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, state: e.target.value })}
                />
                <Input
                  label="Postal / PIN Code"
                  placeholder="e.g. 02138"
                  value={collegeInfo.postalCode || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, postalCode: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Primary Contact Phone *"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={collegeInfo.phone}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, phone: e.target.value })}
                  required
                />
                <Input
                  label="Alternate / Helpline Phone"
                  placeholder="e.g. +1 (555) 019-2835"
                  value={collegeInfo.alternatePhone || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, alternatePhone: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Official Contact Email *"
                  type="email"
                  placeholder="e.g. admissions@college.edu"
                  value={collegeInfo.email}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, email: e.target.value })}
                  required
                />
                <Input
                  label="Official Website URL"
                  type="url"
                  placeholder="https://www.college.edu"
                  value={collegeInfo.websiteUrl || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, websiteUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 4: PRINCIPAL */}
          {activeTab === 'principal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                👨‍🏫 Head of Institution / Principal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="Principal Name"
                  placeholder="e.g. Dr. Eleanor Vance, Ph.D."
                  value={collegeInfo.principalName || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalName: e.target.value })}
                />
                <Input
                  label="Designation / Title"
                  placeholder="e.g. Principal & Director"
                  value={collegeInfo.principalDesignation || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalDesignation: e.target.value })}
                />
              </div>

              {/* Principal Photo */}
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('principal')}>
                      {collegeInfo.principalPhotoUrl ? 'Change Photo' : 'Select Photo from Media Library'}
                    </Button>
                    {collegeInfo.principalPhotoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setCollegeInfo({ ...collegeInfo, principalPhotoUrl: '' })}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Principal&apos;s Message to Students &amp; Visitors
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter the official welcome message from the Principal..."
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

          {/* TAB 5: SOCIAL */}
          {activeTab === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🌐 Official Social Media Profiles
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Social icon links will appear in the website header and footer only when a valid profile URL is entered.
              </p>
              <Input
                label="Facebook Page URL"
                placeholder="https://facebook.com/yourcollege"
                value={socialLinks.facebook || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              />
              <Input
                label="Instagram Profile URL"
                placeholder="https://instagram.com/yourcollege"
                value={socialLinks.instagram || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              />
              <Input
                label="LinkedIn Organization URL"
                placeholder="https://linkedin.com/school/yourcollege"
                value={socialLinks.linkedin || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              />
              <Input
                label="YouTube Channel URL"
                placeholder="https://youtube.com/@yourcollege"
                value={socialLinks.youtube || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              />
              <Input
                label="Twitter / X Profile URL"
                placeholder="https://x.com/yourcollege"
                value={socialLinks.twitter || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
              />
            </div>
          )}

          {/* TAB 6: FOOTER */}
          {activeTab === 'footer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                📄 Footer Text &amp; Copyright Notice
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Footer About / Mission Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief college summary displayed in the public website footer..."
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
                placeholder="e.g. © 2026 College Name. All rights reserved."
                value={footerConfig.copyrightText || ''}
                onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
              />
            </div>
          )}

          {/* TAB 7: SEO */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🔍 Global Default SEO &amp; Social Metadata
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                These default meta tags are used as fallbacks across public pages when page-specific SEO is not configured.
              </p>
              <Input
                label="Default Website Meta Title"
                placeholder="e.g. Official College Portal | Higher Education & Research"
                value={seoConfig.defaultMetaTitle || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, defaultMetaTitle: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Default Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Default search engine snippet describing the college..."
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

              {/* OG Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                  Default Social Share Image (OG Image)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {seoConfig.defaultOgImageUrl ? (
                    <img
                      src={seoConfig.defaultOgImageUrl}
                      alt="OG Preview"
                      style={{ height: '80px', width: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div style={{ height: '80px', width: '140px', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: '1.5rem' }}>
                      🖼️
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('ogImage')}>
                      {seoConfig.defaultOgImageUrl ? 'Change OG Image' : 'Select Social Share Image'}
                    </Button>
                    {seoConfig.defaultOgImageUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setSeoConfig({ ...seoConfig, defaultOgImageUrl: '' })}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
                🚨 Maintenance Mode Controls
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                When Maintenance Mode is active, public visitors will see a dedicated maintenance notice instead of normal college pages. Administrators can still log in and access all `/admin/*` panels.
              </p>

              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: maintenanceMode ? '#FEF2F2' : 'var(--bg-main)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: maintenanceMode ? '#991B1B' : 'var(--primary)' }}>
                      Maintenance Mode: {maintenanceMode ? 'ACTIVE (Public Locked)' : 'DISABLED (Public Live)'}
                    </strong>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                      {maintenanceMode ? 'Turn off maintenance mode to resume normal public website access.' : 'Turn on to perform scheduled site updates.'}
                    </p>
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
                  placeholder="Custom message shown to visitors during maintenance..."
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
          <br /><br />
          <strong>Note:</strong> You will remain logged in and can continue managing the CMS at <code>/admin/*</code>.
        </p>
      </Modal>
    </div>
  );
}
