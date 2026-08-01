import {useEffect, useRef} from "react"
import {createPortal} from "react-dom"
import {X} from "lucide-react"
import {cn} from "@/lib/cn"
import {DIALOG_BASE, surfaceClass} from "./dialogSurface"

/**
 * Declarative dialog. The app already renders modals as
 * `{open && <Thing onClose={…} />}`, which is the idiomatic React form —
 * so there is no imperative open() service here. For confirmations, where
 * a promise genuinely pays, use `useConfirm()`.
 *
 *   <Dialog title="Record payment" onClose={close} size="lg">…</Dialog>
 *
 * `position="responsive"` (the default) is a bottom sheet on phones and a
 * centered modal from md up — the behaviour the old BottomSheet had, but
 * rendering children ONCE instead of twice.
 */

export default function Dialog({
                                   title,
                                   subtitle,
                                   onClose,
                                   position = "responsive",
                                   size = "md",
                                   dismissible = true,
                                   hideHeader = false,
                                   footer,
                                   bodyClass,
                                   className,
                                   ariaLabel,
                                   children,
                               }) {
    const surfaceRef = useRef(null)

    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    useEffect(() => {
        if (!dismissible) return
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.()
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [dismissible, onClose])

    // Move focus into the dialog so keyboard users don't stay behind it.
    useEffect(() => {
        surfaceRef.current?.focus()
    }, [])

    const showsHandle = position === "responsive" || position === "bottom"

    return createPortal(
        <>
            <div
                onClick={dismissible ? onClose : undefined}
                className="fixed inset-0 z-100 bg-neutral-95/50 backdrop-blur-[2px] animate-fade-in"
            />

            <div
                ref={surfaceRef}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel ?? title}
                tabIndex={-1}
                className={cn(DIALOG_BASE, surfaceClass(position, size), "focus:outline-hidden", className)}
            >
                {/* Drag affordance — mobile sheets only. */}
                {showsHandle && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-neutral-10",
                            position === "responsive" && "md:hidden",
                        )}
                    />
                )}

                {!hideHeader && (title || dismissible) && (
                    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-5 px-5 py-4 md:px-6">
                        <div className="min-w-0">
                            {title && (
                                <h2 className="truncate font-heading text-lg font-medium text-neutral-90">{title}</h2>
                            )}
                            {subtitle && <p className="mt-0.5 text-sm text-neutral-40">{subtitle}</p>}
                        </div>
                        {dismissible && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-40 transition-colors hover:bg-neutral-5 hover:text-neutral-70"
                            >
                                <X size={20}/>
                            </button>
                        )}
                    </div>
                )}

                <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6", bodyClass)}>{children}</div>

                {footer && (
                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-neutral-5 px-5 py-4 md:px-6">
                        {footer}
                    </div>
                )}
            </div>
        </>,
        document.body,
    )
}
