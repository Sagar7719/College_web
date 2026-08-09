'use client';

import React, { useEffect, useState } from 'react';
import { NavigationItem, Page } from '@/types';
import { navigationService } from '@/services/navigation.service';
import { pagesService } from '@/services/pages.service';
import {
  SYSTEM_ROUTE_OPTIONS,
  isValidExternalUrl,
} from '@/validations/navigation.schema';
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

export default function AdminNavigationManagerScreen() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [publishedPages, setPublishedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);

  // Form State inside Modal
  const [label, setLabel] = useState('');
  const [linkType, setLinkType] = useState<'system' | 'cms' | 'external'>('system');
  const [systemPath, setSystemPath] = useState('/');
  const [selectedCmsPageId, setSelectedCmsPageId] = useState('');
  const [externalUrl, setExternalUrl] = useState('https://');
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(0);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [allNav, allPages] = await Promise.all([
      navigationService.getAllAdminNavigationItems(),
      pagesService.getPublishedPages(),
    ]);
    setNavItems(allNav);
    setPublishedPages(allPages);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      navigationService.getAllAdminNavigationItems(),
      pagesService.getPublishedPages(),
    ])
      .then(([allNav, allPages]) => {
        if (alive) {
          setNavItems(allNav);
          setPublishedPages(allPages);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => { alive = false; };
  }, []);

  // Filtered Nav Items
  const filteredNavItems = navItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setLabel('');
    setLinkType('system');
    setSystemPath('/');
    setSelectedCmsPageId(publishedPages[0]?.id || '');
    setExternalUrl('https://');
    setVisible(true);
    setOrder(navItems.length);
    setOpenInNewTab(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: NavigationItem) => {
    setEditingItem(item);
    setLabel(item.label);

    if (item.isExternal) {
      setLinkType('external');
      setExternalUrl(item.path);
    } else if (item.isCMSPage) {
      setLinkType('cms');
      setSelectedCmsPageId(item.cmsPageId || '');
    } else {
      setLinkType('system');
      setSystemPath(item.path);
    }

    setVisible(item.visible);
    setOrder(item.order);
    setOpenInNewTab(item.targetBlank || false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Save Modal Item
  const handleSaveModalItem = async () => {
    setErrorMessage('');

    if (!label.trim()) {
      setErrorMessage('Menu label is required.');
      return;
    }

    let finalPath = '/';
    let isCMSPage = false;
    let isExternal = false;
    let cmsPageId: string | undefined = undefined;

    if (linkType === 'system') {
      finalPath = systemPath;
    } else if (linkType === 'cms') {
      const selectedPage = publishedPages.find((p) => p.id === selectedCmsPageId);
      if (!selectedPage) {
        setErrorMessage('Please select a valid published CMS page.');
        return;
      }
      finalPath = `/${selectedPage.slug}`;
      isCMSPage = true;
      cmsPageId = selectedPage.id;
    } else if (linkType === 'external') {
      if (!isValidExternalUrl(externalUrl)) {
        setErrorMessage('Please enter a valid external URL starting with http:// or https://');
        return;
      }
      finalPath = externalUrl;
      isExternal = true;
    }

    setIsSaving(true);
    try {
      const newItem: NavigationItem = {
        id: editingItem?.id || `nav_${Date.now()}`,
        label: label.trim(),
        path: finalPath,
        order,
        visible,
        isCMSPage,
        cmsPageId,
        isExternal,
        targetBlank: isExternal ? openInNewTab : undefined,
      };

      await navigationService.saveSingleNavigationItem(newItem);
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save navigation item.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Up
  const moveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...navItems];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setNavItems(updated);
    await navigationService.saveNavigationItems(updated);
  };

  // Reorder Down
  const moveDown = async (index: number) => {
    if (index === navItems.length - 1) return;
    const updated = [...navItems];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setNavItems(updated);
    await navigationService.saveNavigationItems(updated);
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: NavigationItem) => {
    const updatedItem = { ...item, visible: !item.visible };
    await navigationService.saveSingleNavigationItem(updatedItem);
    loadData();
  };

  // Delete Item (Does NOT delete CMS page!)
  const confirmDelete = async (id: string) => {
    await navigationService.deleteNavigationItem(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Dynamic Navigation</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Header Navigation Manager</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Configure menu items, order, visibility, and link destinations for the public website header.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Add Menu Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Filter menu items by label or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>
              Clear
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Content Table / Cards */}
      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </CardBody>
        </Card>
      ) : filteredNavItems.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No menu items matching "${searchQuery}"` : 'No Navigation Items Configured'}
          description={
            searchQuery
              ? 'Try searching with a different term.'
              : 'Add your first menu item to customize the public college header navbar.'
          }
          actionLabel={!searchQuery ? '+ Add Menu Item' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '60px' }}>Order</TableHead>
                  <TableHead>Menu Label</TableHead>
                  <TableHead>Link Destination & Type</TableHead>
                  <TableHead>Visibility Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNavItems.map((item, idx) => {
                  return (
                    <TableRow key={item.id} style={{ opacity: item.visible ? 1 : 0.6 }}>
                      <TableCell style={{ fontWeight: 700 }}>#{idx + 1}</TableCell>
                      <TableCell>
                        <strong style={{ color: 'var(--primary)' }}>{item.label}</strong>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Badge variant={item.isExternal ? 'warning' : item.isCMSPage ? 'info' : 'default'}>
                            {item.isExternal ? 'External URL' : item.isCMSPage ? 'CMS Page' : 'System Route'}
                          </Badge>
                          <span className="small-text">{item.path}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.visible ? 'success' : 'danger'}>
                          {item.visible ? 'Visible in Navbar' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            aria-label="Move navigation item up"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDown(idx)}
                            disabled={idx === navItems.length - 1}
                            aria-label="Move navigation item down"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleVisibility(item)}
                            aria-label={item.visible ? 'Hide navigation item' : 'Show navigation item'}
                          >
                            {item.visible ? 'Hide' : 'Show'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(item)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteConfirmId(item.id)}
                            aria-label="Remove menu item"
                          >
                            ✕
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal 1: Create / Edit Navigation Item */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Navigation Menu Item' : 'Add New Navigation Menu Item'}
        description="Configure menu label, link destination, and public navbar visibility."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveModalItem}>
              {editingItem ? 'Save Changes' : 'Add Menu Item'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--semantic-error-bg)',
                color: 'var(--semantic-error)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          <Input
            label="Menu Display Label *"
            placeholder="e.g. Scholarship Information"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />

          <Select
            label="Link Destination Type"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as 'system' | 'cms' | 'external')}
            options={[
              { label: 'Internal System Page (e.g. /about, /admissions)', value: 'system' },
              { label: 'Published CMS Page', value: 'cms' },
              { label: 'External Web Link (http:// or https://)', value: 'external' },
            ]}
          />

          {linkType === 'system' && (
            <Select
              label="Select System Route"
              value={systemPath}
              onChange={(e) => setSystemPath(e.target.value)}
              options={SYSTEM_ROUTE_OPTIONS}
            />
          )}

          {linkType === 'cms' && (
            <div>
              <Select
                label="Select Published CMS Page"
                value={selectedCmsPageId}
                onChange={(e) => setSelectedCmsPageId(e.target.value)}
                options={
                  publishedPages.length > 0
                    ? publishedPages.map((p) => ({ label: `${p.title} (/${p.slug})`, value: p.id }))
                    : [{ label: 'No published CMS pages found', value: '' }]
                }
              />
              {publishedPages.length === 0 && (
                <span className="tiny-text" style={{ color: 'var(--semantic-warning)', marginTop: '0.25rem', display: 'block' }}>
                  ⚠️ Create and publish a CMS page first in Page Builder to select it here.
                </span>
              )}
            </div>
          )}

          {linkType === 'external' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Input
                label="External URL *"
                placeholder="https://example.com"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="targetBlank"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="targetBlank" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  Open external link in a new browser tab (target=&quot;_blank&quot;)
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="visibleCheck"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="visibleCheck" style={{ fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
              Visible in Public Header Navbar
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Remove Navigation Item?"
        description="This will remove the item from the public navigation bar."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>
              Remove Menu Item
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Removing a navigation menu item only removes the link from the public header menu. <strong>The underlying CMS page or system route will NOT be deleted.</strong>
        </p>
      </Modal>
    </div>
  );
}
