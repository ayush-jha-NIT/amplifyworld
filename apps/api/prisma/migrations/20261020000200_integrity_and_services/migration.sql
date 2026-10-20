BEGIN;

-- Prisma cannot express CHECK constraints or triggers. This migration is part
-- of the schema contract and must be preserved by future migrations.
ALTER TABLE admin_users
  ADD CONSTRAINT admin_users_email_normalized CHECK (
    email = lower(btrim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  ADD CONSTRAINT admin_users_identity_nonempty CHECK (
    length(btrim(display_name)) > 0 AND
    length(btrim(auth_provider)) > 0 AND length(btrim(auth_subject)) > 0
  );

ALTER TABLE categories
  ADD CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT categories_name_nonempty CHECK (length(btrim(name)) > 0);

ALTER TABLE services
  ADD CONSTRAINT services_id_format CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT services_name_nonempty CHECK (length(btrim(name)) > 0);

ALTER TABLE posts
  ADD CONSTRAINT posts_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT posts_title_nonempty CHECK (length(btrim(title)) > 0),
  ADD CONSTRAINT posts_published_content CHECK (
    status <> 'PUBLISHED' OR
    (published_at IS NOT NULL AND length(btrim(body)) > 0 AND length(btrim(excerpt)) > 0)
  ),
  ADD CONSTRAINT posts_cover_accessibility CHECK (
    (cover_image_url IS NULL AND cover_image_alt IS NULL) OR
    (cover_image_url IS NOT NULL AND length(btrim(cover_image_url)) > 0 AND
     cover_image_alt IS NOT NULL AND length(btrim(cover_image_alt)) > 0)
  );

ALTER TABLE projects
  ADD CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ADD CONSTRAINT projects_name_nonempty CHECK (length(btrim(name)) > 0),
  ADD CONSTRAINT projects_sort_order CHECK (sort_order >= 0),
  ADD CONSTRAINT projects_publication_review CHECK (
    status <> 'PUBLISHED' OR
    (published_at IS NOT NULL AND claims_reviewed_at IS NOT NULL AND
     length(btrim(description)) > 0 AND length(btrim(body)) > 0)
  );

ALTER TABLE project_media
  ADD CONSTRAINT project_media_sort_order CHECK (sort_order >= 0),
  ADD CONSTRAINT project_media_content_nonempty CHECK (length(btrim(url)) > 0 AND length(btrim(alt)) > 0);

ALTER TABLE inquiries
  ADD CONSTRAINT inquiries_name_nonempty CHECK (length(btrim(name)) > 0),
  ADD CONSTRAINT inquiries_email_normalized CHECK (
    email = lower(btrim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  ADD CONSTRAINT inquiries_message_length CHECK (length(btrim(message)) BETWEEN 20 AND 5000),
  ADD CONSTRAINT inquiries_optional_details CHECK (
    (company IS NULL OR length(btrim(company)) > 0) AND
    (phone IS NULL OR (
      phone ~ '^[+0-9() .-]+$' AND
      length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 7 AND 15
    ))
  ),
  ADD CONSTRAINT inquiries_notification_attempts CHECK (notification_attempts >= 0),
  ADD CONSTRAINT inquiries_sent_timestamp CHECK (
    (notification_status = 'SENT' AND notified_at IS NOT NULL) OR
    (notification_status <> 'SENT' AND notified_at IS NULL)
  ),
  ADD CONSTRAINT inquiries_idempotency_pair CHECK (
    (idempotency_key IS NULL AND request_hash IS NULL) OR
    (idempotency_key IS NOT NULL AND request_hash IS NOT NULL AND request_hash ~ '^[0-9a-f]{64}$')
  ),
  ADD CONSTRAINT inquiries_retention_after_creation CHECK (
    retention_expires_at IS NULL OR retention_expires_at > created_at
  );

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_action_nonempty CHECK (length(btrim(action)) > 0),
  ADD CONSTRAINT audit_events_type_nonempty CHECK (length(btrim(entity_type)) > 0);

-- Keep updated_at reliable for SQL maintenance as well as Prisma mutations.
-- clock_timestamp advances even for multiple updates in one transaction.
CREATE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER project_media_updated_at BEFORE UPDATE ON project_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Approved shared taxonomy, not demo content. No "not-sure" fake service:
-- that explicit frontend selection maps to a nullable inquiry service_id.
INSERT INTO services (id, name) VALUES
  ('performance', 'Meta Ads & Performance Marketing'),
  ('local', 'Google Business Profile Optimization'),
  ('website', 'Growth-Focused Website Development'),
  ('seo-geo', 'SEO & GEO Optimization'),
  ('agentic-ai', 'Agentic AI for Web'),
  ('social', 'Social Media Management');

COMMIT;
