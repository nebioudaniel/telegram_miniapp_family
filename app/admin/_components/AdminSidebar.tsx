// app/admin/_components/AdminSidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// 🎯 FIX: Remove 'Code' from the import list
import { LayoutDashboard, BookOpen, Users, LogOut, UserRoundPen,Menu } from "lucide-react" 
import { signOut } from "next-auth/react"

// Import shadcn/ui components
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils" // Utility for combining class names
import { useMediaQuery } from "@/hooks/use-media-query" // Custom hook for responsiveness

// --- Component Logic and Data ---
const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/teachers", icon: Users, label: "Manage Teachers" },
  { href: "/admin/courses", icon: BookOpen, label: "All Courses" },
  { href: "/admin/profile", icon: UserRoundPen, label: "Profile" },
]

// Separate the navigation links into a reusable component
function SidebarContent({ className }: { className?: string }) {
  const pathname = usePathname()

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (pathname !== '/admin' && pathname.startsWith(item.href))
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-green-600 text-white hover:bg-green-500 shadow-md"
            : "text-foreground/80 hover:bg-accent hover:text-foreground",
          className
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex w-full flex-col p-4">
      {/* Header */}
      <h2 className="text-2xl font-bold text-green-600 mb-6 px-3">Admin Portal</h2>
      <Separator className="mb-4" />

      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full justify-start space-x-3 text-red-500 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  )
}

// --- Main Component ---
export default function AdminSidebar() {
  const isDesktop = useMediaQuery("(min-width: 768px)") // md: breakpoint

  // Desktop Sidebar
  if (isDesktop) {
    return (
      <div className="hidden md:block h-screen w-full border-r bg-card shadow-sm">
        <SidebarContent />
      </div>
    )
  }

  // Mobile Sidebar (Sheet)
  return (
    <div className="w-full p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent className="hover:text-green-600" />
        </SheetContent>
      </Sheet>
    </div>
  )
}
