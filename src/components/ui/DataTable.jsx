import {ArrowUpDown, ChevronDown, ChevronRight, ChevronUp} from "lucide-react"
import {EmptyState, ErrorState} from "./States"
import {Skeleton} from "./Loader"
import {cn} from "@/lib/cn"

/**
 * ONE column definition drives BOTH the desktop table and the mobile card
 * list. This is the whole point of the component: before it, every list
 * page hand-wrote its rows twice and the two copies drifted.
 *
 * ColumnDef:
 *   key         string                    required
 *   header      string                    required (desktop <th>)
 *   cell        (row, index) => ReactNode  default: row[key]
 *   sortable    boolean
 *   align       'left' | 'right' | 'center'
 *   width       Tailwind width class, e.g. 'w-64'   (desktop only)
 *   cellClass / headerClass  string
 *
 *   card        'title' | 'badge' | 'meta' | 'block' | 'hidden'
 *               DEFAULT 'hidden' — adding a column must never silently
 *               change the mobile card.
 *                 title  the card's headline (exactly one expected)
 *                 badge  sits top-right beside the title
 *                 meta   joins the dot-separated secondary line
 *                 block  a full-width panel below the meta line
 *   cardLabel   label for meta/block; defaults to `header`, pass null to omit
 *   cardOrder   number; ties broken by array order
 *
 * Escape hatch: `renderCard={(row, i) => …}` overrides card roles entirely.
 * Reach for it only after trying `block`.
 *
 * Both trees live in the DOM and swap via `hidden md:block` / `md:hidden`
 * — no resize listener, no hydration flash. `cell()` must stay pure; it
 * runs in both.
 *
 * Sorting is controlled: the table emits onSortChange and never mutates
 * `rows`. Desktop only for now — there is no header row on a card list.
 */

const ALIGN = {left: "text-left", right: "text-right", center: "text-center"}

const keyOf = (row, index, rowKey) => {
    if (typeof rowKey === "function") return rowKey(row)
    if (rowKey && row?.[rowKey] != null) return row[rowKey]
    return index
}

const valueOf = (col, row, index) => (col.cell ? col.cell(row, index) : row?.[col.key] ?? "—")

const byCardOrder = (a, b) => (a.cardOrder ?? 0) - (b.cardOrder ?? 0)

