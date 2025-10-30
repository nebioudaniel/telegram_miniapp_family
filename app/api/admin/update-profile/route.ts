// app/api/admin/update-profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Define the API handler for POST requests
export async function POST(req: Request) {
  try {
    // 1. Authentication and Authorization (Admin Only)
    const session = await auth();
    // Ensure user is logged in AND has the ADMIN role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized access' }), { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newEmail, newPassword } = body;
    const userId = session.user.id; // Get the ID of the currently logged-in admin

    // 2. Fetch the current user to verify the password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    // 3. Current Password Verification (Mandatory for security)
    // The current password is required for any changes to be made.
    if (!currentPassword) {
      return new NextResponse(JSON.stringify({ message: 'Current password is required to make changes.' }), { status: 400 });
    }
    
    // Check if the user has a hashedPassword (i.e., didn't sign up with OAuth)
    if (user.hashedPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.hashedPassword);
        if (!isPasswordValid) {
            // Returns 401 if the current password is wrong.
            return new NextResponse(JSON.stringify({ message: 'Invalid current password.' }), { status: 401 });
        }
    } else {
        // Returns 401 if the account has no password set (e.g., created via OAuth).
        return new NextResponse(JSON.stringify({ message: 'Account was created via social login; please contact support to update profile.' }), { status: 401 });
    }
    
    // 4. Prepare update data
    const updateData: { email?: string; hashedPassword?: string } = {};

    // 4a. Handle Email Update
    // Checks for non-empty string and ensures email is actually different from the current one.
    if (newEmail && newEmail.trim() !== '' && newEmail !== user.email) {
      // Check for email uniqueness before updating
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return new NextResponse(JSON.stringify({ message: 'Email address is already in use by another account.' }), { status: 409 });
      }
      updateData.email = newEmail;
    }

    // 4b. Handle Password Update
    if (newPassword) {
      // Check for minimal password change length
      if (newPassword.length < 6) {
         return new NextResponse(JSON.stringify({ message: 'New password must be at least 6 characters long.' }), { status: 400 });
      }
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.hashedPassword = newHashedPassword; // Use 'hashedPassword'
    }

    // 5. Check if any actual updates are present
    if (Object.keys(updateData).length === 0) {
      return new NextResponse(JSON.stringify({ message: 'No changes submitted.' }), { status: 200 });
    }

    // 6. Perform the update
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    // 7. Success Response
    return new NextResponse(JSON.stringify({ message: 'Admin profile updated successfully!' }), { status: 200 });

  } catch (error) {
    console.error('Admin profile update error:', error);
    return new NextResponse(JSON.stringify({ message: 'An internal server error occurred.' }), { status: 500 });
  }
}
