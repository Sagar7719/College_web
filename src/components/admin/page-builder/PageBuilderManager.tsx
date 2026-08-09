'use client';

import React, { useState } from 'react';
import { PageSection, SectionType } from '@/types';
import { Button, Card, CardBody, Badge, Modal, Select } from '@/components/ui';
import { SectionEditor } from './SectionEditors';

export interface PageBuilderManagerProps {
  sections: PageSection[];
  onChange: (updatedSections: PageSection[]) => void;
}

const SECTION_TYPE_OPTIONS: { label: string; value: SectionType }[] = [
  { label: 'Hero Banner', value: 'hero' },
  { label: 'Heading Block', value: 'heading' },
  { label: 'Rich Text (HTML)', value: 'richtext' },
  { label: 'Single Image', value: 'image' },
  { label: 'Image + Text', value: 'imageText' },
  { label: '2 Column Grid', value: 'twoColumn' },
  { label: '3 Column Grid', value: 'threeColumn' },
  { label: 'Card Grid', value: 'cardGrid' },
  { label: 'Call to Action (CTA)', value: 'cta' },
  { label: 'FAQ Accordion', value: 'faq' },
  { label: 'Notice List Embed', value: 'noticeList' },
  { label: 'Document Downloads Embed', value: 'documentDownloads' },
  { label: 'Gallery Grid Embed', value: 'gallery' },
  { label: 'Spacer Divider', value: 'spacer' },
];

