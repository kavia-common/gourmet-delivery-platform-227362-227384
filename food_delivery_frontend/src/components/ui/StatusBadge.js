import React from "react";

function normalizeStatus(status) {
  return String(status || "").toLowerCase();
}

/**
 * PUBLIC_INTERFACE
 */
export function StatusBadge({ status }) {
  /** This is a public function. */
  const s = normalizeStatus(status);

  let cls = "badge";
  if (["delivered"].includes(s)) cls += " badge-success";
  else if (["cancelled", "failed"].includes(s)) cls += " badge-danger";
  else if (["picked_up", "preparing", "confirmed", "pending"].includes(s)) cls += " badge-info";
  else cls += " badge-muted";

  return <span className={cls}>{s || "unknown"}</span>;
}
