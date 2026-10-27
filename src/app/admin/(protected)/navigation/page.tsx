'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { NavigationItem, Page } from '@/types';
import { navigationService, buildNavigationTree, reorderTreeAndFlatten } from '@/services/navigation.service';
import { pagesService } from '@/services/pages.service';
import { selectablePagesService, SelectablePageOption } from '@/services/selectable-pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { isValidExternalUrl } from '@/validations/navigation.schema';
import {
  Compass,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  GripVertical,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Link2,
  Globe,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  Skeleton,
} from '@/components/ui';

/* System page keys that are strictly protected against deletion */
const PROTECTED_SYSTEM_KEYS = new Set(['home', 'about', 'academics', 'admissions', 'contact']);

export default function AdminNavigationManagerScreen() {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [treeItems, setTreeItems] = useState<NavigationItem[]>([]);
  const [publishedPages, setPublishedPages] = useState<Page[]>([]);
  const [selectablePages, setSelectablePages] = useState<SelectablePageOption[]>([]);
  const [collegeName, setCollegeName] = useState('Shivaji University, Kolhapur');
  const [loading, setLoading] = useState(true);

  // Drag and Drop States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'top' | 'child' | 'page' | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Hover Action Box Tracking State
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Edit Navigation Item Modal State
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPath, setEditPath] = useState('');
  const [editVisible, setEditVisible] = useState(true);

  // Inline + Add Page Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string>('');

  // New Page Form State inside Modal
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [linkType, setLinkType] = useState<'create_page' | 'existing_page' | 'external_url'>('create_page');
  const [selectedExistingPageId, setSelectedExistingPageId] = useState('');
  const [externalUrl, setExternalUrl] = useState('https://');
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allNav, allPages, discoveredPages, settings] = await Promise.all([
        navigationService.getAllAdminNavigationItems(),
        pagesService.getPublishedPages(),
        selectablePagesService.getSelectablePages(),
        siteSettingsService.getSettings(),
      ]);

      setNavItems(allNav);
      setTreeItems(buildNavigationTree(allNav));
      setPublishedPages(allPages);
      setSelectablePages(discoveredPages);
      if (settings?.collegeInfo?.name) {
        setCollegeName(settings.collegeInfo.name);
      }
    } catch (err) {
      console.warn('Failed to load navigation manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update tree representation whenever navItems changes
  useEffect(() => {
    setTreeItems(buildNavigationTree(navItems));
  }, [navItems]);

  // Pages not yet linked in the navbar
  const linkedPageIds = new Set(navItems.map((n) => n.cmsPageId).filter(Boolean));
  const linkedPaths = new Set(navItems.map((n) => n.path));

  const unlinkedPages = selectablePages.filter((p) => {
    if (linkedPageIds.has(p.pageId)) return false;
    if (linkedPaths.has(p.path)) return false;
    return true;
  });

  // Snapshot ref for rollback on error
  const previousTreeRef = useRef<NavigationItem[]>([]);
  // Mutex / save queue refs
  const isSavingRef = useRef(false);
  const pendingItemsQueueRef = useRef<NavigationItem[] | null>(null);

  // Save authoritative tree navigation state back to Firestore
  const persistNavigationState = async (updatedItems: NavigationItem[]) => {
    // If a write is currently in progress, store latest state in pending queue
    if (isSavingRef.current) {
      pendingItemsQueueRef.current = updatedItems;
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveStatus('Saving reorder to live database...');

    try {
      await navigationService.saveNavigationItems(updatedItems);
      setSaveStatus('✓ Live Website Header Updated Successfully!');
      setTimeout(() => setSaveStatus(''), 2500);

      // Check if newer state arrived while saving
      if (pendingItemsQueueRef.current) {
        const nextItems = pendingItemsQueueRef.current;
        pendingItemsQueueRef.current = null;
        isSavingRef.current = false;
        await persistNavigationState(nextItems);
        return;
      }
    } catch (err) {
      console.error('Failed to save navigation reorder:', err);
      setSaveStatus('✕ Failed to save navigation order. Your changes were reverted.');
      setTimeout(() => setSaveStatus(''), 4000);
      // Rollback: Reload authoritative Firestore state
      await loadData();
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  /**
   * Applies an in-memory tree modification, flattens deterministically,
   * updates UI state immediately, and triggers sequential persistence.
   */
  const applyTreeUpdate = async (newTree: NavigationItem[]) => {
    previousTreeRef.current = treeItems;
    const flattened = reorderTreeAndFlatten(newTree);
    setTreeItems(newTree);
    setNavItems(flattened);
    await persistNavigationState(flattened);
  };

  /* ------------------------------------------------------------------ */
  /*  QUICK ACTIONS: EDIT, HIDE/SHOW, DELETE                           */
  /* ------------------------------------------------------------------ */

  // Toggle Visibility Directly
  const handleToggleVisibility = async (item: NavigationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    const updated = { ...item, visible: item.visible === false ? true : false };
    try {
      await navigationService.saveSingleNavigationItem(updated);
      await loadData();
      setSaveStatus(`✓ "${item.label}" visibility updated!`);
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      alert('Failed to update visibility.');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Item Modal
  const handleOpenEditModal = (item: NavigationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditLabel(item.label);
    setEditPath(item.path);
    setEditVisible(item.visible !== false);
  };

  // Save Item Edit Changes
  const handleSaveItemEdit = async () => {
    if (!editingItem) return;
    if (!editLabel.trim()) {
      alert('Navigation label is required.');
      return;
    }
    setIsSaving(true);
    try {
      const updated: NavigationItem = {
        ...editingItem,
        label: editLabel.trim(),
        path: editPath.trim() || '/',
        visible: editVisible,
      };
      await navigationService.saveSingleNavigationItem(updated);
      setEditingItem(null);
      await loadData();
      setSaveStatus('✓ Navigation item saved successfully!');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      alert('Failed to save navigation item.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  TREE-AWARE HTML5 DRAG AND DROP HANDLERS                          */
  /* ------------------------------------------------------------------ */

  // Drag Start for Top-Level Navbar Tab (Suppresses Hover Boxes while Dragging)
  const handleTopDragStart = (e: React.DragEvent, id: string) => {
    setHoveredItemId(null);
    setDraggedItemId(id);
    setDraggedItemType('top');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `top:${id}`);
  };

  // Drag Start for Child Item inside Dropdown
  const handleChildDragStart = (e: React.DragEvent, childId: string) => {
    e.stopPropagation();
    setHoveredItemId(null);
    setDraggedItemId(childId);
    setDraggedItemType('child');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `child:${childId}`);
  };

  // Drag Start for Unlinked Page Chip
  const handlePageChipDragStart = (e: React.DragEvent, pageOptionId: string) => {
    setHoveredItemId(null);
    setDraggedItemId(pageOptionId);
    setDraggedItemType('page');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `page:${pageOptionId}`);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTargetId !== targetId) {
      setDragOverTargetId(targetId);
    }
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTargetId(targetId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedItemType(null);
    setDragOverTargetId(null);
    setHoveredItemId(null);
  };

  // Deep clone tree helper to avoid mutating React state in place
  const cloneTree = (tree: NavigationItem[]): NavigationItem[] => {
    return tree.map((parent) => ({
      ...parent,
      children: parent.children ? parent.children.map((c) => ({ ...c })) : [],
    }));
  };

  // Drop Handler on Top-Level Category Card / Tab
  const handleDropOnParentTab = async (e: React.DragEvent, targetParentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTargetId(null);
    setHoveredItemId(null);

    const rawData = e.dataTransfer.getData('text/plain');
    let type = draggedItemType;
    let sourceId = draggedItemId;

    if (rawData && rawData.includes(':')) {
      const parts = rawData.split(':');
      type = parts[0] as any;
      sourceId = parts[1];
    }

    if (!type || !sourceId) return;

    // Scenario 1: Reordering Top-Level Tabs (Left to Right)
    if (type === 'top' && sourceId !== targetParentId) {
      const newTree = cloneTree(treeItems);
      const sourceIdx = newTree.findIndex((i) => i.id === sourceId);
      const targetIdx = newTree.findIndex((i) => i.id === targetParentId);
      if (sourceIdx === -1 || targetIdx === -1) return;

      const [moved] = newTree.splice(sourceIdx, 1);
      newTree.splice(targetIdx, 0, moved);

      await applyTreeUpdate(newTree);
      return;
    }

    // Scenario 2: Move Child Sub-Page into another Category Card (Appended to bottom of category)
    if (type === 'child') {
      const newTree = cloneTree(treeItems);
      let movedChild: NavigationItem | null = null;

      // Find and remove child from its previous parent
      for (const parent of newTree) {
        if (parent.children) {
          const cIdx = parent.children.findIndex((c) => c.id === sourceId);
          if (cIdx !== -1) {
            const [extracted] = parent.children.splice(cIdx, 1);
            movedChild = extracted;
            break;
          }
        }
      }

      if (!movedChild) return;

      // Find target parent and append child
      const targetParent = newTree.find((p) => p.id === targetParentId);
      if (!targetParent) return;

      targetParent.children = targetParent.children || [];
      movedChild.parentId = targetParentId;
      delete movedChild.children;
      targetParent.children.push(movedChild);

      await applyTreeUpdate(newTree);
      return;
    }

    // Scenario 3: Insert Unlinked Page Chip directly into a Category Tab
    if (type === 'page' && sourceId) {
      const matchedPageOpt = selectablePages.find((p) => p.id === sourceId);
      if (!matchedPageOpt) return;

      const newTree = cloneTree(treeItems);
      const targetParent = newTree.find((p) => p.id === targetParentId);
      if (!targetParent) return;

      const newNavItem: NavigationItem = {
        id: `nav_cms_${matchedPageOpt.pageId || Date.now()}`,
        label: matchedPageOpt.title,
        path: matchedPageOpt.path,
        parentId: targetParentId,
        isCMSPage: matchedPageOpt.category === 'custom_page',
        cmsPageId: matchedPageOpt.pageId,
        isSystemPage: matchedPageOpt.isSystemPage,
        systemKey: matchedPageOpt.systemKey as any,
        order: 999,
        visible: true,
      };

      targetParent.children = targetParent.children || [];
      // Prevent duplicate insertion
      if (!targetParent.children.some((c) => c.cmsPageId === newNavItem.cmsPageId || c.id === newNavItem.id)) {
        targetParent.children.push(newNavItem);
      }

      await applyTreeUpdate(newTree);
    }
  };

  // Drop Handler directly onto a Sub-Item row (Precise Sibling Index Drop)
  const handleDropOnChildItem = async (e: React.DragEvent, targetChildId: string, targetParentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTargetId(null);
    setHoveredItemId(null);

    const rawData = e.dataTransfer.getData('text/plain');
    let type = draggedItemType;
    let sourceId = draggedItemId;

    if (rawData && rawData.includes(':')) {
      const parts = rawData.split(':');
      type = parts[0] as any;
      sourceId = parts[1];
    }

    if (!type || !sourceId || sourceId === targetChildId) return;

    const newTree = cloneTree(treeItems);
    const targetParent = newTree.find((p) => p.id === targetParentId);
    if (!targetParent) return;

    targetParent.children = targetParent.children || [];

    // Scenario 4: Reordering Sub-Page onto a specific target sibling position
    if (type === 'child') {
      let movedChild: NavigationItem | null = null;

      // 1. Remove from source parent
      for (const parent of newTree) {
        if (parent.children) {
          const cIdx = parent.children.findIndex((c) => c.id === sourceId);
          if (cIdx !== -1) {
            const [extracted] = parent.children.splice(cIdx, 1);
            movedChild = extracted;
            break;
          }
        }
      }

      if (!movedChild) return;

      // 2. Locate target index in target parent
      let targetIdx = targetParent.children.findIndex((c) => c.id === targetChildId);
      if (targetIdx === -1) {
        targetIdx = targetParent.children.length;
      }

      // 3. Insert at target position with updated parentId
      movedChild.parentId = targetParentId;
      delete movedChild.children;
      targetParent.children.splice(targetIdx, 0, movedChild);

      await applyTreeUpdate(newTree);
      return;
    }

    // Scenario 5: Drop Unlinked Page Chip directly onto a specific Sub-Page slot
    if (type === 'page' && sourceId) {
      const matchedPageOpt = selectablePages.find((p) => p.id === sourceId);
      if (!matchedPageOpt) return;

      let targetIdx = targetParent.children.findIndex((c) => c.id === targetChildId);
      if (targetIdx === -1) {
        targetIdx = targetParent.children.length;
      }

      const newNavItem: NavigationItem = {
        id: `nav_cms_${matchedPageOpt.pageId || Date.now()}`,
        label: matchedPageOpt.title,
        path: matchedPageOpt.path,
        parentId: targetParentId,
        isCMSPage: matchedPageOpt.category === 'custom_page',
        cmsPageId: matchedPageOpt.pageId,
        isSystemPage: matchedPageOpt.isSystemPage,
        systemKey: matchedPageOpt.systemKey as any,
        order: 999,
        visible: true,
      };

      // Remove from any other location first if already present
      for (const parent of newTree) {
        if (parent.children) {
          parent.children = parent.children.filter((c) => c.cmsPageId !== newNavItem.cmsPageId && c.id !== newNavItem.id);
        }
      }

      targetParent.children.splice(targetIdx, 0, newNavItem);
      await applyTreeUpdate(newTree);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  INLINE + PAGE CREATION HANDLERS                                  */
  /* ------------------------------------------------------------------ */
  const handleOpenAddModal = (parentId?: string) => {
    const defaultParent = parentId || treeItems.find((t) => t.id !== 'nav_sys_home')?.id || 'nav_sys_about';
    setTargetParentId(defaultParent);
    setPageTitle('');
    setPageSlug('');
    setLinkType('create_page');
    if (selectablePages.length > 0) {
      setSelectedExistingPageId(selectablePages[0].id);
    }
    setExternalUrl('https://');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewSubPage = async () => {
    setFormError('');

    if (linkType === 'create_page') {
      if (!pageTitle.trim()) {
        setFormError('Page Title is required.');
        return;
      }
      const slug = (pageSlug.trim() || pageTitle.trim())
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      setIsSaving(true);
      try {
        // 1. Create Page document in Firestore pages collection
        const newPageId = await pagesService.savePage({
          title: pageTitle.trim(),
          slug,
          status: 'published',
          showInNavigation: true,
          sections: [],
        });

        // Enforce that new custom pages default to a dropdown menu (e.g. About Us or More) so they only show in dropdown menus, not top-level main nav
        const effectiveParentId = targetParentId || 'nav_sys_about';

        const newNavItem: NavigationItem = {
          id: `nav_cms_${newPageId}`,
          label: pageTitle.trim(),
          path: `/${slug}`,
          isCMSPage: true,
          cmsPageId: newPageId,
          parentId: effectiveParentId,
          order: navItems.length,
          visible: true,
        };

        await navigationService.saveSingleNavigationItem(newNavItem);
        setIsAddModalOpen(false);
        await loadData();
        setSaveStatus('✓ New page created and synced with live header & sidebar!');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (err) {
        setFormError('Failed to create page. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (linkType === 'existing_page') {
      const selectedOpt = selectablePages.find((p) => p.id === selectedExistingPageId);
      if (!selectedOpt) {
        setFormError('Please select an existing page.');
        return;
      }

      setIsSaving(true);
      try {
        const newNavItem: NavigationItem = {
          id: `nav_cms_${selectedOpt.pageId || Date.now()}`,
          label: selectedOpt.title,
          path: selectedOpt.path,
          isCMSPage: selectedOpt.category === 'custom_page',
          cmsPageId: selectedOpt.pageId,
          isSystemPage: selectedOpt.isSystemPage,
          systemKey: selectedOpt.systemKey as any,
          parentId: targetParentId || undefined,
          order: navItems.length,
          visible: true,
        };

        await navigationService.saveSingleNavigationItem(newNavItem);
        setIsAddModalOpen(false);
        await loadData();
      } catch (err) {
        setFormError('Failed to link page.');
      } finally {
        setIsSaving(false);
      }
    } else if (linkType === 'external_url') {
      if (!pageTitle.trim() || !isValidExternalUrl(externalUrl)) {
        setFormError('Please enter a valid label and external URL starting with http:// or https://');
        return;
      }

      setIsSaving(true);
      try {
        const newNavItem: NavigationItem = {
          id: `nav_ext_${Date.now()}`,
          label: pageTitle.trim(),
          path: externalUrl.trim(),
          isExternal: true,
          parentId: targetParentId || undefined,
          order: navItems.length,
          visible: true,
          targetBlank: true,
        };

        await navigationService.saveSingleNavigationItem(newNavItem);
        setIsAddModalOpen(false);
        await loadData();
      } catch (err) {
        setFormError('Failed to add external link.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Delete Custom Navigation Item
  const handleDeleteNavItem = async () => {
    if (!deleteConfirmId) return;
    setIsSaving(true);
    try {
      await navigationService.deleteNavigationItem(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '10px', borderRadius: '12px', background: '#FFF5F0', border: '1.5px solid #FCD3C1', color: '#C85A32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
              Live Visual Website Navbar Drag &amp; Drop Manager
            </h1>
            <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
              All categories and sub-pages are <strong>fully expanded &amp; visible by default</strong>! Drag items or hover to edit, hide, delete.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {saveStatus && (
            <span style={{ padding: '6px 14px', fontSize: '0.875rem', fontWeight: 700, borderRadius: '20px', backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6' }}>
              {saveStatus}
            </span>
          )}
          {/* SINGLE TOP-RIGHT ADD BUTTON */}
          <Button
            variant="primary"
            onClick={() => handleOpenAddModal()}
            style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700, padding: '0.625rem 1.25rem', fontSize: '0.9375rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Menu Tab / Page</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton style={{ height: '180px', width: '100%', borderRadius: '16px' }} />
      ) : (
        <div>
          {/* ==============================================================================
             1. LIVE WEBSITE HEADER NAVBAR PREVIEW STRIP
             ============================================================================== */}
          <Card
            variant="bordered"
            style={{
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              color: '#24221F',
              boxShadow: '0 4px 20px rgba(36, 34, 31, 0.04)',
              overflow: 'hidden',
              marginBottom: '1.5rem',
              border: '1.5px solid #E8DFD1',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                backgroundColor: '#FAF7F2',
                borderBottom: '1.5px solid #E8DFD1',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#C85A32', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1F1914' }}>
                    {collegeName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#706A61', fontWeight: 600, marginLeft: 8 }}>
                    Live Header Preview Bar
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#137333', fontWeight: 700, backgroundColor: '#E6F4EA', padding: '4px 12px', borderRadius: '20px', border: '1px solid #CEEAD6' }}>
                ● 6 Main Header Tabs Synced
              </div>
            </div>

            {/* PREVIEW STRIP */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.5rem', flexWrap: 'wrap', backgroundColor: '#FFFFFF' }}>
              {treeItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF7F2',
                    border: '1.5px solid #DED4C5',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#24221F',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{item.label}</span>
                  {item.children && item.children.length > 0 && <span style={{ fontSize: '0.7rem', color: '#C85A32' }}>▾ ({item.children.length})</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* ==============================================================================
             2. STRUCTURED CATEGORY CARDS IN ONE SINGLE ROW (ZERO SCROLLBAR)
             ============================================================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              gap: '0.875rem',
              width: '100%',
              overflow: 'visible',
              marginBottom: '2rem',
              alignItems: 'stretch',
            }}
          >
            {treeItems.map((parentItem) => {
              const isSystemProtected = Boolean(parentItem.isSystemPage && parentItem.systemKey && PROTECTED_SYSTEM_KEYS.has(parentItem.systemKey));
              const hasChildren = Boolean(parentItem.children && parentItem.children.length > 0);
              const isDragTarget = dragOverTargetId === parentItem.id;
              const isHovered = hoveredItemId === parentItem.id;
              const isHidden = parentItem.visible === false;

              return (
                <div
                  key={parentItem.id}
                  draggable={true}
                  onDragStart={(e) => handleTopDragStart(e, parentItem.id)}
                  onDragOver={(e) => handleDragOver(e, parentItem.id)}
                  onDragEnter={(e) => handleDragEnter(e, parentItem.id)}
                  onDrop={(e) => handleDropOnParentTab(e, parentItem.id)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => {
                    if (!draggedItemId) setHoveredItemId(parentItem.id);
                  }}
                  onMouseLeave={() => setHoveredItemId(null)}
                  style={{
                    position: 'relative',
                    backgroundColor: isDragTarget ? '#FFF5F0' : '#FFFFFF',
                    border: isDragTarget ? '2.5px dashed #C85A32' : '1.5px solid #E8DFD1',
                    borderRadius: '14px',
                    boxShadow: '0 4px 16px rgba(36, 34, 31, 0.04)',
                    padding: '1rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                    flex: '1 1 0px',
                    minWidth: 0,
                    opacity: isHidden ? 0.65 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* HOVER TOOLBAR FOR CATEGORY TAB */}
                  {isHovered && !draggedItemId && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-18px',
                        right: '16px',
                        zIndex: 140,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FAF7F2',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        boxShadow: '0 6px 18px rgba(36, 34, 31, 0.14)',
                        border: '1.5px solid #C85A32',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(parentItem, e)}
                        style={{ backgroundColor: '#FFF5F0', color: '#C85A32', border: '1px solid #FCD3C1', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(200,90,50,0.15)' }}
                        title="Edit category tab title & path"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleToggleVisibility(parentItem, e)}
                        style={{ backgroundColor: isHidden ? '#FEF3C7' : '#E6F4EA', color: isHidden ? '#92400E' : '#137333', border: isHidden ? '1px solid #FCD34D' : '1px solid #CEEAD6', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}
                        title={isHidden ? 'Show category' : 'Hide category'}
                      >
                        {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      {!isSystemProtected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(parentItem.id);
                          }}
                          style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(220,38,38,0.12)' }}
                          title="Delete custom category tab"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* CATEGORY HEADER BAR */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      backgroundColor: '#FAF7F2',
                      borderRadius: '8px',
                      border: '1.5px solid #DED4C5',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <span
                        draggable={true}
                        onDragStart={(e) => handleTopDragStart(e, parentItem.id)}
                        style={{ opacity: 0.7, cursor: 'grab', color: '#C85A32', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      >
                        <GripVertical size={14} />
                      </span>
                      <FolderOpen size={15} color="#C85A32" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#1F1914', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {parentItem.label}
                      </span>
                      {isSystemProtected && (
                        <span title="System Protected Category" style={{ flexShrink: 0 }}>
                          <Lock size={12} color="#C85A32" />
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(parentItem.id);
                      }}
                      style={{
                        background: '#C85A32',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(200,90,50,0.25)',
                      }}
                      title={`Add sub-page into "${parentItem.label}"`}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* SUB-PAGES LIST (ALWAYS VISIBLE & OPEN BY DEFAULT) */}
                  <div style={{ flex: 1 }}>
                    {!parentItem.children || parentItem.children.length === 0 ? (
                      <div style={{ padding: '0.875rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#706A61', backgroundColor: '#FAF7F2', borderRadius: '8px', border: '1px dashed #DED4C5', fontWeight: 600, lineHeight: 1.4 }}>
                        No sub-pages yet.<br />Click <strong>+</strong> or drag a page here.
                      </div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {parentItem.children.map((child) => {
                          const isChildHovered = hoveredItemId === child.id;
                          const isChildHidden = child.visible === false;
                          const isChildDragTarget = dragOverTargetId === child.id;
                          const isChildProtected = Boolean(child.isSystemPage && child.systemKey && PROTECTED_SYSTEM_KEYS.has(child.systemKey));

                          return (
                            <li
                              key={child.id}
                              draggable={true}
                              onDragStart={(e) => handleChildDragStart(e, child.id)}
                              onDragOver={(e) => handleDragOver(e, child.id)}
                              onDragEnter={(e) => handleDragEnter(e, child.id)}
                              onDrop={(e) => handleDropOnChildItem(e, child.id, parentItem.id)}
                              onDragEnd={handleDragEnd}
                              onMouseEnter={() => {
                                if (!draggedItemId) setHoveredItemId(child.id);
                              }}
                              onMouseLeave={() => setHoveredItemId(null)}
                              style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: isChildDragTarget ? '#FFF5F0' : isChildHidden ? '#F3F4F6' : '#FFFFFF',
                                border: isChildDragTarget ? '2px dashed #C85A32' : '1px solid #E8DFD1',
                                color: isChildHidden ? '#9CA3AF' : '#24221F',
                                fontSize: '0.875rem',
                                cursor: 'grab',
                                transition: 'all 0.15s ease',
                                opacity: isChildHidden ? 0.65 : 1,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                                <span
                                  draggable={true}
                                  onDragStart={(e) => handleChildDragStart(e, child.id)}
                                  style={{ opacity: 0.7, color: '#C85A32', cursor: 'grab', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                                >
                                  <GripVertical size={14} />
                                </span>
                                <span style={{ fontWeight: 600, color: isChildHidden ? '#9CA3AF' : '#24221F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.label}</span>
                                {isChildHidden && (
                                  <span style={{ fontSize: '0.65rem', color: '#9CA3AF', backgroundColor: '#E5E7EB', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
                                    Hidden
                                  </span>
                                )}
                              </div>

                              {/* INLINE HOVER ACTION BUTTONS */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isChildHovered && !draggedItemId && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenEditModal(child, e)}
                                      style={{ backgroundColor: '#FFF5F0', color: '#C85A32', border: '1px solid #FCD3C1', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(200,90,50,0.12)' }}
                                      title="Edit sub-page"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleVisibility(child, e)}
                                      style={{ backgroundColor: isChildHidden ? '#FEF3C7' : '#E6F4EA', color: isChildHidden ? '#92400E' : '#137333', border: isChildHidden ? '1px solid #FCD34D' : '1px solid #CEEAD6', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                      title={isChildHidden ? 'Show sub-page' : 'Hide sub-page'}
                                    >
                                      {isChildHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                                    </button>
                                    {!isChildProtected && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirmId(child.id);
                                        }}
                                        style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(220,38,38,0.1)' }}
                                        title="Delete sub-page"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==============================================================================
             3. UNLINKED PUBLISHED PAGES POOL (LIGHT MODE)
             ============================================================================== */}
          <Card variant="bordered" style={{ borderRadius: '16px', border: '1.5px solid #E8DFD1', backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(36, 34, 31, 0.04)' }}>
            <CardBody style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={18} color="#C85A32" />
                    <span>Available Published Pages Pool</span>
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#706A61', margin: '0.25rem 0 0 0' }}>
                    Drag any page chip below onto a category card above to insert it as a dropdown sub-item!
                  </p>
                </div>
                <Badge variant="info" style={{ backgroundColor: '#EBF5FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '6px 12px', fontSize: '0.8125rem' }}>
                  {unlinkedPages.length} Pages Available
                </Badge>
              </div>

              {unlinkedPages.length === 0 ? (
                <div style={{ padding: '1.25rem', backgroundColor: '#FAF7F2', color: '#706A61', fontSize: '0.875rem', textAlign: 'center', borderRadius: '10px', border: '1px dashed #DED4C5', fontWeight: 600 }}>
                  ✓ All published pages are currently linked in the navigation bar!
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                  {unlinkedPages.map((pageOpt) => (
                    <div
                      key={pageOpt.id}
                      draggable={true}
                      onDragStart={(e) => handlePageChipDragStart(e, pageOpt.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #C85A32',
                        borderRadius: '8px',
                        cursor: 'grab',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#24221F',
                        boxShadow: '0 2px 8px rgba(200, 90, 50, 0.12)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <GripVertical size={14} color="#C85A32" />
                      <span>{pageOpt.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* EDIT NAVIGATION ITEM MODAL */}
      {editingItem && (
        <Modal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`✏️ Edit Navigation Item: "${editingItem.label}"`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Navigation Label / Title *
              </label>
              <Input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="e.g. About Us"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                URL Path / Link *
              </label>
              <Input
                type="text"
                value={editPath}
                onChange={(e) => setEditPath(e.target.value)}
                placeholder="e.g. /about"
                disabled={Boolean(editingItem.isSystemPage && editingItem.systemKey === 'home')}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={editVisible}
                  onChange={(e) => setEditVisible(e.target.checked)}
                />
                Show this link in live website navigation header
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveItemEdit} disabled={isSaving} style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700 }}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* INLINE + NEW PAGE CREATION MODAL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={targetParentId ? `➕ Add Page into Dropdown Category` : `➕ Add New Top-Level Navbar Category`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {formError && (
              <div style={{ padding: '0.75rem', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C', borderRadius: '6px', fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}

            {/* Target Dropdown Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Dropdown Menu Category Location
              </label>
              <select
                value={targetParentId}
                onChange={(e) => setTargetParentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '6px',
                  border: '1px solid #DED4C5',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#24221F',
                }}
              >
                <option value="">📌 Top-Level Header Bar (New Main Category)</option>
                {treeItems.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    📁 Inside Dropdown Category: "{parent.label}"
                  </option>
                ))}
              </select>
            </div>

            {/* Link Type Option */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Menu Action Type
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'create_page'}
                    onChange={() => setLinkType('create_page')}
                  />
                  <span>Create Brand New Page</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'existing_page'}
                    onChange={() => setLinkType('existing_page')}
                  />
                  <span>Link Existing Page</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'external_url'}
                    onChange={() => setLinkType('external_url')}
                  />
                  <span>External URL</span>
                </label>
              </div>
            </div>

            {/* Create New Page Inputs */}
            {linkType === 'create_page' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                    New Page Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Research & Development Cell"
                    value={pageTitle}
                    onChange={(e) => {
                      setPageTitle(e.target.value);
                      if (!pageSlug) {
                        setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                    Page URL Slug
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. research-cell"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#706A61', marginTop: '4px', display: 'block' }}>
                    Live URL: <code>http://localhost:3000/{pageSlug || 'your-slug'}</code>
                  </span>
                </div>
              </>
            )}

            {/* Link Existing Page */}
            {linkType === 'existing_page' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                  Select Existing Published Page *
                </label>
                <Select
                  value={selectedExistingPageId}
                  onChange={(e) => setSelectedExistingPageId(e.target.value)}
                  options={selectablePages.map((p) => ({
                    label: `${p.title} (${p.path})`,
                    value: p.id,
                  }))}
                />
              </div>
            )}

            {/* External URL */}
            {linkType === 'external_url' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                    Link Title / Label *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Student ERP Portal"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                    External Web URL *
                  </label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveNewSubPage} disabled={isSaving} style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} />
                <span>{isSaving ? 'Creating Page...' : 'Create & Sync Page'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* HARD DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Hard Delete Page & Navigation Item"
        >
          <div>
            <p style={{ color: '#24221F', fontSize: '0.9375rem', lineHeight: 1.5 }}>
              Are you sure you want to <strong>permanently hard delete</strong> this page and remove its navigation link from the live website?
            </p>
            <p style={{ color: '#991B1B', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8125rem', marginTop: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} color="#991B1B" />
              <span>Warning: This will permanently delete the page document and its content from the database. This action cannot be undone.</span>
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={handleDeleteNavItem}
                disabled={isSaving}
              >
                <Trash2 size={16} />
                <span>{isSaving ? 'Hard Deleting...' : 'Hard Delete Page'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
