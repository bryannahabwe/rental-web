import {cn} from "@/lib/cn"

/**
 * The standard surface container.
 *
 * `h-full` on the root means cards in the same grid row match heights
 * automatically — no `items-stretch` on the grid.
 *
 * Two header regions, deliberately:
 *   - the built-in header renders on `title` OR `subtitle`, and holds
 *     `actions` beside the title;
 *   - `header` is a separate region below it, always rendered when passed.
 *     Use it for a toolbar or filter row.
 *
 * `bodyClass="p-0"` is the standard override when the card wraps a table
 * or a list that manages its own padding.
 */
export default function Card({
                                 title,
                                 subtitle,
                                 actions,
                                 header,
                                 footer,
                                 elevated = true,
                                 interactive = false,
                                 bodyClass = "p-5",
                                 className,
                                 children,
                                 ...rest
                             }) {
    const hasTitleBlock = title || subtitle

    return (
        <div
            className={cn(
                "flex h-full flex-col overflow-hidden rounded-lg border border-neutral-5 bg-white",
                elevated && "shadow-card",
                interactive && "transition-shadow hover:shadow-card-hover",
                className,
            )}
            {...rest}
        >
            {hasTitleBlock && (
                <div className="flex items-center justify-between gap-3 border-b border-neutral-5 px-5 py-4">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="truncate font-heading text-base font-medium text-neutral-90">{title}</h3>
                        )}
                        {/* Wraps rather than truncates — a card header has no height
                            budget to protect, and subtitles here are full sentences
                            that read as broken when clipped mid-clause. */}
                        {subtitle && <p className="mt-0.5 text-sm leading-snug text-neutral-40">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
            )}

            {header}

            <div className={cn("min-w-0", bodyClass)}>{children}</div>

            {footer && (
                <div className="flex items-center justify-end gap-3 border-t border-neutral-5 px-5 py-4">
                    {footer}
                </div>
            )}
        </div>
    )
}
