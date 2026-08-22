'use client';

import React, { useEffect, useState } from 'react';
import { Course, Department } from '@/types';
import { coursesService, departmentsService } from '@/services/cms-modules.service';
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

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [degreeType, setDegreeType] = useState<'UG' | 'PG' | 'Diploma' | 'Doctoral'>('UG');
  const [durationYears, setDurationYears] = useState(3);
  const [eligibility, setEligibility] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cData, dData] = await Promise.all([
      coursesService.getAll(),
      departmentsService.getAll(),
    ]);
    setCourses(cData);
    setDepartments(dData);
    setLoading(false);
  };

  useEffect(() => {
    let alive = true;
    Promise.all([coursesService.getAll(), departmentsService.getAll()])
      .then(([cData, dData]) => {
        if (alive) {
          setCourses(cData);
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

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'all' || c.departmentId === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCode('');
    setDepartmentId(departments[0]?.id || '');
    setDegreeType('UG');
    setDurationYears(3);
    setEligibility('');
    setDescription('');
    setStatus('published');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setCode(c.code);
    setDepartmentId(c.departmentId);
    setDegreeType(c.degreeType);
    setDurationYears(c.durationYears);
    setEligibility(c.eligibility || '');
    setDescription(c.description || '');
    setStatus(c.status);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSaveCourse = async () => {
    setErrorMessage('');

    if (!title.trim() || !code.trim() || !departmentId) {
      setErrorMessage('Course Title, Code, and Department selection are required.');
      return;
    }

    const deptObj = departments.find((d) => d.id === departmentId);

    setIsSaving(true);
    try {
      await coursesService.save({
        id: editingCourse?.id,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        departmentId,
        departmentName: deptObj?.name || '',
        degreeType,
        durationYears,
        eligibility: eligibility.trim(),
        description: description.trim(),
        status,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save course.';
      setErrorMessage(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    await coursesService.delete(id);
    setDeleteConfirmId(null);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="info" style={{ marginBottom: '0.375rem' }}>Academics CMS</Badge>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>Courses & Degree Programs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage undergraduate, postgraduate, and diploma degree programs.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
          + Add Course
        </Button>
      </div>

      <Card variant="bordered" style={{ marginBottom: '1.5rem' }}>
        <CardBody style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search courses by title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ width: '220px' }}>
            <Select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
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
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title={searchQuery ? `No courses matching "${searchQuery}"` : 'No Courses Configured Yet'}
          description="Add degree programs offered by your college departments."
          actionLabel={!searchQuery ? '+ Add Course' : undefined}
          onAction={!searchQuery ? handleOpenCreateModal : undefined}
        />
      ) : (
        <Card variant="bordered">
          <CardBody style={{ padding: 0 }}>
            <Table responsive>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Degree Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Badge variant="default">{c.code}</Badge></TableCell>
                    <TableCell><strong style={{ color: 'var(--primary)' }}>{c.title}</strong></TableCell>
                    <TableCell>{c.degreeType}</TableCell>
                    <TableCell>{c.durationYears} Years</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'published' ? 'success' : 'warning'}>
                        {c.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(c)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(c.id)}>✕</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Modal: Create/Edit Course */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course Program' : 'Add Course Program'}
        description="Select department and enter course degree rules."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" isLoading={isSaving} onClick={handleSaveCourse}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && <div style={{ color: 'var(--semantic-error)', backgroundColor: 'var(--semantic-error-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>⚠️ {errorMessage}</div>}
          <Input label="Course Program Title *" placeholder="e.g. B.Tech Computer Science" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Course Code *" placeholder="e.g. CS-101" value={code} onChange={(e) => setCode(e.target.value)} required />
          <Select
            label="Department *"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Degree Level"
              value={degreeType}
              onChange={(e) => setDegreeType(e.target.value as 'UG' | 'PG' | 'Diploma' | 'Doctoral')}
              options={[
                { label: 'Undergraduate (UG)', value: 'UG' },
                { label: 'Postgraduate (PG)', value: 'PG' },
                { label: 'Diploma', value: 'Diploma' },
                { label: 'Doctoral (Ph.D.)', value: 'Doctoral' },
              ]}
            />
            <Input
              label="Duration (Years)"
              type="number"
              value={durationYears}
              onChange={(e) => setDurationYears(parseFloat(e.target.value) || 1)}
            />
          </div>
          <Input label="Eligibility Criteria" placeholder="e.g. 10+2 with 60% aggregate in Physics & Math" value={eligibility} onChange={(e) => setEligibility(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')} options={[{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }, { label: 'Archived', value: 'archived' }]} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} title="Delete Course?" description="Are you sure you want to remove this course program?" footer={<><Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteConfirmId && confirmDelete(deleteConfirmId)}>Confirm Delete</Button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>Removing a course program removes its public academic listing.</p>
      </Modal>
    </div>
  );
}
