export function jsonError(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;
  const message = error instanceof Error ? error.message : "Unexpected ArkRide backend error";

  if (status >= 500) {
    console.error("ArkRide API error", error);
  }

  return Response.json({ ok: false, error: message }, { status });
}
