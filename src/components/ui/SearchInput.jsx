import {Search, X} from "lucide-react"
import {cn} from "@/lib/cn"

/**
 * Controlled and immediate — debouncing lives in `useDebouncedValue`, not
 * in here. Every page already held both the raw and debounced value, so
 * folding the timer into the component would fight the call sites.
 *
 *   const [search, setSearch] = useState("")
 *   const query = useDebouncedValue(search)
 *
 * `onChange` receives the string, not the event.
 */
export default function SearchInput({
                                        value = "",
                                        onChange,
                                        placeholder = "Search…",
                                        className,
                                        ...rest
                                    }) {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 text-neutral-40"/>
            <input
                type="search"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "h-11 w-full rounded-lg border border-neutral-15 bg-white pl-10 pr-9 text-sm",
                    "text-neutral-90 transition-colors placeholder:text-neutral-30",
                    "focus:border-primary-500 focus:outline-hidden focus:ring-4 focus:ring-primary-500/20",
                    // The native search clear button duplicates ours.
                    "[&::-webkit-search-cancel-button]:hidden",
                )}
                {...rest}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange?.("")}
                    aria-label="Clear search"
                    className="absolute right-3 text-neutral-40 transition-colors hover:text-neutral-70"
                >
                    <X size={16}/>
                </button>
            )}
        </div>
    )
}
