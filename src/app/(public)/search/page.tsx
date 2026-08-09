import React from 'react';
import type { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: 'Search College Website',
  description: 'Search academic notices, courses, departments, faculty profiles, and announcements.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/search',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
