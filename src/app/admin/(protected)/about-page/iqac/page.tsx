'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';

export default function AdminIQACEditor() {
  const [naacGrade, setNaacGrade] = useState('A+ Grade (3.38 CGPA)');
  const [cycle, setCycle] = useState('3rd Re-accreditation Cycle');
  const [coordinator, setCoordinator] = useState('Dr. M. B. Kamble');
  const [coordinatorEmail, setCoordinatorEmail] = useState('iqac@jaysingpurcollege.edu.in');
  const [iqacVision, setIqacVision] = useState(
    'To build and ensure a quality culture at the institutional level by internalizing academic and administrative quality measures.'
  );

  const [reports, setReports] = useState([
    { id: '1', year: '2024-2025', title: 'AQAR Report 2024-25', status: 'Published' },
    { id: '2', year: '2023-2024', title: 'AQAR Report 2023-24', status: 'Published' },
    { id: '3', year: '2022-2023', title: 'AQAR Report 2022-23', status: 'Published' },
  ]);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccessMsg('IQAC Cell & NAAC Accreditation details updated successfully!');
    }, 400);
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#24221F', margin: 0 }}>
          📖 IQAC Cell &amp; NAAC Accreditation Editor
        </h1>
        <p style={{ color: '#68705A', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
          Non-technical editor for NAAC accreditation scores, IQAC Coordinator details, and AQAR annual reports.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1rem', background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      <Card variant="bordered">
        <CardBody style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                NAAC Accreditation Grade &amp; Score *
              </label>
              <Input type="text" value={naacGrade} onChange={(e) => setNaacGrade(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Accreditation Cycle
              </label>
              <Input type="text" value={cycle} onChange={(e) => setCycle(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                IQAC Director / Coordinator Name
              </label>
              <Input type="text" value={coordinator} onChange={(e) => setCoordinator(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
                Coordinator Official Email
              </label>
              <Input type="email" value={coordinatorEmail} onChange={(e) => setCoordinatorEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#24221F', marginBottom: '0.35rem' }}>
              IQAC Quality Policy &amp; Vision Statement
            </label>
            <textarea
              rows={4}
              value={iqacVision}
              onChange={(e) => setIqacVision(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #DED4C5', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#24221F', marginBottom: '0.75rem' }}>
              Published Annual Quality Assurance Reports (AQAR)
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Report Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell style={{ fontWeight: 800 }}>{r.year}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell><Badge variant="success">{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="primary" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2rem' }}>
              {saving ? 'Saving...' : '💾 Save IQAC Details'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