export const PageBuilderManager: React.FC<PageBuilderManagerProps> = ({ sections, onChange }) => {
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [selectedNewType, setSelectedNewType] = useState<SectionType>('heading');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 1. Reorder Up
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;
    onChange(newSections);
  };

  // 2. Reorder Down
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;
    onChange(newSections);
  };

  // 3. Toggle Hide / Show
  const toggleVisibility = (index: number) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      visible: newSections[index].visible === false ? true : false,
    };
    onChange(newSections);
  };

  // 4. Duplicate Section
  const duplicateSection = (index: number) => {
    const target = sections[index];
    const cloned: PageSection = JSON.parse(JSON.stringify(target));
    cloned.id = `sec_${target.type}_${Date.now()}`;
    const newSections = [...sections];
    newSections.splice(index + 1, 0, cloned);
    onChange(newSections);
  };

  // 5. Delete Section
  const confirmDelete = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
    setDeleteConfirmId(null);
  };

  // 6. Add New Section Block
  const handleCreateSection = () => {
    const id = `sec_${selectedNewType}_${Date.now()}`;
    let newSection: PageSection;

    switch (selectedNewType) {
      case 'hero':
        newSection = { id, type: 'hero', title: 'New Hero Title', subtitle: 'Hero subtitle text...', visible: true };
        break;
      case 'heading':
        newSection = { id, type: 'heading', title: 'New Section Title', level: 'h2', align: 'left', visible: true };
        break;
      case 'richtext':
        newSection = { id, type: 'richtext', content: '<p>Enter formatted paragraph content here...</p>', visible: true };
        break;
      case 'image':
        newSection = { id, type: 'image', imageUrl: 'https://via.placeholder.com/800x400', altText: 'Sample Image', visible: true };
        break;
      case 'imageText':
        newSection = { id, type: 'imageText', title: 'Image & Text Heading', content: '<p>Side-by-side text content...</p>', imageUrl: 'https://via.placeholder.com/600x400', imagePosition: 'left', visible: true };
        break;
      case 'twoColumn':
        newSection = { id, type: 'twoColumn', col1Content: '<p>Column 1 content...</p>', col2Content: '<p>Column 2 content...</p>', visible: true };
        break;
      case 'threeColumn':
        newSection = { id, type: 'threeColumn', col1Content: '<p>Col 1</p>', col2Content: '<p>Col 2</p>', col3Content: '<p>Col 3</p>', visible: true };
        break;
      case 'cardGrid':
        newSection = { id, type: 'cardGrid', title: 'Featured Cards', cards: [{ id: 'c1', title: 'Feature 1', description: 'Feature details...' }], visible: true };
        break;
      case 'cta':
        newSection = { id, type: 'cta', title: 'Call To Action Title', buttonLabel: 'Learn More', buttonUrl: '/contact', visible: true };
        break;
      case 'faq':
        newSection = { id, type: 'faq', title: 'Frequently Asked Questions', items: [{ id: 'q1', question: 'Sample Question?', answer: 'Sample Answer.' }], visible: true };
        break;
      case 'noticeList':
        newSection = { id, type: 'noticeList', title: 'Latest College Notices', maxCount: 5, visible: true };
        break;
      case 'documentDownloads':
        newSection = { id, type: 'documentDownloads', title: 'Resource Downloads', visible: true };
        break;
      case 'gallery':
        newSection = { id, type: 'gallery', title: 'Photo Gallery', visible: true };
        break;
      case 'spacer':
        newSection = { id, type: 'spacer', height: 'md', visible: true };
        break;
      default:
        return;
    }

    onChange([...sections, newSection]);
    setIsAddModalOpen(false);
  };

  // 7. Save Edited Section in Modal
  const handleSaveEditedSection = (updated: PageSection) => {
    onChange(sections.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Page Sections ({sections.length})</h3>
        <Button variant="primary" size="sm" type="button" onClick={() => setIsAddModalOpen(true)}>
          + Add Section Block
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card variant="bordered" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            No section blocks added yet. Click &quot;+ Add Section Block&quot; to build page content.
          </p>
          <Button variant="outline" size="sm" type="button" onClick={() => setIsAddModalOpen(true)}>
            + Add First Section
          </Button>
        </Card>
      ) : (
        sections.map((section, idx) => {
          const isHidden = section.visible === false;
          return (
            <Card
              key={section.id}
              variant="bordered"
              style={{
                opacity: isHidden ? 0.6 : 1,
                borderColor: isHidden ? 'var(--border-dark)' : 'var(--border-color)',
              }}
            >
              <CardBody style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ cursor: 'grab', fontSize: '1.25rem' }}>☰</span>
                  <Badge variant="info">{section.type.toUpperCase()}</Badge>
                  <strong style={{ color: 'var(--primary)' }}>
                    {'title' in section && section.title ? String(section.title) : `Section #${idx + 1}`}
                  </strong>
                  {isHidden && <Badge variant="warning">Hidden</Badge>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {/* Reorder Up */}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    aria-label="Move section up"
                  >
                    ↑
                  </Button>
                  {/* Reorder Down */}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === sections.length - 1}
                    aria-label="Move section down"
                  >
                    ↓
                  </Button>
                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setEditingSection(section)}
                    aria-label="Edit section content"
                  >
                    Edit
                  </Button>
                  {/* Hide/Show */}
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => toggleVisibility(idx)}
                    aria-label={isHidden ? 'Show section on public website' : 'Hide section from public website'}
                  >
                    {isHidden ? 'Show' : 'Hide'}
                  </Button>
                  {/* Duplicate */}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => duplicateSection(idx)}
                    aria-label="Duplicate section block"
                  >
                    Clone
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => setDeleteConfirmId(section.id)}
                    aria-label="Delete section block"
                  >
                    ✕
                  </Button>
                </div>
              </CardBody>
            </Card>
          );
        })
      )}

      {/* Modal 1: Add New Section Block */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Page Section Block"
        description="Select from 14 predefined layout section blocks."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSection}>
              Add Block
            </Button>
          </>
        }
      >
        <Select
          label="Choose Section Type"
          value={selectedNewType}
          onChange={(e) => setSelectedNewType(e.target.value as SectionType)}
          options={SECTION_TYPE_OPTIONS}
        />
      </Modal>

      {/* Modal 2: Edit Section Content */}
      <Modal
        isOpen={Boolean(editingSection)}
        onClose={() => setEditingSection(null)}
        title={`Edit ${editingSection?.type.toUpperCase()} Section`}
        description="Configure section heading, text, imagery, and layout parameters."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => editingSection && handleSaveEditedSection(editingSection)}
            >
              Save Section Changes
            </Button>
          </>
        }
      >
        {editingSection && (
          <SectionEditor
            section={editingSection}
            onChange={(updated) => setEditingSection(updated)}
          />
        )}
      </Modal>

      {/* Modal 3: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Section Block?"
        description="This will remove this section from the page configuration. Are you sure?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Deleting a section removes its block layout. You can also hide the section instead if you wish to temporarily unpublish it.
        </p>
      </Modal>
    </div>
  );
};
