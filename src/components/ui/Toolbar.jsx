import {cn} from "@/lib/cn"

/**
 * The search/filter header bar that sits above a table inside a Card.
 *
 * This component IS the standardization — the source system had three
 * divergent versions of this bar in the wild. There is only one here.
 *
 *   <Card bodyClass="p-0">
 *     <Toolbar>
 *       <SearchInput … className="md:w-80" />
 *       <SegmentedFilter … />
 *     </Toolbar>
 *     <DataTable … />
 *   </Card>
 */
export default function Toolbar({className, children}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 border-b border-neutral-5 p-4",
                "md:flex-row md:items-center md:justify-between",
                className,
            )}
        >
            {children}
        </div>
    )
}
