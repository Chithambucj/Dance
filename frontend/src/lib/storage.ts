import fs from "fs";
import path from "path";

/**
 * Storage Utility
 * Supports Supabase Storage with graceful fallback to local `/public/uploads/`
 */
export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<{ success: boolean; url?: string; filePath?: string; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");

    // 1. If Supabase is configured, upload to Supabase Storage bucket
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const bucketName = "gallery";
        const storagePath = `${cleanFolder}/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(storagePath);

          return {
            success: true,
            url: publicUrlData.publicUrl,
            filePath: storagePath,
          };
        }
      } catch (sbErr) {
        console.warn("Supabase upload fallback to local storage:", sbErr);
      }
    }

    // 2. Fallback: Save to `/public/uploads/[folder]/`
    const uploadsDir = path.join(process.cwd(), "public", "uploads", cleanFolder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/uploads/${cleanFolder}/${fileName}`;
    return {
      success: true,
      url: publicUrl,
      filePath: publicUrl,
    };
  } catch (err: unknown) {
    console.error("Storage upload error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload file.",
    };
  }
}
