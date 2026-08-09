'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MediaAsset } from '@/types';
import { mediaService } from '@/services/media.service';
import {
  Modal,
  Button,
  Input,
  Skeleton,
  EmptyState,
  Badge,
} from '@/components/ui';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string, altText?: string) => void;
  allowedType?: 'image' | 'document' | 'all';
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelectMedia,
  allowedType = 'all',
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [directAltText, setDirectAltText] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'direct'>('library');

  // Inline Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mediaService.getAll();
      setAssets(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load media assets from Firestore.';
      setError(msg);
      console.error('MediaPickerModal fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    mediaService
      .getAll()
      .then((data) => {
        if (isMounted) {
          setAssets(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load media');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const filteredAssets = assets.filter((asset) => {
    const nameMatch = (asset.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const altMatch = (asset.altText || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || altMatch;

    const isImg =
      asset.resourceType === 'image' ||
      ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes((asset.format || '').toLowerCase());
    const isDoc =
      asset.resourceType === 'document' ||
      ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes((asset.format || '').toLowerCase());

    const matchesType =
      allowedType === 'all'
        ? true
        : allowedType === 'image'
        ? isImg
        : isDoc;

    return matchesSearch && matchesType;
  });

  const handleUploadSubmit = async () => {
    setUploadError('');
    if (!uploadFile) {
      setUploadError('Please select a file to upload.');
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

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to upload media asset.');
      }

      // Refresh list
      await handleRefresh();

      // Automatically select the newly uploaded asset
      onSelectMedia(result.url, uploadAltText || result.fileName);
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed.';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (activeTab === 'direct' && directUrl.trim()) {
      onSelectMedia(directUrl.trim(), directAltText.trim());
      onClose();
    } else if (selectedAsset) {
      onSelectMedia(selectedAsset.secureUrl || selectedAsset.url, selectedAsset.altText || selectedAsset.fileName);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        allowedType === 'image'
          ? 'Select Image Asset'
          : allowedType === 'document'
          ? 'Select Document / PDF'
          : 'Select Media Asset'
      }
      description="Select an existing file from your Media Library, upload a new file, or enter a direct URL."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {activeTab === 'upload' ? (
            <Button
              variant="primary"
              isLoading={isUploading}
              disabled={!uploadFile}
              onClick={handleUploadSubmit}
            >
              Upload & Select
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={activeTab === 'library' ? !selectedAsset : !directUrl.trim()}
              onClick={handleConfirmSelection}
            >
              Use Selected Media
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant={activeTab === 'library' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('library')}
          >
            📁 Media Library ({filteredAssets.length})
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload New File
          </Button>
          <Button
            variant={activeTab === 'direct' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('direct')}
          >
            🔗 Direct External URL
          </Button>
        </div>

        {/* Tab 1: Library */}
        {activeTab === 'library' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Search media by filename or alt text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="md" onClick={handleRefresh} title="Refresh Library">
                🔄
              </Button>
            </div>

            {error && (
              <div
                style={{
                  padding: '0.875rem',
                  backgroundColor: 'var(--semantic-error-bg)',
                  color: 'var(--semantic-error)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  border: '1px solid var(--semantic-error)',
                }}
              >
                ⚠️ <strong>Media Library Warning:</strong> {error}
              </div>
            )}

            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <Skeleton height="110px" />
                <Skeleton height="110px" />
                <Skeleton height="110px" />
                <Skeleton height="110px" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <EmptyState
                title={searchQuery ? `No media matching "${searchQuery}"` : 'No Media in Library Yet'}
                description={
                  searchQuery
                    ? 'Try searching with another filename or keyword.'
                    : 'Upload your campus photos, logos, or documents to select them easily.'
                }
                actionLabel="+ Upload New File"
                onAction={() => setActiveTab('upload')}
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                  gap: '0.75rem',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem',
                }}
              >
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const isImage =
                    asset.resourceType === 'image' ||
                    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(
                      (asset.format || '').toLowerCase()
                    );

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      style={{
                        border: isSelected
                          ? '2px solid var(--primary)'
                          : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.375rem',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--neutral-100)' : 'var(--card-bg)',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            zIndex: 2,
                          }}
                        >
                          ✓
                        </div>
                      )}

                      {isImage ? (
                        <div
                          style={{
                            height: '85px',
                            width: '100%',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--neutral-200)',
                          }}
                        >
                          <img
                            src={asset.secureUrl || asset.url}
                            alt={asset.altText || asset.fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: '85px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--neutral-200)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <span style={{ fontSize: '1.75rem' }}>📄</span>
                          <Badge variant="info" style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                            {(asset.format || 'doc').toUpperCase()}
                          </Badge>
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginTop: '0.375rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                        }}
                        title={asset.fileName}
                      >
                        {asset.fileName}
                      </div>
                      {asset.altText && (
                        <div
                          style={{
                            fontSize: '0.65rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={asset.altText}
                        >
                          {asset.altText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload New File */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}>
            {uploadError && (
              <div
                style={{
                  color: 'var(--semantic-error)',
                  backgroundColor: 'var(--semantic-error-bg)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                }}
              >
                ⚠️ {uploadError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                Choose File from Computer * (Max 5MB Image / 10MB PDF)
              </label>
              <input
                type="file"
                accept={
                  allowedType === 'image'
                    ? 'image/*'
                    : allowedType === 'document'
                    ? 'application/pdf,.doc,.docx'
                    : 'image/*,application/pdf,.doc,.docx'
                }
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{
                  padding: '0.75rem',
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--neutral-100)',
                }}
              />
            </div>

            <Input
              label="Accessibility Alt Text (Recommended for images)"
              placeholder="e.g. Campus library building at sunset"
              value={uploadAltText}
              onChange={(e) => setUploadAltText(e.target.value)}
            />

            <Input
              label="Caption / Label (Optional)"
              placeholder="e.g. Official University Campus photo 2026"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
            />
          </div>
        )}

        {/* Tab 3: Direct External URL */}
        {activeTab === 'direct' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <Input
              label="Direct Image or Document URL *"
              placeholder="https://images.unsplash.com/photo-1541339907198-e08756dedf3f"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
            />

            <Input
              label="Alt Text / Description (Optional)"
              placeholder="e.g. External partner institution logo"
              value={directAltText}
              onChange={(e) => setDirectAltText(e.target.value)}
            />

            {directUrl && (
              <div
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>URL Preview:</span>
                <img
                  src={directUrl}
                  alt="Preview"
                  style={{
                    maxHeight: '160px',
                    marginTop: '0.5rem',
                    margin: '0.5rem auto',
                    borderRadius: 'var(--radius-sm)',
                    display: 'block',
                  }}
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
