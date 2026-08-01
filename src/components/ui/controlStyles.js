/**
 * The shared form-control visual contract.
 *
 * Input, Textarea, Select and DateField are byte-identical here. If you
 * build a new control, reuse these exactly rather than re-deriving them —
 * that divergence is the single most common source of drift in a form layer.
 */

export const CONTROL_BASE =
    "w-full rounded-lg border bg-white text-sm text-neutral-90 transition-colors " +
    "placeholder:text-neutral-30 focus:outline-hidden focus:ring-4 " +
    "disabled:cursor-not-allowed disabled:bg-neutral-0 disabled:text-neutral-40"

/** Controls use a softer 4px translucent ring plus a border change, not the
 *  global 2px focus outline. */
export const controlState = (invalid) =>
    invalid
        ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
        : "border-neutral-15 focus:border-primary-500 focus:ring-primary-500/20"

/** All form controls are h-11 (44px) — also a sound mobile touch target. */
export const CONTROL_HEIGHT = "h-11"
