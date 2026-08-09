'use client';

import React, { useEffect, useState } from 'react';
import { MediaAsset } from '@/types';
import { mediaService } from '@/services/media.service';
import {
  Modal,
  Button,
  Input,
  Skeleton,
  EmptyState,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [directUrl, setDirectUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'direct'>('library');

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    mediaService.getAll()
      .then((data) => {
        if (alive) {
          setAssets(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, [isOpen]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      allowedType === 'all'
        ? true
        : allowedType === 'image'
        ? asset.resourceType === 'image'
        : asset.resourceType === 'document';
    return matchesSearch && matchesType;
  });

  const handleConfirmSelection = () => {
    if (activeTab === 'direct' && directUrl.trim()) {
      onSelectMedia(directUrl.trim(), '');
      onClose();
    } else if (selectedAsset) {
      onSelectMedia(selectedAsset.secureUrl || selectedAsset.url, selectedAsset.altText || '');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Media from Library"
      description="Choose an asset from your Media Library or enter a direct URL."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={activeTab === 'library' ? !selectedAsset : !directUrl.trim()}
            onClick={handleConfirmSelection}
          >
            Use Selected Media
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <Button
            variant={activeTab === 'library' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('library')}
          >
            📁 Media Library
          </Button>
          <Button
            variant={activeTab === 'direct' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('direct')}
          >
            🔗 Direct External URL
          </Button>
        </div>

        {activeTab === 'direct' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <Input
              label="Direct Image or Document URL *"
              placeholder="https://images.unsplash.com/photo-1541339907198-e08756dedf3f"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
            />
            {directUrl && (
              <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>URL Preview:</span>
                <img
                  src={directUrl}
                  alt="Preview"
                  style={{ maxHeight: '160px', marginTop: '0.5rem', margin: '0.5rem auto', borderRadius: 'var(--radius-sm)' }}
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Input
              placeholder="Search media by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <Skeleton height="100px" />
                <Skeleton height="100px" />
                <Skeleton height="100px" />
              </div>
            ) : filteredAssets.length === 0 ? (
              <EmptyState
                title="No Media Found"
                description="Upload images or documents in the Media Library first, or use a direct URL."
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.75rem',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem',
                }}
              >
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      style={{
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.375rem',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? 'var(--neutral-100)' : 'var(--card-bg)',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {asset.resourceType === 'image' ? (
                        <div style={{ height: '90px', width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                          <img
                            src={asset.secureUrl || asset.url}
                            alt={asset.altText || asset.fileName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: '90px',
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
                          <span style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                            {asset.format.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          marginTop: '0.375rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: 'var(--primary)',
                        }}
                      >
                        {asset.fileName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
