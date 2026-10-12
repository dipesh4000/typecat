export function transactionError(error: unknown, origin = window.location.origin) {
  const message = error instanceof Error ? error.message : String(error)
  if (/cors.*origin.*not allowed/i.test(message)) {
    return `SmoothSend rejected ${origin}. Add this exact origin to the API-key CORS allowlist in your SmoothSend project. TypeCat's ALLOWED_ORIGINS setting does not configure SmoothSend.`
  }
  return message
}
