// app/teacher/layout.tsx

import { auth } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import TeacherSidebar from "./_components/TeacherSidebar";

// Define the sidebar width (w-64 is 256px)
const SIDEBAR_WIDTH_CLASS = "w-64";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  
  const session = await auth(); 

  // 1. Check Login Status & Role (Authorization)
  if (!session?.user) {
    // Redirect unauthenticated users
    return redirect("/login?callbackUrl=/teacher/courses"); // Changed callback to be more specific
  }
  
  // FIX: Access the role directly without 'any' type assertion
  const role = session.user.role || 'STUDENT';

  if (role !== "TEACHER") {
    // If it's the admin, redirect them to their correct dashboard
    if (role === "ADMIN") {
        return redirect("/admin");
    }
    // Redirect all other unauthorized roles (e.g., STUDENT)
    return redirect("/unauthorized"); 
  }

  // 2. Layout Structure
  return (
    <div className="relative flex min-h-screen bg-gray-50"> 
      
      {/* A. DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col flex-shrink-0 ${SIDEBAR_WIDTH_CLASS} h-screen fixed top-0 left-0 border-r bg-card shadow-lg z-20`}
      >
        <TeacherSidebar />
      </aside>

      {/* B. FIXED HEADER */}
      <header 
        className={`fixed top-0 left-0 w-full bg-white border-b z-10 p-4 transition-all duration-300 md:ml-64`}
        style={{ transitionProperty: 'margin-left' }} 
      >
        <div className="flex items-center justify-between">
            
            {/* MOBILE NAV BAR ICON */}
            <div className="md:hidden mr-4">
                {/* Note: In a production app, this should likely be a button that toggles the sidebar visibility. */}
                <TeacherSidebar />
            </div>

            <h1 className="text-xl font-bold text-gray-800">Teacher Portal</h1>
            
            <div className="md:block hidden">
                {/* Safely access user name */}
                <span className="text-sm text-muted-foreground">Welcome, {session.user.name || "Teacher"}</span>
            </div>
        </div>
      </header>

      {/* C. MAIN CONTENT AREA */}
      <main 
        className={`flex-1 p-6 pt-20 transition-all duration-300 md:ml-64`}
        style={{ transitionProperty: 'margin-left' }}
      >
        {children}
      </main>
      
    </div>
  )
}