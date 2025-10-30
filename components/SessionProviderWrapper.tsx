// components/SessionProviderWrapper.tsx
'use client'; // This component must be a client component

import { SessionProvider } from 'next-auth/react';
import React from 'react';

/**
 * A wrapper component that provides the NextAuth session context to client components.
 */
export default function SessionProviderWrapper({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
