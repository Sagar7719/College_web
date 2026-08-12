'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';
import { contactMessageSchema } from '@/validations/contact-message.schema';
import styles from '@/app/(public)/inner.module.css';
import homeStyles from '@/app/(public)/home.module.css';

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
        setSuccessMessage(data.message || "Your message has been sent successfully. Our helpdesk team will respond to your email shortly.");
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
    <div className={styles.executiveFormCard}>
      <div className={styles.cardHeaderBox}>
        <MessageSquare size={24} className={styles.cardHeaderIcon} />
        <div>
          <h2>Send Us a Direct Message</h2>
          <p>Fill out the form below and our administrative helpdesk will respond promptly.</p>
        </div>
      </div>

      {successMessage && (
        <div className={styles.alertSuccessBox} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className={styles.alertCloseBtn}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {serverError && (
        <div className={styles.alertErrorBox} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className={styles.alertCloseBtn}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.contactFormBody}>
        <div className={styles.formRowTwoCol}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Your Full Name <span className={styles.reqStar}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.formControl} ${errors.name ? styles.controlError : ''}`}
              placeholder="e.g. Sagar Ulagadde"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              disabled={submitting}
              required
            />
            {errors.name && <span className={styles.fieldErrorText}>{errors.name}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              Email Address <span className={styles.reqStar}>*</span>
            </label>
            <input
              type="email"
              className={`${styles.formControl} ${errors.email ? styles.controlError : ''}`}
              placeholder="sagarulagadde1008@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              disabled={submitting}
              required
            />
            {errors.email && <span className={styles.fieldErrorText}>{errors.email}</span>}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Subject / Inquiry Department <span className={styles.reqStar}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.formControl} ${errors.subject ? styles.controlError : ''}`}
            placeholder="e.g. Admission Guidance / Course Inquiry"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
            }}
            disabled={submitting}
            required
          />
          {errors.subject && <span className={styles.fieldErrorText}>{errors.subject}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            Message <span className={styles.reqStar}>*</span>
          </label>
          <textarea
            rows={5}
            className={`${styles.formControl} ${errors.message ? styles.controlError : ''}`}
            placeholder="Type your message, inquiry, or question here..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors((prev) => ({ ...prev, message: '' }));
            }}
            disabled={submitting}
            required
          />
          {errors.message && <span className={styles.fieldErrorText}>{errors.message}</span>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={homeStyles.btnPrimaryTerracotta}
          style={{ width: '100%', justifyContent: 'center', height: '48px', marginTop: '8px' }}
        >
          <Send size={18} />
          <span>{submitting ? 'Sending Message...' : 'Send Message Directly'}</span>
        </button>
      </form>
    </div>
  );
};
