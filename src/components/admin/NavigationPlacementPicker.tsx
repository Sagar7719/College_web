'use client';

import React, { useState, useEffect } from 'react';
import { NavigationItem } from '@/types';
import { navigationService, buildNavigationTree } from '@/services/navigation.service';
import { Badge, Button, Select } from '@/components/ui';

export interface NavigationPlacementPickerProps {
  showInNavigation: boolean;
  currentPageId?: string;
  currentPageTitle: string;
  currentPageSlug: string;
  navigationOrder: number;
  navigationParentId?: string;
  onChangePlacement: (newOrder: number, newParentId?: string, updatedNavSequence?: NavigationItem[]) => void;
}

export const NavigationPlacementPicker: React.FC<NavigationPlacementPickerProps> = ({
  showInNavigation,
  currentPageId,
  currentPageTitle,
  currentPageSlug,
  navigationOrder,
  navigationParentId,
  onChangePlacement,
}) => {
  const [allNavItems, setAllNavItems] = useState<NavigationItem[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>(navigationParentId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const displayTitle = currentPageTitle.trim() || 'Untitled Page';

  useEffect(() => {
    let alive = true;
    const loadNav = async () => {
      try {
        setIsLoading(true);
        const existing = await navigationService.getAllAdminNavigationItems();
        if (!alive) return;

        // Filter out existing instance of current page if editing
        const filtered = existing.filter((item) => {
          if (currentPageId && (item.cmsPageId === currentPageId || item.id === `nav_cms_${currentPageId}`)) {
            return false;
          }
          return true;
        });

        // Construct target placeholder item for placement
        const targetItem: NavigationItem = {
          id: currentPageId ? `nav_cms_${currentPageId}` : 'current_page_target',
          label: displayTitle,
          path: `/${currentPageSlug.toLowerCase().replace(/^\//, '')}`,
          isCMSPage: true,
          cmsPageId: currentPageId,
          order: navigationOrder,
          visible: true,
        };
        if (navigationParentId) {
          targetItem.parentId = navigationParentId;
        }

        const updated = [...filtered, targetItem];
        setAllNavItems(updated);
      } catch (err) {
        console.warn('Navigation placement fetch warning:', err);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    loadNav();
    return () => {
      alive = false;
    };
  }, [currentPageId]);

  // Update label / parentId of target item in real-time
  useEffect(() => {
    setSelectedParentId(navigationParentId || '');
    setAllNavItems((prev) =>
      prev.map((item) => {
        if (item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId)) {
          const updated: NavigationItem = {
            ...item,
            label: displayTitle,
            path: `/${currentPageSlug.toLowerCase().replace(/^\//, '')}`,
          };
          if (navigationParentId) {
            updated.parentId = navigationParentId;
          } else {
            delete updated.parentId;
          }
          return updated;
        }
        return item;
      })
    );
  }, [currentPageTitle, currentPageSlug, currentPageId, navigationParentId]);

  if (!showInNavigation) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-card-hover)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          border: '1px dashed var(--border-color)',
        }}
      >
        🔒 <strong>Public Navigation is disabled for this page.</strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem' }}>
          Enable <em>&quot;Show in Public Navigation Bar&quot;</em> above to visually arrange this page on the website navbar.
        </p>
      </div>
    );
  }

  // Eligible top-level parent dropdown items (excluding current page)
  const topLevelOptions = allNavItems
    .filter((item) => !item.parentId && item.id !== 'current_page_target' && item.cmsPageId !== currentPageId)
    .map((item) => ({
      label: `${item.label} (Dropdown)`,
      value: item.id,
    }));

  const parentSelectOptions = [
    { label: '📌 Main Navigation (Top-Level Item)', value: '' },
    ...topLevelOptions,
  ];

  const handleParentChange = (newParentId: string) => {
    setSelectedParentId(newParentId);
    const updated = allNavItems.map((item) => {
      if (item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId)) {
        const copy = { ...item };
        if (newParentId) {
          copy.parentId = newParentId;
        } else {
          delete copy.parentId;
        }
        return copy;
      }
      return item;
    });

    setAllNavItems(updated);

    const targetIdx = updated.findIndex(
      (item) => item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId)
    );
    onChangePlacement(targetIdx !== -1 ? targetIdx : 0, newParentId || undefined, updated);
  };

  const updateSequence = (newItems: NavigationItem[]) => {
    const reindexed = newItems.map((item, idx) => {
      const cleanItem = { ...item, order: idx };
      if (!cleanItem.parentId) delete cleanItem.parentId;
      if (!cleanItem.systemKey) delete cleanItem.systemKey;
      return cleanItem;
    });
    setAllNavItems(reindexed);

    const targetIdx = reindexed.findIndex(
      (item) => item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId)
    );

    if (targetIdx !== -1) {
      onChangePlacement(targetIdx, selectedParentId || undefined, reindexed);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= allNavItems.length) return;

    const copy = [...allNavItems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateSequence(copy);
  };

  const tree = buildNavigationTree(allNavItems.filter((i) => i.visible !== false));

  // Position badge calculation
  let targetBadgeText = '';
  if (!selectedParentId) {
    const topLevelList = allNavItems.filter((i) => !i.parentId && i.visible !== false);
    const topIdx = topLevelList.findIndex(
      (i) => i.id === 'current_page_target' || (currentPageId && i.cmsPageId === currentPageId)
    );
    if (topIdx !== -1) {
      targetBadgeText = `In Navbar (#${topIdx + 1})`;
    }
  } else {
    const parentObj = allNavItems.find((i) => i.id === selectedParentId);
    const parentLabel = parentObj ? parentObj.label : 'Parent';
    const siblings = allNavItems.filter((i) => i.parentId === selectedParentId && i.visible !== false);
    const childIdx = siblings.findIndex(
      (i) => i.id === 'current_page_target' || (currentPageId && i.cmsPageId === currentPageId)
    );
    if (childIdx !== -1) {
      targetBadgeText = `Inside ${parentLabel} · #${childIdx + 1}`;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)', margin: 0 }}>
            3. Navigation Placement &amp; Hierarchy
          </label>
          {targetBadgeText && <Badge variant="info">{targetBadgeText}</Badge>}
        </div>
        <p className="tiny-text" style={{ color: 'var(--text-muted)', margin: 0 }}>
          Choose whether this page appears as a top-level menu item or inside a dropdown menu.
        </p>
      </div>

      {/* Dropdown / Top-level Selector */}
      <Select
        label="Navbar Location"
        value={selectedParentId}
        onChange={(e) => handleParentChange(e.target.value)}
        options={parentSelectOptions}
      />

      {/* Live Public Navbar Preview Strip */}
      <div
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'rgba(255,255,255,0.6)',
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 600,
          }}
        >
          🖥️ Live Public Navbar Preview
        </span>
        <div
          style={{
            display: 'flex',
            gap: '0.875rem',
            alignItems: 'center',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            whiteSpace: 'nowrap',
          }}
        >
          {tree.map((item, idx) => {
            const isTargetTop = item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId);
            const hasChildren = Boolean(item.children && item.children.length > 0);

            return (
              <React.Fragment key={item.id}>
                {idx > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>•</span>}
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: isTargetTop ? 700 : 500,
                      color: isTargetTop ? '#38BDF8' : 'rgba(255, 255, 255, 0.9)',
                      backgroundColor: isTargetTop ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      padding: isTargetTop ? '0.25rem 0.625rem' : '0.125rem 0',
                      borderRadius: 'var(--radius-sm)',
                      border: isTargetTop ? '1px solid #38BDF8' : 'none',
                    }}
                  >
                    {isTargetTop && '⭐ '}
                    {item.label}
                    {hasChildren && ' ▼'}
                  </span>

                  {/* Children preview tag */}
                  {hasChildren && (
                    <span style={{ fontSize: '0.6875rem', color: '#94A3B8', paddingLeft: '0.25rem' }}>
                      ↳ {item.children?.map((c) => c.label).join(', ')}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Interactive Hierarchical List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-main)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          maxHeight: '340px',
          overflowY: 'auto',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Loading current navigation sequence...
          </div>
        ) : (
          allNavItems.map((item, idx) => {
            const isTarget = item.id === 'current_page_target' || (currentPageId && item.cmsPageId === currentPageId);
            const isChild = Boolean(item.parentId);
            const isFirst = idx === 0;
            const isLast = idx === allNavItems.length - 1;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  marginLeft: isChild ? '1.5rem' : 0,
                  backgroundColor: isTarget ? 'var(--primary-bg)' : 'var(--bg-card)',
                  border: isTarget ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.15s ease',
                  boxShadow: isTarget ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  {isChild && (
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                      ↳
                    </span>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontWeight: isTarget ? 700 : 600,
                          color: isTarget ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.9375rem',
                        }}
                      >
                        {isTarget ? `⭐ ${item.label}` : item.label}
                      </span>

                      {isTarget && (
                        <Badge variant="info" style={{ fontSize: '0.6875rem' }}>
                          This Page
                        </Badge>
                      )}

                      {isChild && (
                        <Badge variant="default" style={{ fontSize: '0.6875rem' }}>
                          Dropdown Child
                        </Badge>
                      )}

                      {item.isSystemPage && (
                        <Badge variant="info" style={{ fontSize: '0.6875rem' }}>
                          System
                        </Badge>
                      )}
                    </div>
                    <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                      Path: {item.path}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isFirst}
                    onClick={() => moveItem(idx, 'up')}
                    aria-label={`Move ${item.label} up`}
                    title="Move Up"
                    style={{ padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    ▲
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLast}
                    onClick={() => moveItem(idx, 'down')}
                    aria-label={`Move ${item.label} down`}
                    title="Move Down"
                    style={{ padding: '0.25rem 0.5rem', height: 'auto' }}
                  >
                    ▼
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
