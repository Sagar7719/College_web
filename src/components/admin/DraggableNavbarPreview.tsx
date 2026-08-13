'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { navigationService } from '@/services/navigation.service';
import { NavigationItem } from '@/types';
import styles from './admin.module.css';

/* ------------------------------------------------------------------ */
/*  Lightweight prop interfaces (avoid importing full Page type)      */
/* ------------------------------------------------------------------ */
interface PageInfo {
  id: string;
  title: string;
  slug: string;
  status: string;
  showInNavigation: boolean;
  isSystemPage?: boolean;
  systemKey?: string;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  visible?: boolean;
  order: number;
  children?: NavItem[];
  parentId?: string;
  isCMSPage?: boolean;
  cmsPageId?: string;
  isSystemPage?: boolean;
  systemKey?: string;
  isExternal?: boolean;
  externalUrl?: string;
  targetBlank?: boolean;
}

interface DraggableNavbarPreviewProps {
  navItems: NavItem[];
  collegeName: string;
  pages: PageInfo[];
}

/* ------------------------------------------------------------------ */
/*  Drag type constants                                               */
/* ------------------------------------------------------------------ */
const DRAG_TYPE_NAV = 'nav-item';
const DRAG_TYPE_PAGE = 'page-chip';

export default function DraggableNavbarPreview({
  navItems: initialNavItems,
  collegeName,
  pages,
}: DraggableNavbarPreviewProps) {
  const router = useRouter();
  const [navItems, setNavItems] = useState<NavItem[]>(initialNavItems);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const dragCounter = useRef<Record<string, number>>({});

  const visibleItems = navItems.filter((item) => item.visible !== false);

  // Pages not yet in the navbar
  const navPageIds = new Set(
    navItems.map((n) => n.cmsPageId).filter(Boolean)
  );
  const navPaths = new Set(navItems.map((n) => n.path));
  const unlinkedPages = pages.filter((page) => {
    if (page.status !== 'published') return false;
    if (navPageIds.has(page.id)) return false;
    const pagePath = `/${page.slug.toLowerCase().replace(/^\//, '')}`;
    if (navPaths.has(pagePath)) return false;
    return true;
  });

  /* ---------------------------------------------------------------- */
  /*  NAV ITEM drag handlers (reorder within navbar)                  */
  /* ---------------------------------------------------------------- */
  const handleNavDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedId(itemId);
    setDragType(DRAG_TYPE_NAV);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${DRAG_TYPE_NAV}:${itemId}`);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedId(null);
    setDragType(null);
    setDragOverId(null);
    dragCounter.current = {};
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current[itemId] = (dragCounter.current[itemId] || 0) + 1;
    setDragOverId(itemId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current[itemId] = (dragCounter.current[itemId] || 0) - 1;
    if (dragCounter.current[itemId] <= 0) {
      dragCounter.current[itemId] = 0;
      if (dragOverId === itemId) {
        setDragOverId(null);
      }
    }
  }, [dragOverId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Save helper                                                     */
  /* ---------------------------------------------------------------- */
  const persistNavOrder = useCallback(async (items: NavItem[]) => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await navigationService.saveNavigationItems(items as NavigationItem[]);
      setSaveStatus('saved');
      router.refresh();
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Navigation reorder error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [router]);

  /* ---------------------------------------------------------------- */
  /*  DROP on a nav item                                              */
  /* ---------------------------------------------------------------- */
  const handleNavDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = {};
      setDragOverId(null);

      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) { setDraggedId(null); setDragType(null); return; }

      const [type, sourceId] = raw.split(':');

      // Case 1: Reorder nav items
      if (type === DRAG_TYPE_NAV) {
        if (!sourceId || sourceId === targetId) {
          setDraggedId(null); setDragType(null); return;
        }
        const sourceIdx = visibleItems.findIndex((item) => item.id === sourceId);
        const targetIdx = visibleItems.findIndex((item) => item.id === targetId);
        if (sourceIdx === -1 || targetIdx === -1) {
          setDraggedId(null); setDragType(null); return;
        }
        const reordered = [...visibleItems];
        const [moved] = reordered.splice(sourceIdx, 1);
        reordered.splice(targetIdx, 0, moved);
        const updatedItems = reordered.map((item, idx) => ({ ...item, order: idx }));
        setNavItems(updatedItems);
        setDraggedId(null);
        setDragType(null);
        await persistNavOrder(updatedItems);
        return;
      }

      // Case 2: Drop page chip onto a nav item → add as dropdown child
      if (type === DRAG_TYPE_PAGE && sourceId) {
        const page = pages.find((p) => p.id === sourceId);
        if (!page) { setDraggedId(null); setDragType(null); return; }

        const newNavItem: NavItem = {
          id: `nav_cms_${page.id}`,
          label: page.title,
          path: `/${page.slug.toLowerCase().replace(/^\//, '')}`,
          isCMSPage: true,
          cmsPageId: page.id,
          isSystemPage: page.isSystemPage,
          systemKey: page.systemKey as NavItem['systemKey'],
          order: visibleItems.length,
          visible: true,
          parentId: targetId,
        };

        // Save the new child item
        setIsSaving(true);
        setSaveStatus('idle');
        try {
          await navigationService.saveSingleNavigationItem(newNavItem as NavigationItem);
          // Re-save all items to consolidate ordering
          const allUpdated = [...visibleItems, newNavItem];
          setNavItems(allUpdated);
          setSaveStatus('saved');
          router.refresh();
          setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
          console.error('Add page to nav error:', err);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
          setIsSaving(false);
        }
        setDraggedId(null);
        setDragType(null);
      }
    },
    [visibleItems, pages, router, persistNavOrder]
  );

  /* ---------------------------------------------------------------- */
  /*  DROP on the navbar bar (top-level add)                          */
  /* ---------------------------------------------------------------- */
  const handleNavbarBarDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = {};
      setDragOverId(null);

      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) { setDraggedId(null); setDragType(null); return; }

      const [type, sourceId] = raw.split(':');

      if (type === DRAG_TYPE_PAGE && sourceId) {
        const page = pages.find((p) => p.id === sourceId);
        if (!page) { setDraggedId(null); setDragType(null); return; }

        const newNavItem: NavItem = {
          id: `nav_cms_${page.id}`,
          label: page.title,
          path: `/${page.slug.toLowerCase().replace(/^\//, '')}`,
          isCMSPage: true,
          cmsPageId: page.id,
          isSystemPage: page.isSystemPage,
          systemKey: page.systemKey as NavItem['systemKey'],
          order: visibleItems.length,
          visible: true,
        };

        setIsSaving(true);
        setSaveStatus('idle');
        try {
          await navigationService.saveSingleNavigationItem(newNavItem as NavigationItem);
          const allUpdated = [...visibleItems, newNavItem];
          setNavItems(allUpdated);
          setSaveStatus('saved');
          router.refresh();
          setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
          console.error('Add page to nav error:', err);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
          setIsSaving(false);
        }
        setDraggedId(null);
        setDragType(null);
      }
    },
    [visibleItems, pages, router]
  );

  /* ---------------------------------------------------------------- */
  /*  PAGE CHIP drag handlers                                         */
  /* ---------------------------------------------------------------- */
  const handlePageDragStart = useCallback((e: React.DragEvent, pageId: string) => {
    setDraggedId(pageId);
    setDragType(DRAG_TYPE_PAGE);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', `${DRAG_TYPE_PAGE}:${pageId}`);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Computed: is a page chip being dragged?                         */
  /* ---------------------------------------------------------------- */
  const isPageDrag = dragType === DRAG_TYPE_PAGE;

  return (
    <div>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
            <h3 className={styles.headerTitle} style={{ fontSize: '1.25rem', margin: 0 }}>
              Live Website Navbar Preview
            </h3>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'rgba(74, 222, 128, 0.12)',
                color: '#4ADE80',
                border: '1px solid rgba(74, 222, 128, 0.25)',
              }}
            >
              LIVE SYNCED ✓
            </span>
            {isSaving && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(251, 191, 36, 0.12)',
                  color: '#FBBF24',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                }}
              >
                SAVING...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(74, 222, 128, 0.12)',
                  color: '#4ADE80',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                }}
              >
                ORDER SAVED ✓
              </span>
            )}
            {saveStatus === 'error' && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                SAVE FAILED
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.84375rem', color: '#706A61', margin: 0 }}>
            Drag tabs to reorder · Drag pages from pool below onto a menu tab to add as dropdown
          </p>
        </div>
        <Link href="/admin/navigation">
          <Button variant="primary" size="sm">
            Manage Navigation 🧭
          </Button>
        </Link>
      </div>

      {/* ============ LIVE NAVBAR BAR ============ */}
      <div
        className={styles.liveNavbarShell}
        onDragOver={handleDragOver}
        onDrop={handleNavbarBarDrop}
        style={{
          border: isPageDrag && dragOverId === '__navbar_bar__'
            ? '1px solid #C85A32'
            : '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'border-color 0.2s ease',
        }}
        onDragEnter={(e) => { e.preventDefault(); if (isPageDrag) setDragOverId('__navbar_bar__'); }}
        onDragLeave={(e) => { e.preventDefault(); if (dragOverId === '__navbar_bar__') setDragOverId(null); }}
      >
        {/* Left Brand Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #C85A32 0%, #A04220 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontSize: '0.9rem',
            }}
          >
            🎓
          </div>
          <span
            style={{
              color: '#FFF',
              fontWeight: 800,
              fontSize: '0.875rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {collegeName}
          </span>
        </div>

        {/* Draggable Navigation Pills */}
        <div className={styles.liveNavbarPillsGroup}>
          {visibleItems.length > 0 ? (
            <>
              {visibleItems.map((item) => {
                const isDragging = draggedId === item.id && dragType === DRAG_TYPE_NAV;
                const isDragOver = dragOverId === item.id && draggedId !== item.id;
                const showDropHint = isPageDrag && isDragOver;

                return (
                  <div
                    key={item.id}
                    className={`${styles.navDropZone} ${showDropHint ? styles.dropTargetActive : ''}`}
                    draggable
                    onDragStart={(e) => handleNavDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={(e) => handleDragEnter(e, item.id)}
                    onDragLeave={(e) => handleDragLeave(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleNavDrop(e, item.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      cursor: 'grab',
                      transition: 'transform 0.2s ease, opacity 0.2s ease',
                      transform: isDragOver && !isPageDrag ? 'scale(1.08)' : isDragging ? 'scale(0.92)' : 'scale(1)',
                      opacity: isDragging ? 0.4 : 1,
                      paddingBottom: showDropHint ? '20px' : '0',
                    }}
                  >
                    {/* Drag Handle Grip */}
                    <div
                      style={{
                        width: '16px',
                        height: '4px',
                        display: 'flex',
                        gap: '2px',
                        justifyContent: 'center',
                        marginBottom: '-2px',
                        opacity: 0.4,
                      }}
                    >
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#E2DFD8' }} />
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#E2DFD8' }} />
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#E2DFD8' }} />
                    </div>

                    {/* Navbar Tab */}
                    <Link
                      href={item.path}
                      target="_blank"
                      title={`Click to open ${item.label} (${item.path})`}
                      onClick={(e) => { if (draggedId) e.preventDefault(); }}
                      style={{
                        padding: '0.4375rem 0.875rem',
                        borderRadius: '8px',
                        background:
                          showDropHint
                            ? 'rgba(200, 90, 50, 0.35)'
                            : isDragOver && !isPageDrag
                              ? 'rgba(200, 90, 50, 0.35)'
                              : item.path === '/'
                                ? 'rgba(200, 90, 50, 0.25)'
                                : 'rgba(255, 255, 255, 0.08)',
                        color: item.path === '/' ? '#FFAA8A' : '#E2DFD8',
                        border: showDropHint || isDragOver
                          ? '1px solid #C85A32'
                          : item.path === '/'
                            ? '1px solid #C85A32'
                            : '1px solid rgba(255, 255, 255, 0.12)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        boxShadow: showDropHint ? '0 0 16px rgba(200, 90, 50, 0.4)' : 'none',
                      }}
                    >
                      <span style={{ opacity: 0.5 }}>⠿</span>
                      <span>{item.label}</span>
                      {item.children && item.children.length > 0 && (
                        <span style={{ fontSize: '0.6875rem', opacity: 0.6 }}>▾</span>
                      )}
                    </Link>

                    {/* Drop hint label */}
                    {showDropHint && (
                      <span className={styles.navDropIndicator} style={{ opacity: 1 }}>
                        + Drop into {item.label}
                      </span>
                    )}

                    {/* Create page button */}
                    {!showDropHint && (
                      <Link
                        href="/admin/pages/create"
                        title={`+ Create New Page (${item.label})`}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #C85A32 0%, #A04220 100%)',
                          color: '#FFFFFF',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(200, 90, 50, 0.4)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        +
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* + New Page CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <Link
                  href="/admin/pages/create"
                  title="Create New CMS Page"
                  style={{
                    padding: '0.4375rem 0.875rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #C85A32 0%, #A04220 100%)',
                    color: '#FFFFFF',
                    border: '1px solid #C85A32',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(200, 90, 50, 0.3)',
                  }}
                >
                  <span>+ New Page</span>
                </Link>
                <Link
                  href="/admin/pages/create"
                  title="Create New CMS Page"
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    color: '#C85A32',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    textDecoration: 'none',
                  }}
                >
                  +
                </Link>
              </div>
            </>
          ) : (
            <span style={{ color: 'rgba(226, 223, 216, 0.6)', fontSize: '0.8125rem' }}>
              No navigation items yet...
            </span>
          )}
        </div>
      </div>

      {/* ============ PAGES POOL ============ */}
      {unlinkedPages.length > 0 && (
        <div className={styles.pagesPoolSection}>
          <div className={styles.pagesPoolHeader}>
            <span style={{ fontSize: '0.9rem' }}>📄</span>
            <h4 className={styles.pagesPoolTitle}>Published Pages</h4>
            <span className={styles.pagesPoolCount}>{unlinkedPages.length} not in navbar</span>
          </div>
          <p style={{ fontSize: '0.78125rem', color: '#706A61', margin: '0 0 0.75rem 0' }}>
            Drag a page onto a navbar tab above to add it as a dropdown item, or onto the bar to add as top-level.
          </p>
          <div className={styles.pagesPoolGrid}>
            {unlinkedPages.map((page) => {
              const isBeingDragged = draggedId === page.id && dragType === DRAG_TYPE_PAGE;
              return (
                <div
                  key={page.id}
                  className={styles.pageChip}
                  draggable
                  onDragStart={(e) => handlePageDragStart(e, page.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    opacity: isBeingDragged ? 0.4 : 1,
                    transform: isBeingDragged ? 'scale(0.95)' : 'scale(1)',
                  }}
                  title={`Drag "${page.title}" onto a navbar tab to add it`}
                >
                  <span className={styles.pageChipGrip}>⠿</span>
                  <span
                    className={styles.pageChipStatus}
                    style={{ background: page.status === 'published' ? '#4ADE80' : '#FBBF24' }}
                  />
                  <span>{page.title}</span>
                  <span style={{ fontSize: '0.6875rem', color: '#B0AAA0' }}>/{page.slug}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when all pages are already in navbar */}
      {unlinkedPages.length === 0 && pages.filter((p) => p.status === 'published').length > 0 && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(74, 222, 128, 0.06)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
            borderRadius: '10px',
            fontSize: '0.8125rem',
            color: '#706A61',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✅</span>
          <span>All published pages are linked in the navigation menu.</span>
        </div>
      )}
    </div>
  );
}
