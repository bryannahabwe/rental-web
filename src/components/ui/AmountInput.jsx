import {useLayoutEffect, useRef} from "react"
import {Controller} from "react-hook-form"
import Input from "./Input"
import {groupDigits, parseAmountInput} from "@/lib/format"

/**
 * A money field that groups digits as you type — `180000` reads back as
 * `180,000`. Counting zeros in a bare number input is how rent gets keyed in
 * off by a factor of ten.
 *
 * It has to be `type="text"`: a number input silently rejects the separator,
 * so a mask is impossible there. `inputMode="numeric"` keeps the phone keypad,
 * and the base layer already suppresses spinner arrows, so nothing is lost.
 *
 * Controller-wrapped rather than register()-compatible — pass `name` and
 * `control`. Being controlled is what makes a numeric `defaultValues` entry
 * render grouped on open with no work at the call site.
 *
 *     <AmountInput name="amount" control={control} invalid={!!errors.amount}
 *                  rules={{required: "Amount is required"}} placeholder="180,000"/>
 *
 * Form state holds a NUMBER (or `""` when empty), so callers submit the field
 * straight through — no parseFloat — and RHF's own `required`/`min` rules
 * still apply.
 */

const countDigits = (s) => (s.match(/\d/g) || []).length

/** Offset just past the nth digit of `s`; 0 lands at the start. */
const caretAfterDigits = (s, n) => {
    if (n <= 0) return 0
    let seen = 0
    for (let i = 0; i < s.length; i++) {
        if (s[i] >= "0" && s[i] <= "9" && ++seen === n) return i + 1
    }
    return s.length
}

function GroupedInput({value, onChange, fieldRef, ...rest}) {
    const el = useRef(null)
    // Digits to the left of the caret, held between the change event and the
    // re-render that reformats around it. Without this the caret snaps to the
    // end on every mid-number edit and the field is unusable for corrections.
    const caretDigits = useRef(null)

    useLayoutEffect(() => {
        if (!el.current || caretDigits.current == null) return
        const pos = caretAfterDigits(el.current.value, caretDigits.current)
        caretDigits.current = null
        el.current.setSelectionRange(pos, pos)
    })

    // RHF hands down a callback ref (it uses it to focus the first invalid
    // field), so both it and the local ref have to see the node.
    const setRef = (node) => {
        el.current = node
        fieldRef?.(node)
    }

    const handleChange = (e) => {
        const {value: raw, selectionStart} = e.target
        caretDigits.current = countDigits(raw.slice(0, selectionStart ?? raw.length))
        onChange(parseAmountInput(raw))
    }

    return (
        <Input
            ref={setRef}
            value={groupDigits(value)}
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="off"
            {...rest}
        />
    )
}

export default function AmountInput({name, control, rules, ...rest}) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue=""
            render={({field: {ref, ...field}}) => <GroupedInput fieldRef={ref} {...field} {...rest}/>}
        />
    )
}
