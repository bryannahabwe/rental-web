/**
 * The component library's single import surface.
 *
 *   import { DataTable, Badge, Button, Card } from "@/components/ui"
 *
 * Pages must never import a deep path — that is what keeps this a library
 * rather than a folder of files.
 *
 * ── Form-control contract ──────────────────────────────────────────────
 * These spread `...rest` onto a native element, so react-hook-form's
 * register() drops straight in:
 *
 *     <Input {...register("phone")} invalid={!!errors.phone} />
 *
 *   register-compatible : Input · Textarea · Select · DateField · Checkbox
 *   Controller-only     : Toggle · SegmentedFilter
 *   Controller-wrapped  : AmountInput — takes `name` + `control`, owns its own
 *                         Controller, and holds a number in form state
 *
 * Pass `invalid` to the control AND `error` to the FormField — the wrapper
 * does not propagate state.
 *
 * ── Icons ──────────────────────────────────────────────────────────────
 * Icon props take a lucide-react COMPONENT, not a name string:
 *
 *     <Button iconLeft={Download}>Export</Button>
 *
 * ── The one rule that breaks silently ──────────────────────────────────
 * Tailwind v4 scans source text. Never build a class by interpolation —
 * `bg-${tone}-50` emits nothing. Variant maps hold complete literal strings.
 */

export {default as Badge} from "./Badge"
export {default as Button} from "./Button"
export {default as Card} from "./Card"
export {default as Avatar} from "./Avatar"
export {default as SummaryCard} from "./SummaryCard"

export {default as FormField} from "./FormField"
export {default as Input} from "./Input"
export {default as AmountInput} from "./AmountInput"
export {default as Textarea} from "./Textarea"
export {default as Select} from "./Select"
export {default as DateField} from "./DateField"
export {default as Checkbox} from "./Checkbox"
export {default as Toggle} from "./Toggle"
export {default as ChoiceGroup} from "./ChoiceGroup"

export {default as Toolbar} from "./Toolbar"
export {default as SearchInput} from "./SearchInput"
export {default as SegmentedFilter} from "./SegmentedFilter"
export {default as Tabs, TabLinks} from "./Tabs"

export {default as DataTable} from "./DataTable"
export {default as Pagination} from "./Pagination"
export {default as DetailRow, DetailList} from "./DetailRow"
export {default as ProgressBar} from "./ProgressBar"

export {default as ChartTooltip} from "./ChartTooltip"

export {Spinner, Skeleton, LoadingPanel} from "./Loader"
export {EmptyState, ErrorState} from "./States"

export {default as Dialog} from "./Dialog"
export {default as ConfirmProvider} from "./ConfirmProvider"
export {useConfirm} from "./confirmContext"
export {default as ToastHost} from "./ToastHost"
export {toast} from "./toastStore"
