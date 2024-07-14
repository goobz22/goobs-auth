# goobs-auth

The NPM repo is available here - https://www.npmjs.com/package/goobs-auth

goobs-auth is a comprehensive authentication solution for Next.js applications. It provides a flexible and customizable authentication flow that can be easily integrated into your projects.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Components](#components)
- [Server Actions](#server-actions)
- [Middleware](#middleware)
- [Customization](#customization)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Installation

To install goobs-auth in your Next.js project, run one of the following commands:

```bash
npm install goobs-auth
# or
yarn add goobs-auth
```

## Features

- Flexible authentication flow with customizable steps
- Support for email/password, email verification, and SMS verification
- Integration with Twilio for SMS services
- SMTP configuration for email services
- Custom middleware for protecting routes
- Server-side utilities for token management and verification
- React components for different authentication steps

## Usage

1. Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['goobs-frontend', 'goobs-cache', 'goobs-auth'],
}

export default nextConfig
```

2. Create an authentication configuration file (e.g., `.auth.json`) in your project root:

```json
{
  "userModel": {
    "getUser": {
      "path": "./path/to/getUserFunction",
      "exportName": "getUser"
    },
    "setUser": {
      "path": "./path/to/setUserFunction",
      "exportName": "setUser"
    },
    "deleteUser": {
      "path": "./path/to/deleteUserFunction",
      "exportName": "deleteUser"
    }
  },
  "database": {
    "connectScript": "// Your database connection script"
  },
  "authentication": {
    "login": [
      { "step": 1, "type": "enterEmail" },
      { "step": 2, "type": "emailAndPasswordVerification" }
    ],
    "registration": [
      { "step": 1, "type": "enterEmail" },
      { "step": 2, "type": "emailAndPasswordAndVerifyPasswordVerification" },
      { "step": 3, "type": "emailVerification" },
      { "step": 4, "type": "textMessageVerification" },
      { "step": 5, "type": "accountInfo" }
    ],
    "forgotPassword": [
      { "step": 1, "type": "enterEmail" },
      { "step": 2, "type": "emailVerification" }
    ]
  },
  "twilio": {
    "accountSid": "your_twilio_account_sid",
    "authToken": "your_twilio_auth_token",
    "phoneNumber": "your_twilio_phone_number"
  },
  "smtp": {
    "host": "your_smtp_host",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your_smtp_username",
      "pass": "your_smtp_password"
    },
    "from": "noreply@yourdomain.com"
  }
}
```

3. Implement the authentication page in your Next.js app:

```tsx
// pages/auth.tsx
'use client'

import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { AuthPageContent } from 'goobs-auth'

export default function AuthPage() {
  return (
    <AppRouterCacheProvider>
      <AuthPageContent />
    </AppRouterCacheProvider>
  )
}
```

4. Protect your routes using the `authMiddleware`:

```typescript
// middleware.ts
import { authMiddleware } from 'goobs-auth'

export default authMiddleware
```

## Configuration

The `.auth.json` file allows you to customize various aspects of the authentication flow:

- `userModel`: Define functions for user management (get, set, delete)
- `database`: Specify the database connection script
- `authentication`: Configure the steps for login, registration, and password recovery
- `twilio`: Set up Twilio credentials for SMS services
- `smtp`: Configure SMTP settings for email services

## API Reference

### `loadAuthConfig(configPath?: string): Promise<AuthConfig>`

Loads the authentication configuration from the specified path or the default locations.

### `authUtility(options: AuthUtilityOptions): Promise<ValidateResult | LoginResult | LogoutResult>`

A comprehensive authentication utility for server components and server actions.

### `authSpoof(options?: AuthSpoofOptions): Promise<{ isValid: boolean, validTokens: ValidTokens }>`

Generates mock authentication data for testing purposes.

## Components

goobs-auth provides several React components for building the authentication UI:

- `AuthPageContent`: The main authentication page component
- `EnterEmailStep`: Component for entering email
- `EmailPasswordVerificationStep`: Component for email and password verification
- `EmailVerificationStep`: Component for email verification
- `TextMessageVerificationStep`: Component for SMS verification
- `AccountInfoStep`: Component for collecting additional account information

## Server Actions

goobs-auth includes several server-side actions for handling authentication:

- `verifyEmail`: Verifies an email address
- `sendEmail`: Sends an email (e.g., for verification)
- `sendSMS`: Sends an SMS message
- `verifyUser`: Verifies a user's phone number

## Middleware

The `authMiddleware` function can be used to protect routes and validate authentication tokens.

## License

This project is licensed under the MIT License.

## Contact

For questions, feature requests, or support, please contact:

- **Matthew Goluba**
  - Email: mkgoluba@technologiesunlimited.net
  - LinkedIn: https://www.linkedin.com/in/matthew-goluba/

For the quickest response, please use email. Our website is currently under development and will be shared here soon.
