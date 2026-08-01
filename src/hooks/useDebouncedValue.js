import {useEffect, useState} from "react"

/**
 * Debounce a rapidly-changing value (typically a search box).
 *
 * Replaces the hand-rolled `useState` + `useEffect` + `setTimeout` trio
 * that every list page currently repeats at 400ms.
 *
 *   const [search, setSearch] = useState("")
 *   const query = useDebouncedValue(search, 400)
 *
 * Callers that reset pagination on a new query should do so off `query`,
 * not off the raw input:
 *
 *   useEffect(() => setPage(0), [query])
 */
export default function useDebouncedValue(value, delay = 400) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
