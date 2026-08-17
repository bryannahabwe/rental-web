import {Link, useNavigate} from "react-router-dom"
import {
    Activity, BarChart3, Briefcase, Building, Building2, ChevronRight, CreditCard,
    FileText, LogOut, Receipt, Tags, UserCircle, Users,
} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import useAuthStore from "@/store/authStore"
import useSettingsStore from "@/store/settingsStore"
import {Avatar, Button, Card} from "@/components/ui"
import {cn} from "@/lib/cn"

/**
 * Nav rows are icon + label + description. The icons already distinguish
 * them, so the chips are a single neutral tint rather than nine hand-picked
 * colours that encoded nothing.
 *
 * `mobileOnly` sections (Manage/Administration/Reports) are operational pages
 * that already live in the desktop sidebar, so on md+ this page shows only the
 * real settings (Account). On mobile there's no sidebar, so Settings doubles as
 * the hub and shows everything.
 */
const SECTIONS = [
    {
        label: "Account",
        items: [
            {icon: UserCircle, label: "My Profile", description: "Your name and phone number", path: "/settings/profile"},
            {icon: Briefcase, label: "Business Profile", description: "Company name, logo and address", path: "/settings/business-profile"},
            {icon: Receipt, label: "Receipt Settings", description: "Prefix, numbering and style", path: "/settings/receipt-settings"},
        ],
    },
    {
        label: "Expenses",
        items: [
            {icon: Tags, label: "Expense Categories", description: "Manage the categories expenses are filed under", path: "/settings/expense-categories"},
            {icon: CreditCard, label: "Payment Methods", description: "Manage how expenses are paid", path: "/settings/payment-methods"},
        ],
    },
    {
        label: "Manage",
        mobileOnly: true,
        items: [
            {icon: Building, label: "Properties", description: "Add and manage properties", path: "/properties"},
            {icon: Building2, label: "Units", description: "Manage your rental units", path: "/units"},
            {icon: FileText, label: "Agreements", description: "Tenant agreements & billing", path: "/agreements"},
        ],
    },
    {
        label: "Administration",
        mobileOnly: true,
        items: [
            {icon: Users, label: "User Management", description: "Invite and manage team members", path: "/users"},
            {icon: Activity, label: "Activity Log", description: "Audit trail of account actions", path: "/activity"},
        ],
    },
    {
        label: "Reports",
        mobileOnly: true,
        items: [
            {icon: BarChart3, label: "Reports", description: "Revenue & occupancy analytics", path: "/reports"},
        ],
    },
]

export default function SettingsPage() {
    const navigate = useNavigate()
    const {landlord, logout} = useAuthStore()
    const {settings, clearSettings} = useSettingsStore()

    const companyName = settings?.companyName || "RentFlow"

    const handleLogout = () => {
        logout()
        clearSettings()
        navigate("/login")
    }

    return (
        <AppShell title="Settings" subtitle="Your account and how the app behaves">
            <div className="mx-auto flex max-w-3xl flex-col gap-5">
                <Card>
                    <div className="flex items-center gap-3.5">
                        <Avatar name={landlord?.name} size={48} className="bg-secondary-900 text-white"/>
                        <div className="min-w-0">
                            <p className="truncate font-heading text-lg font-medium text-neutral-90">
                                {landlord?.name || "Landlord"}
                            </p>
                            <p className="truncate text-sm text-neutral-40">
                                {landlord?.email || landlord?.phoneNumber || companyName}
                            </p>
                        </div>
                    </div>
                </Card>

                {SECTIONS.map((section) => (
                    <section key={section.label} className={cn(section.mobileOnly && "md:hidden")}>
                        <p className="mb-2 px-1 text-2xs font-medium uppercase tracking-wide text-neutral-40">
                            {section.label}
                        </p>
                        <Card bodyClass="p-0">
                            <ul className="divide-y divide-neutral-5">
                                {section.items.map(({icon: Icon, label, description, path}) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-neutral-0"
                                        >
                                            <span
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-5 text-neutral-60">
                                                <Icon size={18}/>
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className="block truncate text-sm font-medium text-neutral-90">{label}</span>
                                                <span
                                                    className="block truncate text-sm text-neutral-40">{description}</span>
                                            </span>
                                            <ChevronRight
                                                size={18}
                                                className="shrink-0 text-neutral-15 transition-colors group-hover:text-primary-500"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </section>
                ))}

                <Button variant="outline" size="lg" iconLeft={LogOut}
                        className="text-danger-600 hover:bg-danger-50" onClick={handleLogout}>
                    Sign out
                </Button>
            </div>
        </AppShell>
    )
}
