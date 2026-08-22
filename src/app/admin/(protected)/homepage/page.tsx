'use client';

import React, { useEffect, useState } from 'react';
import {
  HomepageConfigData,
  GatewayCard,
  FeaturePillar,
  WhyChooseUsCard,
  QuickLinkItem,
  AccreditationItem,
  StatItem,
} from '@/types/enterprise-cms';
import { homepageConfigService, defaultHomepageData } from '@/services/enterprise-cms.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';
import { Plus, Trash2, Save, Sparkles, Home as HomeIcon, Award, Layers, BarChart2, ShieldCheck, Link2, MapPin } from 'lucide-react';

export default function AdminHomepageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<HomepageConfigData>(defaultHomepageData);

  useEffect(() => {
    homepageConfigService
      .get()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await homepageConfigService.save(data);
      setStatusMessage({
        type: 'success',
        text: '✓ Homepage configuration saved successfully to Firestore and synced with live website!',
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save homepage data.' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Gateway Cards Manipulators ──
  const updateGatewayCard = (index: number, field: keyof GatewayCard, val: string) => {
    const updated = [...data.gatewayCards];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, gatewayCards: updated });
  };
  const addGatewayCard = () => {
    setData({
      ...data,
      gatewayCards: [
        ...data.gatewayCards,
        {
          title: 'New Gateway Card',
          subtitle: 'Card Subtitle',
          ctaLabel: 'Explore',
          href: '/courses',
          iconKey: 'GraduationCap',
          colorVariant: 'Terracotta',
        },
      ],
    });
  };
  const removeGatewayCard = (index: number) => {
    setData({ ...data, gatewayCards: data.gatewayCards.filter((_, i) => i !== index) });
  };

  // ── Stats Manipulators ──
  const updateStatItem = (index: number, field: keyof StatItem, val: any) => {
    const updated = [...data.stats];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, stats: updated });
  };

  // ── Feature Pillars Manipulators ──
  const updateFeaturePillar = (index: number, field: keyof FeaturePillar, val: string) => {
    const updated = [...(data.featurePillars || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, featurePillars: updated });
  };

  // ── Why Choose Us Manipulators ──
  const updateWhyChooseUs = (index: number, field: keyof WhyChooseUsCard, val: string) => {
    const updated = [...data.whyChooseUs];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, whyChooseUs: updated });
  };
  const addWhyChooseUs = () => {
    setData({
      ...data,
      whyChooseUs: [
        ...data.whyChooseUs,
        { title: 'New Feature Pillar', description: 'Feature description text', iconKey: 'Award', colorClass: 'whyTerracotta' },
      ],
    });
  };
  const removeWhyChooseUs = (index: number) => {
    setData({ ...data, whyChooseUs: data.whyChooseUs.filter((_, i) => i !== index) });
  };

  // ── Quick Links Manipulators ──
  const updateQuickLink = (index: number, field: keyof QuickLinkItem, val: string) => {
    const updated = [...(data.quickLinks || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, quickLinks: updated });
  };
  const addQuickLink = () => {
    setData({
      ...data,
      quickLinks: [
        ...(data.quickLinks || []),
        { label: 'New Quick Link', href: '/downloads', iconKey: 'FileText', colorClass: 'quickTerracotta' },
      ],
    });
  };
  const removeQuickLink = (index: number) => {
    setData({ ...data, quickLinks: (data.quickLinks || []).filter((_, i) => i !== index) });
  };

  // ── Accreditations Manipulators ──
  const updateAccreditation = (index: number, field: keyof AccreditationItem, val: string) => {
    const updated = [...(data.accreditations || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, accreditations: updated });
  };

  if (loading) return <Skeleton height="400px" style={{ borderRadius: '16px' }} />;

  return (
    <div style={{ paddingBottom: '4rem', maxWidth: '1200px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: '#FFF5F0', border: '1.5px solid #FCD3C1', color: '#C85A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HomeIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
              Live Home Page Content Editor
            </h1>
            <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
              Edit all Home Page sections (Hero, Gateways, Stats, Pillars, Why Choose Us, Quick Links, Accreditations &amp; CTAs).
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700, padding: '0.625rem 1.25rem', fontSize: '0.9375rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving to Database...' : 'Save All Changes'}</span>
        </Button>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            backgroundColor: statusMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: statusMessage.type === 'success' ? '1px solid #6EE7B7' : '1px solid #FCA5A5',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* ==============================================================================
         1. HERO BANNER COPY & CTAs
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <Sparkles size={20} color="#C85A32" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
              1. Hero Banner Copy &amp; CTAs
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Hero Badge Pill Text
              </label>
              <Input
                value={data.hero?.badgeText || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, badgeText: e.target.value } })}
                placeholder="e.g. EST. 1972 • NAAC 'A' GRADE"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Main Hero Headline / Tagline
              </label>
              <Input
                value={data.hero?.headline || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, headline: e.target.value } })}
                placeholder="e.g. Empowering Minds, Building Futures"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={data.hero?.subtitle || ''}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DED4C5', fontSize: '0.875rem', outline: 'none' }}
              placeholder="Hero paragraph description..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Button 1 Label
              </label>
              <Input
                value={data.hero?.cta1Label || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, cta1Label: e.target.value } })}
                placeholder="Explore Programmes"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Button 1 Link (href)
              </label>
              <Input
                value={data.hero?.cta1Href || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, cta1Href: e.target.value } })}
                placeholder="/courses"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Button 2 Label
              </label>
              <Input
                value={data.hero?.cta2Label || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, cta2Label: e.target.value } })}
                placeholder="About Our College"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Button 2 Link (href)
              </label>
              <Input
                value={data.hero?.cta2Href || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, cta2Href: e.target.value } })}
                placeholder="/about"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         2. GATEWAYS CARDS DECK
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} color="#C85A32" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
                2. Gateway Cards Deck ({data.gatewayCards.length} Cards)
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addGatewayCard}
              style={{ borderColor: '#C85A32', color: '#C85A32', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} />
              <span>Add Gateway Card</span>
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {data.gatewayCards.map((card, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  border: '1.5px solid #E8DFD1',
                  borderRadius: '12px',
                  backgroundColor: '#FAF7F2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#24221F', fontWeight: 800 }}>
                    Card #{idx + 1}: {card.title}
                  </strong>
                  <button
                    type="button"
                    onClick={() => removeGatewayCard(idx)}
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Title</label>
                  <Input value={card.title} onChange={(e) => updateGatewayCard(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Subtitle</label>
                  <Input value={card.subtitle} onChange={(e) => updateGatewayCard(idx, 'subtitle', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>CTA Label</label>
                    <Input value={card.ctaLabel} onChange={(e) => updateGatewayCard(idx, 'ctaLabel', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Target Link</label>
                    <Input value={card.href} onChange={(e) => updateGatewayCard(idx, 'href', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         3. KEY HIGHLIGHTS STATS BAR
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <BarChart2 size={20} color="#C85A32" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
              3. Key Highlights Stats Counters
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {data.stats.map((stat, idx) => (
              <div key={idx} style={{ padding: '1.25rem', border: '1.5px solid #E8DFD1', borderRadius: '12px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <strong style={{ fontSize: '0.875rem', color: '#C85A32', fontWeight: 800 }}>Stat #{idx + 1}</strong>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Label</label>
                  <Input value={stat.label} onChange={(e) => updateStatItem(idx, 'label', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Value Mode</label>
                    <select
                      value={stat.valueType}
                      onChange={(e) => updateStatItem(idx, 'valueType', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #DED4C5', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <option value="auto">Auto Calculated</option>
                      <option value="manual">Manual Number</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Suffix</label>
                    <Input value={stat.suffix || ''} onChange={(e) => updateStatItem(idx, 'suffix', e.target.value)} placeholder="e.g. +" />
                  </div>
                </div>
                {stat.valueType === 'manual' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Manual Number</label>
                    <Input
                      type="number"
                      value={stat.manualValue ?? 0}
                      onChange={(e) => updateStatItem(idx, 'manualValue', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         4. WHY CHOOSE US CARDS
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} color="#C85A32" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
                4. &quot;Why Choose Us&quot; Feature Cards ({data.whyChooseUs.length} Cards)
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addWhyChooseUs}
              style={{ borderColor: '#C85A32', color: '#C85A32', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} />
              <span>Add Feature Card</span>
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {data.whyChooseUs.map((item, idx) => (
              <div key={idx} style={{ padding: '1.25rem', border: '1.5px solid #E8DFD1', borderRadius: '12px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.875rem', color: '#24221F', fontWeight: 800 }}>Feature Card #{idx + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeWhyChooseUs(idx)}
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
                <Input label="Title" value={item.title} onChange={(e) => updateWhyChooseUs(idx, 'title', e.target.value)} />
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#24221F', marginBottom: '2px' }}>Description</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateWhyChooseUs(idx, 'description', e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #DED4C5', fontSize: '0.8125rem' }}
                  />
                </div>
                <Input label="Icon Key (Lucide)" value={item.iconKey} onChange={(e) => updateWhyChooseUs(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         5. QUICK ACCESS LINKS CAROUSEL
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link2 size={20} color="#C85A32" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
                5. Quick Access Links Cards ({data.quickLinks?.length || 0} Links)
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addQuickLink}
              style={{ borderColor: '#C85A32', color: '#C85A32', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={14} />
              <span>Add Quick Link</span>
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {(data.quickLinks || []).map((linkItem, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1.5px solid #E8DFD1', borderRadius: '10px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.8125rem', color: '#24221F', fontWeight: 800 }}>Link #{idx + 1}</strong>
                  <button
                    type="button"
                    onClick={() => removeQuickLink(idx)}
                    style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
                <Input label="Label" value={linkItem.label} onChange={(e) => updateQuickLink(idx, 'label', e.target.value)} />
                <Input label="Target Link (href)" value={linkItem.href} onChange={(e) => updateQuickLink(idx, 'href', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         6. ACCREDITATION & RECOGNITIONS BAR
         ============================================================================== */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem', borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#C85A32" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
              6. Accreditation &amp; Recognition Badges
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {(data.accreditations || []).map((acc, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1.5px solid #E8DFD1', borderRadius: '10px', backgroundColor: '#FAF7F2', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <strong style={{ fontSize: '0.8125rem', color: '#C85A32', fontWeight: 800 }}>Badge #{idx + 1}</strong>
                <Input label="Badge Title" value={acc.title} onChange={(e) => updateAccreditation(idx, 'title', e.target.value)} />
                <Input label="Subtitle" value={acc.subtitle} onChange={(e) => updateAccreditation(idx, 'subtitle', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ==============================================================================
         7. ADMISSIONS CTA BANNER
         ============================================================================== */}
      <Card variant="bordered" style={{ borderRadius: '16px', border: '1.5px solid #E8DFD1' }}>
        <CardBody style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1.5px solid #E8DFD1', paddingBottom: '0.75rem' }}>
            <MapPin size={20} color="#C85A32" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
              7. Admissions Call-To-Action Banner
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Input label="Banner Badge Pill" value={data.admissionCtaBadge || ''} onChange={(e) => setData({ ...data, admissionCtaBadge: e.target.value })} />
            <Input label="Banner Title" value={data.admissionCtaTitle || ''} onChange={(e) => setData({ ...data, admissionCtaTitle: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>Banner Description</label>
            <textarea
              rows={2}
              value={data.admissionCtaDesc || ''}
              onChange={(e) => setData({ ...data, admissionCtaDesc: e.target.value })}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #DED4C5', fontSize: '0.875rem' }}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
