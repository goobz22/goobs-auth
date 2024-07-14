// Export the main authentication page component
export { default as AuthPageContent } from './app/auth/page'

// Export the configuration loader and its types
export {
  default as loadAuthConfig,
  type AuthConfig,
  type AuthStep,
} from './actions/server/auth/configLoader'

// Export the token spoofing function and its types
export {
  default as authSpoof,
  type SerializableTokenData,
} from './actions/server/auth/tokenSpoof'

// Export the auth utility function
export { default as authUtility } from './actions/server/auth/authUtility'

// Export the custom middleware
export { authMiddleware } from './actions/server/auth/customMiddleware'
