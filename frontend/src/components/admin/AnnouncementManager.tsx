"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAnnouncement,
  deleteAnnouncement,
  editAnnouncement,
  togglePublishAnnouncement,
} from "@/actions/announcements";
import { Plus, Trash2, Edit2, Loader2, Megaphone, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished?: boolean;
  createdAt: Date | string;
}

interface AnnouncementManagerProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementManager({ initialAnnouncements }: AnnouncementManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [error, setError]       = useState("");
  const [editError, setEditError] = useState("");
  const [success, setSuccess]   = useState("");
  const [isCreatePending, startCreate] = useTransition();
  const [isEditPending, startEdit] = useTransition();
  const [deletingId, setDeletingId]    = useState<string | null>(null);
  const [togglingId, setTogglingId]    = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    setError("");
    startCreate(async () => {
      const result = await createAnnouncement(formData);
      if (result.success) {
        setSuccess("✅ Announcement published to all members!");
        setShowForm(false);
        router.refresh();
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(result.error || "Failed to create announcement.");
      }
    });
  }

  function handleEdit(formData: FormData) {
    if (!editingAnnouncement) return;
    setEditError("");
    startEdit(async () => {
      const result = await editAnnouncement(editingAnnouncement.id, formData);
      if (result.success) {
        setSuccess("✅ Announcement updated successfully!");
        setEditingAnnouncement(null);
        router.refresh();
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setEditError(result.error || "Failed to update announcement.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setDeletingId(id);
    const result = await deleteAnnouncement(id);
    if (result.success) {
      setSuccess("✅ Announcement deleted successfully!");
      router.refresh();
      setTimeout(() => setSuccess(""), 3500);
    } else {
      setError(result.error || "Failed to delete announcement.");
    }
    setDeletingId(null);
  }

  async function handleTogglePublish(ann: Announcement) {
    const nextState = !ann.isPublished;
    setTogglingId(ann.id);
    const result = await togglePublishAnnouncement(ann.id, nextState);
    if (result.success) {
      setSuccess(nextState ? "✅ Announcement published to members!" : "✅ Announcement unpublished (saved as draft)!");
      router.refresh();
      setTimeout(() => setSuccess(""), 3500);
    } else {
      setError(result.error || "Failed to update announcement publication status.");
    }
    setTogglingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Announcements</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and manage studio announcements for members.</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingAnnouncement(null);
          }}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm animate-in fade-in">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-semibold text-sm animate-in fade-in">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> New Announcement
          </h2>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title" className="text-gray-700 font-semibold text-sm">Title *</Label>
              <Input
                id="ann-title"
                name="title"
                placeholder="e.g. Studio closed on Sunday"
                required
                className="rounded-xl bg-gray-50 border-gray-200 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-content" className="text-gray-700 font-semibold text-sm">Message *</Label>
              <textarea
                id="ann-content"
                name="content"
                placeholder="Write the full announcement here..."
                required
                rows={4}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={true}
                  className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/20 accent-primary"
                />
                Publish immediately to members
              </label>

              <Button
                type="submit"
                disabled={isCreatePending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11"
              >
                {isCreatePending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                  </span>
                ) : "Publish Announcement"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" /> Edit Announcement
              </h2>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleEdit} className="p-5 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                  {editError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-gray-700 font-semibold text-sm">Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingAnnouncement.title}
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-content" className="text-gray-700 font-semibold text-sm">Message *</Label>
                <textarea
                  id="edit-content"
                  name="content"
                  defaultValue={editingAnnouncement.content}
                  required
                  rows={4}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={editingAnnouncement.isPublished ?? true}
                    className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/20 accent-primary"
                  />
                  Published (visible to members)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAnnouncement(null)}
                  className="rounded-xl font-semibold h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditPending}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11"
                >
                  {isEditPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </span>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Cards */}
      <div className="space-y-4">
        {initialAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border-0 shadow-sm shadow-gray-100 p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No announcements yet.</p>
            <p className="text-gray-300 text-sm mt-1">Click &quot;New Announcement&quot; to publish one.</p>
          </div>
        ) : (
          initialAnnouncements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl border-0 shadow-sm shadow-gray-100 p-6 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{ann.title}</h3>
                      <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        ann.isPublished
                          ? "bg-green-50 text-green-700 border border-green-200/60"
                          : "bg-amber-50 text-amber-700 border border-amber-200/60"
                      }`}>
                        {ann.isPublished ? "Published" : "Unpublished"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed whitespace-pre-line">{ann.content}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-3">
                      {new Date(ann.createdAt).toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(ann)}
                    disabled={togglingId === ann.id}
                    className={`p-2 rounded-xl transition-colors ${
                      ann.isPublished
                        ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                        : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                    }`}
                    title={ann.isPublished ? "Unpublish announcement" : "Publish announcement"}
                  >
                    {togglingId === ann.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : ann.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingAnnouncement(ann)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    title="Edit announcement"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    disabled={deletingId === ann.id}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete announcement"
                  >
                    {deletingId === ann.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
