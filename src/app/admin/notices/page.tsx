'use client';

import React, { useEffect, useState } from 'react';
import { Notice } from '@/types';
import { noticesService } from '@/services/cms-modules.service';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Skeleton,
} from '@/components/ui';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Notice['category']>('Academic');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await noticesService.getAll();
    setNotices(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    noticesService.getAll()
      .then((data) => { if (alive) { setNotices(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleOpenCreateModal = () => {
    setEditingNotice(null);
    setTitle('');
    setCategory('Academic');
    setPublishDate(new Date().toISOString().slice(0, 10));
    setContent('');
    setAttachmentUrl('');
    setAttachmentName('');
    setIsUrgent(false);
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (n: Notice) => {
    setEditingNotice(n);
    setTitle(n.title);
    setCategory(n.category);
    setPublishDate(n.publishDate ? n.publishDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setContent(n.content || '');
    setAttachmentUrl(n.attachmentUrl || '');
    setAttachmentName(n.attachmentName || '');
    setIsUrgent(n.isUrgent || false);
    setStatus(n.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveNotice = async () => {
    setErrorMessage('');

    if (!title.trim() || !publishDate) {
      setErrorMessage('Notice Title and Publish Date are required.');
      return;
    }

    setIsSaving(true);
    try {
      await noticesService.save({
        id: editingNotice?.id,
        title: title.trim(),
        category,
        publishDate,
        content: content.trim(),
        attachmentUrl: attachmentUrl.trim(),
        attachmentName: attachmentName.trim(),
        isUrgent,
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save notice.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await noticesService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Content CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Notices & Circulars</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Publish official academic notices, exam circulars, and downloadable attachments.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Post Notice
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search notices by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Academic', value: 'Academic' },
                { label: 'Exam', value: 'Exam' },
                { label: 'Admissions', value: 'Admissions' },
                { label: 'General', value: 'General' },
              ]}
            />
          </div>
          {searchQuery && <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>Clear</Button>}
        </CardBody>
      </Card>

      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </CardBody>
        </Card>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No notices matching "${searchQuery}"` : 'No Notices Posted Yet'}
          description="Post your first official circular or academic notice."
          actionLabel={!searchQuery ? '+ Post Notice' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Notice Title</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <Badge variant={n.isUrgent ? 'danger' : 'info'}>
                        {n.isUrgent ? '🔥 URGENT' : n.category}
                      </Badge>
                    </TableCell>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{n.title}</strong></TableCell>
                    <TableCell className="small-text">{n.publishDate ? n.publishDate.slice(0, 10) : 'Today'}</TableCell>
                    <TableCell>
                      <Badge variant={n.status === 'published' ? 'success' : 'warning'}>
                        {n.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(n)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(n.id)}>✕</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create/Edit Notice */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? 'Edit Notice' : 'Post Official Notice'}
        description="Enter circular title, category, publish date, and document attachment."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveNotice}>
              {editingNotice ? 'Save Changes' : 'Post Notice'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Notice Title *" placeholder="e.g. End Semester Exam Time Table 2026" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'Academic' | 'Exam' | 'Admissions' | 'General')}
              options={[
                { label: 'Academic', value: 'Academic' },
                { label: 'Exam', value: 'Exam' },
                { label: 'Admissions', value: 'Admissions' },
                { label: 'General', value: 'General' },
              ]}
            />
            <Input label="Publish Date *" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="urgentCheck" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} style={{ cursor: 'pointer' }} />
            <label htmlFor="urgentCheck" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--semantic-error)', cursor: 'pointer' }}>Mark as High Priority / Urgent Notice 🔥</label>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Notice Body Content</label>
            <textarea rows={4} placeholder="Full notice details..." value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} />
          </div>
          <Input label="Attachment File URL (Optional)" placeholder="https://..." value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
          <Input label="Attachment Display Name" placeholder="e.g. Schedule_2026.pdf" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Notice?" description="Are you sure you want to remove this notice?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>Deleting a notice removes it from the public notice board.</p>
      </Modal>
    </div>
  );
}
