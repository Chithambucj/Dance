import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Image as ImageIcon, Play, Sparkles } from "lucide-react";

export const metadata = {
  title: "Gallery | Dance Studio",
  description: "Browse photos and videos from our Dance Studio — performances, classes, events and studio moments.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolved = await searchParams;
  const currentCategory = resolved.category || "All";

  const allMedia = await prisma.media.findMany({
    where: {
      isPublished: true,
      ...(currentCategory !== "All" ? { category: { equals: currentCategory, mode: "insensitive" } } : {}),
    },
    orderBy: { displayOrder: "asc" },
  });

  const categories = ["All", "Classes", "Events", "Performances", "Studio", "Instructors", "Workshops"];

  return (
    <>
      {/* Header */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF007A]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">Studio Life</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Gallery &amp; Media</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Live snapshots and recordings of our performances, training classes, and community events.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="pb-8">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => {
              const isActive = currentCategory.toLowerCase() === cat.toLowerCase();
              return (
                <a
                  key={cat}
                  href={cat === "All" ? "/gallery" : `/gallery?category=${cat}`}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-[#FF7700] text-white shadow-lg shadow-[#FF7700]/30"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {cat}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4 lg:px-12">
          {allMedia.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-12">
              <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold text-base">No media items in this category yet.</p>
              <p className="text-gray-500 text-xs mt-1">Upload photos from the Admin Gallery module to display them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMedia.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#FF7700]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative h-64 w-full bg-gray-900 overflow-hidden">
                    <Image
                      src={item.publicUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#FF7700] border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    {item.mediaType === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FF7700] transition-colors">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 space-y-1">
                      <h3 className="text-white font-extrabold text-base leading-tight drop-shadow">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-300 text-xs font-medium line-clamp-2 drop-shadow">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
