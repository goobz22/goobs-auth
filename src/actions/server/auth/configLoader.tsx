'use server'

import { promises as fs } from 'fs'
import path from 'path'

/**
 * Represents the structure of the user model in the auth configuration.
 */
interface UserModel {
  /** Configuration for getting a user */
  getUser: {
    /** Path to the file containing the getUser function */
    path: string
    /** Name of the exported getUser function */
    exportName: string
  }
  /** Configuration for setting a user */
  setUser: {
    /** Path to the file containing the setUser function */
    path: string
    /** Name of the exported setUser function */
    exportName: string
  }
  /** Configuration for deleting a user */
  deleteUser: {
    /** Path to the file containing the deleteUser function */
    path: string
    /** Name of the exported deleteUser function */
    exportName: string
  }
}

/**
 * Represents the database configuration in the auth configuration.
 */
interface Database {
  /** Script to connect to the database */
  connectScript: string
}

/**
 * Represents a step in the authentication process.
 */
export type AuthStep =
  | { step: number; type: 'enterEmail' }
  | { step: number; type: 'emailAndPasswordVerification' }
  | { step: number; type: 'emailAndPasswordAndVerifyPasswordVerification' }
  | { step: number; type: 'emailVerification' }
  | { step: number; type: 'textMessageVerification' }
  | { step: number; type: 'accountInfo' }

/**
 * Represents the authentication configuration.
 */
interface Authentication {
  /** Steps for the forgot password process */
  forgotPassword: AuthStep[]
  /** Steps for the registration process */
  registration: AuthStep[]
  /** Steps for the login process */
  login: AuthStep[]
}

/**
 * Represents the Twilio configuration for SMS services.
 */
interface TwilioConfig {
  /** Twilio account SID */
  accountSid: string
  /** Twilio auth token */
  authToken: string
  /** Twilio phone number to send SMS from */
  phoneNumber: string
}

/**
 * Represents the SMTP configuration for email services.
 */
interface SMTPConfig {
  /** SMTP host */
  host: string
  /** SMTP port */
  port: number
  /** Whether to use a secure connection */
  secure: boolean
  /** SMTP authentication */
  auth: {
    /** SMTP username */
    user: string
    /** SMTP password */
    pass: string
  }
  /** Email address to send from */
  from: string
}

/**
 * Represents the complete auth configuration.
 */
export interface AuthConfig {
  /** User model configuration */
  userModel: UserModel
  /** Database configuration */
  database: Database
  /** Authentication process configuration */
  authentication: Authentication
  /** Twilio configuration for SMS */
  twilio: TwilioConfig
  /** SMTP configuration for email */
  smtp: SMTPConfig
}

/**
 * Loads the auth configuration from a file.
 *
 * @param configPath - Optional path to the configuration file
 * @returns A promise that resolves to the loaded AuthConfig
 * @throws Error if the configuration file is not found or is invalid
 */
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

/**
 * Validates the loaded auth configuration.
 *
 * @param config - The auth configuration to validate
 * @throws Error if the configuration is invalid
 */
async function validateConfig(config: AuthConfig): Promise<void> {
  console.log('Validating userModel')
  if (
    !config.userModel ||
    !config.userModel.getUser ||
    !config.userModel.setUser ||
    !config.userModel.deleteUser
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

  /**
   * Validates the steps for a specific authentication process.
   *
   * @param steps - The steps to validate
   * @param processName - The name of the process being validated
   * @throws Error if the steps are invalid
   */
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

  console.log('Validating Twilio configuration')
  if (
    !config.twilio ||
    !config.twilio.accountSid ||
    !config.twilio.authToken ||
    !config.twilio.phoneNumber
  ) {
    console.error('Invalid Twilio configuration')
    throw new Error('Invalid Twilio configuration')
  }

  console.log('Validating SMTP configuration')
  if (
    !config.smtp ||
    !config.smtp.host ||
    !config.smtp.port ||
    typeof config.smtp.secure !== 'boolean' ||
    !config.smtp.auth ||
    !config.smtp.auth.user ||
    !config.smtp.auth.pass ||
    !config.smtp.from
  ) {
    console.error('Invalid SMTP configuration')
    throw new Error('Invalid SMTP configuration')
  }

  console.log('Config validation completed successfully')
}

/**
 * Checks if a file exists at the given path.
 *
 * @param filePath - The path to check
 * @returns A promise that resolves to true if the file exists, false otherwise
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export default loadAuthConfig
