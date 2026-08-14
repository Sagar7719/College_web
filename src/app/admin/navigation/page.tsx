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
      const tree = buildNavigationTree(allNav);
      setTreeItems(tree);
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterTab = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setOpenDropdownId(id);
  };

  const handleMouseLeaveTab = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 180);
  };

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
  /*  DRAG AND DROP HANDLERS                                           */
  /* ------------------------------------------------------------------ */

  // Drag Start for Top-Level Navbar Tab
  const handleTopDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    setDraggedItemType('top');
    e.dataTransfer.setData('text/plain', `top:${id}`);
  };

  // Drag Start for Child Item inside Dropdown
  const handleChildDragStart = (e: React.DragEvent, childId: string) => {
    e.stopPropagation();
    setDraggedItemId(childId);
    setDraggedItemType('child');
    e.dataTransfer.setData('text/plain', `child:${childId}`);
  };

  // Drag Start for Unlinked Page Chip
  const handlePageChipDragStart = (e: React.DragEvent, pageOptionId: string) => {
    setDraggedItemId(pageOptionId);
    setDraggedItemType('page');
    e.dataTransfer.setData('text/plain', `page:${pageOptionId}`);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (dragOverTargetId !== targetId) {
      setDragOverTargetId(targetId);
    }
  };

  // Drop Handler on Top-Level Tab or Dropdown Container
  const handleDropOnParentTab = async (e: React.DragEvent, targetParentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTargetId(null);

    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;
    const [type, sourceId] = rawData.split(':');

    // Case 1: Reorder Top-Level Tabs
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
        // Preserve children order
        const children = navItems.filter((c) => c.parentId === topItem.id);
        children.forEach((child) => {
          updatedNavItems.push({ ...child, order: currentOrder++ });
        });
      });

      setNavItems(updatedNavItems);
      await persistNavigationState(updatedNavItems);
      return;
    }

    // Case 2: Drop Child Item onto Another Parent Tab (Auto-create Dropdown or Move)
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

    // Case 3: Drop Unlinked Page Chip onto a Parent Tab
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
            Drag top tabs to reorder the main website menu bar. Click any tab to view its attached dropdown sub-pages directly below it.
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
                  gap: '10px',
                  padding: '1.5rem 1.75rem',
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

                  return (
                    <div
                      key={parentItem.id}
                      draggable
                      onDragStart={(e) => handleTopDragStart(e, parentItem.id)}
                      onDragOver={(e) => handleDragOver(e, parentItem.id)}
                      onDrop={(e) => handleDropOnParentTab(e, parentItem.id)}
                      onMouseEnter={() => handleMouseEnterTab(parentItem.id)}
                      onMouseLeave={handleMouseLeaveTab}
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                      }}
                    >
                      {/* Top-Level Navbar Button (Light Mode) */}
                      <div
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : parentItem.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: isDragTarget ? '#FFF5F0' : isDropdownOpen ? '#FFF5F0' : '#FAF7F2',
                          border: isDragTarget ? '2px dashed #C85A32' : isDropdownOpen ? '1.5px solid #C85A32' : '1.5px solid #DED4C5',
                          color: isDropdownOpen ? '#9E3B1B' : '#24221F',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          transition: 'all 0.15s ease',
                          userSelect: 'none',
                          boxShadow: isDropdownOpen ? '0 4px 12px rgba(200, 90, 50, 0.15)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
                        }}
                      >
                        {/* Drag Handle Icon */}
                        <span style={{ opacity: 0.4, cursor: 'grab', fontSize: '0.8125rem', color: '#706A61' }}>⋮⋮</span>

                        <span>{parentItem.label}</span>

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

                      {/* Dropdown Sub-Menu Attached Directly Below Button */}
                      {isDropdownOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            minWidth: '290px',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #DED4C5',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 16px 40px rgba(36, 34, 31, 0.14)',
                            zIndex: 100,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px 8px 4px', borderBottom: '1.5px dashed #E8DFD1' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#706A61', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              📁 {parentItem.label} SUB-ITEMS
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenAddModal(parentItem.id)}
                              style={{
                                background: '#C85A32',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(200,90,50,0.25)',
                              }}
                            >
                              ➕ Add Sub-Page
                            </button>
                          </div>

                          {/* List of Child Sub-Pages */}
                          {!parentItem.children || parentItem.children.length === 0 ? (
                            <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: '0.8125rem', color: '#706A61', backgroundColor: '#FAF7F2', borderRadius: '8px', border: '1px dashed #DED4C5' }}>
                              No sub-items yet. Drag a page here or click ➕ Add Sub-Page.
                            </div>
                          ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {parentItem.children.map((child) => (
                                <li
                                  key={child.id}
                                  draggable
                                  onDragStart={(e) => handleChildDragStart(e, child.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '9px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FAF7F2',
                                    border: '1px solid #E8DFD1',
                                    color: '#24221F',
                                    fontSize: '0.875rem',
                                    cursor: 'grab',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ opacity: 0.4, fontSize: '0.8125rem', color: '#706A61' }}>⋮⋮</span>
                                    <span style={{ fontWeight: 600, color: '#24221F' }}>{child.label}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <code style={{ fontSize: '0.7rem', color: '#C85A32', background: '#FFF5F0', border: '1px solid #FCD3C1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                      {child.path}
                                    </code>
                                    {!child.isSystemPage && (
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(child.id)}
                                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}
                                        title="Remove sub-page"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </li>
                              ))}
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
                      draggable
                      onDragStart={(e) => handlePageChipDragStart(e, pageOpt.id)}
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
                      <span style={{ opacity: 0.4, color: '#706A61' }}>⋮⋮</span>
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
