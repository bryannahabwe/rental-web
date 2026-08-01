import {useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {LogOut, User} from "lucide-react"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import {Avatar} from "@/components/ui"
import {cn} from "@/lib/cn"

/** Extracted from PageWrapper, which was half AvatarMenu by line count. */
export default function AvatarMenu() {
    const {landlord, logout} = useAuthStore()
    const {settings, clearSettings} = useSettingsStore()
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const companyName = settings?.companyName || "RentFlow"
    const logoUrl = settings?.logoUrl || null

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleLogout = () => {
        logout()
        clearSettings()
        navigate("/login")
    }

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                className={cn(
                    "rounded-full border-2 transition-colors",
                    open ? "border-primary-300" : "border-transparent",
                )}
            >
                <Avatar name={landlord?.name} size={36} className="bg-primary-400 text-white"/>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-neutral-5 bg-white shadow-dialog animate-scale-in"
                >
                    <div className="flex items-center gap-3 border-b border-neutral-5 px-4 py-3.5">
                        <Avatar name={landlord?.name} size={38} className="bg-secondary-900 text-white"/>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-90">
                                {landlord?.name || "Landlord"}
                            </p>
                            <p className="truncate text-xs text-neutral-40">{landlord?.phoneNumber || ""}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-b border-neutral-5 px-4 py-2.5">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName}
                                 className="h-7 w-7 shrink-0 rounded-md border border-neutral-5 object-contain"/>
                        ) : (
                            <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 font-heading text-xs text-primary-700">
                                {companyName.charAt(0)}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate font-heading text-sm leading-none text-secondary-900">{companyName}</p>
                            <p className="mt-0.5 text-2xs text-neutral-40">Property Management</p>
                        </div>
                    </div>

                    <div className="p-1.5">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false)
                                navigate("/settings/profile")
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-neutral-70 transition-colors hover:bg-neutral-5"
                        >
                            <User size={16}/> My profile
                        </button>
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger-600 transition-colors hover:bg-danger-50"
                        >
                            <LogOut size={16}/> Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
