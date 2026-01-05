import React from "react";

/**
 * PUBLIC_INTERFACE
 */
export function Card({ className = "", children }) {
  /** This is a public function. */
  return <div className={`card ${className}`.trim()}>{children}</div>;
}
