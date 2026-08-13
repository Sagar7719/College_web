'use client';

import React, { useEffect, useState } from 'react';
import { HomepageConfigData, GatewayCard, FeaturePillar, WhyChooseUsCard, QuickLinkItem, AccreditationItem, StatItem } from '@/types/enterprise-cms';
import { homepageConfigService, defaultHomepageData } from '@/services/enterprise-cms.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';

export default function AdminHomepageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<HomepageConfigData>(defaultHomepageData);

  useEffect(() => {
    homepageConfigService.get().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await homepageConfigService.save(data);
      setStatusMessage({ type: 'success', text: 'Homepage configuration saved successfully to Firestore (`siteSettings/homepage`)!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Array item manipulators
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
        { title: 'New Program', subtitle: 'Program Description', ctaLabel: 'Explore', href: '/courses', iconKey: 'GraduationCap', colorVariant: 'Terracotta' },
      ],
    });
  };
  const removeGatewayCard = (index: number) => {
    setData({ ...data, gatewayCards: data.gatewayCards.filter((_, i) => i !== index) });
  };

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
        { title: 'New Feature', description: 'Feature description', iconKey: 'Award', colorClass: 'whyTerracotta' },
      ],
    });
  };
  const removeWhyChooseUs = (index: number) => {
    setData({ ...data, whyChooseUs: data.whyChooseUs.filter((_, i) => i !== index) });
  };

  if (loading) return <Skeleton height="400px" />;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Enterprise CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Homepage Content &amp; Cards Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Hero Banner, Gateway Cards Deck, Why Choose Us Grid, Quick Links, and CTAs in Firestore (`siteSettings/homepage`).</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save Homepage to Firestore'}
        </Button>
      </div>

      {statusMessage && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: statusMessage.type === 'success' ? '#065F46' : '#991B1B' }}>
          {statusMessage.text}
        </div>
      )}

      {/* 1. HERO SECTION */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>1. Hero Banner Copy &amp; CTAs</h3>
          <Input label="Hero Headline" value={data.hero.headline} onChange={(e) => setData({ ...data, hero: { ...data.hero, headline: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hero Subtitle</label>
            <textarea rows={3} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Input label="CTA Button 1 Label" value={data.hero.cta1Label} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta1Label: e.target.value } })} />
            <Input label="CTA Button 1 Link" value={data.hero.cta1Href} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta1Href: e.target.value } })} />
            <Input label="CTA Button 2 Label" value={data.hero.cta2Label} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta2Label: e.target.value } })} />
            <Input label="CTA Button 2 Link" value={data.hero.cta2Href} onChange={(e) => setData({ ...data, hero: { ...data.hero, cta2Href: e.target.value } })} />
          </div>
        </CardBody>
      </Card>

      {/* 2. GATEWAY CARDS DECK */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>2. Gateway Cards Deck ({data.gatewayCards.length} Cards)</h3>
            <Button variant="outline" size="sm" onClick={addGatewayCard}>+ Add Gateway Card</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.gatewayCards.map((card, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Card #{idx + 1}: {card.title}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeGatewayCard(idx)}>Remove</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <Input label="Card Title" value={card.title} onChange={(e) => updateGatewayCard(idx, 'title', e.target.value)} />
                  <Input label="Card Subtitle" value={card.subtitle} onChange={(e) => updateGatewayCard(idx, 'subtitle', e.target.value)} />
                  <Input label="CTA Label" value={card.ctaLabel} onChange={(e) => updateGatewayCard(idx, 'ctaLabel', e.target.value)} />
                  <Input label="Target Link (href)" value={card.href} onChange={(e) => updateGatewayCard(idx, 'href', e.target.value)} />
                  <Input label="Icon Name (Lucide)" value={card.iconKey} onChange={(e) => updateGatewayCard(idx, 'iconKey', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 3. WHY CHOOSE US CARDS */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>3. &quot;Why Choose Us&quot; Feature Cards ({data.whyChooseUs.length} Cards)</h3>
            <Button variant="outline" size="sm" onClick={addWhyChooseUs}>+ Add Feature Card</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {data.whyChooseUs.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Item #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeWhyChooseUs(idx)}>Remove</Button>
                </div>
                <Input label="Title" value={item.title} onChange={(e) => updateWhyChooseUs(idx, 'title', e.target.value)} />
                <Input label="Description" value={item.description} onChange={(e) => updateWhyChooseUs(idx, 'description', e.target.value)} />
                <Input label="Icon Key" value={item.iconKey} onChange={(e) => updateWhyChooseUs(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 4. ADMISSIONS CTA BANNER */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>4. Admissions CTA Banner</h3>
          <Input label="Banner Badge" value={data.admissionCtaBadge} onChange={(e) => setData({ ...data, admissionCtaBadge: e.target.value })} />
          <Input label="Banner Title" value={data.admissionCtaTitle} onChange={(e) => setData({ ...data, admissionCtaTitle: e.target.value })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Banner Description</label>
            <textarea rows={2} value={data.admissionCtaDesc} onChange={(e) => setData({ ...data, admissionCtaDesc: e.target.value })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
