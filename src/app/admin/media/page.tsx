'use client';

import React, { useEffect, useState } from 'react';
import { MediaAsset } from '@/types';
import { mediaService } from '@/services/media.service';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  EmptyState,
  Skeleton,
} from '@/components/ui';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document'>('all');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Metadata Edit Modal State
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await mediaService.getAll();
    setAssets(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    mediaService.getAll()
      .then((data) => { if (alive) { setAssets(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.publicId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.resourceType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenUploadModal = () => {
    setUploadFile(null);
    setUploadAltText('');
    setUploadCaption('');
    setUploadError('');
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async () => {
    setUploadError('');
    if (!uploadFile) {
      setUploadError('Please select an image or document file.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('altText', uploadAltText);
      formData.append('caption', uploadCaption);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload media asset');
      }

      // Persist metadata in Firestore from authenticated admin client
      await mediaService.saveMediaAsset({
        publicId: data.publicId,
        resourceType: data.resourceType,
        url: data.secureUrl || data.url,
        secureUrl: data.secureUrl || data.url,
        format: data.format,
        bytes: data.bytes,
        width: data.width,
        height: data.height,
        fileName: data.fileName,
        originalName: data.originalName || data.fileName,
        altText: uploadAltText,
        caption: uploadCaption,
      });

      setIsUploadModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditMetadata = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setEditAltText(asset.altText || '');
    setEditCaption(asset.caption || '');
  };

  const handleSaveMetadata = async () => {
    if (!editingAsset) return;
    await mediaService.updateMetadata(editingAsset.id, editAltText, editCaption);
    setEditingAsset(null);
    loadData();
  };

  const confirmDelete = async (id: string) => {
    await mediaService.deleteMediaAsset(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Central Assets</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Media Library</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Upload and manage images and PDF documents used across your college website.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenUploadModal}>
          + Upload Media
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search media assets by filename or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'image' | 'document')}
              options={[
                { label: 'All Types', value: 'all' },
                { label: 'Images', value: 'image' },
                { label: 'Documents (PDF)', value: 'document' },
              ]}
            />
          </div>
          {searchQuery && <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>Clear</Button>}
        </CardBody>
      </Card>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <Skeleton height="180px" />
          <Skeleton height="180px" />
          <Skeleton height="180px" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No media matching "${searchQuery}"` : 'No Media Uploaded Yet'}
          description="Upload images and documents to use them across your website."
          actionLabel={!searchQuery ? '+ Upload Media' : undefined}
          onAction={!searchQuery ? handleOpenUploadModal : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {filteredAssets.map((asset) => (
            <Card key={asset.id} variant="bordered" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {asset.resourceType === 'image' ? (
                <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--neutral-100)' }}>
                  <img
                    src={asset.secureUrl || asset.url}
                    alt={asset.altText || asset.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    height: '140px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--neutral-200)',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>📄</span>
                  <Badge variant="info" style={{ marginTop: '0.5rem' }}>
                    {asset.format.toUpperCase()} DOCUMENT
                  </Badge>
                </div>
              )}
              <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.75rem' }}>
                <div>
                  <h4
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={asset.fileName}
                  >
                    {asset.fileName}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {(asset.bytes / 1024).toFixed(1)} KB • {asset.format.toUpperCase()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem' }}>
                  <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={() => handleOpenEditMetadata(asset)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(asset.id)}>
                    ✕
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Upload Asset */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media Asset"
        description="Select an image (Max 5MB) or PDF document (Max 10MB)."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isUploading} onClick={handleUploadSubmit}>
              Upload File
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {uploadError && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {uploadError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Choose File *</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              style={{ padding: '0.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Input
            label="Accessibility Alt Text (For Images)"
            placeholder="e.g. Students working in computer vision lab"
            value={uploadAltText}
            onChange={(e) => setUploadAltText(e.target.value)}
          />
          <Input
            label="Caption / Description (Optional)"
            placeholder="e.g. Annual convocation ceremony photo 2026"
            value={uploadCaption}
            onChange={(e) => setUploadCaption(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal: Edit Metadata */}
      <Modal
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        title="Edit Asset Metadata"
        description="Update image accessibility alt text and caption."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingAsset(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMetadata}>Save Metadata</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Accessibility Alt Text"
            value={editAltText}
            onChange={(e) => setEditAltText(e.target.value)}
          />
          <Input
            label="Caption"
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Media Asset?"
        description="Remove metadata record from Media Library?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Deleting removes this asset reference from your Media Library.
        </p>
      </Modal>
    </div>
  );
}
