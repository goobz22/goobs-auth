'use client'
import React, { useEffect } from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import AuthPageContent from './auth/page'
import { initReusableStore } from 'goobs-repo'

const AuthPageWrapper = () => {
  useEffect(() => {
    const initStore = async () => {
      try {
        await initReusableStore()
        console.log('ReusableStore initialized successfully')
      } catch (error) {
        console.error('Failed to initialize ReusableStore:', error)
      }
    }
    initStore()
  }, [])
  return <AuthPageContent />
}

export default function Page() {
  return (
    <AppRouterCacheProvider>
      <AuthPageWrapper />
    </AppRouterCacheProvider>
  )
}
