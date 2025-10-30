"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// Removed Cloudinary SDK import and configuration
// import { v2 as cloudinary } from 'cloudinary'; 
// cloudinary.config({ ... }); 

// Removed file system imports and functions as they are not needed

export async function createCourse(formData: FormData) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  // 1. EXTRACT DATA: 
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  // 🚨 REMOVED VIDEO URL: 
  // const finalVideoUrl = formData.get('videoUrl') as string | null 
  const notes = formData.get('notes') as string
  const statusChoice = formData.get('statusChoice') as 'draft' | 'publish' | 'schedule'
  const scheduledDate = formData.get('scheduledDate') as string


  // 2. 🚨 REMOVED VIDEO CHECK: 
  // if (!finalVideoUrl) {
  //    return { success: false, message: "Video file is required, but the upload URL was not provided." }
  // }


  // 3. DETERMINE PUBLISHING STATUS (Unchanged)
  let status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' = 'DRAFT'
  let publishedAt: Date | undefined = undefined
  let scheduledAt: Date | undefined = undefined

  if (statusChoice === 'publish') {
    status = 'PUBLISHED'
    publishedAt = new Date()
  } else if (statusChoice === 'schedule' && scheduledDate) {
    status = 'SCHEDULED'
    scheduledAt = new Date(scheduledDate)
  }

  // 4. SAVE COURSE TO DATABASE (Removed videoUrl field)
  try {
    await prisma.course.create({
      data: {
        title,
        description,
        // videoUrl: finalVideoUrl, // REMOVED VIDEO URL FIELD
        notes,
        teacherId,
        status,
        publishedAt,
        scheduledAt,
      },
    })

    revalidatePath("/teacher/courses")
    return { success: true, message: `Course saved as ${status.toLowerCase()}.` }
  } catch (error: unknown) { 
    console.error("Database Save Error:", error)
    return { success: false, message: "Failed to create course. Database error." }
  }
}

// 5. DELETE COURSE (Cleaned up to only delete the database record)
export async function deleteCourse(courseId: string) {
  const session = await auth()
  const teacherId = session?.user?.id

  if (!teacherId) {
    return { success: false, message: "Authentication failed." }
  }

  try {
    // 1. Find the course to get the title for the success message (no need for videoUrl)
    const courseToDelete = await prisma.course.findUnique({
        where: { id: courseId, teacherId: teacherId },
        select: { title: true } // Removed videoUrl from select
    });

    if (!courseToDelete) {
        return { success: false, message: "Course not found or unauthorized." }
    }
    
    // 2. Removed all Cloudinary cleanup logic
    /* if (courseToDelete.videoUrl) {
        try {
            const urlParts = courseToDelete.videoUrl.split('/upload/');
            if (urlParts.length > 1) {
                const assetPath = urlParts[1].split('/').slice(1).join('/'); 
                const publicId = assetPath.substring(0, assetPath.lastIndexOf('.'));
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' }); 
                console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
            }
        } catch (fileError: unknown) { 
             console.error("Failed to delete Cloudinary asset during course deletion:", fileError);
        }
    }
    */
    
    // 3. Delete the course from the database
    const deletedCourse = await prisma.course.delete({
      where: { id: courseId, teacherId: teacherId }, 
    })
    
    revalidatePath("/teacher/courses")
    return { success: true, message: `Course "${deletedCourse.title}" deleted.` }

  } catch (error: unknown) { 
    console.error("Delete error:", error)
    return { success: false, message: "Failed to delete course. Database error." }
  }
}
