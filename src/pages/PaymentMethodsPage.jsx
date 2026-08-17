import AppShell from "@/components/layout/AppShell"
import {
    useCreatePaymentMethod, useDeletePaymentMethod, usePaymentMethods, useUpdatePaymentMethod,
} from "@/hooks/usePaymentMethods"
import ManagedListSettings from "@/components/feature/settings/ManagedListSettings"

export default function PaymentMethodsPage() {
    const {data: methods = [], isLoading} = usePaymentMethods()
    const create = useCreatePaymentMethod()
    const update = useUpdatePaymentMethod()
    const remove = useDeletePaymentMethod()

    return (
        <AppShell title="Payment Methods"
                  subtitle="How expenses (and income) are paid" showBack>
            <ManagedListSettings
                singular="Payment method"
                addPlaceholder="e.g. Airtel Money"
                items={methods}
                isLoading={isLoading}
                onCreate={(name) => create.mutateAsync({name})}
                onRename={(id, name) => update.mutateAsync({id, data: {name}})}
                onRemove={(id) => remove.mutateAsync(id)}
                onRestore={(item) => update.mutateAsync({id: item.id, data: {name: item.name, active: true}})}
            />
        </AppShell>
    )
}
