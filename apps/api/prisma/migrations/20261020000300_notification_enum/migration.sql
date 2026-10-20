-- PostgreSQL enum additions must be committed before use in constraints/updates.
ALTER TYPE "NotificationStatus" ADD VALUE 'PROCESSING';
