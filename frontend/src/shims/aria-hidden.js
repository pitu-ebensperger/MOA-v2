// Shim for aria-hidden functionality
// This provides compatibility for @radix-ui components that may reference aria-hidden

export default function ariaHidden() {
  // No-op shim - modern browsers support aria-hidden natively
  return;
}
