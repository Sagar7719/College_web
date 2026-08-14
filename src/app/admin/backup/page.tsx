'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Badge, Modal } from '@/components/ui';
import { backupService, BackupManifest } from '@/services/backup.service';

const MODULE_OPTIONS = [
  { id: 'site_settings', label: '⚙️ Site Branding & Settings' },
  { id: 'navigation', label: '🧭 Navigation Menu Bar' },
  { id: 'pages', label: '📄 Custom CMS Pages' },
  { id: 'departments', label: '🏛️ Academic Departments' },
  { id: 'courses', label: '🎓 Courses & Degree Programs' },
  { id: 'faculty', label: '👨‍🏫 Faculty Directory' },
  { id: 'notices', label: '📌 Official Notices & Circulars' },
  { id: 'news', label: '📰 News & Press Releases' },
  { id: 'events', label: '📅 Campus Events Calendar' },
  { id: 'gallery', label: '🖼️ Photo Gallery Albums' },
  { id: 'downloads', label: '📥 Document Downloads' },
  { id: 'contact_messages', label: '✉️ Contact Form Inquiries' },
];

export default function AdminBackupManagerScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Selective module state
  const [selectedModules, setSelectedModules] = useState<string[]>(MODULE_OPTIONS.map((m) => m.id));

  // Restore Modal State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedManifest, setParsedManifest] = useState<BackupManifest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedModules.length === MODULE_OPTIONS.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(MODULE_OPTIONS.map((m) => m.id));
    }
  };

  // Trigger JSON Download
  const handleFullBackupDownload = async () => {
    setIsExporting(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const manifest = await backupService.createFullBackup();
      const jsonStr = JSON.stringify(manifest, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `jaysingpur_college_cms_backup_${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage(`Full database snapshot created successfully! (${manifest.totalRecords} records exported).`);
    } catch (err) {
      setErrorMessage('Failed to generate full backup. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectiveBackupDownload = async () => {
    if (selectedModules.length === 0) {
      setErrorMessage('Please select at least one CMS module to back up.');
      return;
    }
    setIsExporting(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const manifest = await backupService.createModuleBackup(selectedModules);
      const jsonStr = JSON.stringify(manifest, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `jaysingpur_college_selective_backup_${dateStr}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage(`Selective backup created successfully! (${manifest.totalRecords} records across ${selectedModules.length} modules exported).`);
    } catch (err) {
      setErrorMessage('Failed to generate selective backup.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Upload File for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setSuccessMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = backupService.validateBackupManifest(content);
      if (!validation.valid || !validation.manifest) {
        setErrorMessage(validation.error || 'Invalid backup file format.');
        return;
      }
      setUploadedFile(file);
      setParsedManifest(validation.manifest);
      setIsModalOpen(true);
    };
    reader.readAsText(file);
  };

  // Perform Disaster Restore
  const handleConfirmRestore = async () => {
    if (!parsedManifest) return;
    setIsRestoring(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await backupService.restoreBackup(parsedManifest);
      setIsModalOpen(false);
      setParsedManifest(null);
      setUploadedFile(null);
      setSuccessMessage(`✓ Disaster Restore Completed Successfully! ${result.restoredCount} database records restored to Firestore.`);
    } catch (err) {
      setErrorMessage('Failed to restore database backup. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '1100px' }}>
      {/* Header Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
          📦 Enterprise Data Backup &amp; Disaster Recovery Console
        </h1>
        <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
          One-click full or selective database backup exports and automated disaster recovery restore for college administrators.
        </p>
      </div>

      {successMessage && (
        <div style={{ padding: '0.875rem 1rem', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 700 }}>
          ✓ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '0.875rem 1rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 700 }}>
          ✕ {errorMessage}
        </div>
      )}

      {/* Grid of Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Full Backup Card */}
        <Card variant="bordered" style={{ borderTop: '4px solid #C85A32' }}>
          <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
                  1-Click Full Database Backup
                </h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#68705A', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Generates a complete JSON backup snapshot containing all 12 CMS collections (Site Settings, Navigation, Courses, Faculty, Notices, Gallery, Downloads, etc.).
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleFullBackupDownload}
              disabled={isExporting}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.9375rem' }}
            >
              {isExporting ? 'Generating Snapshot...' : '📥 Download Full Database Backup (.json)'}
            </Button>
          </CardBody>
        </Card>

        {/* Disaster Restore Card */}
        <Card variant="bordered" style={{ borderTop: '4px solid #059669' }}>
          <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔄</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
                  Disaster Recovery Restore
                </h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#68705A', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Upload any previously saved `.json` CMS backup file to inspect document metadata and restore the live Firestore database state with 1 click.
              </p>
            </div>

            <label style={{ display: 'block', width: '100%' }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <span
                className="btn btn-outline"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.75rem 1rem',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#059669',
                  borderColor: '#059669',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  backgroundColor: '#F0FDF4',
                }}
              >
                📂 Select &amp; Restore Backup File (.json)
              </span>
            </label>
          </CardBody>
        </Card>
      </div>

      {/* Module-Wise Selective Backup Section */}
      <Card variant="bordered">
        <CardBody style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
                🎯 Module-Wise Selective Backup
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#68705A', margin: '0.25rem 0 0 0' }}>
                Select specific sections to export a lightweight targeted backup file.
              </p>
            </div>

            <Button size="sm" variant="ghost" onClick={toggleSelectAll}>
              {selectedModules.length === MODULE_OPTIONS.length ? 'Deselect All' : 'Select All Modules'}
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {MODULE_OPTIONS.map((mod) => {
              const isChecked = selectedModules.includes(mod.id);
              return (
                <label
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '4px',
                    border: isChecked ? '1.5px solid #C85A32' : '1px solid #DED4C5',
                    backgroundColor: isChecked ? '#FFFBEB' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: isChecked ? 700 : 500,
                    color: isChecked ? '#24221F' : '#55514B',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ width: '16px', height: '16px', accentColor: '#C85A32' }}
                  />
                  {mod.label}
                </label>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={handleSelectiveBackupDownload}
              disabled={isExporting || selectedModules.length === 0}
              style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}
            >
              📥 Download Selective Backup ({selectedModules.length} Modules Selected)
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Restore Inspection Modal */}
      {isModalOpen && parsedManifest && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="📦 Inspect & Confirm Disaster Restore"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
              ⚠️ Warning: Restoring will overwrite existing Firestore records matching document IDs in the snapshot file.
            </div>

            {/* Manifest Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: '#FAF8F5', padding: '1rem', border: '1px solid #DED4C5', borderRadius: '4px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#68705A', display: 'block' }}>Schema Version</span>
                <span style={{ fontWeight: 800, color: '#24221F', fontSize: '0.9375rem' }}>{parsedManifest.schemaVersion}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#68705A', display: 'block' }}>Snapshot Date</span>
                <span style={{ fontWeight: 800, color: '#24221F', fontSize: '0.9375rem' }}>
                  {new Date(parsedManifest.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#68705A', display: 'block' }}>College Title</span>
                <span style={{ fontWeight: 800, color: '#24221F', fontSize: '0.9375rem' }}>{parsedManifest.collegeName || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#68705A', display: 'block' }}>Total Records</span>
                <Badge variant="success">{parsedManifest.totalRecords} Records</Badge>
              </div>
            </div>

            {/* Collection Breakdown */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#24221F', marginBottom: '0.5rem' }}>
                Collections in Snapshot:
              </h4>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #DED4C5', borderRadius: '4px', padding: '0.5rem' }}>
                {Object.entries(parsedManifest.collections).map(([col, items]) => (
                  <div key={col} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', borderBottom: '1px solid #F0EAE1', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: '#24221F' }}>📁 {col}</span>
                    <span style={{ color: '#68705A', fontWeight: 700 }}>{items?.length || 0} items</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" style={{ backgroundColor: '#059669' }} onClick={handleConfirmRestore} disabled={isRestoring}>
                {isRestoring ? 'Restoring Database...' : '🚀 Confirm & Restore Live Database'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
