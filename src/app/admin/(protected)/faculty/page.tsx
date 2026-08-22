'use client';

import React, { useEffect, useState } from 'react';
import { Faculty, Department } from '@/types';
import { facultyService, departmentsService } from '@/services/cms-modules.service';
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

import { MediaPickerModal } from '@/components/admin/MediaPickerModal';

export default function AdminFacultyPage() {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFac, setEditingFac] = useState<Faculty | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [qualification, setQualification] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [fData, dData] = await Promise.all([
      facultyService.getAll(),
      departmentsService.getAll(),
    ]);
    setFacultyList(fData);
    setDepartments(dData);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([facultyService.getAll(), departmentsService.getAll()])
      .then(([fData, dData]) => {
        if (alive) {
          setFacultyList(fData);
          setDepartments(dData);
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

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || f.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenCreateModal = () => {
    setEditingFac(null);
    setName('');
    setDesignation('Assistant Professor');
    setDepartmentId(departments[0]?.id || '');
    setQualification('Ph.D. / M.Tech');
    setEmail('');
    setPhotoUrl('');
    setBio('');
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fac: Faculty) => {
    setEditingFac(fac);
    setName(fac.name);
    setDesignation(fac.designation);
    setDepartmentId(fac.departmentId);
    setQualification(fac.qualification || '');
    setEmail(fac.email || '');
    setPhotoUrl(fac.photoUrl || '');
    setBio(fac.bio || '');
    setStatus(fac.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveFaculty = async () => {
    setErrorMessage('');

    if (!name.trim() || !designation.trim() || !departmentId) {
      setErrorMessage('Faculty Name, Designation, and Department are required.');
      return;
    }

    const deptObj = departments.find((d) => d.id === departmentId);

    setIsSaving(true);
    try {
      await facultyService.save({
        id: editingFac?.id,
        name: name.trim(),
        designation: designation.trim(),
        departmentId,
        departmentName: deptObj?.name || '',
        qualification: qualification.trim(),
        email: email.trim(),
        photoUrl: photoUrl.trim(),
        bio: bio.trim(),
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save faculty member.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await facultyService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Academics CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Faculty Directory</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage professors, lecturers, designations, and academic qualifications.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Add Faculty Member
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search faculty by name or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { label: 'All Departments', value: 'all' },
                ...departments.map((d) => ({ label: d.name, value: d.id })),
              ]}
            />
          </div>
          {searchQuery && <Button variant="ghost" size="md" onClick={() => setSearchQuery('')}>Clear</Button>}
        </CardBody>
      </Card>

      {loading ? (
        <Card variant="bordered">
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="2.5rem" />
            <Skeleton height="2.5rem" />
          </CardBody>
        </Card>
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No faculty matching "${searchQuery}"` : 'No Faculty Profiles Added Yet'}
          description="Add academic staff and professor profiles for your college."
          actionLabel={!searchQuery ? '+ Add Faculty Member' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((fac) => (
                  <TableRow key={fac.id}>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{fac.name}</strong></TableCell>
                    <TableCell>{fac.designation}</TableCell>
                    <TableCell><Badge variant="default">{fac.departmentName || 'General'}</Badge></TableCell>
                    <TableCell className="small-text">{fac.qualification}</TableCell>
                    <TableCell>
                      <Badge variant={fac.status === 'published' ? 'success' : 'warning'}>
                        {fac.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(fac)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(fac.id)}>✕</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create/Edit Faculty */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFac ? 'Edit Faculty Member' : 'Add Faculty Member'}
        description="Enter academic designation, department, and contact details."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveFaculty}>
              {editingFac ? 'Save Changes' : 'Add Faculty'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Full Name *" placeholder="e.g. Prof. Alan Turing" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Designation *" placeholder="e.g. Head of Computer Science" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
          <Select
            label="Department *"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
          <Input label="Qualification" placeholder="e.g. Ph.D. in Artificial Intelligence, M.Tech" value={qualification} onChange={(e) => setQualification(e.target.value)} />
          <Input label="Email Address" type="email" placeholder="prof.name@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input label="Photo URL (Optional)" placeholder="https://..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </div>
            <Button variant="outline" size="md" type="button" onClick={() => setIsMediaPickerOpen(true)}>
              📁 Media Library
            </Button>
          </div>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        allowedType="image"
        onSelectMedia={(url) => setPhotoUrl(url)}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Faculty Member?" description="Are you sure you want to remove this profile from the faculty directory?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>This profile will no longer be listed in the public faculty directory.</p>
      </Modal>
    </div>
  );
}
