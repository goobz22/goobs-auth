'use client';
export interface AuthData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
const SESSION_STORAGE_KEY = 'authData';
export const useAuth = () => {
  console.log('useAuth: Function called');
  const getAuthData = (): AuthData => {
    console.log('getAuthData: Function called');
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      console.log('getAuthData: Retrieved raw data from sessionStorage:', storedData);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('getAuthData: Successfully parsed data:', parsedData);
          return parsedData;
        } catch (error) {
          console.error('getAuthData: Error parsing stored data:', error);
          return {};
        }
      } else {
        console.log('getAuthData: No data found in sessionStorage, returning empty object');
        return {};
      }
    }
    console.log('getAuthData: Window is undefined (server-side), returning empty object');
    return {};
  };
  const setAuthData = (
    newData: Partial<AuthData> | ((prevData: AuthData) => Partial<AuthData>),
  ): void => {
    console.log('setAuthData: Function called with new data:', newData);
    if (typeof window !== 'undefined') {
      const currentData = getAuthData();
      console.log('setAuthData: Current data before update:', currentData);
      const updatedData =
        typeof newData === 'function'
          ? { ...currentData, ...newData(currentData) }
          : { ...currentData, ...newData };
      console.log('setAuthData: Merged data:', updatedData);
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedData));
        console.log('setAuthData: Successfully updated sessionStorage');
      } catch (error) {
        console.error('setAuthData: Error updating sessionStorage:', error);
      }
    } else {
      console.log('setAuthData: Window is undefined (server-side), no action taken');
    }
  };
  const clearAuthData = (): void => {
    console.log('clearAuthData: Function called');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        console.log('clearAuthData: Successfully cleared auth data from sessionStorage');
      } catch (error) {
        console.error('clearAuthData: Error clearing auth data from sessionStorage:', error);
      }
    } else {
      console.log('clearAuthData: Window is undefined (server-side), no action taken');
    }
  };
  const authData = getAuthData();
  console.log('useAuth: Returning auth functions and data');
  return { authData, getAuthData, setAuthData, clearAuthData };
};
