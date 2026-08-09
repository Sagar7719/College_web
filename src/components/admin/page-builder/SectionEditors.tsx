import React, { useState, useEffect } from 'react';
import {
  PageSection,
  HeroSection,
  HeadingSection,
  RichTextSection,
  ImageSection,
  ImageTextSection,
  TwoColumnSection,
  ThreeColumnSection,
  CardGridSection,
  CTASection,
  FAQSection,
  NoticeListSection,
  DocumentDownloadsSection,
  GallerySection,
  SpacerSection,
  GalleryAlbum,
} from '@/types';
import { Input, Select, Button, Card } from '@/components/ui';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { galleryService } from '@/services/cms-modules.service';

export interface SectionEditorProps {
  section: PageSection;
  onChange: (updatedSection: PageSection) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ section, onChange }) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerTargetField, setPickerTargetField] = useState<'backgroundImageUrl' | 'imageUrl' | null>(null);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);

  // Load published gallery albums for the gallery section selector
  useEffect(() => {
    if (section.type === 'gallery') {
      galleryService.getPublished().then(setAlbums).catch(() => setAlbums([]));
    }
  }, [section.type]);

  const openPicker = (target: 'backgroundImageUrl' | 'imageUrl') => {
    setPickerTargetField(target);
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string, altText?: string) => {
    if (pickerTargetField === 'backgroundImageUrl' && section.type === 'hero') {
      onChange({ ...(section as HeroSection), backgroundImageUrl: url });
    } else if (pickerTargetField === 'imageUrl' && section.type === 'image') {
      onChange({ ...(section as ImageSection), imageUrl: url, altText: altText || (section as ImageSection).altText || '' });
    } else if (pickerTargetField === 'imageUrl' && section.type === 'imageText') {
      onChange({ ...(section as ImageTextSection), imageUrl: url });
    }
  };
  const renderEditorContent = () => {
    switch (section.type) {
      case 'hero': {
        const s = section as HeroSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Hero Title" value={s.title} onChange={(e) => onChange({ ...s, title: e.target.value })} required />
            <Input label="Subtitle" value={s.subtitle || ''} onChange={(e) => onChange({ ...s, subtitle: e.target.value })} />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input label="Background Image URL" value={s.backgroundImageUrl || ''} onChange={(e) => onChange({ ...s, backgroundImageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <Button variant="outline" size="md" type="button" onClick={() => openPicker('backgroundImageUrl')}>
                📁 Media Library
              </Button>
            </div>
            <Input label="CTA Button Label" value={s.buttonLabel || ''} onChange={(e) => onChange({ ...s, buttonLabel: e.target.value })} />
            <Input label="CTA Button Target URL" value={s.buttonUrl || ''} onChange={(e) => onChange({ ...s, buttonUrl: e.target.value })} placeholder="/admissions" />
          </div>
        );
      }
      case 'heading': {
        const s = section as HeadingSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Heading Text" value={s.title} onChange={(e) => onChange({ ...s, title: e.target.value })} required />
            <Input label="Subheading / Caption" value={s.subtitle || ''} onChange={(e) => onChange({ ...s, subtitle: e.target.value })} />
            <Select
              label="Heading Level"
              value={s.level}
              onChange={(e) => onChange({ ...s, level: e.target.value as 'h1' | 'h2' | 'h3' })}
              options={[
                { label: 'H1 (Main Section Title)', value: 'h1' },
                { label: 'H2 (Subsection Heading)', value: 'h2' },
                { label: 'H3 (Minor Heading)', value: 'h3' },
              ]}
            />
            <Select
              label="Alignment"
              value={s.align || 'left'}
              onChange={(e) => onChange({ ...s, align: e.target.value as 'left' | 'center' | 'right' })}
              options={[
                { label: 'Left Aligned', value: 'left' },
                { label: 'Center Aligned', value: 'center' },
                { label: 'Right Aligned', value: 'right' },
              ]}
            />
          </div>
        );
      }
      case 'richtext': {
        const s = section as RichTextSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Rich Text Content (HTML supported)</label>
            <textarea
              rows={8}
              value={s.content}
              onChange={(e) => onChange({ ...s, content: e.target.value })}
              placeholder="<p>Type paragraph text here...</p>"
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
            />
          </div>
        );
      }
      case 'image': {
        const s = section as ImageSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input label="Image URL" value={s.imageUrl} onChange={(e) => onChange({ ...s, imageUrl: e.target.value })} placeholder="https://..." required />
              </div>
              <Button variant="outline" size="md" type="button" onClick={() => openPicker('imageUrl')}>
                📁 Media Library
              </Button>
            </div>
            <Input label="Alt Text (For accessibility)" value={s.altText || ''} onChange={(e) => onChange({ ...s, altText: e.target.value })} />
            <Input label="Image Caption" value={s.caption || ''} onChange={(e) => onChange({ ...s, caption: e.target.value })} />
            <Select
              label="Alignment"
              value={s.alignment || 'center'}
              onChange={(e) => onChange({ ...s, alignment: e.target.value as 'left' | 'center' | 'right' })}
              options={[
                { label: 'Center', value: 'center' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ]}
            />
          </div>
        );
      }
      case 'imageText': {
        const s = section as ImageTextSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Heading Title" value={s.title} onChange={(e) => onChange({ ...s, title: e.target.value })} required />
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input label="Image URL" value={s.imageUrl} onChange={(e) => onChange({ ...s, imageUrl: e.target.value })} placeholder="https://..." required />
              </div>
              <Button variant="outline" size="md" type="button" onClick={() => openPicker('imageUrl')}>
                📁 Media Library
              </Button>
            </div>
            <Select
              label="Image Position"
              value={s.imagePosition}
              onChange={(e) => onChange({ ...s, imagePosition: e.target.value as 'left' | 'right' })}
              options={[
                { label: 'Image on Left', value: 'left' },
                { label: 'Image on Right', value: 'right' },
              ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Text Content (HTML)</label>
              <textarea
                rows={5}
                value={s.content}
                onChange={(e) => onChange({ ...s, content: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        );
      }
      case 'twoColumn': {
        const s = section as TwoColumnSection;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Column 1 HTML Content</label>
              <textarea
                rows={6}
                value={s.col1Content}
                onChange={(e) => onChange({ ...s, col1Content: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Column 2 HTML Content</label>
              <textarea
                rows={6}
                value={s.col2Content}
                onChange={(e) => onChange({ ...s, col2Content: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        );
      }
      case 'threeColumn': {
        const s = section as ThreeColumnSection;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Col 1 HTML</label>
              <textarea
                rows={5}
                value={s.col1Content}
                onChange={(e) => onChange({ ...s, col1Content: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Col 2 HTML</label>
              <textarea
                rows={5}
                value={s.col2Content}
                onChange={(e) => onChange({ ...s, col2Content: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Col 3 HTML</label>
              <textarea
                rows={5}
                value={s.col3Content}
                onChange={(e) => onChange({ ...s, col3Content: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        );
      }
      case 'cardGrid': {
        const s = section as CardGridSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Grid Section Title" value={s.title || ''} onChange={(e) => onChange({ ...s, title: e.target.value })} placeholder="Feature Cards" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Cards List ({s.cards.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange({
                    ...s,
                    cards: [
                      ...s.cards,
                      { id: `card_${Date.now()}`, title: 'New Card', description: 'Card details...' },
                    ],
                  })
                }
              >
                + Add Card
              </Button>
            </div>
            {s.cards.map((card, idx) => (
              <Card key={card.id || idx} variant="bordered" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Card #{idx + 1}</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...s,
                          cards: s.cards.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <Input label="Title" value={card.title} onChange={(e) => {
                    const newCards = [...s.cards];
                    newCards[idx] = { ...card, title: e.target.value };
                    onChange({ ...s, cards: newCards });
                  }} />
                  <Input label="Description" value={card.description || ''} onChange={(e) => {
                    const newCards = [...s.cards];
                    newCards[idx] = { ...card, description: e.target.value };
                    onChange({ ...s, cards: newCards });
                  }} />
                  <Input label="Icon Name (Optional)" value={card.iconName || ''} onChange={(e) => {
                    const newCards = [...s.cards];
                    newCards[idx] = { ...card, iconName: e.target.value };
                    onChange({ ...s, cards: newCards });
                  }} placeholder="GraduationCap" />
                  <Input label="Card Image URL (Optional)" value={card.imageUrl || ''} onChange={(e) => {
                    const newCards = [...s.cards];
                    newCards[idx] = { ...card, imageUrl: e.target.value };
                    onChange({ ...s, cards: newCards });
                  }} placeholder="https://..." />
                </div>
              </Card>
            ))}
          </div>
        );
      }
      case 'cta': {
        const s = section as CTASection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Call To Action Title" value={s.title} onChange={(e) => onChange({ ...s, title: e.target.value })} required />
            <Input label="Description" value={s.description || ''} onChange={(e) => onChange({ ...s, description: e.target.value })} />
            <Input label="Button Text" value={s.buttonLabel} onChange={(e) => onChange({ ...s, buttonLabel: e.target.value })} required />
            <Input label="Target URL" value={s.buttonUrl} onChange={(e) => onChange({ ...s, buttonUrl: e.target.value })} required />
          </div>
        );
      }
      case 'faq': {
        const s = section as FAQSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="FAQ Title" value={s.title || ''} onChange={(e) => onChange({ ...s, title: e.target.value })} placeholder="Frequently Asked Questions" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Q&A Items ({s.items.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange({
                    ...s,
                    items: [
                      ...s.items,
                      { id: `faq_${Date.now()}`, question: 'Sample Question?', answer: 'Answer details...' },
                    ],
                  })
                }
              >
                + Add FAQ
              </Button>
            </div>
            {s.items.map((item, idx) => (
              <Card key={item.id || idx} variant="bordered" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Q#{idx + 1}</strong>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...s,
                          items: s.items.filter((_, i) => i !== idx),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <Input label="Question" value={item.question} onChange={(e) => {
                    const newItems = [...s.items];
                    newItems[idx] = { ...item, question: e.target.value };
                    onChange({ ...s, items: newItems });
                  }} />
                  <Input label="Answer" value={item.answer} onChange={(e) => {
                    const newItems = [...s.items];
                    newItems[idx] = { ...item, answer: e.target.value };
                    onChange({ ...s, items: newItems });
                  }} />
                </div>
              </Card>
            ))}
          </div>
        );
      }
      case 'noticeList': {
        const s = section as NoticeListSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Notices Section Title" value={s.title || ''} onChange={(e) => onChange({ ...s, title: e.target.value })} placeholder="Latest Circulars & Notices" />
            <Input label="Max Items to Display" type="number" value={s.maxCount || 5} onChange={(e) => onChange({ ...s, maxCount: parseInt(e.target.value) || 5 })} />
          </div>
        );
      }
      case 'documentDownloads': {
        const s = section as DocumentDownloadsSection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Downloads Block Title" value={s.title || ''} onChange={(e) => onChange({ ...s, title: e.target.value })} placeholder="Resource Center & Downloads" />
            <Input
              label="Category Filter (Optional)"
              value={s.categoryFilter || ''}
              onChange={(e) => onChange({ ...s, categoryFilter: e.target.value.trim() || undefined })}
              placeholder="e.g. Admissions — leave blank to show all categories"
            />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              Leave blank to show all published documents. Enter a category name to filter.
            </p>
          </div>
        );
      }
      case 'gallery': {
        const s = section as GallerySection;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Gallery Block Title" value={s.title || ''} onChange={(e) => onChange({ ...s, title: e.target.value })} placeholder="Campus Photo Gallery" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Select Gallery Album</label>
              {albums.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  No published gallery albums found. Create and publish an album in Gallery Admin first.
                </p>
              ) : (
                <select
                  value={s.albumId || ''}
                  onChange={(e) => onChange({ ...s, albumId: e.target.value || undefined })}
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    fontFamily: 'inherit', fontSize: '0.875rem', color: 'var(--text-primary)',
                    backgroundColor: 'var(--input-bg)',
                  }}
                >
                  <option value="">— None (no album selected) —</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.images?.length || 0} photos)
                    </option>
                  ))}
                </select>
              )}
            </div>
            {s.albumId && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Images will be loaded from the selected album in their stored order.
              </p>
            )}
          </div>
        );
      }
      case 'spacer': {
        const s = section as SpacerSection;
        return (
          <Select
            label="Spacer Divider Height"
            value={s.height}
            onChange={(e) => onChange({ ...s, height: e.target.value as 'sm' | 'md' | 'lg' })}
            options={[
              { label: 'Small (24px)', value: 'sm' },
              { label: 'Medium (48px)', value: 'md' },
              { label: 'Large (96px)', value: 'lg' },
            ]}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      {renderEditorContent()}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        allowedType="image"
        onSelectMedia={handleMediaSelect}
      />
    </>
  );
};
