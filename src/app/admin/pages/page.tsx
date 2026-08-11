'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Page, NavigationItem, ToastMessage } from '@/types';
import { pagesService } from '@/services/pages.service';
import { navigationService, getNavPositionForPage } from '@/services/navigation.service';
import { isSystemPageCheck } from '@/constants/system-pages';
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
  Toast,
} from '@/components/ui';

export default function AdminPagesListScreen() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Delete confirmation modal state
  const [deleteTargetPage, setDeleteTargetPage] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const showToast = useCallback((title: string, description: string, type: ToastMessage['type']) => {
    setToast({ id: `toast_${Date.now()}`, title, description, type });
  }, []);

  const loadPages = useCallback(async () => {
    setLoading(true);
    const [allPages, allNav] = await Promise.all([
      pagesService.getAllPages(),
      navigationService.getAllAdminNavigationItems(),
    ]);
    setPages(allPages);
    setNavItems(allNav);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([
      pagesService.getAllPages(),
      navigationService.getAllAdminNavigationItems(),
    ])
      .then(([allPages, allNav]) => {
        if (alive) {
          setPages(allPages);
          setNavItems(allNav);
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

  // Filter pages logic
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Action 1: Toggle Publish / Unpublish
  const handleTogglePublish = async (page: Page) => {
    const nextStatus = page.status === 'published' ? 'draft' : 'published';
    await pagesService.updatePageStatus(page.id, nextStatus);

    // Sync to dynamic navigation
    await navigationService.syncPageToNavigation(
      page.id,
      page.title,
      page.slug,
      nextStatus === 'published' ? page.showInNavigation : false,
      page.navigationOrder || 0,
      page.isSystemPage,
      page.systemKey
    );

    loadPages();
  };

  // Action 2: Toggle Show / Hide in Navigation
  const handleToggleNavigationVisibility = async (page: Page) => {
    const nextShowNav = !page.showInNavigation;
    await pagesService.savePage({
      ...page,
      showInNavigation: nextShowNav,
    });

    await navigationService.syncPageToNavigation(
      page.id,
      page.title,
      page.slug,
      page.status === 'published' ? nextShowNav : false,
      page.navigationOrder || 0,
      page.isSystemPage,
      page.systemKey
    );

    loadPages();
  };

  // Action 3: Archive Page (Custom pages only)
  const handleArchivePage = async (page: Page) => {
    if (isSystemPageCheck(page)) {
      alert('System pages cannot be archived.');
      return;
    }
    if (confirm(`Archive page "${page.title}"? It will no longer appear on the public website or navbar.`)) {
      await pagesService.updatePageStatus(page.id, 'archived');
      await navigationService.removePageFromNavigation(page.id);
      loadPages();
    }
  };

  // Action 4: Open Delete Confirmation Modal
  const handleOpenDeleteModal = (page: Page) => {
    if (isSystemPageCheck(page)) {
      alert('Required institutional system pages cannot be permanently deleted.');
      return;
    }
    setDeleteTargetPage(page);
    setDeleteError('');
    setIsDeleting(false);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTargetPage(null);
    setDeleteError('');
  };

  // Action 4 (confirmed): Execute Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deleteTargetPage) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      // Step 1: Remove the page's navigation item permanently from Firestore
      const navItemId = `nav_cms_${deleteTargetPage.id}`;
      await navigationService.deleteNavigationItem(navItemId).catch(() => {});
      await navigationService.removePageNavigationCompletely(deleteTargetPage.id).catch(() => {});

      // Step 2: Permanently delete the CMS page document from Firestore.
      await pagesService.deletePage(deleteTargetPage.id);

      // Step 3: Update local state immediately
      setPages((prev) => prev.filter((p) => p.id !== deleteTargetPage.id));
      setDeleteTargetPage(null);

      showToast(
        'Page Permanently Deleted',
        `"${deleteTargetPage.title}" has been permanently deleted.`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setDeleteError(`Deletion failed: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Page Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>CMS Page Builder</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Website Pages</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage institutional system pages and dynamic custom pages for your college website.
          </p>
        </div>
        <Link href="/admin/pages/create">
          <Button variant="primary" size="md">
            + Create New Page
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              label="Search Pages"
              placeholder="Search by page title or URL slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Published Only', value: 'published' },
                { label: 'Drafts Only', value: 'draft' },
                { label: 'Archived Only', value: 'archived' },
              ]}
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Loading Skeleton */}
      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
          </CardBody>
        </Card>
      ) : filteredPages.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No Pages Matching "${searchQuery}"` : 'No Pages Found'}
          description={
            searchQuery
              ? 'Try searching with a different term or clear the filter.'
              : 'Create your first dynamic custom website page to expand your college website.'
          }
          actionLabel={!searchQuery ? '+ Create First Page' : undefined}
          onAction={!searchQuery ? () => router.push('/admin/pages/create') : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Title &amp; Slug</TableHead>
                  <TableHead>Type &amp; Status</TableHead>
                  <TableHead>Navbar Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => {
                  const isPub = page.status === 'published';
                  const isSystem = isSystemPageCheck(page);

                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <strong style={{ color: 'var(--primary)', display: 'block' }}>{page.title}</strong>
                        <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                          /{page.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {isSystem ? (
                            <Badge variant="info">SYSTEM</Badge>
                          ) : (
                            <Badge variant="default">CUSTOM</Badge>
                          )}
                          <Badge
                            variant={
                              page.status === 'published'
                                ? 'success'
                                : page.status === 'draft'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {page.status.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const posInfo = getNavPositionForPage(page, navItems);
                          return posInfo ? (
                            <Badge variant="info">{posInfo.displayText}</Badge>
                          ) : (
                            <Badge variant="default">Hidden</Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="small-text">
                        {page.updatedAt ? page.updatedAt.slice(0, 10) : 'Recently'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem', flexWrap: 'wrap' }}>
                          <Link href={`/admin/pages/${page.id}/edit`}>
                            <Button variant="outline" size="sm">Edit ✏️</Button>
                          </Link>
                          <Link href={`/admin/pages/${page.id}/preview`} target="_blank">
                            <Button variant="ghost" size="sm">Preview 👁️</Button>
                          </Link>
                          <Button
                            variant={isPub ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleTogglePublish(page)}
                          >
                            {isPub ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleNavigationVisibility(page)}
                          >
                            {page.showInNavigation ? 'Hide Nav' : 'Show Nav'}
                          </Button>

                          {/* Archive Action — disabled for system pages */}
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isSystem}
                            title={isSystem ? 'System pages cannot be archived.' : 'Archive page'}
                            onClick={() => !isSystem && handleArchivePage(page)}
                            style={isSystem ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                          >
                            Archive
                          </Button>

                          {/* Permanent Delete Action — disabled for system pages */}
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isSystem}
                            title={
                              isSystem
                                ? 'Required institutional system page cannot be permanently deleted.'
                                : `Permanently delete "${page.title}"`
                            }
                            onClick={() => !isSystem && handleOpenDeleteModal(page)}
                            style={
                              isSystem
                                ? { opacity: 0.4, cursor: 'not-allowed' }
                                : {
                                    background: 'var(--semantic-error, #dc2626)',
                                    borderColor: 'var(--semantic-error, #dc2626)',
                                  }
                            }
                            aria-label={`Permanently delete ${page.title}`}
                          >
                            🗑️ Delete
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

      {/* ─── Delete Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={Boolean(deleteTargetPage)}
        onClose={handleCloseDeleteModal}
        title="⚠️ Delete This Custom Page Permanently?"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              style={{
                background: 'var(--semantic-error, #dc2626)',
                borderColor: 'var(--semantic-error, #dc2626)',
              }}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        {deleteTargetPage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Are you sure you want to permanently delete custom page:
            </p>

            <div
              style={{
                background: 'var(--semantic-error-bg, rgba(220,38,38,0.07))',
                border: '1px solid var(--semantic-error, #dc2626)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
              }}
            >
              <strong style={{ color: 'var(--semantic-error, #dc2626)', display: 'block', marginBottom: '0.2rem' }}>
                {deleteTargetPage.title}
              </strong>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                /{deleteTargetPage.slug}
              </span>
            </div>

            <ul
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.75,
                paddingLeft: '1.25rem',
                margin: 0,
              }}
            >
              <li>The page document will be removed from Firestore.</li>
              <li>Its navigation reference will be removed.</li>
              <li>The public URL will return 404 immediately.</li>
              <li><strong>Media Library assets are NOT deleted.</strong></li>
            </ul>

            {deleteError && (
              <div
                role="alert"
                style={{
                  background: 'var(--semantic-error-bg, rgba(220,38,38,0.07))',
                  color: 'var(--semantic-error, #dc2626)',
                  border: '1px solid var(--semantic-error, #dc2626)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                ⚠️ {deleteError}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── Toast Notification ─────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
