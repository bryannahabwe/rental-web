import {useState} from "react"
import {
    BarChart3, Building2, CreditCard, FileText, Home, LogIn,
    Receipt, Settings, ShieldAlert, UserCog, Users,
} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useActivity} from "@/hooks/useActivity"
import useDebouncedValue from "@/hooks/useDebouncedValue"
import {Card, EmptyState, LoadingPanel, Pagination, SearchInput, Select, Toolbar} from "@/components/ui"
import {formatRelativeTime} from "@/lib/format"
import {cn} from "@/lib/cn"

// Each entry is a filter preset: a module, optionally narrowed to one action.
const FILTERS = [
    {id: "", label: "All activity"},
    {id: "PAYMENT", label: "Payments", module: "PAYMENT"},
    {id: "TENANT", label: "Tenants", module: "TENANT"},
    {id: "UNIT", label: "Units", module: "UNIT"},
    {id: "RENTAL_AGREEMENT", label: "Agreements", module: "RENTAL_AGREEMENT"},
    {id: "PROPERTY", label: "Properties", module: "PROPERTY"},
    {id: "USER", label: "Users", module: "USER"},
    {id: "SETTINGS", label: "Settings & receipts", module: "SETTINGS"},
    {id: "REPORT", label: "Reports", module: "REPORT"},
    {id: "AUTHENTICATION", label: "Sign-ins", module: "AUTHENTICATION"},
    {id: "LOGIN_FAILED", label: "Failed sign-ins", module: "AUTHENTICATION", action: "LOGIN_FAILED"},
]

const MODULE_ICON = {
    TENANT: Users,
    UNIT: Building2,
    RENTAL_AGREEMENT: FileText,
    PAYMENT: CreditCard,
    PROPERTY: Home,
    USER: UserCog,
    SETTINGS: Settings,
    REPORT: BarChart3,
    AUTHENTICATION: LogIn,
}

// A few actions read better with their own mark than their module's — a
// rejected sign-in especially, which shouldn't look like a routine one.
const ACTION_ICON = {LOGIN_FAILED: ShieldAlert, ISSUE_RECEIPT: Receipt, VIEW_REPORT: BarChart3}

/**
 * Colour here carries MEANING, not category — the icon already tells you
 * which module an entry belongs to. The previous nine hand-picked tints were
 * decorative and mostly off-palette; only two of them said anything:
 * money moved, and a sign-in was rejected.
 */
const CHIP = {
    danger: "bg-danger-50 text-danger-600",
    success: "bg-success-50 text-success-600",
    neutral: "bg-neutral-5 text-neutral-60",
}

const chipTone = (entry) => {
    if (entry.action === "LOGIN_FAILED") return "danger"
    if (entry.module === "PAYMENT") return "success"
    return "neutral"
}

export default function ActivityPage() {
    const [page, setPage] = useState(0)
    const [filterId, setFilterId] = useState("")
    const [search, setSearch] = useState("")

    const query = useDebouncedValue(search)

    const onSearchChange = (value) => {
        setSearch(value)
        setPage(0)
    }

    const filter = FILTERS.find((f) => f.id === filterId) || FILTERS[0]

    const {data, isLoading} = useActivity({
        page, size: 20,
        module: filter.module,
        action: filter.action,
        search: query || undefined,
    })

    const entries = data?.content || []
    const totalPages = data?.totalPages || 0

    return (
        <AppShell title="Activity" subtitle="Everything that happened, and who did it" showBack>
            <Card bodyClass="p-0" header={
                <Toolbar>
                    <SearchInput value={search} onChange={onSearchChange}
                                 placeholder="Search activity…" className="md:w-80"/>
                    <Select
                        className="md:w-56"
                        value={filterId}
                        onChange={(e) => {
                            setFilterId(e.target.value)
                            setPage(0)
                        }}
                        aria-label="Filter activity"
                        options={FILTERS.map((f) => ({label: f.label, value: f.id}))}
                    />
                </Toolbar>
            }>
                {isLoading ? (
                    <LoadingPanel message="Loading activity…"/>
                ) : entries.length === 0 ? (
                    <EmptyState
                        title="No activity yet"
                        message="Actions across the portal will show up here."
                    />
                ) : (
                    <>
                        <ul className="divide-y divide-neutral-5">
                            {entries.map((e) => {
                                const Icon = ACTION_ICON[e.action] || MODULE_ICON[e.module] || FileText
                                const time = formatRelativeTime(e.createdAt)
                                return (
                                    <li key={e.id} className="flex gap-3.5 px-4 py-3.5 md:px-5">
                                        <span
                                            className={cn(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                                CHIP[chipTone(e)],
                                            )}
                                        >
                                            <Icon size={17}/>
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm leading-relaxed text-neutral-90">{e.statement}</p>
                                            <p className="mt-0.5 text-xs text-neutral-40" title={time.abs}>
                                                {e.actingUserName} · {time.rel}
                                            </p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>

                        {totalPages > 1 && (
                            <Pagination
                                className="border-t border-neutral-5 px-4 py-2"
                                page={page}
                                pageSize={20}
                                totalPages={totalPages}
                                totalElements={data?.totalElements}
                                onPageChange={setPage}
                            />
                        )}
                    </>
                )}
            </Card>
        </AppShell>
    )
}
