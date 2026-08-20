import { createFileRoute } from "@tanstack/react-router";
import { Image, Loader2, Search, Trash2, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  MediaAsset,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_MIME_TYPES,
  validateFile,
  uploadMedia,
  fetchUserMedia,
  deleteMedia,
  formatFileSize,
  formatUploadDate,
} from "@/lib/media-service";

export const Route = createFileRoute("/_app/media")({
  head: () => ({ meta: [{ title: "Media library — SocialSync" }] }),
  component: Media,
});

type UploadItem = {
  id: string;
  name: string;
  status: "uploading" | "error";
  error?: string;
};

function Media() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState<UploadItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaAsset | null>(null);

  const loadMedia = async () => {
    if (!user?.id) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchUserMedia(user.id);
      setAssets(data);
    } catch (err: any) {
      setFetchError(err.message ?? "Failed to load media library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [user?.id]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !user?.id) return;
    // Reset input so same file can be re-selected
    e.target.value = "";

    for (const file of files) {
      const { valid, error } = validateFile(file);
      if (!valid) {
        toast.error(error);
        continue;
      }

      const uploadId = crypto.randomUUID();
      setUploading((prev) => [
        ...prev,
        { id: uploadId, name: file.name, status: "uploading" },
      ]);

      try {
        const asset = await uploadMedia(file, user.id);
        setAssets((prev) => [asset, ...prev]);
        toast.success(`"${file.name}" uploaded successfully.`);
      } catch (err: any) {
        toast.error(err.message ?? `Failed to upload "${file.name}".`);
        setUploading((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: "error", error: err.message } : u
          )
        );
        continue;
      } finally {
        setUploading((prev) => prev.filter((u) => u.id !== uploadId));
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || !user?.id) return;
    setDeletingId(confirmDelete.id);
    setConfirmDelete(null);
    const result = await deleteMedia(confirmDelete.id, confirmDelete.storage_path, user.id);
    if (result.success) {
      setAssets((prev) => prev.filter((a) => a.id !== confirmDelete.id));
      toast.success(`"${confirmDelete.file_name}" deleted.`);
    } else {
      toast.error(result.error ?? "Failed to delete media.");
    }
    setDeletingId(null);
  };

  const filtered = assets.filter((a) =>
    a.file_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-base font-semibold">Delete media?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              "{confirmDelete.file_name}" will be permanently deleted from your media
              library. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${assets.length} asset${assets.length !== 1 ? "s" : ""} · reuse across your posts.`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Accepted: JPG, PNG, WEBP, GIF · Max {MAX_IMAGE_SIZE_MB} MB per file
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMedia}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Bulk upload
          </Button>
        </div>
      </div>

      {/* Hidden file input — images only, multiple allowed */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleFileSelect}
        aria-label="Upload images"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search media…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active uploads */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm"
            >
              {u.status === "uploading" ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span className="flex-1 truncate">{u.name}</span>
              <span className="text-xs text-muted-foreground">
                {u.status === "uploading" ? "Uploading…" : u.error}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-card">
              <div className="aspect-square rounded-t-xl bg-secondary" />
              <div className="space-y-1.5 p-3">
                <div className="h-3 w-3/4 rounded bg-secondary" />
                <div className="h-2.5 w-1/2 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && assets.length === 0 && !fetchError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Image className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">No media uploaded yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click "Bulk upload" to add your first images.
          </p>
          <Button
            className="mt-5 bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload your first image
          </Button>
        </div>
      )}

      {/* No search results */}
      {!loading && assets.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No media matches "{query}".</p>
      )}

      {/* Media grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className="group relative cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/40 hover:shadow-glow"
            >
              {/* Real image preview */}
              <div className="aspect-square overflow-hidden bg-secondary">
                <img
                  src={asset.public_url}
                  alt={asset.file_name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Delete button (shown on hover) */}
              <button
                aria-label={`Delete ${asset.file_name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(asset);
                }}
                disabled={deletingId === asset.id}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-destructive disabled:opacity-50"
              >
                {deletingId === asset.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>

              <CardContent className="p-3">
                <p className="truncate text-xs font-medium" title={asset.file_name}>
                  {asset.file_name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(asset.file_size_bytes)} · {formatUploadDate(asset.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}