'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageSection, PageStatus } from '@/types';
import { pagesService } from '@/services/pages.service';
import { navigationService } from '@/services/navigation.service';
import { generateSlug, isReservedSlug } from '@/validations/page.schema';
import { PageBuilderManager } from '@/components/admin/page-builder/PageBuilderManager';
import { NavigationPlacementPicker } from '@/components/admin/NavigationPlacementPicker';
import { Input, Select, Button, Card, CardBody, Badge } from '@/components/ui';
import { NavigationItem } from '@/types';

export default function CreatePageScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
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

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Sections State
  const [sections, setSections] = useState<PageSection[]>([]);

  // Validation Error State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto slug generation on Title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(generateSlug(val));
    }
    if (!metaTitle) {
      setMetaTitle(val);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  // Submit Handler
  const handleSavePage = async (targetStatus: PageStatus) => {
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Page title is required.');
      return;
    }

    const cleanSlug = slug.trim() || generateSlug(title);
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
      const pageId = await pagesService.savePage({
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
      });

      // Sync to Dynamic Navigation if published and visible
      await navigationService.syncPageToNavigation(
        pageId,
        title.trim(),
        cleanSlug,
        targetStatus === 'published' ? showInNavigation : false,
        navigationOrder,
        false,
        undefined,
        navigationParentId
      );

      if (navSequence && navSequence.length > 0 && showInNavigation && targetStatus === 'published') {
        const finalNavSequence = navSequence.map((item) => {
          if (item.id === 'current_page_target' || item.cmsPageId === pageId) {
            const updatedItem: NavigationItem = {
              ...item,
              id: `nav_cms_${pageId}`,
              cmsPageId: pageId,
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
      const errMsg = err instanceof Error ? err.message : 'Failed to save page. Please check your data.';
      setErrorMessage(errMsg);
    }
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>CMS Page Builder</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Create New Website Page</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={() => router.push('/admin/pages')}>
            Cancel
          </Button>
          <Button variant="outline" isLoading={isSaving} onClick={() => handleSavePage('draft')}>
            Save Draft 💾
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={() => handleSavePage('published')}>
            Publish Page 🚀
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

      {/* Main Form Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Page Identity Card */}
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>1. Page Identity &amp; URL</h3>
            <Input
              label="Page Title *"
              placeholder="e.g. Scholarship Information"
              value={title}
              onChange={handleTitleChange}
              required
            />
            <div>
              <Input
                label="URL Slug *"
                placeholder="scholarship-information"
                value={slug}
                onChange={handleSlugChange}
                required
              />
              <span className="tiny-text" style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Public URL: https://yourcollege.edu/{slug || 'page-slug'}
              </span>
            </div>
            <Input
              label="Featured Image URL (Optional)"
              placeholder="https://images.cloudinary.com/..."
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
            />
          </CardBody>
        </Card>

        {/* Navigation & Status Settings */}
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
                id="showNav"
                checked={showInNavigation}
                onChange={(e) => setShowInNavigation(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="showNav" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
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

      {/* SEO Settings Editor */}
      <Card variant="bordered" style={{ marginBottom: '2rem' }}>
        <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3>3. Search Engine Optimization (SEO)</h3>
          <div>
            <Input
              label="SEO Meta Title"
              placeholder="Scholarship Information | College Name"
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
              placeholder="Find college scholarship eligibility criteria, merit rankings, and application guidelines."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit', marginTop: '0.375rem' }}
            />
            <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
              Recommended length: around 150–160 characters ({metaDescription.length} chars)
            </span>
          </div>

          <Input
            label="Open Graph Image URL (For social sharing previews)"
            placeholder="https://..."
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
          />
        </CardBody>
      </Card>
    </div>
  );
}
