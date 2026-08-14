'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Badge } from '@/components/ui';

interface GoverningMember {
  id: string;
  name: string;
  designation: string;
  role: string;
  photoUrl: string;
  bio: string;
}

const initialGoverningMembers: GoverningMember[] = [
  {
    id: 'gov-1',
    name: 'Hon. Shri Sharadchandraji Pawar',
    designation: 'President & Managing Trustee',
    role: 'Governing Council President',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    bio: 'Renowned educationist and visionary leader dedicated to rural higher education development.',
  },
  {
    id: 'gov-2',
    name: 'Dr. Ashokrao Shinde',
    designation: 'Vice President',
    role: 'Executive Council Member',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    bio: 'Eminent scientist and former university vice-chancellor.',
  },
  {
    id: 'gov-3',
    name: 'Prin. Dr. S. R. Patil',
    designation: 'Member Secretary & Principal',
    role: 'Ex-Officio Secretary',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    bio: 'Principal of Jaysingpur College and Head of Academic Quality Assurance.',
  },
];

export default function AdminGoverningBodyEditor() {
  const [members, setMembers] = useState<GoverningMember[]>(initialGoverningMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<GoverningMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');

  const handleOpenCreate = () => {
    setEditingMember(null);
    setName('');
    setDesignation('');
    setRole('Council Member');
    setPhotoUrl('');
    setBio('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: GoverningMember) => {
    setEditingMember(member);
    setName(member.name);
    setDesignation(member.designation);
    setRole(member.role);
    setPhotoUrl(member.photoUrl);
    setBio(member.bio);
    setIsModalOpen(true);
  };

  const handleSaveMember = () => {
    if (!name.trim()) return;

    if (editingMember) {
      setMembers(
        members.map((m) => (m.id === editingMember.id ? { ...m, name, designation, role, photoUrl, bio } : m))
      );
    } else {
      const newMember: GoverningMember = {
        id: `gov-${Date.now()}`,
        name,
        designation,
        role,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
        bio,
      };
      setMembers([...members, newMember]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
            📖 Governing Body &amp; Board of Trustees Editor
          </h1>
          <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
            Non-technical manager for updating trust management council and board members displayed on the About Us page.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          ➕ Add Council Member
        </Button>
      </div>

      <Card variant="bordered">
        <CardBody style={{ padding: '1.25rem' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '64px' }}>Photo</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Council Role</TableHead>
                <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '1px solid #DED4C5' }}>
                      <img src={member.photoUrl} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 800, color: '#24221F' }}>{member.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#68705A' }}>{member.bio}</div>
                  </TableCell>
                  <TableCell>{member.designation}</TableCell>
                  <TableCell>
                    <Badge variant="info">{member.role}</Badge>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(member)}>
                        ✏️ Edit
                      </Button>
                      <Button size="sm" variant="ghost" style={{ color: '#DC2626' }} onClick={() => handleDelete(member.id)}>
                        🗑️ Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingMember ? 'Edit Council Member' : 'Add New Council Member'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Full Name *</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Ashokrao Shinde" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Designation *</label>
              <Input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Vice President" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Council Role</label>
              <Input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Executive Member" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Photo URL</label>
              <Input type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Short Bio / Profile</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #DED4C5' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveMember}>Save Member</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
