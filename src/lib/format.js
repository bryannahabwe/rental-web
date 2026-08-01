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

/** `UGX 1.25M` / `UGX 250K` — for KPI tiles and chart axes. */
export const formatUGXShort = (amount) => {
    if (amount == null) return EMPTY
    const n = Number(amount)
    if (Number.isNaN(n)) return EMPTY
    if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`
    if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`
    return `UGX ${n.toLocaleString()}`
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
