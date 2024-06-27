'use server'

import { Dialog } from '@mui/material'
import Setup from './setup/page'
import React from 'react'

export default async function Registration() {
  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Setup />
    </Dialog>
  )
}
