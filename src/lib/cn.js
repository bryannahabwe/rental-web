import {clsx} from "clsx"
import {twMerge} from "tailwind-merge"

/**
 * Merge conditional class names, with later Tailwind utilities winning
 * over earlier conflicting ones.
 *
 * NOTE: Tailwind v4 scans source *text*. Never build a class by
 * interpolation — `bg-${tone}-50` emits nothing. Variant maps must hold
 * complete literal class strings.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
