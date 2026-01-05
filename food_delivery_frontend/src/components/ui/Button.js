import React from "react";

/**
 * PUBLIC_INTERFACE
 */
export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  /** This is a public function. */
  return <button className={`btn btn-${variant} btn-${size} ${className}`.trim()} {...props} />;
}
