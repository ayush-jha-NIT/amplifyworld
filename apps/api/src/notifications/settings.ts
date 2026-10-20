/** Only private server-side configuration can turn on the notification worker. */
export function workerEnabled(env: NodeJS.ProcessEnv): boolean {
  return env.INQUIRY_EMAIL_ENABLED === "true" &&
    env.INQUIRY_COLLECTION_ENABLED === "true" &&
    env.INQUIRY_PRIVACY_POLICY_APPROVED === "true" &&
    Boolean(env.DATABASE_URL);
}
