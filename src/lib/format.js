/**
 * Formatting helpers. Previously re-declared across 12 files with
 * subtly different null- and NaN-handling; this is the single source.
 *
 * Every formatter renders a missing/invalid value as an em dash, so
 * callers never need to guard.
 */

const LOCALE = "en-UG"
const EMPTY = "—"

/** `UGX 1,250,000` */
export const formatUGX = (amount) =>
    amount == null ? EMPTY : `UGX ${Number(amount).toLocaleString()}`

/** Only ever strips a fractional tail — `320` must not become `32`. */
const trimZeros = (s) => (s.includes(".") ? s.replace(/\.?0+$/, "") : s)

/**
 * `UGX 1.25M` / `UGX 250K` — for KPI tiles and chart axes.
 *
 * Held to ~3 significant digits (`1.15M`, `32.5M`, `325M`) so the result is
 * never wider than 9 characters. Past that the extra decimals are noise on a
 * KPI, and the tile this exists to serve has no room for them.
 */
export const formatUGXShort = (amount) => {
    if (amount == null) return EMPTY
    const n = Number(amount)
    if (Number.isNaN(n)) return EMPTY
    // Scale on the magnitude, not the signed value — otherwise a negative
    // figure falls past both branches and renders at full length.
    const abs = Math.abs(n)
    const sign = n < 0 ? "−" : ""
    if (abs >= 1_000_000) {
        const m = abs / 1_000_000
        return `UGX ${sign}${trimZeros(m.toFixed(m >= 100 ? 0 : m >= 10 ? 1 : 2))}M`
    }
    if (abs >= 1_000) return `UGX ${sign}${(abs / 1_000).toFixed(0)}K`
    return `UGX ${n.toLocaleString()}`
}

/**
 * Amount inputs are text fields carrying a grouped figure, so the pair below
 * is the mask: `groupDigits` renders it, `parseAmountInput` reads it back.
 *
 * Both pin the separator to en-US rather than the ambient locale — a mask has
 * to strip exactly what it wrote, and a space- or dot-grouped locale would
 * leave the two halves disagreeing.
 */
const MAX_AMOUNT_DIGITS = 12

/** `1150000` → `"1,150,000"`. */
export const groupDigits = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "")
    return digits === "" ? "" : Number(digits).toLocaleString("en-US")
}

/**
 * `"UGX 1,150,000"` → `1150000` — non-digits are dropped, so pasting an
 * already-formatted figure works. Empty stays `""` rather than 0, so a
 * required money field still reports as missing.
 */
export const parseAmountInput = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "").slice(0, MAX_AMOUNT_DIGITS)
    return digits === "" ? "" : Number(digits)
}

const parse = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
}

/** `12 Mar 2024` */
export const formatDate = (value) => {
    const d = parse(value)
    return d
        ? d.toLocaleDateString(LOCALE, {day: "numeric", month: "short", year: "numeric"})
        : EMPTY
}

/** `12 Mar` — billing cycles stay within a year, so the year is noise. */
export const formatCycleDate = (value) => {
    const d = parse(value)
    return d ? d.toLocaleDateString(LOCALE, {day: "numeric", month: "short"}) : EMPTY
}

/** `1 Mar – 31 Mar` */
export const formatCycle = (start, end) =>
    !start || !end ? EMPTY : `${formatCycleDate(start)} – ${formatCycleDate(end)}`

/** `1st`, `2nd`, `23rd` — billing day-of-month. */
export const formatOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/** Empty form fields must reach the API as null, not "". */
export const nullIfEmpty = (value) =>
    value === "" || value === undefined ? null : value

/** `Nahabwe Brian` → `NB`. Falls back to `?`. */
export const initials = (name) => {
    if (!name) return "?"
    const words = name.trim().split(/\s+/)
    const picked = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]
    return picked.toUpperCase()
}

export const todayStr = () => new Date().toISOString().split("T")[0]

/**
 * Relative timestamp plus the absolute form for a tooltip.
 * Always returns the same shape — an invalid date yields empty strings
 * rather than a bare `""`, so callers can read `.rel` unconditionally.
 */
export const formatRelativeTime = (value) => {
    const d = parse(value)
    if (!d) return {rel: "", abs: ""}

    const mins = Math.round((Date.now() - d.getTime()) / 60000)
    const rel =
        mins < 1 ? "just now"
            : mins < 60 ? `${mins}m ago`
                : mins < 1440 ? `${Math.round(mins / 60)}h ago`
                    : `${Math.round(mins / 1440)}d ago`

    const abs = d.toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
    return {rel, abs}
}
