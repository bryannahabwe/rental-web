import {NavLink} from "react-router-dom"
import Badge from "./Badge"
import {cn} from "@/lib/cn"

/**
 * The underline is a floating pill inset 8px from each edge, not a
 * full-width border.
 *
 * `Tabs` is presentational — the parent owns `active`. `TabLink` is the
 * route-based twin, styled identically so in-page tabs and sub-navigation
 * never diverge (the source system drifted into two competing tab styles;
 * this pre-empts it).
 */
const RAIL = "flex items-center gap-1 overflow-x-auto border-b border-neutral-5"
const TAB = "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors"
const ACTIVE = "text-secondary-900"
const IDLE = "text-neutral-40 hover:text-neutral-70"
const UNDERLINE = "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary-500"

function TabInner({item, active}) {
    const {label, icon: Icon, count} = item
    return (
        <>
            {Icon && <Icon size={16} aria-hidden="true"/>}
            {label}
            {count != null && <Badge size="sm" tone={active ? "primary" : "neutral"}>{count}</Badge>}
            {active && <span aria-hidden="true" className={UNDERLINE}/>}
        </>
    )
}

/** items: [{ id, label, icon?, count? }] */
export default function Tabs({items = [], active, onSelect, className}) {
    return (
        <div role="tablist" className={cn(RAIL, className)}>
            {items.map((item) => {
                const isActive = item.id === active
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onSelect?.(item.id)}
                        className={cn(TAB, isActive ? ACTIVE : IDLE)}
                    >
                        <TabInner item={item} active={isActive}/>
                    </button>
                )
            })}
        </div>
    )
}

/** items: [{ id, to, label, icon?, count?, end? }] */
export function TabLinks({items = [], className}) {
    return (
        <div className={cn(RAIL, className)}>
            {items.map((item) => (
                <NavLink
                    key={item.id ?? item.to}
                    to={item.to}
                    end={item.end}
                    className={({isActive}) => cn(TAB, isActive ? ACTIVE : IDLE)}
                >
                    {({isActive}) => <TabInner item={item} active={isActive}/>}
                </NavLink>
            ))}
        </div>
    )
}
