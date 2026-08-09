'use client';

import React, { useEffect, useState } from 'react';
import { Announcement } from '@/types';
import { announcementsService } from '@/services/cms-modules.service';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
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

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Form State
  const [text, setText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [active, setActive] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await announcementsService.getActive();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    announcementsService.getActive()
      .then((data) => { if (alive) { setItems(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredItems = items.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setText('');
    setLinkUrl('');
    setActive(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (anc: Announcement) => {
    setEditingItem(anc);
    setText(anc.text);
    setLinkUrl(anc.linkUrl || '');
    setActive(anc.active ?? true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    setErrorMessage('');

    if (!text.trim()) {
      setErrorMessage('Announcement ticker text is required.');
      return;
    }

    setIsSaving(true);
    try {
      await announcementsService.save({
        id: editingItem?.id,
        text: text.trim(),
        linkUrl: linkUrl.trim(),
        active,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save announcement.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await announcementsService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Content CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Announcements Ticker</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage the top banner marquee announcement ticker items displayed across the public website.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Add Announcement
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search marquee announcement text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No announcements matching "${searchQuery}"` : 'No Marquee Announcements Configured'}
          description="Create your first announcement ticker text for the website header banner."
          actionLabel={!searchQuery ? '+ Add Announcement' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker Text</TableHead>
                  <TableHead>Link Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>📢 {item.text}</strong></TableCell>
                    <TableCell className="small-text">{item.linkUrl || 'None'}</TableCell>
                    <TableCell>
                      <Badge variant={item.active ? 'success' : 'danger'}>
                        {item.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(item)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(item.id)}>✕</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create/Edit Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Announcement' : 'Add Announcement Ticker'}
        description="Enter ticker text and optional target page URL."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveAnnouncement}>
              {editingItem ? 'Save Changes' : 'Add Announcement'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Ticker Text *" placeholder="e.g. Admissions open for 2026 academic batch. Apply now!" value={text} onChange={(e) => setText(e.target.value)} required />
          <Input label="Target URL (Optional)" placeholder="e.g. /admissions" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="activeTicker" checked={active} onChange={(e) => setActive(e.target.checked)} style={{ cursor: 'pointer' }} />
            <label htmlFor="activeTicker" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Active in Top Banner Marquee</label>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Announcement?" description="Remove this announcement from the ticker?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>This text will be removed from the top banner marquee.</p>
      </Modal>
    </div>
  );
}
