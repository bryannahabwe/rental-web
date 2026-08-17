import AppShell from "@/components/layout/AppShell"
import {useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory} from "@/hooks/useCategories"
import ManagedListSettings from "@/components/feature/settings/ManagedListSettings"

export default function ExpenseCategoriesPage() {
    const {data: categories = [], isLoading} = useCategories()
    const create = useCreateCategory()
    const update = useUpdateCategory()
    const remove = useDeleteCategory()

    return (
        <AppShell title="Expense Categories"
                  subtitle="The categories your expenses can be filed under" showBack>
            <ManagedListSettings
                singular="Category"
                addPlaceholder="e.g. Landscaping"
                items={categories}
                isLoading={isLoading}
                onCreate={(name) => create.mutateAsync({name})}
                onRename={(id, name) => update.mutateAsync({id, data: {name}})}
                onRemove={(id) => remove.mutateAsync(id)}
                onRestore={(item) => update.mutateAsync({id: item.id, data: {name: item.name, active: true}})}
            />
        </AppShell>
    )
}
