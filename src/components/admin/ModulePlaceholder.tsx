import React from 'react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import Link from 'next/link';

export interface ModulePlaceholderProps {
  title: string;
  moduleName: string;
  targetPhase: string;
  icon?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  moduleName,
  targetPhase,
  icon = '📦',
}) => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>CMS Module Placeholder</Badge>
        <h1>{title}</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Management interface for {moduleName}.
        </p>
      </div>

      <Card variant="bordered">
        <CardBody style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
          <h2>{title} Shell Ready</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '1rem auto 1.5rem', lineHeight: 1.6 }}>
            The protected routing shell and data services for {moduleName} are fully configured. Full CRUD management will be activated in <strong>{targetPhase}</strong>.
          </p>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">Return to Dashboard</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};
