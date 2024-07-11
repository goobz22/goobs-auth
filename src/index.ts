// Export the main authentication page component
export { default as AuthPageContent } from './app/auth/page'

// Export the configuration loader
export {
  default as loadAuthConfig,
  type AuthConfig,
} from './actions/server/auth/configLoader'
