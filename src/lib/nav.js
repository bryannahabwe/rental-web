import {
    Activity, BarChart3, Building2, CreditCard, FileText, Home,
    LayoutDashboard, Receipt, Scale, Settings, UserCog, Users, Wallet,
} from "lucide-react"

/**
 * The app's navigation destinations, in priority order, each tagged with the
 * capability it needs and (for the ones that land on the More page) the group
 * it belongs to. This is the single source both the mobile bottom nav and the
 * More page read from, so they can't drift apart.
 *
 * The bottom nav turns the first {@link PRIMARY_TABS} a user can reach into
 * tabs; everything else they can reach is shown on the More page, grouped by
 * `group`.
 */
export const PRIMARY_TABS = 3

export const NAV_DESTINATIONS = [
    {label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, can: "viewReports", group: null, description: "Portfolio overview"},
    {label: "Tenants", path: "/tenants", icon: Users, can: "viewOperations", group: null, description: "Everyone renting"},
    {label: "Payments", path: "/payments", icon: CreditCard, can: "viewOperations", group: null, description: "Recorded payments"},
    {label: "Units", path: "/units", icon: Building2, can: "viewOperations", group: "Manage", description: "Rooms and occupancy"},
    {label: "Agreements", path: "/agreements", icon: FileText, can: "viewOperations", group: "Manage", description: "Tenancies and move-outs"},
    {label: "Income", path: "/income", icon: Wallet, can: "viewOperations", group: "Finances", description: "Rent and other income"},
    {label: "Expenses", path: "/expenses", icon: Receipt, can: "viewOperations", group: "Finances", description: "Property costs"},
    {label: "Finances", path: "/finances", icon: Scale, can: "viewReports", group: "Finances", description: "Income vs expenses"},
    {label: "Properties", path: "/properties", icon: Home, can: "manageProperties", group: "Manage", description: "Buildings you manage"},
    {label: "Reports", path: "/reports", icon: BarChart3, can: "viewReports", group: "Reports & logs", description: "Collections and occupancy"},
    {label: "Users", path: "/users", icon: UserCog, can: "manageUsers", group: "Manage", description: "Manage staff accounts"},
    {label: "Activity", path: "/activity", icon: Activity, can: "viewActivity", group: "Reports & logs", description: "Audit trail of changes"},
    {label: "Settings", path: "/settings", icon: Settings, can: "manageBranding", group: "Manage", description: "Branding, receipts and defaults"},
]

export const MORE_PATH = "/more"

/**
 * A destination owns the current page when the path matches it or nests under
 * it — so /tenants/123 keeps Tenants active and /settings/profile keeps
 * Settings active.
 */
export const ownsPath = (pathname, path) =>
    pathname === path || pathname.startsWith(path + "/")
