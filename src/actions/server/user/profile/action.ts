'use server'
import { getFormData } from 'goobs-repo'

interface SerializableUserData {
  _id: string
}

interface SerializableTokenData {
  _id: string
  tokenName: string
  tokenString: string
  tokenExpiration: string
  user: string
}

interface UpdateActionProps {
  user: SerializableUserData
  token: SerializableTokenData
}

export async function updateAction(
  formData: FormData,
  { user, token }: UpdateActionProps
): Promise<SerializableUserData | null> {
  console.log('Starting profile update process...')

  try {
    console.log('Updating user data with form fields...')
    const updatedData = await getFormData(formData)

    // Check if the user and token match
    if (user._id !== token.user) {
      console.error('User and token mismatch. Profile update process halted.')
      return null
    }

    console.log('Updating user data...')
    const updatedUser: SerializableUserData = {
      ...user,
      ...updatedData,
    }

    console.log('Profile update action completed successfully.')
    // Return the updated user data
    return updatedUser
  } catch (error) {
    console.error('An error occurred during the profile update process:', error)
    return null
  }
}
