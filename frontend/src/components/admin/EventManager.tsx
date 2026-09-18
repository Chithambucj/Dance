"use client";

import { useState, useTransition } from "react";
import { createEvent, editEvent, deleteEvent } from "@/actions/events";
import { Plus, Trash2, Edit2, Loader2, Calendar, MapPin, ExternalLink, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudioEvent {
  id: string;
  title: string;
  description: string;
  image: string | null;
  eventDate: Date | string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  registrationRequired: boolean;
  registrationLink: string | null;
  category: string;
  isPublished: boolean;
}

interface EventManagerProps {
  initialEvents: StudioEvent[];
}

export default function EventManager({ initialEvents }: EventManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudioEvent | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSave(formData: FormData) {
    setError("");
    startTransition(async () => {
      let res;
      if (editingEvent) {
        res = await editEvent(editingEvent.id, formData);
      } else {
        res = await createEvent(formData);
      }

      if (res.success) {
        setSuccess(editingEvent ? "Event updated successfully!" : "Event created successfully!");
        setShowForm(false);
        setEditingEvent(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Operation failed.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeletingId(id);
    await deleteEvent(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Events &amp; Workshops</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage studio workshops, showcases, battles, and masterclasses.</p>
        </div>
        <Button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(!showForm);
          }}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Event"}
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm">
          ✅ {success}
        </div>
      )}

      {/* Event Form Modal / Expandable */}
      {showForm && (
        <div className="bg-white rounded-3xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> {editingEvent ? "Edit Event" : "Create New Event"}
          </h2>
          <form action={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-gray-700 font-semibold text-sm">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingEvent?.title || ""}
                  placeholder="e.g. Summer Hip Hop Battle"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-gray-700 font-semibold text-sm">Category</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingEvent?.category || "Workshop"}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 font-medium"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Showcase">Showcase</option>
                  <option value="Competition">Competition</option>
                  <option value="Special Class">Special Class</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="eventDate" className="text-gray-700 font-semibold text-sm">Event Date *</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  defaultValue={
                    editingEvent?.eventDate
                      ? new Date(editingEvent.eventDate).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="startTime" className="text-gray-700 font-semibold text-sm">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  defaultValue={editingEvent?.startTime || "4:00 PM"}
                  placeholder="e.g. 4:00 PM"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endTime" className="text-gray-700 font-semibold text-sm">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  defaultValue={editingEvent?.endTime || "7:00 PM"}
                  placeholder="e.g. 7:00 PM"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-gray-700 font-semibold text-sm">Location / Venue</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingEvent?.location || "Main Studio Hall, Bandra"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image" className="text-gray-700 font-semibold text-sm">Banner Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  defaultValue={editingEvent?.image || "/images/hip-hop.jpg"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-gray-700 font-semibold text-sm">Description *</Label>
              <textarea
                id="description"
                name="description"
                defaultValue={editingEvent?.description || ""}
                required
                rows={3}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="registrationLink" className="text-gray-700 font-semibold text-sm">Registration Link (optional)</Label>
                <Input
                  id="registrationLink"
                  name="registrationLink"
                  defaultValue={editingEvent?.registrationLink || ""}
                  placeholder="https://..."
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="flex items-center gap-6 pt-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="registrationRequired"
                    defaultChecked={editingEvent?.registrationRequired ?? false}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Requires Registration
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={editingEvent?.isPublished ?? true}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Publish on Website
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
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
                ) : editingEvent ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialEvents.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-semibold">No events created yet.</p>
            <p className="text-gray-300 text-xs mt-1">Click &quot;Add Event&quot; to publish your first workshop or showcase.</p>
          </div>
        ) : (
          initialEvents.map((evt) => (
            <div key={evt.id} className="bg-white rounded-3xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {evt.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    evt.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}>
                    {evt.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{evt.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-3">{evt.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs text-gray-600 font-medium">
                  <p className="flex items-center gap-2 text-primary font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(evt.eventDate).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    {evt.startTime && ` • ${evt.startTime}`}
                  </p>
                  <p className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {evt.location || "Main Studio"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingEvent(evt);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    disabled={deletingId === evt.id}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Event"
                  >
                    {deletingId === evt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>

                {evt.registrationLink && (
                  <a
                    href={evt.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Reg Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
