'use client';

import React, { useEffect, useState } from 'react';
import { NavigationItem, Page } from '@/types';
import { navigationService, buildNavigationTree } from '@/services/navigation.service';
import { pagesService } from '@/services/pages.service';
import { selectablePagesService, SelectablePageOption } from '@/services/selectable-pages.service';
import { isValidExternalUrl } from '@/validations/navigation.schema';
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

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

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

  // Drag and Drop Event Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...navItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    // Re-index sequential order values
    const updated = newItems.map((item, idx) => ({ ...item, order: idx }));
    setNavItems(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Persist to database
    setIsSavingReorder(true);
    try {
      await navigationService.saveNavigationItems(updated);
    } catch (err) {
      console.warn('Failed to persist drag reorder:', err);
    } finally {
      setIsSavingReorder(false);
    }
  };

  // Quick Nest Item under Parent Dropdown
  const handleNestUnderParent = async (itemId: string, targetParentId: string) => {
    const updated = navItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, parentId: targetParentId || undefined };
      }
      return item;
    });
    setNavItems(updated);

    try {
      await navigationService.saveNavigationItems(updated);
    } catch (err) {
      console.warn('Failed to update nested dropdown parent:', err);
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
      const payload: NavigationItem = {
        id: editingItem ? editingItem.id : '',
        label: label.trim(),
        path: finalPath,
        parentId: parentId || undefined,
        isCMSPage,
        cmsPageId,
        isExternal,
        isSystemPage,
        systemKey,
        order,
        visible,
        targetBlank: openInNewTab,
      };

      await navigationService.saveSingleNavigationItem(payload);
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setErrorMessage('Failed to save navigation item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Item Visibility
  const handleToggleVisibility = async (item: NavigationItem) => {
    try {
      const updated = { ...item, visible: !item.visible };
      await navigationService.saveSingleNavigationItem(updated);
      await loadData();
    } catch (err) {
      console.warn('Failed to toggle visibility:', err);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deleteConfirmId) return;
    setIsSaving(true);
    try {
      await navigationService.deleteNavigationItem(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete navigation item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
            🧭 Drag &amp; Drop Navigation Menu Manager
          </h1>
          <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
            Drag and drop items to reorder the main website menu bar or nest items under dropdown menus.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isSavingReorder && (
            <Badge variant="warning">Saving Order...</Badge>
          )}
          <Button variant="primary" onClick={handleOpenCreateModal}>
            ➕ Add New Menu Link
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="outline">
        <CardBody style={{ padding: '1.25rem' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '1.25rem', maxWidth: '360px' }}>
            <Input
              type="text"
              placeholder="Search menu items by label or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton style={{ height: '48px', width: '100%' }} />
              <Skeleton style={{ height: '48px', width: '100%' }} />
              <Skeleton style={{ height: '48px', width: '100%' }} />
            </div>
          ) : filteredNavItems.length === 0 ? (
            <EmptyState
              icon="🧭"
              title="No Navigation Items Found"
              description="Click 'Add New Menu Link' to add custom links or restore system page links."
              action={{
                label: 'Add Menu Link',
                onClick: handleOpenCreateModal,
              }}
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ width: '48px' }}>Drag</TableHead>
                    <TableHead>Menu Label &amp; Hierarchy</TableHead>
                    <TableHead>Target Path</TableHead>
                    <TableHead>Menu Position</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNavItems.map((item, index) => {
                    const isParent = !item.parentId;
                    const parentObj = item.parentId ? navItems.find((p) => p.id === item.parentId) : null;
                    const isBeingDragged = draggedIndex === index;
                    const isDragTarget = dragOverIndex === index;

                    return (
                      <TableRow
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        style={{
                          opacity: isBeingDragged ? 0.4 : 1,
                          backgroundColor: isDragTarget ? '#FFFBEB' : isParent ? '#FFFFFF' : '#FAFAF8',
                          borderLeft: isDragTarget ? '4px solid #C85A32' : item.parentId ? '3px solid #DED4C5' : '4px solid #24221F',
                          cursor: 'grab',
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {/* Drag Handle */}
                        <TableCell>
                          <span
                            title="Click and drag to reorder menu items"
                            style={{
                              cursor: 'grab',
                              fontSize: '1.25rem',
                              color: '#8E877D',
                              userSelect: 'none',
                              padding: '4px 8px',
                            }}
                          >
                            ⋮⋮
                          </span>
                        </TableCell>

                        {/* Label & Type */}
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: item.parentId ? '1.5rem' : '0' }}>
                            {item.parentId && <span style={{ color: '#C85A32', fontWeight: 'bold' }}>↳</span>}
                            <span style={{ fontWeight: isParent ? 800 : 600, color: '#24221F', fontSize: '0.9375rem' }}>
                              {item.label}
                            </span>
                            {item.isSystemPage && <Badge variant="info">System</Badge>}
                            {item.isCMSPage && !item.isSystemPage && <Badge variant="accent">CMS Page</Badge>}
                            {item.isExternal && <Badge variant="warning">External</Badge>}
                          </div>
                        </TableCell>

                        {/* Path */}
                        <TableCell>
                          <code style={{ fontSize: '0.8125rem', color: '#68705A', background: '#F7F2E9', padding: '2px 8px', borderRadius: '2px' }}>
                            {item.path}
                          </code>
                        </TableCell>

                        {/* Nesting Dropdown Assignment */}
                        <TableCell>
                          <select
                            value={item.parentId || ''}
                            onChange={(e) => handleNestUnderParent(item.id, e.target.value)}
                            style={{
                              fontSize: '0.8125rem',
                              padding: '4px 8px',
                              borderRadius: '0px',
                              border: '1px solid #DED4C5',
                              backgroundColor: '#FFFFFF',
                              color: '#24221F',
                            }}
                          >
                            <option value="">📌 Top-Level Menu</option>
                            {navItems
                              .filter((p) => !p.parentId && p.id !== item.id)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  📁 Nested under "{p.label}"
                                </option>
                              ))}
                          </select>
                        </TableCell>

                        {/* Visibility */}
                        <TableCell>
                          <Button
                            size="sm"
                            variant={item.visible ? 'outline' : 'ghost'}
                            onClick={() => handleToggleVisibility(item)}
                          >
                            {item.visible ? '👁️ Published' : '🙈 Hidden'}
                          </Button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(item)}>
                              ✏️ Edit
                            </Button>
                            {!item.isSystemPage && (
                              <Button
                                size="sm"
                                variant="ghost"
                                style={{ color: '#DC2626' }}
                                onClick={() => setDeleteConfirmId(item.id)}
                              >
                                🗑️ Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Navigation Link' : 'Add New Navigation Link'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMessage && (
              <div style={{ padding: '0.75rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '4px', fontSize: '0.875rem' }}>
                {errorMessage}
              </div>
            )}

            {/* Menu Label */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Menu Title / Label *
              </label>
              <Input
                type="text"
                placeholder="e.g. Courses & Degrees"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            {/* Parent Dropdown Menu */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Menu Hierarchy Position
              </label>
              <Select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                options={parentSelectOptions}
              />
            </div>

            {/* Link Type Radio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Link Target Type
              </label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'existing'}
                    onChange={() => setLinkType('existing')}
                  />
                  Existing Website Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'external'}
                    onChange={() => setLinkType('external')}
                  />
                  External URL Link
                </label>
              </div>
            </div>

            {/* Existing Page Select */}
            {linkType === 'existing' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                  Select Target Page *
                </label>
                <Select
                  value={selectedPageId}
                  onChange={(e) => handleSelectPageOption(e.target.value)}
                  options={selectablePages.map((p) => ({
                    label: `${p.isSystemPage ? '🏛️ System: ' : '📄 Custom: '}${p.title} (${p.path})`,
                    value: p.id,
                  }))}
                />
              </div>
            )}

            {/* External URL Input */}
            {linkType === 'external' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                  External Website URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://example.edu/portal"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                />
              </div>
            )}

            {/* Visibility Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="visibleCheck"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="visibleCheck" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#24221F', cursor: 'pointer' }}>
                Visible in live header navigation bar
              </label>
            </div>

            {/* Target Blank Check */}
            {linkType === 'external' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="targetBlankCheck"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="targetBlankCheck" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#24221F', cursor: 'pointer' }}>
                  Open link in a new browser tab
                </label>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveModalItem} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Navigation Link'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Navigation Link"
        >
          <div>
            <p style={{ color: '#24221F', fontSize: '0.9375rem' }}>
              Are you sure you want to delete this custom menu link from the navigation bar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="primary" style={{ backgroundColor: '#DC2626' }} onClick={handleDeleteItem} disabled={isSaving}>
                {isSaving ? 'Deleting...' : 'Delete Link'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
