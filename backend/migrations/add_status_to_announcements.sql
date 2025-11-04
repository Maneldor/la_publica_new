-- Migration: Add status field to Announcement table
-- Date: 2025-10-29

BEGIN;

-- Add status column with default value
ALTER TABLE "Announcement"
ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';

-- Add index for performance
CREATE INDEX "Announcement_status_idx" ON "Announcement"(status);

-- Update existing announcements to have 'approved' status
UPDATE "Announcement" SET status = 'approved' WHERE status IS NULL;

-- Add comment to document possible values
COMMENT ON COLUMN "Announcement".status IS 'Possible values: draft, pending_review, approved, rejected';

COMMIT;