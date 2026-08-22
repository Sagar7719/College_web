'use client';

import React, { useEffect, useState } from 'react';
import { AdmissionsConfigData, AdmissionStep, AdmissionScheduleItem, AdmissionFAQ } from '@/types/enterprise-cms';
import { admissionsConfigService, defaultAdmissionsData } from '@/services/enterprise-cms.service';
import { Card, CardBody, Button, Badge, Input, Skeleton } from '@/components/ui';

export default function AdminAdmissionsPageEditor() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [data, setData] = useState<AdmissionsConfigData>(defaultAdmissionsData);

  useEffect(() => {
    admissionsConfigService.get().then((res) => {
      setData(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await admissionsConfigService.save(data);
      setStatusMessage({ type: 'success', text: 'Admissions configuration saved successfully to Firestore (`siteSettings/admissions`)!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Steps Handlers
  const updateStep = (index: number, field: keyof AdmissionStep, val: string) => {
    const updated = [...data.steps];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, steps: updated });
  };
  const addStep = () => {
    setData({
      ...data,
      steps: [
        ...data.steps,
        { title: 'New Process Step', description: 'Step details', iconKey: 'CheckCircle2' },
      ],
    });
  };
  const removeStep = (index: number) => {
    setData({ ...data, steps: data.steps.filter((_, i) => i !== index) });
  };

  // FAQ Handlers
  const updateFaq = (index: number, field: keyof AdmissionFAQ, val: string) => {
    const updated = [...data.faqs];
    updated[index] = { ...updated[index], [field]: val };
    setData({ ...data, faqs: updated });
  };
  const addFaq = () => {
    setData({
      ...data,
      faqs: [
        ...data.faqs,
        { question: 'New Frequently Asked Question?', answer: 'Answer details here.' },
      ],
    });
  };
  const removeFaq = (index: number) => {
    setData({ ...data, faqs: data.faqs.filter((_, i) => i !== index) });
  };

  // Documents Handlers
  const updateDocumentItem = (index: number, val: string) => {
    const updated = [...data.requiredDocuments];
    updated[index] = val;
    setData({ ...data, requiredDocuments: updated });
  };
  const addDocumentItem = () => {
    setData({ ...data, requiredDocuments: [...data.requiredDocuments, 'New Mandatory Document Certificate'] });
  };
  const removeDocumentItem = (index: number) => {
    setData({ ...data, requiredDocuments: data.requiredDocuments.filter((_, i) => i !== index) });
  };

  if (loading) return <Skeleton height="400px" />;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Enterprise CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Admissions Content Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage Hero Banner, 4-Step Process, Mandatory Documents, Timeline, and FAQs in Firestore (`siteSettings/admissions`).</p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save Admissions Config'}
        </Button>
      </div>

      {statusMessage && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: statusMessage.type === 'success' ? '#065F46' : '#991B1B' }}>
          {statusMessage.text}
        </div>
      )}

      {/* HERO BANNER */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>1. Hero Banner</h3>
          <Input label="Hero Badge" value={data.hero.badgeText} onChange={(e) => setData({ ...data, hero: { ...data.hero, badgeText: e.target.value } })} />
          <Input label="Hero Title" value={data.hero.title} onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Hero Subtitle</label>
            <textarea rows={2} value={data.hero.subtitle} onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <Input label="Application Deadline Date String" value={data.applicationDeadline} onChange={(e) => setData({ ...data, applicationDeadline: e.target.value })} />
        </CardBody>
      </Card>

      {/* 4-STEP ADMISSION PROCESS */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>2. Admission Steps ({data.steps.length} Steps)</h3>
            <Button variant="outline" size="sm" onClick={addStep}>+ Add Step</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {data.steps.map((step, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Step #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeStep(idx)}>Remove</Button>
                </div>
                <Input label="Step Title" value={step.title} onChange={(e) => updateStep(idx, 'title', e.target.value)} />
                <Input label="Description" value={step.description} onChange={(e) => updateStep(idx, 'description', e.target.value)} />
                <Input label="Icon Key" value={step.iconKey} onChange={(e) => updateStep(idx, 'iconKey', e.target.value)} />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* DOCUMENTS CHECKLIST */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>3. Mandatory Documents Checklist ({data.requiredDocuments.length} Items)</h3>
            <Button variant="outline" size="sm" onClick={addDocumentItem}>+ Add Document</Button>
          </div>
          {data.requiredDocuments.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Input label="" value={item} onChange={(e) => updateDocumentItem(idx, e.target.value)} />
              <Button variant="ghost" size="sm" onClick={() => removeDocumentItem(idx)}>Remove</Button>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* FAQS ACCORDION */}
      <Card variant="bordered">
        <CardBody style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>4. Admissions FAQs ({data.faqs.length} FAQs)</h3>
            <Button variant="outline" size="sm" onClick={addFaq}>+ Add FAQ</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.faqs.map((faq, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>FAQ #{idx + 1}</strong>
                  <Button variant="ghost" size="sm" onClick={() => removeFaq(idx)}>Remove</Button>
                </div>
                <Input label="Question" value={faq.question} onChange={(e) => updateFaq(idx, 'question', e.target.value)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Answer</label>
                  <textarea rows={3} value={faq.answer} onChange={(e) => updateFaq(idx, 'answer', e.target.value)} style={{ padding: '0.625rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
