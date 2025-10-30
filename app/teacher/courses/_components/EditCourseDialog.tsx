// app/teacher/courses/_components/EditCourseDialog.tsx
"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { getCourseDetails, updateCourse } from "@/lib/actions/teacher.actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Bold, Italic, Underline, List, ListOrdered, Heading1 } from "lucide-react"
import { type ReactNode } from "react"

// 🧠 Tiptap packages
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import UnderlineExtension from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"

// ✅ Submit button component
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
    </Button>
  )
}

interface EditCourseDialogProps {
  courseId: string
  children: ReactNode
}

type CourseDetails = Awaited<ReturnType<typeof getCourseDetails>>

export default function EditCourseDialog({ courseId, children }: EditCourseDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [course, setCourse] = React.useState<CourseDetails | null>(null)
  const [notesContent, setNotesContent] = React.useState<string>("")

  // --- Initialize Tiptap editor ---
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Write detailed notes here, just like in Word...",
      }),
    ],
    content: '', 
    onUpdate: ({ editor }) => setNotesContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[250px]",
      },
    },
    immediatelyRender: false,
  })

  // --- Fetch course data and manage open state ---
  React.useEffect(() => {
    if (open) {
      // 🌟 FIX 1: Explicitly reset course state before fetching new data.
      setCourse(null) 
      setNotesContent("")

      getCourseDetails(courseId)
        .then((data) => {
          setCourse(data)
          setNotesContent(data?.notes || "")
        })
        .catch(() => {
          toast.error("Failed to load course data.")
          setOpen(false); // Close dialog if fetch fails completely
        })
    }
    // 🌟 FIX 2: Added cleanup logic for when the dialog closes.
    return () => {
        if (!open) {
            setCourse(null)
            setNotesContent("")
        }
    }
  }, [open, courseId])

  // 🌟 FIX 3: Load content into the Tiptap editor once data is fetched and the editor is ready.
  React.useEffect(() => {
    // Check if the editor exists and course data has been fetched
    if (editor && course && course.notes !== undefined) {
      // We only set it if the content is truly different (to prevent infinite loops)
      if (editor.getHTML() !== course.notes) {
       editor.commands.setContent(course.notes || '', { emitUpdate: false });

      }
    }
  }, [editor, course]); // Depend on editor and course data

  // --- Handle form submission ---
  const formAction = async (formData: FormData) => {
    formData.append("id", courseId)
    formData.append("notes", notesContent) 

    const result = await updateCourse(formData)

    if (result && "error" in result) {
      toast.error(result.error)
    } else if (result && "success" in result) {
      toast.success("Course updated successfully!")
      setOpen(false)
    }
  }

  // --- Tiptap toolbar ---
  // (Toolbar component logic remains the same)
  const Toolbar = () => (
    <div className="flex flex-wrap gap-2 border rounded-md p-2 bg-gray-50">
      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("bold") ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("italic") ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("underline") ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("heading", { level: 1 }) ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("bulletList") ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant={editor?.isActive("orderedList") ? "default" : "outline"}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Course: {course?.title || "Loading..."}</DialogTitle>
          <DialogDescription>Update course details and notes.</DialogDescription>
        </DialogHeader>

        {/* This block is still correct: show form only when course data is ready */}
        {course ? (
          <form action={formAction} className="grid gap-6 py-4">
            {/* Hidden ID field */}
            <input type="hidden" name="id" value={courseId} />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={course.title} required />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={course.description}
                required
                rows={3}
              />
            </div>

            {/* Removed the Video URL input section here */}
            {/* <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (YouTube/Vimeo)</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                defaultValue={course.videoUrl || ""}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            */}

            {/* 📝 Notes (Tiptap Editor) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Course Notes / Transcription</Label>
              {editor ? (
                <>
                  <Toolbar />
                  <div className="border rounded-md p-2 min-h-[250px] bg-white">
                    <EditorContent editor={editor} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4 border rounded-md bg-gray-50">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Loading Rich Text Editor...
                </div>
              )}
              <p className="text-sm text-gray-500">
                You can format text, add headings, lists, and styles — just like in Word.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <SubmitButton />
            </DialogFooter>
          </form>
        ) : (
          // This loader shows when course is null (while fetching or when the dialog first opens)
          <div className="text-center py-8 flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading course details...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
