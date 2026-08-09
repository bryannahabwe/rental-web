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

    // Focus management: move focus into the dialog on open, keep Tab trapped
    // inside it (WCAG 2.4.3), and return focus to the triggering element on
    // close so keyboard users don't lose their place.
    useEffect(() => {
        const previouslyFocused = document.activeElement
        surfaceRef.current?.focus()

        const focusablesIn = (root) =>
            Array.from(root?.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
                'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ) ?? []).filter((el) => el.offsetParent !== null || el === document.activeElement)

        const onKeyDown = (e) => {
            if (e.key !== "Tab") return
            const surface = surfaceRef.current
            if (!surface) return
            const focusables = focusablesIn(surface)
            if (focusables.length === 0) {
                // Nothing tabbable — keep focus on the surface itself.
                e.preventDefault()
                surface.focus()
                return
            }
            const first = focusables[0]
            const last = focusables[focusables.length - 1]
            const active = document.activeElement
            if (e.shiftKey && (active === first || active === surface)) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && active === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
        }
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
