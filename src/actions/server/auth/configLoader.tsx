'use server'

import { promises as fs } from 'fs'
import path from 'path'

interface UserModel {
  getUser: {
    path: string
    exportName: string
  }
  setUser: {
    path: string
    exportName: string
  }
}

interface Database {
  connectScript: string
}

export type AuthStep =
  | { step: number; type: 'enterEmail' }
  | { step: number; type: 'emailAndPasswordVerification' }
  | { step: number; type: 'emailAndPasswordAndVerifyPasswordVerification' }
  | { step: number; type: 'emailVerification' }
  | { step: number; type: 'textMessageVerification' }
  | { step: number; type: 'accountInfo' }

interface Authentication {
  forgotPassword: AuthStep[]
  registration: AuthStep[]
  login: AuthStep[]
}

export interface AuthConfig {
  userModel: UserModel
  database: Database
  authentication: Authentication
}

export async function loadAuthConfig(configPath?: string): Promise<AuthConfig> {
  console.log('loadAuthConfig called with configPath:', configPath)

  let finalConfigPath: string

  if (configPath) {
    console.log('Using provided config path')
    finalConfigPath = path.resolve(configPath)
  } else {
    console.log('Trying to load from main repo or local repo')
    const mainRepoPath = path.resolve(process.cwd(), '..', '..', '.auth.json')
    const localRepoPath = path.resolve(process.cwd(), '.auth.json')

    console.log('Checking main repo path:', mainRepoPath)
    console.log('Checking local repo path:', localRepoPath)

    if (await fileExists(mainRepoPath)) {
      console.log('Found config in main repo')
      finalConfigPath = mainRepoPath
    } else if (await fileExists(localRepoPath)) {
      console.log('Found config in local repo')
      finalConfigPath = localRepoPath
    } else {
      console.error('Auth configuration file not found in main or local repo')
      throw new Error('Auth configuration file not found in main or local repo')
    }
  }

  console.log('Final config path:', finalConfigPath)

  if (!(await fileExists(finalConfigPath))) {
    console.error(`Auth configuration file not found at ${finalConfigPath}`)
    throw new Error(`Auth configuration file not found at ${finalConfigPath}`)
  }

  console.log('Reading config file')
  const configContent = await fs.readFile(finalConfigPath, 'utf-8')
  console.log('Parsing config content')
  const config: AuthConfig = JSON.parse(configContent)
  console.log('Validating config')
  await validateConfig(config)
  console.log('Config loaded and validated successfully')
  return config
}

async function validateConfig(config: AuthConfig): Promise<void> {
  console.log('Validating userModel')
  if (
    !config.userModel ||
    !config.userModel.getUser ||
    !config.userModel.setUser
  ) {
    console.error('Invalid userModel configuration')
    throw new Error('Invalid userModel configuration')
  }

  console.log('Validating database')
  if (!config.database || !config.database.connectScript) {
    console.error('Invalid database configuration')
    throw new Error('Invalid database configuration')
  }

  console.log('Validating authentication')
  if (
    !config.authentication ||
    !Array.isArray(config.authentication.forgotPassword) ||
    !Array.isArray(config.authentication.registration) ||
    !Array.isArray(config.authentication.login)
  ) {
    console.error('Invalid authentication configuration')
    throw new Error('Invalid authentication configuration')
  }

  const validateSteps = async (steps: AuthStep[], processName: string) => {
    console.log(`Validating steps for ${processName}`)
    for (let index = 0; index < steps.length; index++) {
      const step = steps[index]
      if (typeof step.step !== 'number' || step.step !== index + 1) {
        console.error(`Invalid step number in ${processName} process`)
        throw new Error(`Invalid step number in ${processName} process`)
      }
      if (
        ![
          'enterEmail',
          'emailAndPasswordVerification',
          'emailAndPasswordAndVerifyPasswordVerification',
          'emailVerification',
          'textMessageVerification',
          'accountInfo',
        ].includes(step.type)
      ) {
        console.error(
          `Invalid step type in ${processName} process: ${step.type}`
        )
        throw new Error(
          `Invalid step type in ${processName} process: ${step.type}`
        )
      }
    }
    console.log(`Steps for ${processName} validated successfully`)
  }

  await validateSteps(config.authentication.forgotPassword, 'forgotPassword')
  await validateSteps(config.authentication.registration, 'registration')
  await validateSteps(config.authentication.login, 'login')

  console.log('Config validation completed successfully')
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export default loadAuthConfig
