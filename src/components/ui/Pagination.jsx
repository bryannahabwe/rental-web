import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "lucide-react"
import Select from "./Select"
import {cn} from "@/lib/cn"

/**
 * ZERO-BASED `page`, matching the app's Spring-shaped hooks
 * ({page, size} in → {totalPages, totalElements} out). Do not make call
 * sites do page±1.
 *
 * Mobile: the numbered buttons collapse to "Page X of Y" below `sm`, and
 * the rows-per-page control is hidden — neither fits a 375px viewport.
 *
 * Convention: when pageSize changes, reset page to 0.
 */
const ARROW =
    "flex h-9 w-9 items-center justify-center rounded-lg text-neutral-50 transition-colors " +
    "hover:bg-neutral-5 disabled:opacity-40 disabled:hover:bg-transparent"

/** Windowed page numbers with ellipses, e.g. 1 … 4 5 6 … 20 */
function pageWindow(current, total) {
    if (total <= 7) return Array.from({length: total}, (_, i) => i)
    const pages = new Set([0, total - 1, current])
    for (let d = 1; d <= 1; d++) {
        if (current - d >= 0) pages.add(current - d)
        if (current + d < total) pages.add(current + d)
    }
    const sorted = [...pages].sort((a, b) => a - b)
    const out = []
    let prev = null
    for (const p of sorted) {
        if (prev !== null && p - prev > 1) out.push("…")
        out.push(p)
        prev = p
    }
    return out
}

export default function Pagination({
                                       page = 0,
                                       pageSize,
                                       totalPages = 0,
                                       totalElements,
                                       onPageChange,
                                       onPageSizeChange,
                                       pageSizeOptions = [10, 25, 50],
                                       className,
                                   }) {
    if (totalPages <= 1 && !onPageSizeChange) return null

    const first = page * (pageSize ?? 0) + 1
    const last = totalElements != null && pageSize != null
        ? Math.min((page + 1) * pageSize, totalElements)
        : null

    return (
        <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
            <div className="flex items-center gap-3 text-sm text-neutral-50">
                {totalElements != null && (
                    <span className="tabular-nums">
                        {totalElements === 0
                            ? "No results"
                            : last != null
                                ? `${first}–${last} of ${totalElements}`
                                : `${totalElements} results`}
                    </span>
                )}
                {onPageSizeChange && (
                    <Select
                        className="hidden h-9 w-20 sm:block"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        options={pageSizeOptions.map((n) => ({label: String(n), value: n}))}
                        aria-label="Rows per page"
                    />
                )}
            </div>

            <div className="flex items-center gap-1">
                <button type="button" className={ARROW} disabled={page === 0}
                        onClick={() => onPageChange(0)} aria-label="First page">
                    <ChevronsLeft size={18}/>
                </button>
                <button type="button" className={ARROW} disabled={page === 0}
                        onClick={() => onPageChange(page - 1)} aria-label="Previous page">
                    <ChevronLeft size={18}/>
                </button>

                {/* Numbered pages — desktop only. */}
                <div className="hidden items-center gap-1 sm:flex">
                    {pageWindow(page, totalPages).map((p, i) =>
                        p === "…" ? (
                            <span key={`gap-${i}`} className="px-1 text-neutral-30">…</span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                aria-current={p === page ? "page" : undefined}
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    "flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5",
                                    "text-sm font-medium tabular-nums transition-colors",
                                    p === page
                                        ? "bg-secondary-900 text-white"
                                        : "text-neutral-60 hover:bg-neutral-5",
                                )}
                            >
                                {p + 1}
                            </button>
                        ),
                    )}
                </div>

                {/* Compact indicator — phones. */}
                <span className="px-2 text-sm tabular-nums text-neutral-50 sm:hidden">
                    {page + 1} / {totalPages || 1}
                </span>

                <button type="button" className={ARROW} disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)} aria-label="Next page">
                    <ChevronRight size={18}/>
                </button>
                <button type="button" className={ARROW} disabled={page >= totalPages - 1}
                        onClick={() => onPageChange(totalPages - 1)} aria-label="Last page">
                    <ChevronsRight size={18}/>
                </button>
            </div>
        </div>
    )
}
