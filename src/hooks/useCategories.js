import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {categoriesService} from "@/services/categoriesService"

// Categories are account-wide (not property-scoped), so no propertyId in the key.
export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesService.getAll().then(r => r.data),
    })
}

function invalidate(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["categories"]})
    // The expense form's category picker reads this list.
    void queryClient.invalidateQueries({queryKey: ["expenses"]})
}

export function useCreateCategory() {
    const queryClient = useQueryClient()
    return useMutation({mutationFn: categoriesService.create, onSuccess: () => invalidate(queryClient)})
}

export function useUpdateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => categoriesService.update(id, data),
        onSuccess: () => invalidate(queryClient),
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()
    return useMutation({mutationFn: categoriesService.remove, onSuccess: () => invalidate(queryClient)})
}
