'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ContactMessage, ContactMessageStatus } from '@/types';
import { contactMessagesService } from '@/services/contact-messages.service';
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

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await contactMessagesService.getAll();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter messages based on search query and status
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        msg.name.toLowerCase().includes(queryLower) ||
        msg.email.toLowerCase().includes(queryLower) ||
        msg.subject.toLowerCase().includes(queryLower) ||
        msg.message.toLowerCase().includes(queryLower);

      const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      read: messages.filter((m) => m.status === 'read').length,
      replied: messages.filter((m) => m.status === 'replied').length,
      archived: messages.filter((m) => m.status === 'archived').length,
    };
  }, [messages]);

  // Handle viewing a message detail modal (auto-mark 'new' as 'read')
  const handleOpenDetailModal = async (msg: ContactMessage) => {
    setSelectedMessage(msg);

    // If message is new, automatically mark as read
    if (msg.status === 'new') {
      try {
        await contactMessagesService.updateStatus(msg.id, 'read');
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read', updatedAt: new Date().toISOString() } : m))
        );
        setSelectedMessage({ ...msg, status: 'read' });
      } catch (err) {
        console.error('Failed to update message status to read:', err);
      }
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id: string, newStatus: ContactMessageStatus) => {
    setIsUpdating(true);
    try {
      await contactMessagesService.updateStatus(id, newStatus);
      const updatedAt = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus, updatedAt } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus, updatedAt });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deletion
  const handleDeleteMessage = async () => {
    if (!deleteConfirmId) return;
    setIsUpdating(true);
    try {
      await contactMessagesService.delete(deleteConfirmId);
      setMessages((prev) => prev.filter((m) => m.id !== deleteConfirmId));
      if (selectedMessage && selectedMessage.id === deleteConfirmId) {
        setSelectedMessage(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Status badge variant helper
  const getStatusBadge = (status: ContactMessageStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="warning">New</Badge>;
      case 'read':
        return <Badge variant="info">Read</Badge>;
      case 'replied':
        return <Badge variant="success">Replied</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Date formatting helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Card / Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <Card variant="bordered">
          <CardBody style={{ textAlign: 'center', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Messages</span>
            <h2 style={{ margin: '0.25rem 0 0 0', color: 'var(--primary)' }}>{stats.total}</h2>
          </CardBody>
        </Card>
        <Card variant="bordered">
          <CardBody style={{ textAlign: 'center', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>New / Unread</span>
            <h2 style={{ margin: '0.25rem 0 0 0', color: '#d97706' }}>{stats.new}</h2>
          </CardBody>
        </Card>
        <Card variant="bordered">
          <CardBody style={{ textAlign: 'center', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Read</span>
            <h2 style={{ margin: '0.25rem 0 0 0', color: '#0284c7' }}>{stats.read}</h2>
          </CardBody>
        </Card>
        <Card variant="bordered">
          <CardBody style={{ textAlign: 'center', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Replied</span>
            <h2 style={{ margin: '0.25rem 0 0 0', color: '#059669' }}>{stats.replied}</h2>
          </CardBody>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card variant="bordered">
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Search sender, email, subject or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ width: '180px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'New', value: 'new' },
                    { label: 'Read', value: 'read' },
                    { label: 'Replied', value: 'replied' },
                    { label: 'Archived', value: 'archived' },
                  ]}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              🔄 Refresh
            </Button>
          </div>

          {/* Table Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <EmptyState
              title="No Contact Messages Found"
              description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search query or status filter.' : 'No website contact form inquiries have been submitted yet.'}
              icon="✉️"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Sender Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => (
                  <TableRow
                    key={msg.id}
                    style={{
                      fontWeight: msg.status === 'new' ? 600 : 400,
                      backgroundColor: msg.status === 'new' ? 'rgba(245, 158, 11, 0.04)' : undefined,
                    }}
                  >
                    <TableCell>{getStatusBadge(msg.status)}</TableCell>
                    <TableCell>{msg.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {msg.email}
                      </a>
                    </TableCell>
                    <TableCell style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </TableCell>
                    <TableCell style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(msg.createdAt)}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(msg)}>
                          👁️ View
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(msg.id)}>
                          🗑️
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={Boolean(selectedMessage)}
          onClose={() => setSelectedMessage(null)}
          title="Contact Message Details"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Status: </span>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {formatDate(selectedMessage.createdAt)}
              </span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Sender Name: </strong> {selectedMessage.name}
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Email Address: </strong>
                <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                  {selectedMessage.email}
                </a>
              </div>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Subject: </strong> {selectedMessage.subject}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <strong style={{ color: 'var(--primary)' }}>Message Content:</strong>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Status Control Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Update Status:</span>
              <Button
                variant={selectedMessage.status === 'read' ? 'primary' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
              >
                Mark Read
              </Button>
              <Button
                variant={selectedMessage.status === 'replied' ? 'primary' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
              >
                Mark Replied
              </Button>
              <Button
                variant={selectedMessage.status === 'archived' ? 'primary' : 'outline'}
                size="sm"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
              >
                Archive
              </Button>
              <div style={{ marginLeft: 'auto' }}>
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" size="sm">
                    ✉️ Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Message Deletion"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p>
              Are you sure you want to permanently delete this contact message document? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteMessage} isLoading={isUpdating} disabled={isUpdating}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
