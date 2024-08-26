'use client';

import React from 'react';
import { useAuth, AuthData } from './authContext';

export const useAuthDataJSON = () => {
  const { authData } = useAuth();

  const getAuthDataAsJSON = (): string => {
    return JSON.stringify(authData, null, 2);
  };

  const getAuthDataAsObject = (): Readonly<AuthData> => {
    return Object.freeze({ ...authData });
  };

  const downloadAuthDataAsJSON = () => {
    const jsonString = getAuthDataAsJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'auth_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    getAuthDataAsJSON,
    getAuthDataAsObject,
    downloadAuthDataAsJSON,
  };
};

// Example usage in a component:
export const AuthDataOutput: React.FC = () => {
  const { getAuthDataAsJSON, downloadAuthDataAsJSON } = useAuthDataJSON();

  return (
    <div>
      <h2>Auth Data (JSON):</h2>
      <pre>{getAuthDataAsJSON()}</pre>
      <button onClick={downloadAuthDataAsJSON}>Download JSON</button>
    </div>
  );
};

// Component to trigger JSON download
export const JSONDownloader: React.FC = () => {
  const { downloadAuthDataAsJSON } = useAuthDataJSON();

  return <button onClick={downloadAuthDataAsJSON}>Download Auth Data as JSON</button>;
};
