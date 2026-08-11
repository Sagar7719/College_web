'use client';

import React, { useEffect, useState } from 'react';
import { FooterColumn, FooterLink, SiteSettings, OptionGroup } from '@/types';
import { siteSettingsService, defaultFooterColumns } from '@/services/site-settings.service';
import { footerPagesService, SelectablePageOption } from '@/services/footer-pages.service';
import { isValidExternalUrl } from '@/validations/navigation.schema';
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
} from '@/components/ui';

export default function AdminFooterManagerScreen() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [selectablePages, setSelectablePages] = useState<SelectablePageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<{ colId: string; link: FooterLink } | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkType, setLinkType] = useState<'existing' | 'external'>('existing');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [externalUrl, setExternalUrl] = useState('https://');
  const [linkVisible, setLinkVisible] = useState(true);
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Column Modal State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [columnTitle, setColumnTitle] = useState('');
  const [columnVisible, setColumnVisible] = useState(true);

  // Delete Confirm Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<
    | { type: 'column'; colId: string; title: string }
    | { type: 'link'; colId: string; linkId: string; label: string }
    | null
  >(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, pages] = await Promise.all([
        siteSettingsService.getSettings(),
        footerPagesService.getSelectablePages(),
      ]);
      setSettings(fetchedSettings);
      const cols = fetchedSettings.footerConfig?.columns || defaultFooterColumns;
      setColumns(cols);
      setSelectablePages(pages);
      if (cols.length > 0) {
        setSelectedColumnId(cols[0].id);
      }
    } catch (err) {
      console.warn('Footer manager data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    Promise.all([
      siteSettingsService.getSettings(),
      footerPagesService.getSelectablePages(),
    ])
      .then(([fetchedSettings, pages]) => {
        if (alive) {
          setSettings(fetchedSettings);
          const cols = fetchedSettings.footerConfig?.columns || defaultFooterColumns;
          setColumns(cols);
          setSelectablePages(pages);
          if (cols.length > 0) {
            setSelectedColumnId(cols[0].id);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const saveFooterColumnsToDb = async (newColumns: FooterColumn[]) => {
    if (!settings) return;
    setIsSaving(true);
    setErrorMessage('');
    try {
      const updatedFooterConfig = {
        ...settings.footerConfig,
        columns: newColumns,
      };
      await siteSettingsService.updateSettings({
        footerConfig: updatedFooterConfig,
      });
      setColumns(newColumns);
      setSettings({
        ...settings,
        footerConfig: updatedFooterConfig,
      });
      setStatusMessage({ type: 'success', text: 'Footer configuration saved successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save footer configuration.';
      setErrorMessage(msg);
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // --- COLUMN MANAGEMENT ---
  const handleOpenAddColumnModal = () => {
    setEditingColumn(null);
    setColumnTitle('');
    setColumnVisible(true);
    setErrorMessage('');
    setIsColumnModalOpen(true);
  };

  const handleOpenEditColumnModal = (col: FooterColumn) => {
    setEditingColumn(col);
    setColumnTitle(col.title);
    setColumnVisible(col.visible);
    setErrorMessage('');
    setIsColumnModalOpen(true);
  };

  const handleSaveColumnModal = async () => {
    if (!columnTitle.trim()) {
      setErrorMessage('Column title is required.');
      return;
    }

    let updatedCols: FooterColumn[] = [];
    if (editingColumn) {
      updatedCols = columns.map((col) =>
        col.id === editingColumn.id
          ? { ...col, title: columnTitle.trim(), visible: columnVisible }
          : col
      );
    } else {
      const newColId = `col_${Date.now()}`;
      const newCol: FooterColumn = {
        id: newColId,
        title: columnTitle.trim(),
        order: columns.length,
        visible: columnVisible,
        links: [],
      };
      updatedCols = [...columns, newCol];
      setSelectedColumnId(newColId);
    }

    setIsColumnModalOpen(false);
    await saveFooterColumnsToDb(updatedCols);
  };

  const moveColumn = async (colIndex: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? colIndex - 1 : colIndex + 1;
    if (targetIdx < 0 || targetIdx >= columns.length) return;

    const copy = [...columns];
    const temp = copy[colIndex];
    copy[colIndex] = copy[targetIdx];
    copy[targetIdx] = temp;

    const reindexed = copy.map((col, idx) => ({ ...col, order: idx }));
    await saveFooterColumnsToDb(reindexed);
  };

  const confirmDeleteColumn = async (colId: string) => {
    const updated = columns
      .filter((col) => col.id !== colId)
      .map((col, idx) => ({ ...col, order: idx }));
    setDeleteConfirmTarget(null);
    await saveFooterColumnsToDb(updated);
  };

  // --- LINK MANAGEMENT ---
  const handleOpenAddLinkModal = (colId?: string) => {
    const targetColId = colId || selectedColumnId || columns[0]?.id || '';
    setSelectedColumnId(targetColId);
    setEditingLink(null);
    setLinkLabel('');
    setLinkType('existing');
    const firstOption = selectablePages[0];
    if (firstOption) {
      setSelectedPageId(firstOption.id);
      setLinkLabel(firstOption.title);
    } else {
      setSelectedPageId('');
    }
    setExternalUrl('https://');
    setLinkVisible(true);
    setOpenInNewTab(false);
    setErrorMessage('');
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLinkModal = (colId: string, link: FooterLink) => {
    setSelectedColumnId(colId);
    setEditingLink({ colId, link });
    setLinkLabel(link.label);

    if (link.type === 'external' || link.isExternal) {
      setLinkType('external');
      setExternalUrl(link.path);
    } else {
      setLinkType('existing');
      // Match existing selectable page option
      const matched = selectablePages.find(
        (p) =>
          (link.pageId && p.pageId === link.pageId) ||
          (link.systemKey && p.systemKey === link.systemKey) ||
          p.path === link.path
      );
      if (matched) {
        setSelectedPageId(matched.id);
      } else if (selectablePages.length > 0) {
        setSelectedPageId(selectablePages[0].id);
      }
    }

    setLinkVisible(link.visible);
    setOpenInNewTab(link.targetBlank || false);
    setErrorMessage('');
    setIsLinkModalOpen(true);
  };

  const handleSelectPageOption = (optId: string) => {
    setSelectedPageId(optId);
    const selectedOpt = selectablePages.find((p) => p.id === optId);
    if (selectedOpt && (!linkLabel.trim() || linkLabel === selectedOpt.title || editingLink === null)) {
      setLinkLabel(selectedOpt.title);
    }
  };

  const handleSaveLinkModal = async () => {
    if (!selectedColumnId) {
      setErrorMessage('Please select a target footer column.');
      return;
    }
    if (!linkLabel.trim()) {
      setErrorMessage('Link label is required.');
      return;
    }

    let finalPath = '';
    let finalType: FooterLink['type'] = 'system';
    let pageId: string | undefined = undefined;
    let systemKey: string | undefined = undefined;
    let isSystemPage: boolean | undefined = undefined;
    let isExternal = false;

    if (linkType === 'existing') {
      const selectedOpt = selectablePages.find((p) => p.id === selectedPageId);
      if (!selectedOpt) {
        setErrorMessage('Please select an existing page from the dropdown.');
        return;
      }
      finalPath = selectedOpt.path;
      finalType = selectedOpt.type;
      pageId = selectedOpt.pageId;
      systemKey = selectedOpt.systemKey;
      isSystemPage = selectedOpt.isSystemPage;
    } else {
      if (!isValidExternalUrl(externalUrl)) {
        setErrorMessage('Please enter a valid external URL starting with http:// or https://');
        return;
      }
      finalPath = externalUrl.trim();
      finalType = 'external';
      isExternal = true;
    }

    const targetCol = columns.find((c) => c.id === selectedColumnId);
    if (!targetCol) {
      setErrorMessage('Selected footer column not found.');
      return;
    }

    let updatedLinks = [...targetCol.links];
    if (editingLink) {
      // If column changed during edit, remove from old column first
      if (editingLink.colId !== selectedColumnId) {
        const oldCol = columns.find((c) => c.id === editingLink.colId);
        if (oldCol) {
          oldCol.links = oldCol.links.filter((l) => l.id !== editingLink.link.id);
        }
      }
      updatedLinks = updatedLinks.map((l) => {
        if (l.id === editingLink.link.id) {
          return {
            ...l,
            label: linkLabel.trim(),
            type: finalType,
            path: finalPath,
            pageId,
            systemKey,
            isSystemPage,
            isExternal,
            targetBlank: isExternal ? openInNewTab : undefined,
            visible: linkVisible,
          };
        }
        return l;
      });
    } else {
      const newLinkId = `link_${Date.now()}`;
      const newLink: FooterLink = {
        id: newLinkId,
        label: linkLabel.trim(),
        type: finalType,
        path: finalPath,
        pageId,
        systemKey,
        isSystemPage,
        isExternal,
        targetBlank: isExternal ? openInNewTab : undefined,
        order: targetCol.links.length,
        visible: linkVisible,
      };
      updatedLinks.push(newLink);
    }

    const updatedCols = columns.map((col) => {
      if (col.id === selectedColumnId) {
        return {
          ...col,
          links: updatedLinks.map((l, idx) => ({ ...l, order: idx })),
        };
      }
      return col;
    });

    setIsLinkModalOpen(false);
    await saveFooterColumnsToDb(updatedCols);
  };

  const moveLink = async (colId: string, linkIndex: number, direction: 'up' | 'down') => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return;

    const targetIdx = direction === 'up' ? linkIndex - 1 : linkIndex + 1;
    if (targetIdx < 0 || targetIdx >= col.links.length) return;

    const copyLinks = [...col.links];
    const temp = copyLinks[linkIndex];
    copyLinks[linkIndex] = copyLinks[targetIdx];
    copyLinks[targetIdx] = temp;

    const reindexedLinks = copyLinks.map((l, idx) => ({ ...l, order: idx }));

    const updatedCols = columns.map((c) =>
      c.id === colId ? { ...c, links: reindexedLinks } : c
    );

    await saveFooterColumnsToDb(updatedCols);
  };

  const toggleLinkVisibility = async (colId: string, linkId: string) => {
    const updatedCols = columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          links: col.links.map((l) => (l.id === linkId ? { ...l, visible: !l.visible } : l)),
        };
      }
      return col;
    });
    await saveFooterColumnsToDb(updatedCols);
  };

  const confirmDeleteLink = async (colId: string, linkId: string) => {
    const updatedCols = columns.map((col) => {
      if (col.id === colId) {
        return {
          ...col,
          links: col.links.filter((l) => l.id !== linkId).map((l, idx) => ({ ...l, order: idx })),
        };
      }
      return col;
    });
    setDeleteConfirmTarget(null);
    await saveFooterColumnsToDb(updatedCols);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Footer Navigation Architecture</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Footer Links &amp; Columns Manager</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage dynamic columns and page links displayed in the public website footer without creating duplicate pages.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="md" onClick={handleOpenAddColumnModal}>
            + Add Footer Column
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenAddLinkModal()}>
            + Add Footer Link
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: statusMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: statusMessage.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${statusMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>{statusMessage.type === 'success' ? '✅' : '⚠️'}</span>
          <p style={{ margin: 0, fontWeight: 500 }}>{statusMessage.text}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
          </CardBody>
        </Card>
      ) : columns.length === 0 ? (
        <EmptyState
          title="No Footer Columns Configured"
          description="Create your first footer column (e.g. Quick Links, Resources) to start organizing footer links."
          actionLabel="+ Add Footer Column"
          onAction={handleOpenAddColumnModal}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {columns
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((col, colIdx) => {
              return (
                <Card key={col.id} variant="bordered" style={{ opacity: col.visible ? 1 : 0.75 }}>
                  {/* Column Card Header */}
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Column #{colIdx + 1}
                      </span>
                      <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: 0 }}>
                        {col.title}
                      </h2>
                      <Badge variant={col.visible ? 'success' : 'danger'}>
                        {col.visible ? 'Visible' : 'Hidden Column'}
                      </Badge>
                      <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                        ({col.links.length} {col.links.length === 1 ? 'link' : 'links'})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={colIdx === 0}
                        onClick={() => moveColumn(colIdx, 'up')}
                        title="Move column left/up"
                      >
                        ◀ Left
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={colIdx === columns.length - 1}
                        onClick={() => moveColumn(colIdx, 'down')}
                        title="Move column right/down"
                      >
                        Right ▶
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditColumnModal(col)}>
                        Edit Title
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAddLinkModal(col.id)}
                      >
                        + Add Link
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirmTarget({ type: 'column', colId: col.id, title: col.title })}
                        title="Delete entire column"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  {/* Column Links Table */}
                  <CardBody style={{ padding: 0 }}>
                    {col.links.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No links in <strong>{col.title}</strong> column yet.{' '}
                        <button
                          onClick={() => handleOpenAddLinkModal(col.id)}
                          style={{ color: 'var(--primary)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + Add Link Now
                        </button>
                      </div>
                    ) : (
                      <Table responsive>
                        <TableHeader>
                          <TableRow>
                            <TableHead style={{ width: '60px' }}>Order</TableHead>
                            <TableHead>Link Display Label</TableHead>
                            <TableHead>Target Route &amp; Type</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {col.links
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((link, linkIdx) => {
                              const isSys = link.type === 'system' || link.isSystemPage;
                              const isExt = link.type === 'external' || link.isExternal;

                              return (
                                <TableRow key={link.id} style={{ opacity: link.visible ? 1 : 0.6 }}>
                                  <TableCell style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                    #{linkIdx + 1}
                                  </TableCell>
                                  <TableCell>
                                    <strong style={{ color: 'var(--text-main)' }}>{link.label}</strong>
                                    {link.targetBlank && (
                                      <Badge variant="default" style={{ fontSize: '0.6875rem', marginLeft: '0.5rem' }}>
                                        New Tab
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                      <Badge variant={isSys ? 'info' : isExt ? 'warning' : 'default'}>
                                        {isSys ? 'SYSTEM' : isExt ? 'EXTERNAL' : 'CUSTOM CMS'}
                                      </Badge>
                                      <span className="small-text">{link.path}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={link.visible ? 'success' : 'danger'}>
                                      {link.visible ? 'Visible' : 'Hidden'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', flexWrap: 'wrap' }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={linkIdx === 0}
                                        onClick={() => moveLink(col.id, linkIdx, 'up')}
                                        title="Move link up"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={linkIdx === col.links.length - 1}
                                        onClick={() => moveLink(col.id, linkIdx, 'down')}
                                        title="Move link down"
                                      >
                                        ↓
                                      </Button>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => toggleLinkVisibility(col.id, link.id)}
                                      >
                                        {link.visible ? 'Hide' : 'Show'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEditLinkModal(col.id, link)}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setDeleteConfirmTarget({ type: 'link', colId: col.id, linkId: link.id, label: link.label })}
                                        title="Remove link"
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              );
            })}
        </div>
      )}

      {/* Modal 1: Create / Edit Link */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLink ? 'Edit Footer Link' : 'Add New Footer Link'}
        description="Select an existing page or external URL to display in the website footer column."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveLinkModal}>
              {editingLink ? 'Save Changes' : 'Add Footer Link'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--semantic-error-bg)',
                color: 'var(--semantic-error)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          <Select
            label="Target Footer Column *"
            value={selectedColumnId}
            onChange={(e) => setSelectedColumnId(e.target.value)}
            options={columns.map((c) => ({ label: `Column: ${c.title}`, value: c.id }))}
          />

          <Select
            label="Link Destination Type *"
            value={linkType}
            onChange={(e) => {
              const val = e.target.value as 'existing' | 'external';
              setLinkType(val);
              if (val === 'existing' && selectablePages.length > 0) {
                handleSelectPageOption(selectablePages[0].id);
              }
            }}
            options={[
              { label: '📌 Existing Page (System or Custom CMS Page)', value: 'existing' },
              { label: '🌐 External Web Link (http:// or https://)', value: 'external' },
            ]}
          />

          {linkType === 'existing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Select
                label="Select Existing Page / Route *"
                value={selectedPageId}
                onChange={(e) => handleSelectPageOption(e.target.value)}
                groups={[
                  {
                    label: 'System Pages',
                    options: selectablePages
                      .filter((p) => p.category === 'system_page')
                      .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id })),
                  },
                  {
                    label: 'System Modules',
                    options: selectablePages
                      .filter((p) => p.category === 'system_module')
                      .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id })),
                  },
                  {
                    label: 'Custom CMS Pages',
                    options:
                      selectablePages.filter((p) => p.category === 'custom_page').length > 0
                        ? selectablePages
                            .filter((p) => p.category === 'custom_page')
                            .map((p) => ({ label: `${p.title} (${p.path})`, value: p.id }))
                        : [{ label: 'No published custom pages found', value: '', disabled: true }],
                  },
                ].filter((g) => g.options.length > 0)}
              />
              <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                Selecting an existing page reuses its canonical path automatically without creating duplicate page documents.
              </span>
            </div>
          )}

          {linkType === 'external' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Input
                label="External URL *"
                placeholder="https://example.com"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="targetBlankFooter"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="targetBlankFooter" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                  Open external link in a new browser tab (target=&quot;_blank&quot;)
                </label>
              </div>
            </div>
          )}

          <Input
            label="Menu Display Label *"
            placeholder="e.g. Photo Gallery & Albums"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            required
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="linkVisibleCheck"
              checked={linkVisible}
              onChange={(e) => setLinkVisible(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="linkVisibleCheck" style={{ fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
              Visible in Public Website Footer
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Create / Edit Column */}
      <Modal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        title={editingColumn ? 'Edit Footer Column Title' : 'Add New Footer Column'}
        description="Configure column header title and visibility in the public footer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsColumnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveColumnModal}>
              {editingColumn ? 'Save Changes' : 'Add Column'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--semantic-error-bg)',
                color: 'var(--semantic-error)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          <Input
            label="Column Title Header *"
            placeholder="e.g. Student Services or Quick Links"
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            required
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="columnVisibleCheck"
              checked={columnVisible}
              onChange={(e) => setColumnVisible(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="columnVisibleCheck" style={{ fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
              Visible in Public Website Footer
            </label>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleteConfirmTarget)}
        onClose={() => setDeleteConfirmTarget(null)}
        title={deleteConfirmTarget?.type === 'column' ? 'Delete Footer Column?' : 'Remove Footer Link?'}
        description={
          deleteConfirmTarget?.type === 'column'
            ? `Are you sure you want to delete column "${deleteConfirmTarget.title}" and all its links?`
            : `Are you sure you want to remove link "${deleteConfirmTarget?.label}" from the footer?`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isSaving}
              onClick={() => {
                if (!deleteConfirmTarget) return;
                if (deleteConfirmTarget.type === 'column') {
                  confirmDeleteColumn(deleteConfirmTarget.colId);
                } else {
                  confirmDeleteLink(deleteConfirmTarget.colId, deleteConfirmTarget.linkId);
                }
              }}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Removing footer items only modifies the public footer navigation menu. <strong>No underlying system routes or CMS pages will be deleted.</strong>
        </p>
      </Modal>
    </div>
  );
}
