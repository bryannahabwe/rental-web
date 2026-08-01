import {ChoiceGroup, FormField, Input} from "@/components/ui"
import {formatOrdinal} from "@/lib/format"

/** Explains, in words, what billing day the chosen start date implies. */
export function BillingDayHint({dateStr, billingModel}) {
    if (!dateStr) return null
    const day = Math.min(new Date(dateStr).getDate(), 28)
    return (
        <div className="mt-2 rounded-lg bg-primary-50 px-3.5 py-2.5 text-xs text-primary-700">
            Rent will be due on the <strong>{formatOrdinal(day)}</strong> of every month.
            {billingModel === "ARREARS"
                ? " Payment collected at end of each cycle."
                : " Payment collected at start of each cycle."}
        </div>
    )
}

const BILLING_OPTIONS = [
    {value: "ADVANCE", label: "Advance", description: "Pays at start of cycle"},
    {value: "ARREARS", label: "Arrears", description: "Pays at end of cycle"},
]

export function BillingModelField({value, onChange}) {
    return (
        <FormField label="Billing model">
            <ChoiceGroup options={BILLING_OPTIONS} value={value} onChange={onChange}/>
        </FormField>
    )
}

const SIGN_OPTIONS = [
    {value: "positive", label: "Paid ahead (+)"},
    {value: "negative", label: "Owes arrears (−)", tone: "danger"},
]

/**
 * Opening balance is stored signed, but entered as a magnitude plus a
 * direction — asking someone to type a minus sign into a money field is how
 * you get arrears recorded as credit.
 */
export function OpeningBalanceField({register, balanceSign, setBalanceSign, helpText}) {
    return (
        <div className="rounded-lg border border-neutral-5 bg-neutral-0 p-4">
            <p className="mb-1.5 text-sm font-medium text-neutral-70">Opening balance (UGX)</p>
            <ChoiceGroup className="mb-2.5" options={SIGN_OPTIONS} value={balanceSign} onChange={setBalanceSign}/>
            <Input {...register("openingBalance")} type="number" min="0" inputMode="numeric" placeholder="0"/>
            {helpText && <p className="mt-2 text-xs leading-relaxed text-neutral-40">{helpText}</p>}
        </div>
    )
}
