'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Page } from '@/types';
import { pagesService } from '@/services/pages.service';
import { navigationService } from '@/services/navigation.service';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  Skeleton,
} from '@/components/ui';

export default function AdminPagesListScreen() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadPages = async () => {
    setLoading(true);
    const allPages = await pagesService.getAllPages();
    setPages(allPages);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    pagesService.getAllPages()
      .then((allPages) => {
        if (alive) {
          setPages(allPages);
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
      page.navigationOrder || 0
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
      page.navigationOrder || 0
    );

    loadPages();
  };

  // Action 3: Archive Page
  const handleArchivePage = async (page: Page) => {
    if (confirm(`Archive page "${page.title}"? It will no longer appear on the public website or navbar.`)) {
      await pagesService.updatePageStatus(page.id, 'archived');
      await navigationService.removePageFromNavigation(page.id);
      loadPages();
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
            Create, edit, section build, and publish dynamic pages for your college website.
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
          title={searchQuery ? `No Pages Matching "${searchQuery}"` : 'No Pages Created Yet'}
          description={
            searchQuery
              ? 'Try searching with a different term or clear the filter.'
              : 'Create your first dynamic website page to start building your college website.'
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
                  <TableHead>Page Title & Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Navbar Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => {
                  const isPub = page.status === 'published';
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <strong style={{ color: 'var(--primary)', display: 'block' }}>{page.title}</strong>
                        <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                          /{page.slug}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {page.showInNavigation ? (
                          <Badge variant="info">In Navbar ({page.navigationOrder || 0})</Badge>
                        ) : (
                          <Badge variant="default">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="small-text">
                        {page.updatedAt ? page.updatedAt.slice(0, 10) : 'Recently'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
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
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleArchivePage(page)}
                          >
                            Archive
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
    </div>
  );
}
