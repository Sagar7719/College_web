'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { siteSettingsService, defaultSettings } from '@/services/site-settings.service';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Modal,
  Skeleton,
} from '@/components/ui';

export default function MaintenanceAdminPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(defaultSettings.maintenanceMessage || '');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    siteSettingsService.getSettings()
      .then((data) => {
        if (alive) {
          setMaintenanceMode(Boolean(data.maintenanceMode));
          setMaintenanceMessage(data.maintenanceMessage || defaultSettings.maintenanceMessage || '');
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const handleSaveMessage = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await siteSettingsService.setMaintenanceMode(maintenanceMode, maintenanceMessage);
      setStatusMessage({ type: 'success', text: 'Maintenance mode settings saved!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to update maintenance settings.';
      setStatusMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMode = () => {
    if (!maintenanceMode) {
      setIsConfirmModalOpen(true);
    } else {
      setMaintenanceMode(false);
      siteSettingsService.setMaintenanceMode(false, maintenanceMessage).catch(() => {});
      setStatusMessage({ type: 'success', text: 'Maintenance Mode deactivated. Public website is live!' });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const confirmActivate = async () => {
    setMaintenanceMode(true);
    setIsConfirmModalOpen(false);
    try {
      await siteSettingsService.setMaintenanceMode(true, maintenanceMessage);
      setStatusMessage({ type: 'success', text: 'Maintenance Mode activated. Public visitors now see maintenance notice.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to activate maintenance mode.';
      setStatusMessage({ type: 'error', text: errMsg });
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton height="3rem" width="40%" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="200px" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant={maintenanceMode ? 'danger' : 'info'} style={{ marginBottom: '0.375rem' }}>
          {maintenanceMode ? '🚨 System Maintenance Active' : 'System Operational'}
        </Badge>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Maintenance Mode Control</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Toggle public website maintenance status and customize visitor notifications.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${statusMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody style={{ padding: '2rem' }}>
          <div
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: maintenanceMode ? '#FEF2F2' : 'var(--bg-main)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '1.125rem', color: maintenanceMode ? '#991B1B' : 'var(--primary)' }}>
                  Status: {maintenanceMode ? 'ACTIVE (Public Locked)' : 'DISABLED (Public Live)'}
                </strong>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
                  {maintenanceMode
                    ? 'All public traffic is redirected to the maintenance page. Admin CMS remains 100% accessible.'
                    : 'Your college website is fully live and serving public visitors.'}
                </p>
              </div>
              <Button
                variant={maintenanceMode ? 'danger' : 'outline'}
                size="md"
                onClick={handleToggleMode}
              >
                {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
              Public Maintenance Message
            </label>
            <textarea
              rows={4}
              placeholder="Message shown to public visitors during maintenance..."
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontFamily: 'inherit',
                fontSize: '0.9375rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Button variant="primary" size="md" onClick={handleSaveMessage} disabled={isSaving}>
              {isSaving ? 'Saving...' : '💾 Save Maintenance Message'}
            </Button>
            <Link href="/admin/settings" style={{ fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>
              ⚙️ Go to All Site Settings →
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Enable Maintenance Mode?"
        description="Public visitors will be locked out and see the maintenance notice."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmActivate}>
              Confirm &amp; Enable Maintenance
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to enable Maintenance Mode?
          <br /><br />
          Public visitors will be redirected to <code>/maintenance</code>. As an administrator, you will remain logged in and can manage content at <code>/admin/*</code>.
        </p>
      </Modal>
    </div>
  );
}