export default function DataTable({
                                      columns = [],
                                      rows = [],
                                      rowKey,
                                      loading = false,
                                      error = null,
                                      onRetry,
                                      sort = null,
                                      onSortChange,
                                      rowClickable = false,
                                      onRowClick,
                                      actions,
                                      actionsCardMode = "footer",
                                      renderCard,
                                      rowClass,
                                      emptyIcon,
                                      emptyTitle,
                                      emptyMessage,
                                      emptyAction,
                                      skeletonRows = 8,
                                      cardSkeletonRows = 4,
                                      className,
                                  }) {
    const titleCol = columns.find((c) => c.card === "title")
    const badgeCols = columns.filter((c) => c.card === "badge").sort(byCardOrder)
    const metaCols = columns.filter((c) => c.card === "meta").sort(byCardOrder)
    const blockCols = columns.filter((c) => c.card === "block").sort(byCardOrder)

    if (import.meta.env.DEV && !renderCard && rows.length > 0 && !titleCol) {
        console.warn(
            "[DataTable] No column declares card:'title', so mobile cards will render without a headline. " +
            "Add card:'title' to the identifying column, or pass renderCard.",
        )
    }

    // Desktop column count, for skeleton alignment. Actions and the click
    // affordance share one trailing cell.
    const totalCols = columns.length + (actions || rowClickable ? 1 : 0)

    if (error) return <ErrorState onRetry={onRetry}/>

    if (!loading && rows.length === 0) {
        return (
            <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                message={emptyMessage}
                action={emptyAction}
            />
        )
    }

    const handleSort = (col) => {
        if (!col.sortable || !onSortChange) return
        const dir = sort?.key === col.key && sort.dir === "asc" ? "desc" : "asc"
        onSortChange({key: col.key, dir})
    }

    const rowProps = (row) =>
        rowClickable && onRowClick
            ? {
                onClick: () => onRowClick(row),
                onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onRowClick(row)
                    }
                },
                tabIndex: 0,
                role: "button",
            }
            : {}

    return (
        <div className={className}>
            {/* ───────────────────────── Desktop table ───────────────────────── */}
            <div className="hidden overflow-x-auto rounded-lg md:block">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                    <tr>
                        {columns.map((col) => {
                            const isSorted = sort?.key === col.key
                            const SortIcon = !isSorted ? ArrowUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown
                            return (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={cn(
                                        "whitespace-nowrap bg-neutral-0/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-40",
                                        ALIGN[col.align ?? "left"],
                                        col.width,
                                        col.headerClass,
                                    )}
                                >
                                    {col.sortable && onSortChange ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(col)}
                                            className={cn(
                                                // `uppercase tracking-wide` is repeated here on purpose: the UA
                                                // stylesheet sets `text-transform: none` on <button>, so without it
                                                // a sortable header renders differently from a plain one.
                                                "inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-neutral-70",
                                                isSorted ? "text-primary-600" : "text-neutral-20",
                                            )}
                                        >
                                            <span className={isSorted ? undefined : "text-neutral-40"}>{col.header}</span>
                                            <SortIcon size={14}/>
                                        </button>
                                    ) : (
                                        col.header
                                    )}
                                </th>
                            )
                        })}
                        {/* Actions and the click affordance share ONE sticky cell.
                            Wide tables (7+ columns of financial data) scroll
                            horizontally, and row actions that scroll out of view
                            are actions the user never discovers. */}
                        {(actions || rowClickable) && (
                            <th aria-hidden="true"
                                className="sticky right-0 z-10 w-px bg-neutral-0 px-4 py-3 shadow-[-8px_0_8px_-8px_rgb(10_74_56_/_0.10)]"/>
                        )}
                    </tr>
                    </thead>

                    <tbody>
                    {loading
                        ? Array.from({length: skeletonRows}).map((_, i) => (
                            <tr key={`sk-${i}`} className="border-b border-neutral-5 last:border-0">
                                {Array.from({length: totalCols}).map((__, j) => (
                                    <td key={j} className="px-4 py-3.5">
                                        <Skeleton height="0.875rem"/>
                                    </td>
                                ))}
                            </tr>
                        ))
                        : rows.map((row, index) => (
                            <tr
                                key={keyOf(row, index, rowKey)}
                                {...rowProps(row)}
                                className={cn(
                                    "group border-b border-neutral-5 transition-colors last:border-0",
                                    // A literal class string, so Tailwind's scanner emits it.
                                    rowClickable && "cursor-pointer hover:bg-neutral-0",
                                    // Row-level state (overdue, not-yet-due, …). Must return
                                    // complete literal classes — no interpolation.
                                    rowClass?.(row, index),
                                )}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={cn(
                                            "px-4 py-3.5 align-middle text-neutral-80",
                                            ALIGN[col.align ?? "left"],
                                            col.cellClass,
                                        )}
                                    >
                                        {valueOf(col, row, index)}
                                    </td>
                                ))}

                                {(actions || rowClickable) && (
                                    <td
                                        className={cn(
                                            "sticky right-0 z-10 w-px whitespace-nowrap px-4 py-3.5 align-middle",
                                            // Matches the row's own background and hover tint, so the
                                            // sticky cell doesn't read as a separate surface.
                                            "bg-white shadow-[-8px_0_8px_-8px_rgb(10_74_56_/_0.10)]",
                                            rowClickable && "group-hover:bg-neutral-0",
                                        )}
                                    >
                                        <div className="flex items-center justify-end gap-2">
                                            {/* The table owns stopPropagation so no page has to remember it. */}
                                            {actions && (
                                                <div className="flex items-center gap-2"
                                                     onClick={(e) => e.stopPropagation()}>
                                                    {actions(row)}
                                                </div>
                                            )}
                                            {rowClickable && (
                                                <span
                                                    className="text-neutral-15 transition-colors group-hover:text-primary-500">
                                                    <ChevronRight size={16}/>
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ───────────────────────── Mobile cards ───────────────────────── */}
            <div className="divide-y divide-neutral-5 md:hidden">
                {loading
                    ? Array.from({length: cardSkeletonRows}).map((_, i) => (
                        <div key={`csk-${i}`} className="flex flex-col gap-2 px-4 py-3.5">
                            <Skeleton width="55%" height="0.9rem"/>
                            <Skeleton width="75%" height="0.75rem"/>
                        </div>
                    ))
                    : rows.map((row, index) => {
                        const key = keyOf(row, index, rowKey)
                        if (renderCard) {
                            return (
                                <div key={key} {...rowProps(row)}
                                     className={cn("group transition-colors", rowClickable && "cursor-pointer active:bg-neutral-0")}>
                                    {renderCard(row, index)}
                                </div>
                            )
                        }

                        const metas = metaCols
                            .map((c) => ({col: c, node: valueOf(c, row, index)}))
                            .filter(({node}) => node != null && node !== "" && node !== "—")

                        return (
                            <div
                                key={key}
                                {...rowProps(row)}
                                className={cn(
                                    "group flex flex-col gap-2 px-4 py-3.5 text-neutral-80 transition-colors",
                                    rowClickable && "cursor-pointer active:bg-neutral-0",
                                    rowClass?.(row, index),
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {titleCol && (
                                        <div className={cn("min-w-0 flex-1 text-sm font-medium text-neutral-90", titleCol.cellClass)}>
                                            {valueOf(titleCol, row, index)}
                                        </div>
                                    )}
                                    <div className="flex shrink-0 items-center gap-2">
                                        {badgeCols.map((c) => (
                                            <span key={c.key}>{valueOf(c, row, index)}</span>
                                        ))}
                                        {rowClickable && <ChevronRight size={16} className="text-neutral-30"/>}
                                    </div>
                                </div>

                                {metas.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-50">
                                        {metas.map(({col, node}, i) => (
                                            <span key={col.key} className="inline-flex items-center gap-1.5">
                                                {i > 0 && <span aria-hidden="true" className="text-neutral-20">·</span>}
                                                {node}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {blockCols.map((col) => {
                                    const label = col.cardLabel === undefined ? col.header : col.cardLabel
                                    return (
                                        <div key={col.key} className="min-w-0">
                                            {label && (
                                                <p className="mb-1 text-2xs font-medium uppercase tracking-wide text-neutral-40">
                                                    {label}
                                                </p>
                                            )}
                                            {valueOf(col, row, index)}
                                        </div>
                                    )
                                })}

                                {actions && actionsCardMode === "footer" && (
                                    <div
                                        className="mt-1 flex flex-wrap items-center gap-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {actions(row)}
                                    </div>
                                )}
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}
