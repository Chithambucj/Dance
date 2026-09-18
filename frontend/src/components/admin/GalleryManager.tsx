"use client";

import { useState, useTransition } from "react";
import { uploadMediaAction, editMedia, deleteMedia, toggleMediaPublish } from "@/actions/media";
import { Plus, Trash2, Edit2, Loader2, Upload, Image as ImageIcon, Sparkles, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  filePath: string;
  publicUrl: string;
  mediaType: string;
  category: string;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date | string;
}

interface GalleryManagerProps {
  initialMedia: MediaItem[];
}

const categories = ["All", "Classes", "Events", "Performances", "Studio", "Instructors", "Workshops", "General"];

export default function GalleryManager({ initialMedia }: GalleryManagerProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMedia = selectedCategory === "All"
    ? initialMedia
    : initialMedia.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());

  function handleSave(formData: FormData) {
    setError("");
    startTransition(async () => {
      let res;
      if (editingItem) {
        res = await editMedia(editingItem.id, formData);
      } else {
        res = await uploadMediaAction(formData);
      }

      if (res.success) {
        setSuccess(editingItem ? "Media updated successfully!" : "Media uploaded and published!");
        setShowUpload(false);
        setEditingItem(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Failed to save media.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    setDeletingId(id);
    await deleteMedia(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Gallery &amp; Media Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Upload studio photos and videos that appear on the public website.</p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setShowUpload(!showUpload);
          }}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        >
          {showUpload ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          {showUpload ? "Cancel" : "Upload Media"}
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm">
          ✅ {success}
        </div>
      )}

      {/* Upload / Edit Form */}
      {showUpload && (
        <div className="bg-white rounded-3xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" /> {editingItem ? "Edit Media Details" : "Upload New Media"}
          </h2>
          <form action={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-gray-700 font-semibold text-sm">Media Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingItem?.title || ""}
                  placeholder="e.g. Annual Showcase 2026 Finale"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-gray-700 font-semibold text-sm">Category</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingItem?.category || "Classes"}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 font-medium"
                >
                  <option value="Classes">Classes</option>
                  <option value="Events">Events</option>
                  <option value="Performances">Performances</option>
                  <option value="Studio">Studio</option>
                  <option value="Instructors">Instructors</option>
                  <option value="Workshops">Workshops</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="file" className="text-gray-700 font-semibold text-sm">
                  {editingItem ? "Replace File (optional)" : "Upload File (Image/Video)"}
                </Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*,video/*"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11 cursor-pointer pt-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="externalUrl" className="text-gray-700 font-semibold text-sm">
                  Or Existing / External URL
                </Label>
                <Input
                  id="externalUrl"
                  name={editingItem ? "publicUrl" : "externalUrl"}
                  defaultValue={editingItem?.publicUrl || ""}
                  placeholder="e.g. /images/about-studio.jpg or https://..."
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-gray-700 font-semibold text-sm">Description (optional)</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={editingItem?.description || ""}
                placeholder="Caption or description of the moment..."
                rows={2}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={editingItem?.isFeatured ?? false}
                  className="w-4 h-4 rounded text-primary"
                />
                Featured on Homepage
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={editingItem?.isPublished ?? true}
                  className="w-4 h-4 rounded text-primary"
                />
                Published (Visible on Public Website)
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUpload(false);
                  setEditingItem(null);
                }}
                className="rounded-xl font-bold h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : editingItem ? "Save Changes" : "Upload Media"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">No media in this category.</p>
            <p className="text-gray-300 text-xs mt-1">Upload photos to showcase your studio life.</p>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div className="relative h-44 w-full bg-gray-900 overflow-hidden">
                <Image
                  src={item.publicUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {item.category}
                  </span>
                  {item.isFeatured && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary text-white">
                      Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-gray-300 text-[10px] truncate">{item.description}</p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-white flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleMediaPublish(item.id, !item.isPublished)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isPublished ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {item.isPublished ? "Published" : "Draft"}
                </button>

                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Preview Media"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowUpload(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit Media Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Media"
                  >
                    {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative h-[480px] w-full">
              <Image src={previewItem.publicUrl} alt={previewItem.title} fill className="object-contain" />
            </div>
            <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent text-white">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{previewItem.category}</span>
              <h3 className="text-2xl font-black mt-1">{previewItem.title}</h3>
              {previewItem.description && (
                <p className="text-sm text-gray-300 mt-2">{previewItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
