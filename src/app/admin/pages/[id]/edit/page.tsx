'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { PageSection, PageStatus, Page } from '@/types';
import { pagesService } from '@/services/pages.service';
import { navigationService } from '@/services/navigation.service';
import { isReservedSlug } from '@/validations/page.schema';
import { PageBuilderManager } from '@/components/admin/page-builder/PageBuilderManager';
import { NavigationPlacementPicker } from '@/components/admin/NavigationPlacementPicker';
import { NavigationItem } from '@/types';
import { Input, Select, Button, Card, CardBody, Badge, Skeleton, EmptyState } from '@/components/ui';

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPageScreen({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<Page | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<PageStatus>('draft');
  const [showInNavigation, setShowInNavigation] = useState(false);
  const [navigationOrder, setNavigationOrder] = useState(0);
  const [navigationParentId, setNavigationParentId] = useState<string | undefined>(undefined);
  const [navSequence, setNavSequence] = useState<NavigationItem[] | undefined>(undefined);
  const [featuredImage, setFeaturedImage] = useState('');

  const handleNavPlacementChange = (newOrder: number, newParentId?: string, sequence?: NavigationItem[]) => {
    setNavigationOrder(newOrder);
    setNavigationParentId(newParentId);
    if (sequence) setNavSequence(sequence);
  };

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Sections
  const [sections, setSections] = useState<PageSection[]>([]);

  // Validation / Saving
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [allPagesList, setAllPagesList] = useState<Page[]>([]);

  useEffect(() => {
    pagesService.getAllPages().then(setAllPagesList).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      const existing = await pagesService.getPageById(id);
      if (existing) {
        setPage(existing);
        setTitle(existing.title);
        setSlug(existing.slug);
        setStatus(existing.status);
        setShowInNavigation(existing.showInNavigation);
        setNavigationOrder(existing.navigationOrder || 0);
        setNavigationParentId(existing.navigationParentId);
        setFeaturedImage(existing.featuredImage || '');
        setMetaTitle(existing.seo?.metaTitle || existing.title);
        setMetaDescription(existing.seo?.metaDescription || '');
        setOgImageUrl(existing.seo?.ogImageUrl || '');
        setSections(existing.sections || []);
      }
      setIsLoading(false);
    };
    fetchPage();
  }, [id]);

  const handleUpdatePage = async (targetStatus: PageStatus) => {
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Page title is required.');
      return;
    }

    const cleanSlug = slug.trim();
    if (!cleanSlug) {
      setErrorMessage('A valid URL slug is required.');
      return;
    }

    if (isReservedSlug(cleanSlug)) {
      setErrorMessage('This URL is reserved by the system. Please choose another slug.');
      return;
    }

    setIsSaving(true);
    try {
      await pagesService.savePage({
        id,
        title: title.trim(),
        slug: cleanSlug,
        status: targetStatus,
        showInNavigation,
        navigationOrder,
        navigationParentId,
        featuredImage: featuredImage.trim() || undefined,
        sections,
        seo: {
          metaTitle: metaTitle.trim() || title.trim(),
          metaDescription: metaDescription.trim() || undefined,
          ogImageUrl: ogImageUrl.trim() || undefined,
        },
        ...(page?.isSystemPage && page?.systemKey ? { isSystemPage: true, systemKey: page.systemKey } : {}),
      });

      // Sync Navigation
      await navigationService.syncPageToNavigation(
        id,
        title.trim(),
        cleanSlug,
        targetStatus === 'published' ? showInNavigation : false,
        navigationOrder,
        page?.isSystemPage,
        page?.systemKey,
        navigationParentId
      );

      if (navSequence && navSequence.length > 0 && showInNavigation && targetStatus === 'published') {
        const finalNavSequence = navSequence.map((item) => {
          if (item.id === 'current_page_target' || item.cmsPageId === id) {
            const updatedItem: NavigationItem = {
              ...item,
              id: `nav_cms_${id}`,
              cmsPageId: id,
            };
            if (navigationParentId) {
              updatedItem.parentId = navigationParentId;
            } else {
              delete updatedItem.parentId;
            }
            if (!updatedItem.systemKey) delete updatedItem.systemKey;
            return updatedItem;
          }
          if (!item.systemKey) {
            const copy = { ...item };
            delete copy.systemKey;
            return copy;
          }
          return item;
        });
        await navigationService.saveNavigationItems(finalNavSequence);
      }

      router.push('/admin/pages');
    } catch (err: unknown) {
      setIsSaving(false);
      const errMsg = err instanceof Error ? err.message : 'Failed to update page.';
      setErrorMessage(errMsg);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <Skeleton height="3rem" width="40%" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="200px" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (!page) {
    return (
      <EmptyState
        title="Page Not Found"
        description="The CMS page you are attempting to edit does not exist or has been deleted."
        actionLabel="Return to Pages List"
        onAction={() => router.push('/admin/pages')}
      />
    );
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>CMS Page Builder</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Edit Page: {title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {allPagesList.length > 0 && (
            <select
              value={id}
              onChange={(e) => router.push(`/admin/pages/${e.target.value}/edit`)}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#24221F',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {allPagesList.map((p) => (
                <option key={p.id} value={p.id}>
                  📄 Edit: {p.title} (/{p.slug})
                </option>
              ))}
            </select>
          )}
          <Button variant="secondary" onClick={() => router.push('/admin/pages')}>
            Cancel
          </Button>
          <Button variant="outline" isLoading={isSaving} onClick={() => handleUpdatePage('draft')}>
            Save Draft 💾
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={() => handleUpdatePage('published')}>
            Update &amp; Publish 🚀
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            backgroundColor: 'var(--semantic-error-bg)',
            border: '1px solid var(--semantic-error-border)',
            color: 'var(--semantic-error)',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.9375rem',
          }}
          role="alert"
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Settings Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>1. Page Identity &amp; URL</h3>
            <Input
              label="Page Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Input
              label="URL Slug *"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required
            />
            <Input
              label="Featured Image URL"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
          </CardBody>
        </Card>

        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>2. Visibility &amp; Status Settings</h3>
            <Select
              label="Publish Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PageStatus)}
              options={[
                { label: 'Draft (Not publicly accessible)', value: 'draft' },
                { label: 'Published (Live on website)', value: 'published' },
                { label: 'Hidden (Accessible via direct link only)', value: 'hidden' },
              ]}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="showNavEdit"
                checked={showInNavigation}
                onChange={(e) => setShowInNavigation(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="showNavEdit" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
                Show in Public Navigation Bar
              </label>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Visual Navigation Placement & Preview Card */}
      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <NavigationPlacementPicker
            showInNavigation={showInNavigation}
            currentPageId={id}
            currentPageTitle={title}
            currentPageSlug={slug}
            navigationOrder={navigationOrder}
            navigationParentId={navigationParentId}
            onChangePlacement={handleNavPlacementChange}
          />
        </CardBody>
      </Card>

      {/* Page Builder Section Manager */}
      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <PageBuilderManager sections={sections} onChange={setSections} />
        </CardBody>
      </Card>

      {/* SEO Editor */}
      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3>3. Search Engine Optimization (SEO)</h3>
          <div>
            <Input
              label="SEO Meta Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
            <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
              Recommended length: 50–60 characters ({metaTitle.length} chars)
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>SEO Meta Description</label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit', marginTop: '0.375rem' }}
            />
            <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
              Recommended length: around 150–160 characters ({metaDescription.length} chars)
            </span>
          </div>

          <Input
            label="Open Graph Image URL"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
