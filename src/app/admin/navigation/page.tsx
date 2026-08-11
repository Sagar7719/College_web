'use client';

import React, { useEffect, useState } from 'react';
import { NavigationItem, Page, OptionGroup } from '@/types';
import { navigationService, buildNavigationTree } from '@/services/navigation.service';
import { pagesService } from '@/services/pages.service';
import { selectablePagesService, SelectablePageOption } from '@/services/selectable-pages.service';
import {
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
  const [selectablePages, setSelectablePages] = useState<SelectablePageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);

  // Form State inside Modal
  const [label, setLabel] = useState('');
  const [parentId, setParentId] = useState('');
  const [linkType, setLinkType] = useState<'existing' | 'external'>('existing');
  const [selectedPageId, setSelectedPageId] = useState('');
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
    const [allNav, allPages, discoveredPages] = await Promise.all([
      navigationService.getAllAdminNavigationItems(),
      pagesService.getPublishedPages(),
      selectablePagesService.getSelectablePages(),
    ]);
    setNavItems(allNav);
    setPublishedPages(allPages);
    setSelectablePages(discoveredPages);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      navigationService.getAllAdminNavigationItems(),
      pagesService.getPublishedPages(),
      selectablePagesService.getSelectablePages(),
    ])
      .then(([allNav, allPages, discoveredPages]) => {
        if (alive) {
          setNavItems(allNav);
          setPublishedPages(allPages);
          setSelectablePages(discoveredPages);
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

  const handleSelectPageOption = (optId: string) => {
    setSelectedPageId(optId);
    const selectedOpt = selectablePages.find((p) => p.id === optId);
    if (selectedOpt && (!label.trim() || editingItem === null)) {
      setLabel(selectedOpt.title);
    }
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setLabel('');
    setParentId('');
    setLinkType('existing');
    const firstOption = selectablePages[0];
    if (firstOption) {
      setSelectedPageId(firstOption.id);
      setLabel(firstOption.title);
    } else {
      setSelectedPageId('');
    }
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
    setParentId(item.parentId || '');

    if (item.isExternal) {
      setLinkType('external');
      setExternalUrl(item.path);
    } else {
      setLinkType('existing');
      const matched = selectablePages.find(
        (p) =>
          (item.cmsPageId && p.pageId === item.cmsPageId) ||
          (item.systemKey && p.systemKey === item.systemKey) ||
          p.path === item.path
      );
      if (matched) {
        setSelectedPageId(matched.id);
      } else if (selectablePages.length > 0) {
        setSelectedPageId(selectablePages[0].id);
      }
    }

    setVisible(item.visible);
    setOrder(item.order);
    setOpenInNewTab(item.targetBlank || false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Parent Select Options (Top-level items only, excluding self)
  const parentSelectOptions = [
    { label: '📌 Main Navigation (Top-Level Item)', value: '' },
    ...navItems
      .filter((i) => !i.parentId && i.id !== editingItem?.id)
      .map((i) => ({ label: `📁 Dropdown Menu: ${i.label}`, value: i.id })),
  ];

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
    let systemKey: string | undefined = undefined;
    let isSystemPage: boolean | undefined = undefined;

    if (linkType === 'existing') {
      const selectedOpt = selectablePages.find((p) => p.id === selectedPageId);
      if (!selectedOpt) {
        setErrorMessage('Please select an existing page from the dropdown.');
        return;
      }
      finalPath = selectedOpt.path;
      isCMSPage = selectedOpt.category === 'custom_page';
      cmsPageId = selectedOpt.pageId;
      isSystemPage = selectedOpt.isSystemPage;
      systemKey = selectedOpt.systemKey;
    } else if (linkType === 'external') {
      if (!isValidExternalUrl(externalUrl)) {
        setErrorMessage('Please enter a valid external URL starting with http:// or https://');
        return;
      }
      finalPath = externalUrl.trim();
      isExternal = true;
    }

    setIsSaving(true);
    try {
      const newItem: NavigationItem = {
        id: editingItem?.id || (isSystemPage && systemKey ? `nav_sys_${systemKey}_${Date.now()}` : isCMSPage && cmsPageId ? `nav_cms_${cmsPageId}` : `nav_${Date.now()}`),
        label: label.trim(),
        path: finalPath,
        order,
        visible,
        isCMSPage,
        cmsPageId,
        ...(parentId ? { parentId } : {}),
        ...(isSystemPage && systemKey ? { isSystemPage: true, systemKey: systemKey as any } : {}),
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
    try {
      await navigationService.deleteNavigationItem(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete navigation item';
      alert(msg);
      setDeleteConfirmId(null);
    }
  };

  const parentMap = new Map<string, string>();
  navItems.forEach((i) => parentMap.set(i.id, i.label));

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>2-Level Mega Navigation</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Header Navigation Manager</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage 2-level top-level and dropdown child navigation items for system and custom CMS pages.
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
                  <TableHead>Menu Label &amp; Hierarchy</TableHead>
                  <TableHead>Link Destination &amp; Type</TableHead>
                  <TableHead>Visibility Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const topLevelItemsList = navItems.filter((i) => !i.parentId);
                  return filteredNavItems.map((item, idx) => {
                    const isSys = item.isSystemPage;
                    const isChild = Boolean(item.parentId);
                    const parentLabel = item.parentId ? parentMap.get(item.parentId) : undefined;

                    let orderDisplay = '';
                    if (!isChild) {
                      const topIdx = topLevelItemsList.findIndex((i) => i.id === item.id);
                      orderDisplay = `#${topIdx !== -1 ? topIdx + 1 : item.order + 1}`;
                    } else {
                      const siblings = navItems.filter((i) => i.parentId === item.parentId);
                      const childIdx = siblings.findIndex((i) => i.id === item.id);
                      orderDisplay = `↳ #${childIdx !== -1 ? childIdx + 1 : item.order + 1}`;
                    }

                    return (
                      <TableRow key={item.id} style={{ opacity: item.visible ? 1 : 0.6 }}>
                        <TableCell style={{ fontWeight: 700, color: isChild ? 'var(--primary)' : 'var(--text-main)' }}>
                          {orderDisplay}
                        </TableCell>
                      <TableCell>
                        <div style={{ paddingLeft: isChild ? '1.5rem' : 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {isChild && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>↳ </span>}
                          <strong style={{ color: 'var(--primary)' }}>{item.label}</strong>
                          {isChild && parentLabel && (
                            <Badge variant="default" style={{ fontSize: '0.6875rem' }}>
                              Inside {parentLabel}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Badge variant={isSys ? 'info' : item.isExternal ? 'warning' : 'default'}>
                            {isSys ? 'SYSTEM' : item.isExternal ? 'EXTERNAL' : 'CUSTOM CMS'}
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', flexWrap: 'wrap' }}>
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
                            disabled={isSys}
                            title={isSys ? 'System page navigation items cannot be deleted.' : 'Remove menu item'}
                            onClick={() => !isSys && setDeleteConfirmId(item.id)}
                            style={isSys ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                            aria-label="Remove menu item"
                          >
                            ✕
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                });
              })()}
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
        description="Configure menu label, parent dropdown location, link destination, and public navbar visibility."
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
            label="Navbar Parent Location"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            options={parentSelectOptions}
          />

          <Select
            label="Link Destination Type *"
            value={linkType}
            onChange={(e) => {
              const val = e.target.value as 'existing' | 'external';
              setLinkType(val);
              if (val === 'existing' && selectablePages.length > 0) {
                handleSelectPageOption(selectablePages[0].id);
              }
            }}
            options={[
              { label: '📌 Existing Page (System Page, System Module, or Custom Page)', value: 'existing' },
              { label: '🌐 External Web Link (http:// or https://)', value: 'external' },
            ]}
          />

          {linkType === 'existing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Select
                label="Select Existing Page / Route *"
                value={selectedPageId}
                onChange={(e) => handleSelectPageOption(e.target.value)}
                groups={[
                  {
                    label: 'System Pages',
                    options: selectablePages
                      .filter((p) => p.category === 'system_page')
                      .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id })),
                  },
                  {
                    label: 'System Modules',
                    options: selectablePages
                      .filter((p) => p.category === 'system_module')
                      .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id })),
                  },
                  {
                    label: 'Custom CMS Pages',
                    options:
                      selectablePages.filter((p) => p.category === 'custom_page').length > 0
                        ? selectablePages
                            .filter((p) => p.category === 'custom_page')
                            .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id }))
                        : [{ label: 'No published custom pages found', value: '', disabled: true }],
                  },
                ].filter((g) => g.options.length > 0)}
              />
              <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                Selecting an existing route reuses its canonical path without creating duplicate page documents.
              </span>
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
          Removing a navigation menu item only removes the link from the public header menu. <strong>The underlying custom CMS page will NOT be deleted.</strong>
        </p>
      </Modal>
    </div>
  );
}
