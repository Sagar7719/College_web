'use client';

import React, { useEffect, useState } from 'react';
import { AboutPageConfigData, AboutPillarCard, AboutHeroStat } from '@/types/enterprise-cms';
import { aboutPageConfigService, defaultAboutData } from '@/services/enterprise-cms.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';

export default function AdminAboutPageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<AboutPageConfigData>(defaultAboutData);

  useEffect(() => {
    Promise.all([
      aboutPageConfigService.get(),
      siteSettingsService.getSettings(),
    ]).then(([res, settings]) => {
      const collegeName = settings.collegeInfo?.name || 'Shivaji University, Kolhapur';
      const rawHeroTitle = res.hero?.title;
      const heroTitle = (!rawHeroTitle || rawHeroTitle === 'About Jaysingpur College')
        ? `About ${collegeName}`
        : rawHeroTitle.replace(/Jaysingpur College/gi, collegeName);

      const rawLegacyDesc = res.legacyOverview?.description || settings.collegeInfo?.description || '';
      const legacyDesc = rawLegacyDesc.replace(/Jaysingpur College/gi, collegeName);

      setData({
        ...defaultAboutData,
        ...res,
        hero: {
          ...defaultAboutData.hero,
          ...(res.hero || {}),
          title: heroTitle,
        },
        heroStats: res.heroStats && res.heroStats.length > 0 ? res.heroStats : defaultAboutData.heroStats,
        legacyOverview: {
          ...defaultAboutData.legacyOverview,
          ...(res.legacyOverview || {}),
          description: legacyDesc,
        },
        visionMission: { ...defaultAboutData.visionMission, ...(res.visionMission || {}) },
        principalDesk: { ...defaultAboutData.principalDesk, ...(res.principalDesk || {}) },
        pillars: res.pillars && res.pillars.length > 0 ? res.pillars : defaultAboutData.pillars,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await aboutPageConfigService.save(data);
      try {
        await siteSettingsService.updateSettings({
          principalName: data.principalDesk.name,
          principalPhotoUrl: data.principalDesk.photoUrl || '',
          principalMessage: data.principalDesk.message,
          collegeInfo: {
            principalName: data.principalDesk.name,
            principalDesignation: data.principalDesk.designation,
            principalPhotoUrl: data.principalDesk.photoUrl || '',
            principalMessage: data.principalDesk.message,
            vision: data.visionMission.vision,
            mission: data.visionMission.mission,
          } as any,
          aboutPage: {
            heroBadge: data.hero.badgeText,
            heroSubtitle: data.hero.subtitle,
            legacyTitle: data.legacyOverview.title,
            pillarsTitle: data.pillarsTitle,
            ctaBannerTitle: data.ctaBannerTitle,
            ctaBannerDesc: data.ctaBannerDesc,
          },
        });
      } catch (syncErr) {
        console.warn('Sync notice:', syncErr);
      }
      setStatusMessage({ type: 'success', text: 'About Page configuration saved successfully to Firestore (`siteSettings/about`)!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Hero Stats handlers
  const updateHeroStat = (index: number, field: keyof AboutHeroStat, val: string) => {
    const updated = [...(data.heroStats || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, heroStats: updated });
  };
  const addHeroStat = () => {
    setData({
      ...data,
      heroStats: [
        ...(data.heroStats || []),
        { label: 'New Metric', sublabel: 'Description', iconKey: 'Award' },
      ],
    });
  };
  const removeHeroStat = (index: number) => {
    setData({
      ...data,
      heroStats: (data.heroStats || []).filter((_, i) => i !== index),
    });
  };

  // Highlights handlers
  const updateHighlight = (index: number, val: string) => {
    const updated = [...data.legacyOverview.highlights];
    updated[index] = val;
    setData({ ...data, legacyOverview: { ...data.legacyOverview, highlights: updated } });
  };
  const addHighlight = () => {
    setData({
      ...data,
      legacyOverview: {
        ...data.legacyOverview,
        highlights: [...data.legacyOverview.highlights, 'New Institutional Highlight'],
      },
    });
  };
  const removeHighlight = (index: number) => {
    setData({
      ...data,
      legacyOverview: {
        ...data.legacyOverview,
        highlights: data.legacyOverview.highlights.filter((_, i) => i !== index),
      },
    });
  };

  // Pillars handlers
  const updatePillar = (index: number, field: keyof AboutPillarCard, val: string) => {
    const updated = [...data.pillars];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, pillars: updated });
  };
  const addPillar = () => {
    setData({
      ...data,
      pillars: [
        ...data.pillars,
        { title: 'New Distinction Pillar', description: 'Pillar Description', iconKey: 'BookOpen' },
      ],
    });
  };
  const removePillar = (index: number) => {
    setData({ ...data, pillars: data.pillars.filter((_, i) => i !== index) });
  };

  if (loading) return <Skeleton height="400px" />;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Enterprise CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>About Page Content Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Hero Banner, Vision/Mission, Principal Desk Message, Distinction Pillars, and Admissions CTA in Firestore (`siteSettings/about`).</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save About Page to Firestore'}
        </Button>
      </div>

      {statusMessage && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: statusMessage.type === 'success' ? '#065F46' : '#991B1B' }}>
          {statusMessage.text}
        </div>
      )}

      {/* 1. HERO BANNER & STATS */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>1. Hero Banner &amp; Accreditation Metrics</h3>
          <Input label="Hero Badge" value={data.hero.badgeText} onChange={(e) => setData({ ...data, hero: { ...data.hero, badgeText: e.target.value } })} />
          <Input label="Hero Title" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hero Subtitle</label>
            <textarea rows={3} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <strong>Hero Metric Stats ({data.heroStats?.length || 0})</strong>
            <Button variant="outline" size="sm" onClick={addHeroStat}>+ Add Metric Stat</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {(data.heroStats || []).map((stat, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Stat #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeHeroStat(idx)}>Remove</Button>
                </div>
                <Input label="Primary Label" value={stat.label} onChange={(e) => updateHeroStat(idx, 'label', e.target.value)} />
                <Input label="Sub-Label" value={stat.sublabel || ''} onChange={(e) => updateHeroStat(idx, 'sublabel', e.target.value)} />
                <Input label="Icon Key (e.g. Award, GraduationCap, Landmark)" value={stat.iconKey} onChange={(e) => updateHeroStat(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 2. LEGACY OVERVIEW & HIGHLIGHTS */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>2. Institutional Legacy &amp; Overview</h3>
          <Input label="Legacy Card Title" value={data.legacyOverview.title} onChange={(e) => setData({ ...data, legacyOverview: { ...data.legacyOverview, title: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Legacy Description</label>
            <textarea rows={3} value={data.legacyOverview.description} onChange={(e) => setData({ ...data, legacyOverview: { ...data.legacyOverview, description: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <strong>Legacy Checklist Highlights</strong>
            <Button variant="outline" size="sm" onClick={addHighlight}>+ Add Highlight</Button>
          </div>
          {data.legacyOverview.highlights.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Input label="" value={item} onChange={(e) => updateHighlight(idx, e.target.value)} />
              <Button variant="ghost" size="sm" onClick={() => removeHighlight(idx)}>Remove</Button>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* 3. VISION & MISSION */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>3. Vision &amp; Mission Statement</h3>
          <Input label="Section Title" value={data.visionMission.title || ''} placeholder="Vision & Mission Statement" onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, title: e.target.value } })} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Vision Badge Label" value={data.visionMission.visionLabel || ''} placeholder="OUR VISION" onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, visionLabel: e.target.value } })} />
            <Input label="Mission Badge Label" value={data.visionMission.missionLabel || ''} placeholder="OUR MISSION" onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, missionLabel: e.target.value } })} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Institutional Vision</label>
            <textarea rows={3} value={data.visionMission.vision} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, vision: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Institutional Mission</label>
            <textarea rows={3} value={data.visionMission.mission} onChange={(e) => setData({ ...data, visionMission: { ...data.visionMission, mission: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
        </CardBody>
      </Card>

      {/* 4. PRINCIPAL DESK */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>4. Leadership Message &amp; Principal&apos;s Desk</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Eyebrow / Badge" value={data.principalDesk.badge || ''} placeholder="Leadership Message" onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, badge: e.target.value } })} />
            <Input label="Section Title" value={data.principalDesk.title || ''} placeholder="From the Principal's Desk" onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, title: e.target.value } })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Principal Name" value={data.principalDesk.name} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, name: e.target.value } })} />
            <Input label="Designation / Title" value={data.principalDesk.designation} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, designation: e.target.value } })} />
          </div>
          <Input label="Photo URL" value={data.principalDesk.photoUrl || ''} placeholder="https://..." onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, photoUrl: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Welcome Message Quote</label>
            <textarea rows={4} value={data.principalDesk.message} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, message: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
        </CardBody>
      </Card>

      {/* 5. PILLARS GRID */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>5. Pillars of Distinction ({data.pillars.length} Pillars)</h3>
            <Button variant="outline" size="sm" onClick={addPillar}>+ Add Pillar</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Section Eyebrow" value={data.pillarsEyebrow || ''} placeholder="Institutional Core" onChange={(e) => setData({ ...data, pillarsEyebrow: e.target.value })} />
            <Input label="Section Title" value={data.pillarsTitle} placeholder="Pillars of Academic Distinction" onChange={(e) => setData({ ...data, pillarsTitle: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {data.pillars.map((pillar, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Pillar #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removePillar(idx)}>Remove</Button>
                </div>
                <Input label="Title" value={pillar.title} onChange={(e) => updatePillar(idx, 'title', e.target.value)} />
                <Input label="Description" value={pillar.description} onChange={(e) => updatePillar(idx, 'description', e.target.value)} />
                <Input label="Icon Key" value={pillar.iconKey} onChange={(e) => updatePillar(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 6. CALL-TO-ACTION BANNER */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>6. Admissions &amp; Helpdesk CTA Banner</h3>
          <Input label="CTA Badge Text" value={data.ctaBadge || ''} placeholder="Start Your Journey" onChange={(e) => setData({ ...data, ctaBadge: e.target.value })} />
          <Input label="CTA Banner Title" value={data.ctaBannerTitle || ''} placeholder="Become Part of Our Academic Heritage" onChange={(e) => setData({ ...data, ctaBannerTitle: e.target.value })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>CTA Banner Description</label>
            <textarea rows={2} value={data.ctaBannerDesc || ''} placeholder="Applications for the 2026–27 academic session are now open across all departments." onChange={(e) => setData({ ...data, ctaBannerDesc: e.target.value })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Primary Button Text" value={data.ctaPrimaryBtnText || ''} placeholder="Apply Online Now" onChange={(e) => setData({ ...data, ctaPrimaryBtnText: e.target.value })} />
            <Input label="Primary Button Link" value={data.ctaPrimaryBtnLink || ''} placeholder="/admissions" onChange={(e) => setData({ ...data, ctaPrimaryBtnLink: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Input label="Secondary Button Text" value={data.ctaSecondaryBtnText || ''} placeholder="Contact Campus Helpdesk" onChange={(e) => setData({ ...data, ctaSecondaryBtnText: e.target.value })} />
            <Input label="Secondary Button Link" value={data.ctaSecondaryBtnLink || ''} placeholder="/contact" onChange={(e) => setData({ ...data, ctaSecondaryBtnLink: e.target.value })} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
