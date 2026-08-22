'use client';

import React, { useEffect, useState } from 'react';
import { NewsItem } from '@/types';
import { newsService } from '@/services/cms-modules.service';
import { generateSlug } from '@/validations/page.schema';
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

export default function AdminNewsPage() {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await newsService.getAll();
    setArticles(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    newsService.getAll()
      .then((data) => { if (alive) { setArticles(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredArticles = articles.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingNews) {
      setSlug(generateSlug(val));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNews(null);
    setTitle('');
    setSlug('');
    setPublishDate(new Date().toISOString().slice(0, 10));
    setSummary('');
    setContent('');
    setCoverImageUrl('');
    setAuthor('College Media Cell');
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: NewsItem) => {
    setEditingNews(item);
    setTitle(item.title);
    setSlug(item.slug);
    setPublishDate(item.publishDate ? item.publishDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setSummary(item.summary || '');
    setContent(item.content || '');
    setCoverImageUrl(item.coverImageUrl || '');
    setAuthor(item.author || '');
    setStatus(item.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveNews = async () => {
    setErrorMessage('');

    if (!title.trim() || !summary.trim() || !content.trim()) {
      setErrorMessage('News Title, Summary, and Body Content are required.');
      return;
    }

    setIsSaving(true);
    try {
      await newsService.save({
        id: editingNews?.id,
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        publishDate,
        summary: summary.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim(),
        author: author.trim(),
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save news article.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await newsService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Content CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>News & Press Releases</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Publish campus stories, research breakthroughs, and press releases.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Write News Article
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search news by title or slug..."
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
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No news articles matching "${searchQuery}"` : 'No News Articles Published Yet'}
          description="Publish your first campus news story."
          actionLabel={!searchQuery ? '+ Write News Article' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Article Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{item.title}</strong></TableCell>
                    <TableCell className="tiny-text">/{item.slug}</TableCell>
                    <TableCell className="small-text">{item.publishDate ? item.publishDate.slice(0, 10) : 'Today'}</TableCell>
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

      {/* Modal: Create/Edit News */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNews ? 'Edit News Article' : 'Publish News Article'}
        description="Enter article title, summary, and full body content."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveNews}>
              {editingNews ? 'Save Changes' : 'Publish Article'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Article Title *" placeholder="e.g. College Ranks #1 in Innovation Award" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
          <Input label="URL Slug *" placeholder="college-ranks-1-in-innovation" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Publish Date *" type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required />
            <Input label="Author / Source" placeholder="e.g. Media Relations Desk" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input label="Cover Image URL (Optional)" placeholder="https://..." value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
            </div>
            <Button variant="outline" size="md" type="button" onClick={() => setIsMediaPickerOpen(true)}>
              📁 Media Library
            </Button>
          </div>
          <Input label="Short Summary *" placeholder="1-2 sentences summarizing the news article..." value={summary} onChange={(e) => setSummary(e.target.value)} required />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Full Body Content (HTML supported) *</label>
            <textarea rows={6} placeholder="<p>Type complete news story...</p>" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} />
          </div>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        allowedType="image"
        onSelectMedia={(url) => setCoverImageUrl(url)}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete News Article?" description="Are you sure you want to remove this news story?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>This article will no longer appear on the public campus news page.</p>
      </Modal>
    </div>
  );
}
