'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Badge } from '@/components/ui';
import { siteSettingsService } from '@/services/site-settings.service';

export default function AdminPrincipalDeskEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [principalName, setPrincipalName] = useState('Dr. S. R. Patil');
  const [qualification, setQualification] = useState('M.Sc., Ph.D. (Chemistry), FIECS');
  const [experience, setExperience] = useState('28+ Years of Academic & Administrative Excellence');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop');
  const [welcomeHeading, setWelcomeHeading] = useState("Welcome to Jaysingpur College — Empowering Minds, Shaping Futures");
  const [messageBody, setMessageBody] = useState(
    `Dear Students, Parents, and Visitors,\n\nIt is my distinct honor and privilege to welcome you to Jaysingpur College, Jaysingpur. Established with a vision to impart quality education and foster holistically empowered citizens, our institution stands as a beacon of academic excellence in Western Maharashtra.\n\nOur dedicated faculty, modern laboratory infrastructure, rich digital library resources, and vibrant extracurricular ecosystem ensure every student receives comprehensive development. We strive to nurture critical thinking, ethical leadership, and technological competence.\n\nI invite you to explore our academic programs and join us in our journey towards educational innovation.`
  );
  const [email, setEmail] = useState('principal@jaysingpurcollege.edu.in');
  const [phone, setPhone] = useState('+91 (02322) 225282');

  useEffect(() => {
    let alive = true;
    siteSettingsService.getSettings().then((settings) => {
      if (alive && settings) {
        if (settings.principalName) setPrincipalName(settings.principalName);
        if (settings.principalQualification) setQualification(settings.principalQualification);
        if (settings.principalPhotoUrl) setPhotoUrl(settings.principalPhotoUrl);
        if (settings.principalMessage) setMessageBody(settings.principalMessage);
      }
      setLoading(false);
    }).catch(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await siteSettingsService.updateSettings({
        principalName,
        principalQualification: qualification,
        principalPhotoUrl: photoUrl,
        principalMessage: messageBody,
      });
      setSuccessMsg("Principal's Desk Message updated successfully and synced with the live website!");
    } catch (err) {
      setErrorMsg('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '1000px' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
          📖 Principal's Desk &amp; Leadership Editor
        </h1>
        <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
          Non-technical editor for updating Principal's desk welcome message, photo, qualifications, and contact details on the live website.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1rem', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.875rem 1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ✕ {errorMsg}
        </div>
      )}

      <Card variant="bordered">
        <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Principal Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Principal's Full Name *
              </label>
              <Input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="Dr. S. R. Patil"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Academic Qualifications
              </label>
              <Input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="M.Sc., Ph.D. (Chemistry)"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Official Photo URL *
              </label>
              <Input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Experience &amp; Leadership Distinction
              </label>
              <Input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="28+ Years of Academic Excellence"
              />
            </div>
          </div>

          {/* Photo Preview */}
          {photoUrl && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Live Photo Preview
              </label>
              <div style={{ width: '120px', height: '140px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #DED4C5' }}>
                <img src={photoUrl} alt="Principal Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          {/* Welcome Heading */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
              Welcome Message Banner Heading
            </label>
            <Input
              type="text"
              value={welcomeHeading}
              onChange={(e) => setWelcomeHeading(e.target.value)}
            />
          </div>

          {/* Message Body */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
              Principal's Desk Message Body (Plain Text or Markdown) *
            </label>
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0px',
                border: '1.5px solid #DED4C5',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem',
                color: '#24221F',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Contact Emails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Principal Office Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Direct Office Contact Phone
              </label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Save Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2rem' }}>
              {saving ? 'Saving Message...' : "💾 Save Principal's Message"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
