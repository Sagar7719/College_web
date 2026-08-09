'use client';

import React, { useEffect, useState } from 'react';
import { GalleryAlbum, GalleryImage } from '@/types';
import { galleryService } from '@/services/cms-modules.service';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import {
  Card, CardBody, Button, Badge, Input, Select, Modal, EmptyState, Skeleton,
} from '@/components/ui';

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const ALBUM_CATEGORIES = ['General', 'Events', 'Campus', 'Academics', 'Sports', 'Cultural', 'Infrastructure'];

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'list' | 'images';

interface AlbumFormState {
  id?: string;
  title: string;
  slug: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  coverImageUrl: string;
}

const emptyAlbumForm = (): AlbumFormState => ({
  title: '',
  slug: '',
  category: 'General',
  status: 'draft',
  coverImageUrl: '',
});

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminGalleryPage() {
  // List state
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [errorMsg, setErrorMsg] = useState('');

  // Album create/edit modal
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumForm, setAlbumForm] = useState<AlbumFormState>(emptyAlbumForm());
  const [albumFormError, setAlbumFormError] = useState('');
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);

  // Album image management view
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [managingAlbum, setManagingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumImages, setAlbumImages] = useState<GalleryImage[]>([]);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [imageSaveError, setImageSaveError] = useState('');

  // Image picker
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'cover' | 'albumAdd' | null>(null);

  // Delete confirm
  const [deleteConfirmAlbum, setDeleteConfirmAlbum] = useState<GalleryAlbum | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadAlbums = async () => {
    setErrorMsg('');
    try {
      const data = await galleryService.getAll();
      setAlbums(data);
    } catch {
      setErrorMsg('Unable to load gallery albums. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: use promise chain so no setState runs synchronously in effect body
  useEffect(() => {
    let alive = true;
    galleryService.getAll()
      .then((data) => { if (alive) { setAlbums(data); setLoading(false); } })
      .catch(() => { if (alive) { setErrorMsg('Unable to load gallery albums.'); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  // ── Filters ──────────────────────────────────────────────────────────────

  const filteredAlbums = albums.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Album CRUD ───────────────────────────────────────────────────────────

  const openCreateAlbum = () => {
    setAlbumForm(emptyAlbumForm());
    setAlbumFormError('');
    setIsAlbumModalOpen(true);
  };

  const openEditAlbum = (album: GalleryAlbum) => {
    setAlbumForm({
      id: album.id,
      title: album.title,
      slug: album.slug,
      category: album.category || 'General',
      status: album.status,
      coverImageUrl: album.coverImageUrl || '',
    });
    setAlbumFormError('');
    setIsAlbumModalOpen(true);
  };

  const handleAlbumFormChange = (field: keyof AlbumFormState, value: string) => {
    setAlbumForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.id) {
        updated.slug = makeSlug(value);
      }
      return updated;
    });
  };

  const handleSaveAlbum = async () => {
    setAlbumFormError('');
    if (!albumForm.title.trim()) { setAlbumFormError('Album title is required.'); return; }
    if (!albumForm.slug.trim()) { setAlbumFormError('Slug is required.'); return; }
    if (!/^[a-z0-9-]+$/.test(albumForm.slug)) {
      setAlbumFormError('Slug may only contain lowercase letters, numbers, and hyphens.');
      return;
    }
    setIsSavingAlbum(true);
    try {
      const existingAlbum = albumForm.id ? albums.find(a => a.id === albumForm.id) : undefined;
      await galleryService.save({
        id: albumForm.id,
        title: albumForm.title.trim(),
        slug: albumForm.slug.trim(),
        category: albumForm.category,
        status: albumForm.status as GalleryAlbum['status'],
        coverImageUrl: albumForm.coverImageUrl,
        images: existingAlbum?.images || [],
      });
      setIsAlbumModalOpen(false);
      loadAlbums();
    } catch {
      setAlbumFormError('Failed to save album. Please try again.');
    } finally {
      setIsSavingAlbum(false);
    }
  };

  const handleQuickStatus = async (album: GalleryAlbum, status: GalleryAlbum['status']) => {
    try {
      await galleryService.save({ ...album, status });
      loadAlbums();
    } catch {
      setErrorMsg('Failed to update album status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAlbum) return;
    setIsDeleting(true);
    try {
      // Archive instead of hard-delete to preserve media asset references safely
      await galleryService.save({ ...deleteConfirmAlbum, status: 'archived' });
      setDeleteConfirmAlbum(null);
      loadAlbums();
    } catch {
      setErrorMsg('Failed to archive album.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Image management ─────────────────────────────────────────────────────

  const openImageManager = (album: GalleryAlbum) => {
    setManagingAlbum(album);
    setAlbumImages([...(album.images || [])]);
    setImageSaveError('');
    setViewMode('images');
  };

  const closeImageManager = () => {
    setViewMode('list');
    setManagingAlbum(null);
    setAlbumImages([]);
  };

  const handleAddImage = (url: string, altText?: string) => {
    const newImg: GalleryImage = {
      id: `img_${Date.now()}`,
      url,
      altText: altText || '',
      caption: '',
    };
    setAlbumImages((prev) => [...prev, newImg]);
  };

  const handleUpdateImageField = (idx: number, field: keyof GalleryImage, value: string) => {
    setAlbumImages((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleRemoveImage = (idx: number) => {
    setAlbumImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setAlbumImages((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const handleMoveDown = (idx: number) => {
    setAlbumImages((prev) => {
      if (idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const handleSaveImages = async () => {
    if (!managingAlbum) return;
    setIsSavingImages(true);
    setImageSaveError('');
    try {
      await galleryService.save({ ...managingAlbum, images: albumImages });
      // Update local albums list so cover image count reflects immediately
      setAlbums((prev) => prev.map((a) =>
        a.id === managingAlbum.id ? { ...managingAlbum, images: albumImages } : a
      ));
      closeImageManager();
    } catch {
      setImageSaveError('Failed to save images. Please try again.');
    } finally {
      setIsSavingImages(false);
    }
  };

  // ── Media Picker ─────────────────────────────────────────────────────────

  const handleMediaPicked = (url: string, altText?: string) => {
    if (pickerTarget === 'cover') {
      setAlbumForm((prev) => ({ ...prev, coverImageUrl: url }));
    } else if (pickerTarget === 'albumAdd') {
      handleAddImage(url, altText);
    }
    setIsImagePickerOpen(false);
    setPickerTarget(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE MANAGEMENT VIEW
  // ─────────────────────────────────────────────────────────────────────────

  if (viewMode === 'images' && managingAlbum) {
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Button variant="ghost" size="sm" onClick={closeImageManager} style={{ marginBottom: '0.5rem' }}>
              ← Back to Albums
            </Button>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>
              Manage Images — {managingAlbum.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {albumImages.length} image{albumImages.length !== 1 ? 's' : ''} in this album. Use Move Up / Move Down to reorder.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => { setPickerTarget('albumAdd'); setIsImagePickerOpen(true); }}
            >
              + Add Image from Media Library
            </Button>
            <Button variant="primary" size="md" isLoading={isSavingImages} onClick={handleSaveImages}>
              Save Image Order
            </Button>
          </div>
        </div>

        {imageSaveError && (
          <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            ⚠️ {imageSaveError}
          </div>
        )}

        {albumImages.length === 0 ? (
          <EmptyState
            title="No Images in This Album"
            description="Add images from the Media Library to build this gallery album."
            actionLabel="+ Add Image from Media Library"
            onAction={() => { setPickerTarget('albumAdd'); setIsImagePickerOpen(true); }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {albumImages.map((img, idx) => (
              <Card key={img.id} variant="bordered">
                <CardBody style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Thumbnail */}
                  <div style={{ width: '120px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--neutral-200)', flexShrink: 0 }}>
                    <img
                      src={img.url}
                      alt={img.altText || `Image ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>

                  {/* Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                    <Badge variant="default" style={{ alignSelf: 'flex-start' }}>Image #{idx + 1}</Badge>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{img.url}</p>
                    <Input
                      label="Alt Text (Accessibility)"
                      value={img.altText || ''}
                      onChange={(e) => handleUpdateImageField(idx, 'altText', e.target.value)}
                      placeholder="Describe this image for screen readers"
                    />
                    <Input
                      label="Caption (Optional)"
                      value={img.caption || ''}
                      onChange={(e) => handleUpdateImageField(idx, 'caption', e.target.value)}
                      placeholder="e.g. Annual Sports Day 2026"
                    />
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                    <Button variant="outline" size="sm" onClick={() => handleMoveUp(idx)} disabled={idx === 0} aria-label="Move image up">↑ Up</Button>
                    <Button variant="outline" size="sm" onClick={() => handleMoveDown(idx)} disabled={idx === albumImages.length - 1} aria-label="Move image down">↓ Down</Button>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveImage(idx)} aria-label="Remove image">✕ Remove</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        <MediaPickerModal
          isOpen={isImagePickerOpen}
          onClose={() => { setIsImagePickerOpen(false); setPickerTarget(null); }}
          allowedType="image"
          onSelectMedia={handleMediaPicked}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALBUM LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Media</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Photo Gallery Albums</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Create and manage photo albums that appear on the public Gallery page.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateAlbum}>
          + New Album
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
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search albums by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
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
          {searchQuery && (
            <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>Clear</Button>
          )}
        </CardBody>
      </Card>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <Skeleton height="220px" />
          <Skeleton height="220px" />
          <Skeleton height="220px" />
        </div>
      ) : filteredAlbums.length === 0 ? (
        <EmptyState
          title={searchQuery || statusFilter !== 'all' ? 'No albums match your filters' : 'No gallery albums yet'}
          description={searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or status filter.' : 'Create your first album to start building the photo gallery.'}
          actionLabel={!searchQuery && statusFilter === 'all' ? '+ New Album' : undefined}
          onAction={!searchQuery && statusFilter === 'all' ? openCreateAlbum : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredAlbums.map((album) => (
            <Card key={album.id} variant="bordered" style={{ overflow: 'hidden' }}>
              {/* Cover image */}
              <div style={{ height: '160px', width: '100%', backgroundColor: 'var(--neutral-200)', position: 'relative', overflow: 'hidden' }}>
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt={album.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--text-muted)' }}>
                    🖼️
                  </div>
                )}
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                  <Badge variant={album.status === 'published' ? 'success' : album.status === 'archived' ? 'danger' : 'warning'}>
                    {album.status}
                  </Badge>
                </div>
              </div>

              <CardBody>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{album.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {album.category || 'General'} · {album.images?.length || 0} photo{(album.images?.length || 0) !== 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  Updated {formatDate(album.updatedAt)}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={() => openEditAlbum(album)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => openImageManager(album)}>📷 Images</Button>
                  {album.status !== 'published' ? (
                    <Button variant="outline" size="sm" onClick={() => handleQuickStatus(album, 'published')}>Publish</Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => handleQuickStatus(album, 'draft')}>Hide</Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => setDeleteConfirmAlbum(album)}>Archive</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modal: Create / Edit Album ─────────────────────────────────── */}
      <Modal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        title={albumForm.id ? 'Edit Gallery Album' : 'Create New Album'}
        description="Set up album details. Images can be added after saving the album."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAlbumModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSavingAlbum} onClick={handleSaveAlbum}>
              {albumForm.id ? 'Save Changes' : 'Create Album'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {albumFormError && (
            <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
              ⚠️ {albumFormError}
            </div>
          )}
          <Input
            label="Album Title *"
            value={albumForm.title}
            onChange={(e) => handleAlbumFormChange('title', e.target.value)}
            placeholder="e.g. Annual Sports Day 2026"
            required
          />
          <Input
            label="URL Slug *"
            value={albumForm.slug}
            onChange={(e) => handleAlbumFormChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g. annual-sports-day-2026"
            required
          />
          <Select
            label="Category"
            value={albumForm.category}
            onChange={(e) => handleAlbumFormChange('category', e.target.value)}
            options={ALBUM_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
          <Select
            label="Status"
            value={albumForm.status}
            onChange={(e) => handleAlbumFormChange('status', e.target.value)}
            options={[
              { label: 'Draft (not public)', value: 'draft' },
              { label: 'Published (visible on website)', value: 'published' },
              { label: 'Archived', value: 'archived' },
            ]}
          />
          {/* Cover image */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Cover Image URL"
                value={albumForm.coverImageUrl}
                onChange={(e) => handleAlbumFormChange('coverImageUrl', e.target.value)}
                placeholder="Select from Media Library or paste URL"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => { setPickerTarget('cover'); setIsImagePickerOpen(true); }}
            >
              📁 Media Library
            </Button>
          </div>
          {albumForm.coverImageUrl && (
            <img
              src={albumForm.coverImageUrl}
              alt="Cover preview"
              style={{ height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          )}
        </div>
      </Modal>

      {/* ── Modal: Archive Confirm ─────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(deleteConfirmAlbum)}
        onClose={() => setDeleteConfirmAlbum(null)}
        title="Archive Gallery Album?"
        description="Archived albums are hidden from the public website. Underlying media assets are not affected."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmAlbum(null)}>Cancel</Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteConfirm}>
              Archive Album
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Album <strong>&ldquo;{deleteConfirmAlbum?.title}&rdquo;</strong> will be archived and hidden from the public Gallery.
          The images inside the album and their Media Library assets are kept intact.
        </p>
      </Modal>

      {/* Media Picker (shared) */}
      <MediaPickerModal
        isOpen={isImagePickerOpen}
        onClose={() => { setIsImagePickerOpen(false); setPickerTarget(null); }}
        allowedType="image"
        onSelectMedia={handleMediaPicked}
      />
    </div>
  );
}
