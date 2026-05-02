// ────────────────────────────────────────────────────────────────────────────
// Grow Photos — data model scaffold
//
// BLOCKED ON: Supabase Storage bucket + auth
// Next steps:
//   1. Create `grow-photos` bucket in Supabase Storage (private, owner-only write)
//   2. Add `grow_photos` table tracking metadata + storage path
//   3. Enable RLS: owners can upload/delete, public can read published photos
//   4. Integrate with GrowDetail page photo gallery
// ────────────────────────────────────────────────────────────────────────────

export type GrowPhotoType =
  | 'overview'   // full plant shot
  | 'closeup'    // detail / trichome
  | 'deficiency' // problem documentation
  | 'harvest';   // final harvest photo

/** A single photo attached to a grow or a specific log entry. */
export type GrowPhoto = {
  id: string;
  growId: string;
  logEntryId?: string;          // optional: attached to specific log entry
  ownerId: string;              // auth.users.id
  storagePath: string;          // Supabase Storage path, e.g. `grows/{growId}/{id}.webp`
  publicUrl?: string;           // resolved CDN URL after upload
  thumbnailUrl?: string;        // optimised 320px version
  type: GrowPhotoType;
  caption?: string;
  takenAt?: string;             // ISO-8601 – when the photo was taken
  uploadedAt: string;           // ISO-8601
  day?: number;                 // grow day when taken
  width?: number;
  height?: number;
  fileSizeBytes?: number;
};

/** What the client sends when uploading a new photo. */
export type GrowPhotoUploadInput = {
  growId: string;
  logEntryId?: string;
  type: GrowPhotoType;
  caption?: string;
  takenAt?: string;
  day?: number;
  // File itself is sent as multipart/form-data, not in this interface
};
