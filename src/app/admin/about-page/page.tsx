'use client';

import React, { useEffect, useState } from 'react';
import { AboutPageConfigData, AboutPillarCard, AboutHeroStat } from '@/types/enterprise-cms';
import { aboutPageConfigService, defaultAboutData } from '@/services/enterprise-cms.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';

export default function AdminAboutPageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<AboutPageConfigData>(defaultAboutData);

  useEffect(() => {
    aboutPageConfigService.get().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await aboutPageConfigService.save(data);
      setStatusMessage({ type: 'success', text: 'About Page configuration saved successfully to Firestore (`siteSettings/about`)!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setIsSaving(false);
    }
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
          <p style={{ color: 'var(--text-muted)' }}>Manage Hero Banner, Vision/Mission, Principal Desk Message, and Distinction Pillars in Firestore (`siteSettings/about`).</p>
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

      {/* HERO & OVERVIEW */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>1. Hero Banner &amp; Legacy Overview</h3>
          <Input label="Hero Badge" value={data.hero.badgeText} onChange={(e) => setData({ ...data, hero: { ...data.hero, badgeText: e.target.value } })} />
          <Input label="Hero Title" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hero Subtitle</label>
            <textarea rows={3} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
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

      {/* VISION & MISSION */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>2. Vision &amp; Mission Statement</h3>
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

      {/* PRINCIPAL DESK */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>3. From the Principal&apos;s Desk</h3>
          <Input label="Principal Name" value={data.principalDesk.name} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, name: e.target.value } })} />
          <Input label="Designation / Title" value={data.principalDesk.designation} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, designation: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Welcome Message</label>
            <textarea rows={4} value={data.principalDesk.message} onChange={(e) => setData({ ...data, principalDesk: { ...data.principalDesk, message: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
        </CardBody>
      </Card>

      {/* PILLARS GRID */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>4. Pillars of Distinction ({data.pillars.length} Pillars)</h3>
            <Button variant="outline" size="sm" onClick={addPillar}>+ Add Pillar</Button>
          </div>
          <Input label="Section Title" value={data.pillarsTitle} onChange={(e) => setData({ ...data, pillarsTitle: e.target.value })} />
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
    </div>
  );
}
