import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {propertiesService} from "@/services/propertiesService"

// Properties are landlord-wide (not scoped by the active property), so this
// key deliberately does NOT include selectedPropertyId.
export function useProperties() {
    return useQuery({
        queryKey: ["properties"],
        queryFn: () => propertiesService.getAll().then(r => r.data),
    })
}

// Adding or removing a property changes the dashboard's portfolio figures, so
// reports refresh alongside the property list.
function invalidatePropertiesAndReports(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["properties"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
}

export function useCreateProperty() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: propertiesService.create,
        onSuccess: () => invalidatePropertiesAndReports(queryClient),
    })
}

export function useUpdateProperty() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => propertiesService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["properties"]}),
    })
}

export function useDeleteProperty() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: propertiesService.delete,
        onSuccess: () => invalidatePropertiesAndReports(queryClient),
    })
}
