// app/layout.tsx
// This is typically a Server Component (default)

import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper'; // <-- Import the wrapper

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/*
          Wrap the entire body content with the SessionProviderWrapper.
          This ensures that any client component using useSession() can access the session data.
        */}
        <SessionProviderWrapper> 
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
