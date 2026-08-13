'use client';

import React, { useEffect, useState } from 'react';
import { ContactPageConfigData, HelpdeskEntry, EmergencyCard } from '@/types/enterprise-cms';
import { contactPageConfigService, defaultContactData } from '@/services/enterprise-cms.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';

export default function AdminContactPageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<ContactPageConfigData>(defaultContactData);

  useEffect(() => {
    contactPageConfigService.get().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await contactPageConfigService.save(data);
      setStatusMessage({ type: 'success', text: 'Contact Page configuration saved successfully to Firestore (`siteSettings/contact`)!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Helpdesk Handlers
  const updateHelpdesk = (index: number, field: keyof HelpdeskEntry, val: string) => {
    const updated = [...data.helpdesks];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, helpdesks: updated });
  };
  const addHelpdesk = () => {
    setData({
      ...data,
      helpdesks: [
        ...data.helpdesks,
        { label: 'New Department Desk:', email: 'desk@college.edu' },
      ],
    });
  };
  const removeHelpdesk = (index: number) => {
    setData({ ...data, helpdesks: data.helpdesks.filter((_, i) => i !== index) });
  };

  // Emergency Card Handlers
  const updateEmergency = (index: number, field: keyof EmergencyCard, val: string) => {
    const updated = [...data.emergencyCards];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, emergencyCards: updated });
  };
  const addEmergency = () => {
    setData({
      ...data,
      emergencyCards: [
        ...data.emergencyCards,
        { title: 'New Safety Cell', description: 'Description', contactInfo: 'Helpline: 1800-000-000', iconKey: 'ShieldCheck' },
      ],
    });
  };
  const removeEmergency = (index: number) => {
    setData({ ...data, emergencyCards: data.emergencyCards.filter((_, i) => i !== index) });
  };

  if (loading) return <Skeleton height="400px" />;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Enterprise CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Contact Page Content Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Office Working Hours, Departmental Helpdesks Directory, and Emergency Helplines in Firestore (`siteSettings/contact`).</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save Contact Config'}
        </Button>
      </div>

      {statusMessage && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: statusMessage.type === 'success' ? '#065F46' : '#991B1B' }}>
          {statusMessage.text}
        </div>
      )}

      {/* HERO BANNER & OFFICE INFO */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>1. Hero Banner &amp; Working Hours</h3>
          <Input label="Hero Badge" value={data.hero.badgeText} onChange={(e) => setData({ ...data, hero: { ...data.hero, badgeText: e.target.value } })} />
          <Input label="Hero Title" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hero Subtitle</label>
            <textarea rows={2} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <Input label="Office Working Hours" value={data.info.officeHours} onChange={(e) => setData({ ...data, info: { ...data.info, officeHours: e.target.value } })} />
          <Input label="Office Closed Info" value={data.info.officeHoursClosed} onChange={(e) => setData({ ...data, info: { ...data.info, officeHoursClosed: e.target.value } })} />
          <Input label="Helpline Phone" value={data.info.helplinePhone} onChange={(e) => setData({ ...data, info: { ...data.info, helplinePhone: e.target.value } })} />
          <Input label="Official Desk Email" value={data.info.officialEmail} onChange={(e) => setData({ ...data, info: { ...data.info, officialEmail: e.target.value } })} />
        </CardBody>
      </Card>

      {/* DEPARTMENTAL HELPDESKS DIRECTORY */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>2. Departmental Directory Helpdesks ({data.helpdesks.length} Desks)</h3>
            <Button variant="outline" size="sm" onClick={addHelpdesk}>+ Add Helpdesk</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.helpdesks.map((hd, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Input label="Desk Label" value={hd.label} onChange={(e) => updateHelpdesk(idx, 'label', e.target.value)} />
                <Input label="Email Address" value={hd.email} onChange={(e) => updateHelpdesk(idx, 'email', e.target.value)} />
                <Button variant="ghost" size="sm" onClick={() => removeHelpdesk(idx)} style={{ marginTop: '1.5rem' }}>Remove</Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* EMERGENCY HELPLINES CARDS */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>3. Emergency &amp; Safety Helplines ({data.emergencyCards.length} Helplines)</h3>
            <Button variant="outline" size="sm" onClick={addEmergency}>+ Add Safety Cell</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {data.emergencyCards.map((card, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Safety Cell #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeEmergency(idx)}>Remove</Button>
                </div>
                <Input label="Title" value={card.title} onChange={(e) => updateEmergency(idx, 'title', e.target.value)} />
                <Input label="Description" value={card.description} onChange={(e) => updateEmergency(idx, 'description', e.target.value)} />
                <Input label="Contact Info / Room" value={card.contactInfo} onChange={(e) => updateEmergency(idx, 'contactInfo', e.target.value)} />
                <Input label="Icon Key" value={card.iconKey} onChange={(e) => updateEmergency(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
