'use client';
import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import AuthPageContent from './auth/page';

export default function Page() {
  return (
    <AppRouterCacheProvider>
      <AuthPageContent />
    </AppRouterCacheProvider>
  );
}
