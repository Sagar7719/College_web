'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Page, NavigationItem, ToastMessage } from '@/types';
import { pagesService } from '@/services/pages.service';
import { navigationService, getNavPositionForPage } from '@/services/navigation.service';
import { isSystemPageCheck } from '@/constants/system-pages';
import { PageSectionRenderer } from '@/components/page-builder';
import { Pencil, Eye, Trash2, Globe, FileText, Sparkles, ExternalLink, X, Search, Filter } from 'lucide-react';
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
import styles from '@/components/admin/admin.module.css';

export default function AdminPagesListScreen() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Toast notification state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // In-place Preview modal state
  const [previewPage, setPreviewPage] = useState<Page | null>(null);

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

  // Action: Open Delete Confirmation Modal
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

  // Action: Execute Permanent Hard Delete
  const handleConfirmDelete = async () => {
    if (!deleteTargetPage) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      // Step 1: Remove navigation reference from Firestore
      const navItemId = `nav_cms_${deleteTargetPage.id}`;
      await navigationService.deleteNavigationItem(navItemId).catch(() => {});
      await navigationService.removePageNavigationCompletely(deleteTargetPage.id).catch(() => {});

      // Step 2: Permanently delete page document from Firestore
      await pagesService.deletePage(deleteTargetPage.id);

      // Step 3: Update local state immediately
      setPages((prev) => prev.filter((p) => p.id !== deleteTargetPage.id));
      setDeleteTargetPage(null);

      showToast(
        'Page Permanently Deleted',
        `"${deleteTargetPage.title}" has been permanently deleted from the database.`,
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
          <h1 className={styles.headerTitle} style={{ fontSize: '2.15rem' }}>Website Pages</h1>
          <p style={{ color: '#706A61', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            Manage institutional system pages and dynamic custom pages for your college website.
          </p>
        </div>
        <Link href="/admin/pages/create">
          <Button variant="primary" size="md">
            + Create New Page
          </Button>
        </Link>
      </div>

      {/* Unified Single Search & Status Filter Box */}
      <div className={styles.unifiedSearchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search pages by title or URL slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className={styles.searchDivider} />

        <div className={styles.filterSelectGroup}>
          <Filter size={16} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>

        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <Card variant="bordered" style={{ borderRadius: '16px' }}>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
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
        <Card variant="bordered" style={{ borderRadius: '16px', border: '1px solid rgba(222, 212, 197, 0.7)', overflow: 'hidden' }}>
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Page Title &amp; Slug</TableHead>
                  <TableHead>Type &amp; Status</TableHead>
                  <TableHead>Navbar Visibility</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => {
                  const isSystem = isSystemPageCheck(page);

                  return (
                    <TableRow key={page.id}>
                      {/* Page Title & Slug */}
                      <TableCell>
                        <strong style={{ color: '#24221F', display: 'block', fontSize: '1rem', fontWeight: 700 }}>{page.title}</strong>
                        <span style={{ fontSize: '0.8125rem', color: '#706A61', fontFamily: 'monospace' }}>
                          /{page.slug}
                        </span>
                      </TableCell>

                      {/* Type & Status */}
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

                      {/* Navbar Visibility */}
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

                      {/* Clean 3 Icon Actions Group */}
                      <TableCell style={{ textAlign: 'right' }}>
                        <div className={styles.iconActionGroup}>
                          {/* 1. Edit Icon Button */}
                          <Link
                            href={`/admin/pages/${page.id}/edit`}
                            className={`${styles.iconActionBtn} ${styles.iconActionBtnEdit}`}
                            title="Edit Page"
                          >
                            <Pencil size={16} />
                          </Link>

                          {/* 2. Preview Icon Button (Opens In-Place Modal Popup) */}
                          <button
                            type="button"
                            className={`${styles.iconActionBtn} ${styles.iconActionBtnPreview}`}
                            title="Preview Page (In-Place Modal)"
                            onClick={() => setPreviewPage(page)}
                          >
                            <Eye size={16} />
                          </button>

                          {/* 3. Delete Icon Button (Triggers Delete Confirmation Modal) */}
                          <button
                            type="button"
                            className={`${styles.iconActionBtn} ${styles.iconActionBtnDanger}`}
                            title={
                              isSystem
                                ? 'Required institutional system page cannot be deleted.'
                                : `Delete "${page.title}"`
                            }
                            disabled={isSystem}
                            onClick={() => !isSystem && handleOpenDeleteModal(page)}
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* ─── 1. IN-PLACE PREVIEW MODAL POPUP ───────────────────────────── */}
      <Modal
        isOpen={Boolean(previewPage)}
        onClose={() => setPreviewPage(null)}
        title={`Preview: ${previewPage?.title}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setPreviewPage(null)}>
              Close Preview
            </Button>
            {previewPage && (
              <Link href={`/admin/pages/${previewPage.id}/edit`}>
                <Button variant="primary">
                  Edit Page ✏️
                </Button>
              </Link>
            )}
          </div>
        }
      >
        {previewPage && (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(222, 212, 197, 0.6)' }}>
              <Badge variant="info">URL Slug: /{previewPage.slug}</Badge>
              <Badge variant={previewPage.status === 'published' ? 'success' : 'warning'}>
                STATUS: {previewPage.status.toUpperCase()}
              </Badge>
            </div>

            {previewPage.sections && previewPage.sections.length > 0 ? (
              <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <PageSectionRenderer sections={previewPage.sections} />
              </div>
            ) : (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#706A61', background: '#FAF8F5', borderRadius: '12px' }}>
                <FileText size={42} style={{ color: '#C85A32', marginBottom: '0.75rem', opacity: 0.8 }} />
                <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#24221F', margin: '0 0 0.5rem' }}>No Sections Built Yet</h4>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Click "Edit Page" to add hero sections, text blocks, cards, or custom widgets using the drag-and-drop Page Builder.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ─── 2. HARD DELETE CONFIRMATION MODAL POPUP ──────────────────── */}
      <Modal
        isOpen={Boolean(deleteTargetPage)}
        onClose={handleCloseDeleteModal}
        title="⚠️ Permanently Delete Page?"
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
                background: '#DC2626',
                borderColor: '#DC2626',
              }}
            >
              Confirm Permanent Delete
            </Button>
          </>
        }
      >
        {deleteTargetPage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#706A61', lineHeight: 1.6, margin: 0 }}>
              Are you sure you want to permanently delete custom page:
            </p>

            <div
              style={{
                background: 'rgba(220, 38, 38, 0.06)',
                border: '1px solid #DC2626',
                borderRadius: '12px',
                padding: '0.875rem 1rem',
              }}
            >
              <strong style={{ color: '#DC2626', display: 'block', marginBottom: '0.2rem', fontSize: '1rem' }}>
                {deleteTargetPage.title}
              </strong>
              <span style={{ fontSize: '0.8125rem', color: '#706A61', fontFamily: 'monospace' }}>
                /{deleteTargetPage.slug}
              </span>
            </div>

            <ul
              style={{
                fontSize: '0.8125rem',
                color: '#706A61',
                lineHeight: 1.7,
                paddingLeft: '1.25rem',
                margin: 0,
              }}
            >
              <li>The page document will be deleted permanently from Firestore.</li>
              <li>Its dynamic navigation item will be unlinked.</li>
              <li>The public URL will immediately return a 404 Not Found error.</li>
            </ul>

            {deleteError && (
              <div
                role="alert"
                style={{
                  background: 'rgba(220, 38, 38, 0.08)',
                  color: '#DC2626',
                  border: '1px solid #DC2626',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                ⚠️ {deleteError}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast Alert Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
