'use client';

import React, { useEffect, useState } from 'react';
import { Department } from '@/types';
import { departmentsService } from '@/services/cms-modules.service';
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

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await departmentsService.getAll();
    setDepartments(data);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    departmentsService.getAll()
      .then((data) => { if (alive) { setDepartments(data); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filteredDepts = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setHodName('');
    setDescription('');
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setHodName(dept.hodName || '');
    setDescription(dept.description || '');
    setStatus(dept.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    setErrorMessage('');

    if (!name.trim() || !code.trim()) {
      setErrorMessage('Department Name and Short Code are required.');
      return;
    }

    setIsSaving(true);
    try {
      await departmentsService.save({
        id: editingDept?.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        hodName: hodName.trim(),
        description: description.trim(),
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save department.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveDepartment = async (dept: Department) => {
    const nextStatus = dept.status === 'archived' ? 'published' : 'archived';
    await departmentsService.save({ ...dept, status: nextStatus });
    loadData();
  };

  const confirmDelete = async (id: string) => {
    await departmentsService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Academics CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Academic Departments</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage college faculties, department codes, and Heads of Departments (HOD).
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Add Department
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search departments by name or short code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' },
                { label: 'Archived', value: 'archived' },
              ]}
            />
          </div>
          {searchQuery && (
            <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>Clear</Button>
          )}
        </CardBody>
      </Card>

      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </CardBody>
        </Card>
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No departments matching "${searchQuery}"` : 'No Departments Added Yet'}
          description="Create your first academic department to organize courses and faculty profiles."
          actionLabel={!searchQuery ? '+ Add Department' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Head of Department (HOD)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepts.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell><Badge variant="default">{dept.code}</Badge></TableCell>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{dept.name}</strong></TableCell>
                    <TableCell>{dept.hodName || 'Not Assigned'}</TableCell>
                    <TableCell>
                      <Badge variant={dept.status === 'published' ? 'success' : dept.status === 'draft' ? 'warning' : 'danger'}>
                        {dept.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(dept)}>Edit</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleArchiveDepartment(dept)}>
                          {dept.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(dept.id)}>✕</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add Academic Department'}
        description="Configure department title, short code, and HOD details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveDepartment}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Department Name *" placeholder="e.g. Computer Science & Engineering" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Department Short Code *" placeholder="e.g. CSE" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Input label="Head of Department (HOD Name)" placeholder="e.g. Dr. Robert Vance" value={hodName} onChange={(e) => setHodName(e.target.value)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>Description</label>
            <textarea rows={3} placeholder="Department overview..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'inherit' }} />
          </div>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Department?" description="Are you sure you want to delete this department record?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>Deleting a department removes its record from the database. Make sure no active courses or faculty members depend on it.</p>
      </Modal>
    </div>
  );
}
