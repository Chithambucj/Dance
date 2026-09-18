import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/actions/auth";
import { uploadFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const res = await uploadFile(file, folder);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: res.url, filePath: res.filePath });
  } catch (err: unknown) {
    console.error("Upload API error:", err);
    return NextResponse.json({ success: false, error: "Unauthorized or upload failed." }, { status: 401 });
  }
}
