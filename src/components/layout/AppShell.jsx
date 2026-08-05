import {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {ArrowLeft} from "lucide-react"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import PropertySwitcher from "./PropertySwitcher"
import AvatarMenu from "./AvatarMenu"
import useSettingsStore from "@/store/settingsStore"

/**
 * The app shell. Replaces PageWrapper.
 *
 * Absorbs the page-header role too: `title`, `subtitle` and `eyebrow` are
 * all actually rendered (the source design system declared subtitle and
 * eyebrow on every page and displayed neither), and the document title is
 * kept in sync.
 *
 * Responsiveness is now Tailwind, not the legacy !important toggles:
 * `md:` (768px) is the same breakpoint those rules used, so this is 1:1.
 *
 * Z-index ladder for the app:
 *   40  sidebar · topbars · bottom nav · FAB
 *   50  popovers, avatar menu, property switcher
 *   100 dialogs      150 panels inside a dialog      200 toasts
 */
export default function AppShell({
                                     title,
                                     subtitle,
                                     eyebrow,
                                     actions,
                                     mobileAction,
                                     showBack = false,
                                     children,
                                 }) {
    const navigate = useNavigate()
    const companyName = useSettingsStore((s) => s.settings?.companyName) || "RentFlow"

    useEffect(() => {
        document.title = title ? `${title} · ${companyName}` : companyName
    }, [title, companyName])

    return (
        <div className="flex min-h-screen bg-neutral-0">
            <Sidebar/>

            <div className="flex min-h-screen min-w-0 flex-1 flex-col md:pl-60">
                {/* ── Desktop topbar ── */}
                <header
                    className="sticky top-0 z-40 hidden shrink-0 items-center justify-between gap-4 border-b border-neutral-5 bg-white px-4 py-3 md:flex">
                    <div className="flex min-w-0 items-center gap-3">
                        {showBack && (
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                aria-label="Go back"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-50 transition-colors hover:bg-neutral-5 hover:text-neutral-80"
                            >
                                <ArrowLeft size={18}/>
                            </button>
                        )}
                        <div className="min-w-0">
                            {eyebrow && (
                                <p className="text-2xs font-medium uppercase tracking-wide text-neutral-40">{eyebrow}</p>
                            )}
                            <h1 className="min-w-0 truncate font-heading text-xl font-medium tracking-tight text-neutral-90">
                                {title}
                            </h1>
                            {subtitle && <p className="mt-0.5 truncate text-sm text-neutral-40">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2.5">{actions}</div>}
                </header>

                {/* ── Mobile topbar — one sticky block, brand row + property row ── */}
                <header className="sticky top-0 z-40 shrink-0 bg-secondary-900 md:hidden">
                    <div className="flex min-h-15 items-center justify-between gap-3 px-4 py-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            {showBack && (
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    aria-label="Go back"
                                    className="-ml-1 flex shrink-0 items-center p-1 text-white/80"
                                >
                                    <ArrowLeft size={20}/>
                                </button>
                            )}
                            <div className="min-w-0">
                                <p className="truncate font-heading text-base leading-none tracking-[0.01em] text-white">
                                    {companyName}
                                </p>
                                {/* Two lines, not one: the sticky bar can afford the
                                    extra line, and several page subtitles are
                                    sentences that lose their point when clipped. */}
                                <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/55">{subtitle ?? title}</p>
                            </div>
                        </div>
                        <AvatarMenu/>
                    </div>

                    <div className="px-4 pb-3">
                        <PropertySwitcher/>
                    </div>
                </header>

                {/* ── Page content ── */}
                <main className="flex-1 px-3 pt-4 pb-24 md:px-4 md:py-7 md:pb-10">
                    <div className="mx-auto w-full max-w-[1600px]">{children}</div>
                </main>
            </div>

            {mobileAction && (
                <div className="fixed bottom-20 right-5 z-40 md:hidden">{mobileAction}</div>
            )}

            <BottomNav/>
        </div>
    )
}
