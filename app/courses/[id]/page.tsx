
// app/courses/[id]/page.tsx (Fixed for Cloudinary URLs and added unselectable notes)

// app/courses/[id]/page.tsx

import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Calendar, FileText, NotebookPen, ChevronLeft } from "lucide-react" // Removed BookOpen icon

// Define the component props
interface CourseDetailPageProps {
  params: {
    id: string
  }
}

// 🚨 REMOVED: The entire getVideoSource function is no longer needed
/*
const getVideoSource = (url: string | null | undefined): { type: 'iframe' | 'video' | null, src: string | null } => {
  if (!url) return { type: null, src: null };

  // 1. Check for External Embed (YouTube, Vimeo, etc.)
  try {
    const urlObj = new URL(url);
    
    // Check for YouTube Embed (Unchanged)
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = urlObj.searchParams.get('v');
      if (!videoId && urlObj.pathname.length > 1) {
          const potentialVideoId = urlObj.pathname.split('/').pop(); 
          if (potentialVideoId) {
             videoId = potentialVideoId;
          }
      }
      const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      return { type: 'iframe', src: embedSrc };
    }
    
    // 2. 🌟 NEW: Check for Cloudinary or other standard external video URLs
    // Cloudinary URLs typically use 'res.cloudinary.com' and are direct video files.
    if (urlObj.hostname.includes('cloudinary.com') || 
        // We assume any standard HTTPS link that isn't YouTube is a direct video file.
        (urlObj.protocol === 'https:' && url.match(/\.(mp4|mov|webm)$/i))
    ) {
        return { type: 'video', src: url };
    }

    // Fallback for generic external URLs that might work in an iframe
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return { type: 'iframe', src: url };
    }
    
    return { type: null, src: null };

  } catch (_e) { 
    // This catches invalid URLs or local paths from the old system that might still be in the DB.
    if (url.startsWith('/videos/')) {
        // Fallback for old local files, though this will no longer work on Vercel
        return { type: 'video', src: url }; 
    }
    return { type: null, src: null };
  }
};
*/


export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = params

  // 1. Fetch the course, ensuring it is PUBLISHED and include the teacher's name
  const course = await prisma.course.findUnique({
    where: {
      id: id,
      status: 'PUBLISHED',
    },
    include: {
      teacher: {
        select: { name: true },
      },
    },
  })

  // 2. Handle 404 Not Found
  if (!course) {
    return notFound()
  }

  // 🚨 REMOVED: videoContent calculation is removed
  // const videoContent = getVideoSource(course.videoUrl);

  return (
  
    <div className="container mx-auto py-15 md:py-10 max-w-5xl px-4 sm:px-6 space-y-8">
      
      {/* Back to Courses Link */}
      <Link 
        href="/courses" 
        className="inline-flex items-center text-base md:text-lg font-medium text-green-600 hover:text-green-800 transition-colors mb-2"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to all courses
      </Link>
      
      {/* Title and Metadata */}
      <div className="border-b pb-4 space-y-3">
        {/* Title: Adjusted size for mobile */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {course.title}
        </h1>

        {/* Metadata Section - Stack vertically on mobile, wrap on larger screens */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-green-600" />
            <span>Taught by: {course.teacher.name || "Family Academy"}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-green-600" />
            <span>Published: {course.publishedAt?.toLocaleDateString() || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 🚨 REMOVED: The entire Video Section block is removed */}
      {/*
      {videoContent.src && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" /> Course Video
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="relative aspect-video max-h-[500px] overflow-hidden p-0"
          > 
            
            {videoContent.type === 'iframe' && (
                <iframe
                  className="w-full h-full rounded-lg absolute top-0 left-0" 
                  src={videoContent.src}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
            )}

            {videoContent.type === 'video' && (
                <video
                    className="w-full h-full rounded-lg absolute top-0 left-0 object-cover" 
                    src={videoContent.src}
                    controls
                    preload="metadata"
                    poster="/images/video-poster.jpg" 
                >
                    Your browser does not support the video tag.
                </video>
            )}

          </CardContent>
        </Card>
      )}
      */}

      {/* Description */}
      <div className="space-y-4">
        
        <h2 className="text-xl md:text-2xl font-semibold border-b pb-2 flex items-center"> 
          <NotebookPen className="h-5 w-5 mr-2 text-green-600"  /> Description
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
      </div>

      {/* Notes Section - Text selection disabled to prevent easy copying */}
      {course.notes && (
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold border-b pb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" /> Course Notes
          </h2>
          {/* 🚫 FIX: Added 'select-none' Tailwind class (which applies user-select: none) */}
          <div 
              className="p-4 md:p-6 w-full select-none" 
              dangerouslySetInnerHTML={{ __html: course.notes }} 
          />
        </div>
      )}
      
    </div>
  )
}
