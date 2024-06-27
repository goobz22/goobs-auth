'use client'

import React from 'react'
import Login from './auth/login/page'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'

export default function Page() {
  return (
    <AppRouterCacheProvider>
      <Login />
    </AppRouterCacheProvider>
  )
}
