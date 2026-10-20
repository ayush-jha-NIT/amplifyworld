BEGIN;

ALTER TABLE inquiries
  ADD COLUMN notification_claim_token UUID,
  ADD COLUMN notification_lease_until TIMESTAMPTZ(3),
  ADD COLUMN notification_provider_id VARCHAR(128);

ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_claim_pair CHECK (
    (notification_status = 'PROCESSING'
      AND notification_claim_token IS NOT NULL AND notification_lease_until IS NOT NULL)
    OR
    (notification_status <> 'PROCESSING'
      AND notification_claim_token IS NULL AND notification_lease_until IS NULL)
  ),
  ADD CONSTRAINT inquiries_provider_id_nonempty CHECK (
    notification_provider_id IS NULL OR length(btrim(notification_provider_id)) > 0
  );

CREATE INDEX inquiries_notification_status_notification_lease_until_idx
  ON inquiries(notification_status, notification_lease_until);

CREATE TABLE inquiry_rate_buckets (
  key_digest CHAR(64) PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT inquiry_rate_buckets_hits_nonnegative CHECK (hits >= 0),
  CONSTRAINT inquiry_rate_buckets_digest_format CHECK (key_digest ~ '^[0-9a-f]{64}$')
);
CREATE INDEX inquiry_rate_buckets_expires_at_idx ON inquiry_rate_buckets(expires_at);

COMMIT;
