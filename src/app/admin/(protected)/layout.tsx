import React from 'react';
import { redirect, forbidden } from 'next/navigation';
import { requireAdmin, AdminRequiredError } from '@/lib/firebase/session';
import AdminClientShell from '@/components/admin/AdminClientShell';

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminRequiredError) {
      // Authenticated user without admin claim -> genuine HTTP 403 Forbidden
      forbidden();
    }
    // Unauthenticated user or invalid/expired session -> server-side redirect to /admin/login
    redirect('/admin/login');
  }

  return <AdminClientShell>{children}</AdminClientShell>;
}