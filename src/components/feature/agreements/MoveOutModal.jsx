import {useState} from "react"
import {useForm} from "react-hook-form"
import {LogOut} from "lucide-react"
import {useMoveOut} from "@/hooks/useAgreements"
import {Alert, Button, DateField, Dialog, FormField, toast} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

export default function MoveOutModal({agreement, onClose}) {
    const moveOut = useMoveOut()
    const [error, setError] = useState("")
    const {register, handleSubmit, formState: {errors}} = useForm()

    const onSubmit = async (data) => {
        setError("")
        try {
            await moveOut.mutateAsync({id: agreement.id, data: {moveOutDate: data.moveOutDate}})
            toast.success("Move-out recorded", `${agreement.tenantName} — Unit ${agreement.roomNumber}`)
            onClose()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    return (
        <Dialog
            onClose={onClose}
            size="sm"
            hideHeader
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="move-out" variant="danger" loading={moveOut.isPending}>
                        Confirm move-out
                    </Button>
                </>
            }
        >
            <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
                    <LogOut size={18}/>
                </span>
                <h2 className="font-heading text-lg font-medium text-neutral-90">Record Move-Out</h2>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-neutral-50">
                Move-out for <strong className="font-medium text-neutral-80">{agreement.tenantName}</strong> in
                unit <strong className="font-medium text-neutral-80">{agreement.roomNumber}</strong>.
                This will terminate the agreement.
            </p>

            <form id="move-out" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Move-out date" error={errors.moveOutDate?.message} required>
                    <DateField
                        {...register("moveOutDate", {required: "Move-out date is required"})}
                        invalid={!!errors.moveOutDate}
                    />
                </FormField>

                {error && <Alert className="mt-4">{error}</Alert>}
            </form>
        </Dialog>
    )
}
