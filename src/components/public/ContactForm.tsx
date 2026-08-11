'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button } from '@/components/ui';
import { contactMessageSchema } from '@/validations/contact-message.schema';
import styles from '@/app/(public)/inner.module.css';

export const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss server error after 5 seconds
  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => {
        setServerError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setServerError(null);

    // Validate fields using Zod schema
    const parseResult = contactMessageSchema.safeParse({ name, email, subject, message });
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setServerError(data.error || 'Failed to submit your message. Please try again.');
      } else {
        setSuccessMessage(data.message || "Your message has been sent successfully. We'll get back to you soon.");
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setErrors({});
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setServerError('An unexpected network error occurred. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="bordered">
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0, fontSize: '1.25rem' }}>Send A Message</h2>

        {successMessage && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
            role="alert"
          >
            <span>✓ {successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#065f46',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: '0 0.25rem',
                opacity: 0.8,
              }}
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {serverError && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
            role="alert"
          >
            <span>⚠️ {serverError}</span>
            <button
              type="button"
              onClick={() => setServerError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#991b1b',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                padding: '0 0.25rem',
                opacity: 0.8,
              }}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Your Name"
            placeholder="Enter full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            disabled={submitting}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            disabled={submitting}
            required
          />

          <Input
            label="Subject"
            placeholder="e.g. Admission Inquiry"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
            }}
            error={errors.subject}
            disabled={submitting}
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Message <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
              }}
              disabled={submitting}
              required
              style={{
                padding: '0.625rem 1.05rem',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${errors.message ? 'var(--color-danger, #ef4444)' : 'var(--color-border)'}`,
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text-main)',
                transition: 'border-color var(--transition-fast)'
              }}
            />
            {errors.message && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-danger, #ef4444)' }} role="alert">
                {errors.message}
              </p>
            )}
          </div>

          <Button variant="primary" size="md" type="submit" isLoading={submitting} disabled={submitting}>
            {submitting ? 'Sending Message...' : 'Send Message'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};
