'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { NavigationItem, Page } from '@/types';
import { navigationService, buildNavigationTree } from '@/services/navigation.service';
import { pagesService } from '@/services/pages.service';
import { selectablePagesService, SelectablePageOption } from '@/services/selectable-pages.service';
import { siteSettingsService } from '@/services/site-settings.service';
import { isValidExternalUrl } from '@/validations/navigation.schema';
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
  const [collegeName, setCollegeName] = useState('Jaysingpur College, Jaysingpur');
  const [loading, setLoading] = useState(true);

  // Drag and Drop States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<'top' | 'child' | 'page' | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Dropdown Open State in Visual Canvas (Closed by default)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  // Ref for click-outside detection
  const canvasRef = useRef<HTMLDivElement>(null);

  // Close open dropdown flyout whenever user clicks outside or presses Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (openDropdownId && canvasRef.current && !canvasRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownId]);

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

  // Save full reordered navigation items back to Firestore
  const persistNavigationState = async (updatedItems: NavigationItem[]) => {
    setIsSaving(true);
    setSaveStatus('Saving reorder to live database...');
    try {
      await navigationService.saveNavigationItems(updatedItems);
      setSaveStatus('✓ Live Website Header Updated Successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('✕ Failed to save reorder. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
  /*  100% ROBUST HTML5 DRAG AND DROP HANDLERS WITH STATE FALLBACKS      */
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

  // Drop Handler on Top-Level Header Tab
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
      const topLevelOnly = navItems.filter((i) => !i.parentId);
      const sourceIdx = topLevelOnly.findIndex((i) => i.id === sourceId);
      const targetIdx = topLevelOnly.findIndex((i) => i.id === targetParentId);
      if (sourceIdx === -1 || targetIdx === -1) return;

      const reorderedTop = [...topLevelOnly];
      const [moved] = reorderedTop.splice(sourceIdx, 1);
      reorderedTop.splice(targetIdx, 0, moved);

      // Re-index order for all items
      let currentOrder = 0;
      const updatedNavItems: NavigationItem[] = [];

      reorderedTop.forEach((topItem) => {
        updatedNavItems.push({ ...topItem, order: currentOrder++ });
        const children = navItems.filter((c) => c.parentId === topItem.id);
        children.forEach((child) => {
          updatedNavItems.push({ ...child, order: currentOrder++ });
        });
      });

      setNavItems(updatedNavItems);
      await persistNavigationState(updatedNavItems);
      return;
    }

    // Scenario 2: Move Child Sub-Page into another Parent Tab Category
    if (type === 'child' && sourceId && sourceId !== targetParentId) {
      const updatedNavItems = navItems.map((item) => {
        if (item.id === sourceId) {
          return { ...item, parentId: targetParentId };
        }
        return item;
      });

      setNavItems(updatedNavItems);
      setOpenDropdownId(targetParentId);
      await persistNavigationState(updatedNavItems);
      return;
    }

    // Scenario 3: Insert Unlinked Page Chip directly into a Parent Tab
    if (type === 'page' && sourceId) {
      const matchedPageOpt = selectablePages.find((p) => p.id === sourceId);
      if (!matchedPageOpt) return;

      const newNavItem: NavigationItem = {
        id: `nav_cms_${matchedPageOpt.pageId || Date.now()}`,
        label: matchedPageOpt.title,
        path: matchedPageOpt.path,
        parentId: targetParentId,
        isCMSPage: matchedPageOpt.category === 'custom_page',
        cmsPageId: matchedPageOpt.pageId,
        isSystemPage: matchedPageOpt.isSystemPage,
        systemKey: matchedPageOpt.systemKey,
        order: navItems.length,
        visible: true,
      };

      const updatedNavItems = [...navItems, newNavItem];
      setNavItems(updatedNavItems);
      setOpenDropdownId(targetParentId);
      await persistNavigationState(updatedNavItems);
    }
  };

  // Drop Handler directly onto a Sub-Item slot (Reordering within or across dropdowns)
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

    // Scenario 4: Reordering Sub-Pages within a Dropdown Menu
    if (type === 'child') {
      const parentChildren = navItems.filter((i) => i.parentId === targetParentId);
      const sourceIdx = parentChildren.findIndex((i) => i.id === sourceId);
      const targetIdx = parentChildren.findIndex((i) => i.id === targetChildId);

      if (sourceIdx !== -1 && targetIdx !== -1) {
        const reorderedChildren = [...parentChildren];
        const [moved] = reorderedChildren.splice(sourceIdx, 1);
        reorderedChildren.splice(targetIdx, 0, moved);

        const otherNavItems = navItems.filter((i) => i.parentId !== targetParentId && i.id !== sourceId);
        const updatedNavItems = [...otherNavItems, ...reorderedChildren];

        setNavItems(updatedNavItems);
        setOpenDropdownId(targetParentId);
        await persistNavigationState(updatedNavItems);
        return;
      } else {
        // Source came from a different dropdown category
        const updatedNavItems = navItems.map((item) => {
          if (item.id === sourceId) {
            return { ...item, parentId: targetParentId };
          }
          return item;
        });

        setNavItems(updatedNavItems);
        setOpenDropdownId(targetParentId);
        await persistNavigationState(updatedNavItems);
        return;
      }
    }

    // Drop Unlinked Page Chip directly on a specific Sub-Page slot
    if (type === 'page' && sourceId) {
      const matchedPageOpt = selectablePages.find((p) => p.id === sourceId);
      if (!matchedPageOpt) return;

      const newNavItem: NavigationItem = {
        id: `nav_cms_${matchedPageOpt.pageId || Date.now()}`,
        label: matchedPageOpt.title,
        path: matchedPageOpt.path,
        parentId: targetParentId,
        isCMSPage: matchedPageOpt.category === 'custom_page',
        cmsPageId: matchedPageOpt.pageId,
        isSystemPage: matchedPageOpt.isSystemPage,
        systemKey: matchedPageOpt.systemKey,
        order: navItems.length,
        visible: true,
      };

      const updatedNavItems = [...navItems, newNavItem];
      setNavItems(updatedNavItems);
      setOpenDropdownId(targetParentId);
      await persistNavigationState(updatedNavItems);
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
          content: [],
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
          systemKey: selectedOpt.systemKey,
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
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
            🧭 Live Visual Website Navbar Drag &amp; Drop Manager
          </h1>
          <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
            Drag top tabs or sub-pages to reorder. Hover any menu item to open its <strong>Edit, Hide, Delete</strong> action box!
          </p>
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
            style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700, padding: '0.625rem 1.25rem', fontSize: '0.9375rem', borderRadius: '8px' }}
          >
            ➕ Add Menu Tab / Page
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton style={{ height: '180px', width: '100%', borderRadius: '16px' }} />
      ) : (
        <div ref={canvasRef}>
          {/* ==============================================================================
             VISUAL LIVE WEBSITE NAVBAR REPLICA CANVAS (LIGHT MODE)
             ============================================================================== */}
          <Card
            variant="bordered"
            style={{
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              color: '#24221F',
              boxShadow: '0 8px 30px rgba(36, 34, 31, 0.06)',
              overflow: 'visible',
              marginBottom: '2rem',
              border: '1.5px solid #E8DFD1',
            }}
          >
            <CardBody style={{ padding: '0' }}>
              {/* Canvas Top Branding Banner */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.75rem',
                  backgroundColor: '#FAF7F2',
                  borderBottom: '1.5px solid #E8DFD1',
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#C85A32', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(200,90,50,0.25)' }}>
                    🎓
                  </div>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#1F1914', letterSpacing: '-0.01em', display: 'block' }}>
                      {collegeName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#706A61', fontWeight: 600 }}>
                      Live Single Line Website Header Navigation Bar
                    </span>
                  </div>
                  <span style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '20px', backgroundColor: '#E6F4EA', color: '#137333', border: '1px solid #CEEAD6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ● LIVE INTERACTIVE CANVAS
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#706A61', fontWeight: 600 }}>
                  🔒 5 Core System Tabs Protected Against Deletion
                </div>
              </div>

              {/* SINGLE HORIZONTAL LINE MAIN NAVBAR ROW */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '2.75rem 1.75rem 1.75rem',
                  backgroundColor: '#FFFFFF',
                  flexWrap: 'wrap',
                  position: 'relative',
                  borderBottomLeftRadius: '15px',
                  borderBottomRightRadius: '15px',
                }}
              >
                {treeItems.map((parentItem) => {
                  const isSystemProtected = Boolean(parentItem.isSystemPage && parentItem.systemKey && PROTECTED_SYSTEM_KEYS.has(parentItem.systemKey));
                  const hasChildren = Boolean(parentItem.children && parentItem.children.length > 0);
                  const isDropdownOpen = openDropdownId === parentItem.id;
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
                        display: 'inline-block',
                        opacity: isHidden ? 0.6 : 1,
                      }}
                    >
                      {/* ==========================================================
                         PROPER HIGH-VISIBILITY HOVER ACTION TOOLBAR (TOP TAB)
                         ========================================================== */}
                      {isHovered && !draggedItemId && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-46px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 140,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#1F1914',
                            padding: '5px 10px',
                            borderRadius: '24px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                            border: '1.5px solid #C85A32',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {/* EDIT BADGE BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(parentItem, e)}
                            style={{
                              backgroundColor: '#2563EB',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '14px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Edit navigation label and URL slug"
                          >
                            ✏️ Edit
                          </button>

                          {/* HIDE / SHOW BADGE BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleVisibility(parentItem, e)}
                            style={{
                              backgroundColor: isHidden ? '#059669' : '#D97706',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '14px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title={isHidden ? 'Show in live navigation' : 'Hide from live navigation'}
                          >
                            {isHidden ? '👁️ Show' : '👁️ Hide'}
                          </button>

                          {/* DELETE BADGE BUTTON */}
                          {!isSystemProtected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(parentItem.id);
                              }}
                              style={{
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Delete custom navigation tab"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      )}

                      {/* + ICON BUTTON FLOATING ON TOP-RIGHT OF TAB */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(parentItem.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-6px',
                          zIndex: 10,
                          background: '#C85A32',
                          color: '#FFFFFF',
                          border: '2px solid #FFFFFF',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(200,90,50,0.35)',
                        }}
                        title={`Add sub-page directly into "${parentItem.label}"`}
                      >
                        +
                      </button>

                      {/* Top-Level Navbar Button (Clean Name Box) */}
                      <div
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : parentItem.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: isDragTarget ? '#FFF5F0' : isDropdownOpen ? '#FFF5F0' : isHidden ? '#F3F4F6' : '#FAF7F2',
                          border: isDragTarget ? '2.5px dashed #C85A32' : isDropdownOpen ? '1.5px solid #C85A32' : '1.5px solid #DED4C5',
                          color: isHidden ? '#9CA3AF' : isDropdownOpen ? '#9E3B1B' : '#24221F',
                          cursor: 'grab',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                          boxShadow: isDropdownOpen ? '0 4px 12px rgba(200, 90, 50, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
                          transform: isDragTarget ? 'scale(1.03)' : 'scale(1)',
                        }}
                      >
                        {/* Drag Handle Icon */}
                        <span
                          draggable={true}
                          onDragStart={(e) => handleTopDragStart(e, parentItem.id)}
                          style={{ opacity: 0.7, cursor: 'grab', fontSize: '0.875rem', color: '#C85A32', padding: '0 2px' }}
                        >
                          ⋮⋮
                        </span>

                        <span>{parentItem.label}</span>

                        {isHidden && (
                          <span style={{ fontSize: '0.7rem', color: '#9CA3AF', backgroundColor: '#E5E7EB', padding: '1px 5px', borderRadius: '3px' }}>
                            Hidden
                          </span>
                        )}

                        {isSystemProtected && (
                          <span title="System Protected Tab (Cannot be deleted)" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                            🔒
                          </span>
                        )}

                        {hasChildren && (
                          <span style={{ fontSize: '0.75rem', color: isDropdownOpen ? '#C85A32' : '#706A61' }}>
                            {isDropdownOpen ? '▲' : '▼'}
                          </span>
                        )}
                      </div>

                      {/* Clean Light Mode Dropdown Flyout Panel */}
                      {isDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            minWidth: '340px',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #DED4C5',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 16px 40px rgba(36, 34, 31, 0.14)',
                            zIndex: 100,
                          }}
                        >
                          {/* List of Child Sub-Pages */}
                          {!parentItem.children || parentItem.children.length === 0 ? (
                            <div style={{ padding: '14px 10px', textAlign: 'center', fontSize: '0.8125rem', color: '#706A61', backgroundColor: '#FAF7F2', borderRadius: '8px', border: '1px dashed #DED4C5' }}>
                              No sub-pages yet. Click <strong>+</strong> on tab or drag a page here.
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
                                      backgroundColor: isChildDragTarget ? '#FFF5F0' : isChildHidden ? '#F3F4F6' : '#FAF7F2',
                                      border: isChildDragTarget ? '2px dashed #C85A32' : '1px solid #E8DFD1',
                                      color: isChildHidden ? '#9CA3AF' : '#24221F',
                                      fontSize: '0.875rem',
                                      cursor: 'grab',
                                      transition: 'all 0.15s ease',
                                      opacity: isChildHidden ? 0.65 : 1,
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span
                                        draggable={true}
                                        onDragStart={(e) => handleChildDragStart(e, child.id)}
                                        style={{ opacity: 0.7, fontSize: '0.8125rem', color: '#C85A32', cursor: 'grab' }}
                                      >
                                        ⋮⋮
                                      </span>
                                      <span style={{ fontWeight: 600, color: isChildHidden ? '#9CA3AF' : '#24221F' }}>{child.label}</span>
                                      {isChildHidden && (
                                        <span style={{ fontSize: '0.65rem', color: '#9CA3AF', backgroundColor: '#E5E7EB', padding: '1px 4px', borderRadius: '3px' }}>
                                          Hidden
                                        </span>
                                      )}
                                    </div>

                                    {/* PROPER INLINE HOVER ACTION BUTTONS (SUB-ITEM) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {isChildHovered && !draggedItemId ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <button
                                            type="button"
                                            onClick={(e) => handleOpenEditModal(child, e)}
                                            style={{ backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                                            title="Edit sub-page"
                                          >
                                            ✏️ Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => handleToggleVisibility(child, e)}
                                            style={{ backgroundColor: isChildHidden ? '#059669' : '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                                            title={isChildHidden ? 'Show' : 'Hide'}
                                          >
                                            {isChildHidden ? '👁️ Show' : '👁️ Hide'}
                                          </button>
                                          {!isChildProtected && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirmId(child.id);
                                              }}
                                              style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}
                                              title="Delete sub-page"
                                            >
                                              🗑️ Delete
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <code style={{ fontSize: '0.7rem', color: '#C85A32', background: '#FFF5F0', border: '1px solid #FCD3C1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                          {child.path}
                                        </code>
                                      )}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* ==============================================================================
             UNLINKED PUBLISHED PAGES POOL (LIGHT MODE)
             ============================================================================== */}
          <Card variant="bordered" style={{ borderRadius: '16px', border: '1.5px solid #E8DFD1', backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(36, 34, 31, 0.04)' }}>
            <CardBody style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F1914', margin: 0 }}>
                    📄 Available Published Pages Pool
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#706A61', margin: '0.25rem 0 0 0' }}>
                    Drag any page chip below onto a header tab above to insert it as a dropdown sub-item!
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
                      <span style={{ opacity: 0.5, color: '#C85A32' }}>⋮⋮</span>
                      <span>{pageOpt.title}</span>
                      <code style={{ fontSize: '0.75rem', color: '#C85A32', backgroundColor: '#FFF5F0', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FCD3C1' }}>
                        {pageOpt.path}
                      </code>
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
                  ✨ Create Brand New Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'existing_page'}
                    onChange={() => setLinkType('existing_page')}
                  />
                  📄 Link Existing Page
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={linkType === 'external_url'}
                    onChange={() => setLinkType('external_url')}
                  />
                  🌐 External URL
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
              <Button variant="primary" onClick={handleSaveNewSubPage} disabled={isSaving} style={{ backgroundColor: '#C85A32', borderColor: '#C85A32', color: '#FFFFFF', fontWeight: 700 }}>
                {isSaving ? 'Creating Page...' : '✨ Create & Sync Page'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Sub-Page Link"
        >
          <div>
            <p style={{ color: '#24221F', fontSize: '0.9375rem' }}>
              Are you sure you want to remove this custom menu link from the navigation bar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="primary" style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF' }} onClick={handleDeleteNavItem} disabled={isSaving}>
                {isSaving ? 'Deleting...' : 'Remove Link'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
