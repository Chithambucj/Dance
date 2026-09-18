"use client";

import { useState, useTransition } from "react";
import { createAnnouncement, deleteAnnouncement, editAnnouncement } from "@/actions/announcements";
import { Plus, Trash2, Edit2, Loader2, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface AnnouncementManagerProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementManager({ initialAnnouncements }: AnnouncementManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [error, setError]       = useState("");
  const [editError, setEditError] = useState("");
  const [success, setSuccess]   = useState("");
  const [isCreatePending, startCreate] = useTransition();
  const [isEditPending, startEdit] = useTransition();
  const [deletingId, setDeletingId]    = useState<string | null>(null);

  function handleCreate(formData: FormData) {
    setError("");
    startCreate(async () => {
      const result = await createAnnouncement(formData);
      if (result.success) {
        setSuccess("✅ Announcement published to all members!");
        setShowForm(false);
        setTimeout(() => setSuccess(""), 3000);
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
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setEditError(result.error || "Failed to update announcement.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    setDeletingId(id);
    await deleteAnnouncement(id);
    setDeletingId(null);
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
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm">
          {success}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" /> New Announcement
          </h2>
          <form action={handleCreate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">{error}</div>
            )}
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
            <div key={ann.id} className="bg-white rounded-2xl border-0 shadow-sm shadow-gray-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{ann.title}</h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{ann.content}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-3">
                      {new Date(ann.createdAt).toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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

