import { supabase } from "./supabase";

// ─── Configuration ────────────────────────────────────────────────────────────
/** Maximum image upload size in megabytes. Change this constant to update the limit app-wide. */
export const MAX_IMAGE_SIZE_MB = 10;

const MAX_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** Allowed MIME types. Only these will pass validation — file extension alone is not trusted. */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

/** Supabase Storage bucket name */
const BUCKET = "socialsync-media";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MediaAsset {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────
/**
 * Validates a file before uploading.
 * Checks MIME type from the browser File object (not just the extension).
 * Returns { valid: true } on success, or { valid: false, error: string } on failure.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 1. Check MIME type first — do NOT trust the extension alone
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type "${file.type || "unknown"}". Please upload JPG, PNG, WEBP, or GIF.`,
    };
  }

  // 2. Also check the file extension matches the MIME type (defence in depth)
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension ".${ext}" does not match an allowed image type.`,
    };
  }

  // 3. Check file size
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeMb} MB — maximum allowed size is ${MAX_IMAGE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

// ─── Upload ───────────────────────────────────────────────────────────────────
/**
 * Uploads a validated image file to Supabase Storage at:
 *   socialsync-media/{userId}/{uuid}.{ext}
 *
 * Then saves metadata to the media_assets table.
 * Cleans up orphaned storage file if the DB insert fails.
 * RLS on both storage and DB ensures users can only access their own files.
 */
export async function uploadMedia(
  file: File,
  userId: string
): Promise<MediaAsset> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const uuid = crypto.randomUUID();
  const storagePath = `${userId}/${uuid}.${ext}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get the public URL for display
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  // Save metadata to database
  const { data, error: dbError } = await supabase
    .from("media_assets")
    .insert({
      user_id: userId,
      file_name: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: file.type,
      file_size_bytes: file.size,
    })
    .select()
    .single();

  if (dbError || !data) {
    // Clean up the orphaned storage file if DB save failed
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Failed to save media metadata: ${dbError?.message}`);
  }

  return data as MediaAsset;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
/** Fetches all media assets for the user from the database, newest first. */
export async function fetchUserMedia(userId: string): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load media: ${error.message}`);
  }

  return (data ?? []) as MediaAsset[];
}

// ─── Delete ───────────────────────────────────────────────────────────────────
/**
 * Deletes a media asset from Supabase Storage and removes the DB metadata record.
 * Both scoped to the user's own files via RLS and storage path prefix.
 */
export async function deleteMedia(
  assetId: string,
  storagePath: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (storageError) {
    return { success: false, error: `Storage delete failed: ${storageError.message}` };
  }

  // 2. Delete metadata from DB (RLS enforces user_id match server-side)
  const { error: dbError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", assetId)
    .eq("user_id", userId);

  if (dbError) {
    return { success: false, error: `DB delete failed: ${dbError.message}` };
  }

  return { success: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Formats a raw byte count into a human-readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Formats an ISO date string as a user-friendly relative label. */
export function formatUploadDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
