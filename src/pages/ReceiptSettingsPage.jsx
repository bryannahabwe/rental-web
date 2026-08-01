import {useState} from "react"
import {useForm} from "react-hook-form"
import AppShell from "@/components/layout/AppShell"
import {useSettings, useUpdateSettings} from "@/hooks/useSettings"
import {Button, Card, ChoiceGroup, FormField, Input, LoadingPanel, Textarea, toast} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

const NUMBERING_OPTIONS = [
    {value: "AUTO", label: "Auto-increment", description: "RCP-001, RCP-002…"},
    {value: "MANUAL", label: "Manual start", description: "Set starting number"},
]

const STYLE_OPTIONS = [
    {value: "DIGITAL", label: "Digital", description: "Clean, branded"},
    {value: "FORMAL", label: "Formal", description: "Like a physical book"},
]

export default function ReceiptSettingsPage() {
    const {data: settings, isLoading} = useSettings()
    const updateSettings = useUpdateSettings()
    const [numbering, setNumbering] = useState(settings?.receiptNumbering || "AUTO")
    const [receiptStyle, setReceiptStyle] = useState(settings?.receiptStyle || "DIGITAL")
    const [error, setError] = useState("")

    const {register, handleSubmit} = useForm({
        values: {
            receiptPrefix: settings?.receiptPrefix || "RCP",
            nextReceiptNo: settings?.nextReceiptNo || 1,
            receiptFooter: settings?.receiptFooter || "Thank you for your business",
        },
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            await updateSettings.mutateAsync({
                receiptPrefix: data.receiptPrefix || "RCP",
                nextReceiptNo: parseInt(data.nextReceiptNo, 10),
                receiptNumbering: numbering,
                receiptFooter: data.receiptFooter || null,
                receiptStyle,
            })
            toast.success("Receipt settings saved")
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const prefix = settings?.receiptPrefix || "RCP"
    const nextNo = settings?.nextReceiptNo || 1
    const previewNo = `${prefix}-${String(nextNo).padStart(3, "0")}`

    return (
        <AppShell title="Receipt Settings" subtitle="Numbering, style and footer" showBack>
            {isLoading ? (
                <LoadingPanel/>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-2xl flex-col gap-5">
                    <Card title="Numbering" subtitle={`Next receipt will be ${previewNo}`}>
                        <div className="flex flex-col gap-4">
                            <FormField label="Numbering mode">
                                <ChoiceGroup options={NUMBERING_OPTIONS} value={numbering} onChange={setNumbering}/>
                            </FormField>

                            <FormField label="Receipt prefix">
                                <Input {...register("receiptPrefix")} placeholder="RCP"/>
                            </FormField>

                            <FormField
                                label="Next receipt number"
                                hint={numbering === "AUTO"
                                    ? "Increments automatically after each receipt."
                                    : "The number the next receipt will use."}
                            >
                                <Input {...register("nextReceiptNo")} type="number" min="1" inputMode="numeric"/>
                            </FormField>
                        </div>
                    </Card>

                    <Card
                        title="Receipt Style"
                        subtitle="You can also choose the style each time you generate a receipt."
                    >
                        <ChoiceGroup options={STYLE_OPTIONS} value={receiptStyle} onChange={setReceiptStyle}/>
                    </Card>

                    <Card title="Receipt Footer">
                        <FormField label="Footer message" hint="Printed at the bottom of every receipt.">
                            <Textarea {...register("receiptFooter")} rows={2}
                                      placeholder="Thank you for your business"/>
                        </FormField>
                    </Card>

                    {error && <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600">{error}</p>}

                    <Button type="submit" size="lg" loading={updateSettings.isPending}>Save changes</Button>
                </form>
            )}
        </AppShell>
    )
}
