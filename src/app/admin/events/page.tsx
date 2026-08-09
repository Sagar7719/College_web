'use client';

import React, { useEffect, useState } from 'react';
import { EventItem } from '@/types';
import { eventsService } from '@/services/cms-modules.service';
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

import { MediaPickerModal } from '@/components/admin/MediaPickerModal';

export default function AdminEventsPage() {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await eventsService.getAll();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    eventsService.getAll()
      .then((data) => { if (alive) { setEvents(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setEventDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setVenue('Main Auditorium');
    setDescription('');
    setBannerUrl('');
    setRegistrationUrl('');
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EventItem) => {
    setEditingEvent(item);
    setTitle(item.title);
    setEventDate(item.eventDate ? item.eventDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setEndDate(item.endDate ? item.endDate.slice(0, 10) : '');
    setVenue(item.venue || '');
    setDescription(item.description || '');
    setBannerUrl(item.bannerUrl || '');
    setRegistrationUrl(item.registrationUrl || '');
    setStatus(item.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    setErrorMessage('');

    if (!title.trim() || !eventDate || !venue.trim()) {
      setErrorMessage('Event Title, Start Date, and Venue location are required.');
      return;
    }

    if (endDate && new Date(endDate) < new Date(eventDate)) {
      setErrorMessage('End date cannot precede the event start date.');
      return;
    }

    setIsSaving(true);
    try {
      await eventsService.save({
        id: editingEvent?.id,
        title: title.trim(),
        eventDate,
        endDate: endDate || undefined,
        venue: venue.trim(),
        description: description.trim(),
        bannerUrl: bannerUrl.trim(),
        registrationUrl: registrationUrl.trim(),
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save event.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await eventsService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Content CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Campus Events Calendar</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Schedule workshops, academic conferences, cultural meets, and sports tournaments.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Schedule Event
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search events by title or venue..."
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
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No events matching "${searchQuery}"` : 'No Campus Events Scheduled Yet'}
          description="Schedule your first upcoming campus event."
          actionLabel={!searchQuery ? '+ Schedule Event' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>📅 {item.title}</strong></TableCell>
                    <TableCell className="small-text">{item.eventDate ? item.eventDate.slice(0, 10) : 'Upcoming'}</TableCell>
                    <TableCell>📍 {item.venue}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
                        {item.status.toUpperCase()}
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

      {/* Modal: Create/Edit Event */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Schedule Campus Event'}
        description="Enter event title, start/end dates, venue, and registration link."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveEvent}>
              {editingEvent ? 'Save Changes' : 'Schedule Event'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Event Title *" placeholder="e.g. International AI & Robotics Conference 2026" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Start Date *" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            <Input label="End Date (Optional)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Input label="Venue / Location *" placeholder="e.g. Main Auditorium, Block B" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Description</label>
            <textarea rows={4} placeholder="Event program details..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} />
          </div>
          <Input label="Registration Link URL (Optional)" placeholder="https://..." value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input label="Banner Image URL (Optional)" placeholder="https://..." value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} />
            </div>
            <Button variant="outline" size="md" type="button" onClick={() => setIsMediaPickerOpen(true)}>
              📁 Media Library
            </Button>
          </div>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        allowedType="image"
        onSelectMedia={(url) => setBannerUrl(url)}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Event?" description="Are you sure you want to remove this event from the calendar?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>This event will no longer be listed on the public campus events calendar.</p>
      </Modal>
    </div>
  );
}
