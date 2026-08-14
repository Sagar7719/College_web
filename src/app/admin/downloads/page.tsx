'use client';

import React, { useEffect, useState } from 'react';
import { DocumentItem } from '@/types';
import { downloadsService } from '@/services/cms-modules.service';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import {
  Card, CardBody, Button, Badge, Input, Select, Modal, EmptyState, Skeleton,
} from '@/components/ui';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const DOCUMENT_CATEGORIES = [
  'General', 'Admissions', 'Academic', 'Circulars', 'Syllabus', 'Forms', 'Policies', 'Results', 'Prospectus',
];

const FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'PPT', 'ZIP', 'Other'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocFormState {
  id?: string;
  title: string;
  category: string;
  tag: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeFormatted: string;
  status: 'published' | 'draft' | 'archived';
}

const emptyDocForm = (): DocFormState => ({
  title: '',
  category: 'General',
  tag: 'NEW',
  description: '',
  fileUrl: '',
  fileName: '',
  fileType: 'PDF',
  fileSizeFormatted: '',
  status: 'draft',
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDownloadsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docForm, setDocForm] = useState<DocFormState>(emptyDocForm());
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Media picker
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────

  const loadDocs = async () => {
    setErrorMsg('');
    try {
      const data = await downloadsService.getAll();
      setDocs(data);
    } catch {
      setErrorMsg('Unable to load documents. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: inline promise chain avoids synchronous setState in effect body
  useEffect(() => {
    let alive = true;
    downloadsService.getAll()
      .then((data) => { if (alive) { setDocs(data); setLoading(false); } })
      .catch(() => { if (alive) { setErrorMsg('Unable to load documents. Please check your connection.'); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  // Derive available categories from actual data
  const availableCategories = Array.from(new Set(docs.map((d) => d.category || 'General'))).sort();

  // ── Filters ──────────────────────────────────────────────────────────────

  const filteredDocs = docs.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.tag || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setDocForm(emptyDocForm());
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (doc: DocumentItem) => {
    setDocForm({
      id: doc.id,
      title: doc.title,
      category: doc.category || 'General',
      tag: doc.tag || 'NEW',
      description: doc.description || '',
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileType: doc.fileType || 'PDF',
      fileSizeFormatted: doc.fileSizeFormatted || '',
      status: doc.status,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!docForm.title.trim()) { setFormError('Document title is required.'); return; }
    if (!docForm.fileUrl.trim()) { setFormError('A file URL is required. Select from Media Library or paste a URL.'); return; }
    if (!docForm.fileName.trim()) { setFormError('File name is required.'); return; }

    setIsSaving(true);
    try {
      await downloadsService.save({
        id: docForm.id,
        title: docForm.title.trim(),
        category: docForm.category,
        tag: docForm.tag.trim().toUpperCase(),
        description: docForm.description.trim(),
        fileUrl: docForm.fileUrl.trim(),
        fileName: docForm.fileName.trim(),
        fileType: docForm.fileType,
        fileSizeFormatted: docForm.fileSizeFormatted.trim(),
        status: docForm.status as DocumentItem['status'],
      });
      setIsModalOpen(false);
      loadDocs();
    } catch {
      setFormError('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatus = async (doc: DocumentItem, status: DocumentItem['status']) => {
    try {
      await downloadsService.save({ ...doc, status });
      loadDocs();
    } catch {
      setErrorMsg('Failed to update document status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      // Archive rather than hard-delete — preserves Media Library asset reference
      await downloadsService.save({ ...deleteConfirm, status: 'archived' });
      setDeleteConfirm(null);
      loadDocs();
    } catch {
      setErrorMsg('Failed to archive document.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Media Picker ─────────────────────────────────────────────────────────

  const handleMediaPicked = (url: string) => {
    // Derive fileName from URL path
    const guessedName = url.split('/').pop()?.split('?')[0] || 'document.pdf';
    setDocForm((prev) => ({
      ...prev,
      fileUrl: url,
      fileName: prev.fileName || guessedName,
    }));
    setIsPickerOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Downloads</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Document Downloads</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Publish forms, syllabi, circulars, and other downloadable documents for website visitors.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreate}>
          + Add Document
        </Button>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filters */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              placeholder="Search by title, filename, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { label: 'All Categories', value: 'all' },
                ...availableCategories.map((c) => ({ label: c, value: c })),
              ]}
            />
          </div>
          <div style={{ width: '160px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Archived', value: 'archived' },
              ]}
            />
          </div>
          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="ghost" size="md" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setStatusFilter('all'); }}>
              Clear Filters
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton height="72px" />
          <Skeleton height="72px" />
          <Skeleton height="72px" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? 'No documents match your filters' : 'No documents added yet'}
          description={searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add downloadable documents like forms, syllabi, and circulars.'}
          actionLabel={!searchQuery && categoryFilter === 'all' && statusFilter === 'all' ? '+ Add Document' : undefined}
          onAction={!searchQuery && categoryFilter === 'all' && statusFilter === 'all' ? openCreate : undefined}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDocs.map((doc) => (
            <Card key={doc.id} variant="bordered" hoverable>
              <CardBody style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* File icon */}
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  📄
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{doc.title}</h3>
                    <Badge variant="default">{doc.category || 'General'}</Badge>
                    <Badge variant={doc.status === 'published' ? 'success' : doc.status === 'archived' ? 'danger' : 'warning'}>
                      {doc.status}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                    {doc.fileName} · {doc.fileType || 'PDF'}{doc.fileSizeFormatted ? ` · ${doc.fileSizeFormatted}` : ''}
                    {doc.description && ` · ${doc.description}`}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                    Updated {formatDate(doc.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={() => openEdit(doc)}>Edit</Button>
                  {doc.status !== 'published' ? (
                    <Button variant="outline" size="sm" onClick={() => handleQuickStatus(doc, 'published')}>Publish</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleQuickStatus(doc, 'draft')}>Hide</Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(doc)}>Archive</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal: Create / Edit Document ─────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={docForm.id ? 'Edit Document' : 'Add New Document'}
        description="Publish documents for website visitors to browse and download."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
              {docForm.id ? 'Save Changes' : 'Add Document'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {formError && (
            <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              ⚠️ {formError}
            </div>
          )}

          <Input
            label="Document Title *"
            value={docForm.title}
            onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Undergraduate Admissions Prospectus 2026"
            required
          />

          <Select
            label="Category"
            value={docForm.category}
            onChange={(e) => setDocForm((p) => ({ ...p, category: e.target.value }))}
            options={DOCUMENT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />

          {/* TAG BADGE SELECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Document Tag Badge (Shown in vertical marquee)</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
              {['NEW', 'IMP', 'PROSPECTUS', 'SYLLABUS', 'FORM'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDocForm((p) => ({ ...p, tag: preset }))}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: docForm.tag === preset ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: docForm.tag === preset ? 'var(--primary-bg)' : '#F7F2E9',
                    color: docForm.tag === preset ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {preset === 'NEW' && '🟢 '}
                  {preset === 'IMP' && '🔥 '}
                  {preset === 'PROSPECTUS' && '📖 '}
                  {preset === 'SYLLABUS' && '📚 '}
                  {preset === 'FORM' && '📄 '}
                  {preset}
                </button>
              ))}
            </div>
            <Input
              placeholder="Or type custom tag badge text (e.g. RESULTS, FEE)..."
              value={docForm.tag}
              onChange={(e) => setDocForm((p) => ({ ...p, tag: e.target.value }))}
            />
          </div>

          <Input
            label="Description (Optional)"
            value={docForm.description}
            onChange={(e) => setDocForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of this document"
          />

          {/* File selection */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Document File URL *"
                value={docForm.fileUrl}
                onChange={(e) => setDocForm((p) => ({ ...p, fileUrl: e.target.value }))}
                placeholder="Select from Media Library or paste URL"
                required
              />
            </div>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setIsPickerOpen(true)}
            >
              📁 Media Library
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="File Name *"
              value={docForm.fileName}
              onChange={(e) => setDocForm((p) => ({ ...p, fileName: e.target.value }))}
              placeholder="Prospectus_2026.pdf"
              required
            />
            <Select
              label="File Type"
              value={docForm.fileType}
              onChange={(e) => setDocForm((p) => ({ ...p, fileType: e.target.value }))}
              options={FILE_TYPES.map((t) => ({ label: t, value: t }))}
            />
            <Input
              label="File Size"
              value={docForm.fileSizeFormatted}
              onChange={(e) => setDocForm((p) => ({ ...p, fileSizeFormatted: e.target.value }))}
              placeholder="e.g. 2.4 MB"
            />
          </div>

          <Select
            label="Status"
            value={docForm.status}
            onChange={(e) => setDocForm((p) => ({ ...p, status: e.target.value as DocFormState['status'] }))}
            options={[
              { label: 'Draft (not public)', value: 'draft' },
              { label: 'Published (visible on website)', value: 'published' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
        </div>
      </Modal>

      {/* ── Modal: Archive Confirm ─────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        title="Archive Document?"
        description="Archived documents are hidden from the public website. The file in Media Library is not affected."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteConfirm}>
              Archive Document
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Document <strong>&ldquo;{deleteConfirm?.title}&rdquo;</strong> will be archived and hidden from the Downloads page.
          The underlying file in the Media Library is not deleted.
        </p>
      </Modal>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        allowedType="document"
        onSelectMedia={handleMediaPicked}
      />
    </div>
  );
}
