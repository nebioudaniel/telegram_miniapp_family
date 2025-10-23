// app/admin/layout.tsx

import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import AdminSidebar from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth(); 

  // --- 1. Authorization Check ---
  // If no session or user is missing (should be covered by the next check, but good for safety)
  if (!session?.user) {
    // Redirect unauthenticated users to the login page with a callback URL
    return redirect("/login?callbackUrl=/admin"); 
  }

  // Get the role from the session.user object (assuming next-auth.d.ts is set up)
  // FIX: Access the role directly without 'any' type assertion
  const role = session.user.role || 'STUDENT';

  if (role !== "ADMIN") {
    // Redirect to an unauthorized page if not an ADMIN
    return redirect("/unauthorized?error=UnauthorizedAccess");
  }

  // --- 2. Layout Structure ---
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Sidebar: */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Content Area: */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mb-4">
            <AdminSidebar />
        </div>
        
        {children}
      </main>
      
    </div>
  )
}