'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteSettings, CollegeInfo, SocialLinks, FooterConfig, GlobalSeoConfig } from '@/types';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Skeleton,
} from '@/components/ui';

const STEPS = [
  { id: 1, label: 'College Info', icon: '🏛️' },
  { id: 2, label: 'Branding', icon: '🎨' },
  { id: 3, label: 'Contact Details', icon: '📍' },
  { id: 4, label: 'Principal', icon: '👨‍🏫' },
  { id: 5, label: 'Social & SEO', icon: '🌐' },
  { id: 6, label: 'Review & Finish', icon: '🚀' },
];

export default function AdminSetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Setup Form State
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo>(defaultSettings.collegeInfo);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSettings.socialLinks);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultSettings.footerConfig);
  const [seoConfig, setSeoConfig] = useState<GlobalSeoConfig>(defaultSettings.seoConfig || {});

  // Media Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'principal' | null>(null);

  // Load existing saved settings if any (partial setup recovery)
  useEffect(() => {
    let alive = true;
    siteSettingsService.getSettings()
      .then((data) => {
        if (alive) {
          if (data.collegeInfo) setCollegeInfo(data.collegeInfo);
          if (data.socialLinks) setSocialLinks(data.socialLinks);
          if (data.footerConfig) setFooterConfig(data.footerConfig);
          if (data.seoConfig) setSeoConfig(data.seoConfig);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const handleOpenMediaPicker = (target: 'logo' | 'principal') => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelected = (url: string) => {
    if (mediaPickerTarget === 'logo') {
      setCollegeInfo((prev) => ({ ...prev, logoUrl: url }));
    } else if (mediaPickerTarget === 'principal') {
      setCollegeInfo((prev) => ({ ...prev, principalPhotoUrl: url }));
    }
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
  };

  // Step validation before proceeding
  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!collegeInfo.name.trim()) {
        setErrorMessage('Please enter the official College Name.');
        return;
      }
      if (!collegeInfo.shortName.trim()) {
        setErrorMessage('Please enter a Short Name / Abbreviation.');
        return;
      }
    } else if (currentStep === 3) {
      if (!collegeInfo.address.trim()) {
        setErrorMessage('Please enter the Campus Address.');
        return;
      }
      if (!collegeInfo.phone.trim()) {
        setErrorMessage('Please enter a Primary Contact Phone number.');
        return;
      }
      if (!collegeInfo.email.trim()) {
        setErrorMessage('Please enter an Official Contact Email.');
        return;
      }
    }

    // Auto-save partial progress to Firestore
    siteSettingsService.updateSettings({
      collegeInfo,
      socialLinks,
      footerConfig,
      seoConfig,
    }).catch((err) => console.warn('Partial setup auto-save error:', err));

    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteSetup = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload: Partial<SiteSettings> = {
        collegeInfo,
        socialLinks,
        footerConfig: {
          ...footerConfig,
          copyrightText: footerConfig.copyrightText || `© ${new Date().getFullYear()} ${collegeInfo.name}. All rights reserved.`,
        },
        seoConfig: {
          ...seoConfig,
          defaultMetaTitle: seoConfig.defaultMetaTitle || `${collegeInfo.name} | Official Portal`,
          defaultMetaDescription: seoConfig.defaultMetaDescription || collegeInfo.description || `Official website of ${collegeInfo.name}.`,
        },
      };

      await siteSettingsService.completeSetup(payload);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to complete setup.';
      setErrorMessage(errMsg);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
        <Skeleton height="3rem" width="50%" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="100px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="350px" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Onboarding Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>First-Time Setup</Badge>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Welcome to Your College CMS
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Follow this quick 6-step guided wizard to configure your college branding, contact information, and public portal defaults.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          position: 'relative',
          padding: '0 0.5rem',
        }}
      >
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.375rem',
                flex: 1,
                cursor: isDone ? 'pointer' : 'default',
              }}
              onClick={() => isDone && setCurrentStep(step.id)}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  backgroundColor: isCurrent ? 'var(--primary)' : isDone ? '#059669' : 'var(--neutral-100)',
                  color: isCurrent || isDone ? '#ffffff' : 'var(--text-muted)',
                  border: isCurrent ? '2px solid var(--primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? '✓' : step.icon}
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Validation Error Alert */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Step Content Card */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem' }}>
          {/* STEP 1: COLLEGE INFO */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 1 — College Information</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Enter the official registered name and identifier for your college.
              </p>
              <Input
                label="Official College Name *"
                placeholder="e.g. Imperial Institute of Technology"
                value={collegeInfo.name}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, name: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Short Name / Acronym *"
                  placeholder="e.g. IIT"
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
                label="College Tagline"
                placeholder="e.g. Empowering Global Leaders"
                value={collegeInfo.tagline || ''}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, tagline: e.target.value })}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Brief Overview</label>
                <textarea
                  rows={3}
                  placeholder="Brief college overview description..."
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

          {/* STEP 2: BRANDING */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 2 — College Logo &amp; Branding</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Upload or select your college logo from the Media Library. If you don&apos;t have a logo right now, you can add one later from Settings.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', alignItems: 'center' }}>
                {collegeInfo.logoUrl ? (
                  <div style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff' }}>
                    <img src={collegeInfo.logoUrl} alt="Logo" style={{ height: '70px', maxWidth: '220px', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ fontSize: '3rem' }}>🏫</div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Button variant="primary" size="sm" onClick={() => handleOpenMediaPicker('logo')}>
                    {collegeInfo.logoUrl ? 'Change Logo' : 'Select Logo from Media Library'}
                  </Button>
                  {collegeInfo.logoUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setCollegeInfo({ ...collegeInfo, logoUrl: '' })}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 3 — Campus Contact Information</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                This contact information will be shown in the website header, footer, and contact page.
              </p>
              <Input
                label="Campus Address *"
                placeholder="e.g. 123 Education Campus Road"
                value={collegeInfo.address}
                onChange={(e) => setCollegeInfo({ ...collegeInfo, address: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <Input
                  label="City"
                  placeholder="e.g. City Name"
                  value={collegeInfo.city || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, city: e.target.value })}
                />
                <Input
                  label="State / Province"
                  placeholder="e.g. State"
                  value={collegeInfo.state || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, state: e.target.value })}
                />
                <Input
                  label="Postal Code"
                  placeholder="e.g. 12345"
                  value={collegeInfo.postalCode || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, postalCode: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Primary Phone *"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={collegeInfo.phone}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, phone: e.target.value })}
                  required
                />
                <Input
                  label="Official Email *"
                  type="email"
                  placeholder="e.g. info@college.edu"
                  value={collegeInfo.email}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, email: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 4: PRINCIPAL */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 4 — Principal / Head of Institution</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure the Principal&apos;s name and welcome message (optional, can also be set later).
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Principal Name"
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={collegeInfo.principalName || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalName: e.target.value })}
                />
                <Input
                  label="Designation"
                  placeholder="e.g. Principal & Director"
                  value={collegeInfo.principalDesignation || ''}
                  onChange={(e) => setCollegeInfo({ ...collegeInfo, principalDesignation: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {collegeInfo.principalPhotoUrl ? (
                  <img src={collegeInfo.principalPhotoUrl} alt="Principal" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                )}
                <Button variant="outline" size="sm" onClick={() => handleOpenMediaPicker('principal')}>
                  {collegeInfo.principalPhotoUrl ? 'Change Photo' : 'Select Photo from Media Library'}
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Principal&apos;s Message</label>
                <textarea
                  rows={4}
                  placeholder="Welcome message for students and prospective applicants..."
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

          {/* STEP 5: SOCIAL & SEO */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 5 — Social Media &amp; Default SEO</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Enter social media handles (optional) and default search engine meta settings.
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
                label="LinkedIn URL"
                placeholder="https://linkedin.com/school/yourcollege"
                value={socialLinks.linkedin || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
              />
              <Input
                label="Default SEO Website Title"
                placeholder={`${collegeInfo.name || 'College'} | Official Portal`}
                value={seoConfig.defaultMetaTitle || ''}
                onChange={(e) => setSeoConfig({ ...seoConfig, defaultMetaTitle: e.target.value })}
              />
            </div>
          )}

          {/* STEP 6: REVIEW & FINISH */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Step 6 — Review &amp; Launch Setup</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                Please review your configured initial settings. You can always edit any of these details later from the Settings page.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>🏛️</span>
                    <strong>College Info</strong>
                    <Badge variant="success" style={{ marginLeft: 'auto' }}>Ready ✓</Badge>
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>{collegeInfo.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{collegeInfo.shortName} · {collegeInfo.establishedYear || 'Est. year unlisted'}</p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>📍</span>
                    <strong>Contact Details</strong>
                    <Badge variant="success" style={{ marginLeft: 'auto' }}>Ready ✓</Badge>
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{collegeInfo.phone}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{collegeInfo.email}</p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>🎨</span>
                    <strong>Branding</strong>
                    <Badge variant={collegeInfo.logoUrl ? 'success' : 'default'} style={{ marginLeft: 'auto' }}>
                      {collegeInfo.logoUrl ? 'Configured ✓' : 'Default'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    {collegeInfo.logoUrl ? 'Official Logo uploaded' : 'Text badge logo will be used'}
                  </p>
                </div>

                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>👨‍🏫</span>
                    <strong>Principal Info</strong>
                    <Badge variant={collegeInfo.principalName ? 'success' : 'default'} style={{ marginLeft: 'auto' }}>
                      {collegeInfo.principalName ? 'Configured ✓' : 'Optional'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    {collegeInfo.principalName || 'Can be added later'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {currentStep > 1 ? (
              <Button variant="secondary" size="md" onClick={handlePrevStep} disabled={isSubmitting}>
                ← Previous
              </Button>
            ) : <div />}

            {currentStep < 6 ? (
              <Button variant="primary" size="md" onClick={handleNextStep}>
                Next Step →
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleCompleteSetup} disabled={isSubmitting}>
                {isSubmitting ? 'Finalizing Setup...' : '🚀 Complete Setup & Go to Dashboard'}
              </Button>
            )}
          </div>
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
    </div>
  );
}
