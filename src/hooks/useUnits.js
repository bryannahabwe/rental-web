import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {unitsService} from "@/services/unitsService"
import usePropertyStore from "@/store/propertyStore"

export function useUnits(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["units", propertyId, params],
        queryFn: () => unitsService.getAll(params).then(r => r.data),
    })
}

export function useAllUnits() {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["units", propertyId, "all"],
        queryFn: () => unitsService.getAll({page: 0, size: 100}).then(r => r.data.content),
    })
}

// Unit changes move occupancy and the dashboard's unit counts, so reports must
// refresh too — otherwise the summary/occupancy cards stay stale until their
// staleTime lapses.
function invalidateUnitsAndReports(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["units"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
}

export function useCreateUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: unitsService.create,
        onSuccess: () => invalidateUnitsAndReports(queryClient),
    })
}

export function useUpdateUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => unitsService.update(id, data),
        onSuccess: () => invalidateUnitsAndReports(queryClient),
    })
}

export function useDeleteUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: unitsService.delete,
        onSuccess: () => invalidateUnitsAndReports(queryClient),
    })
}

export function useUnit(id) {
    return useQuery({
        queryKey: ["units", id],
        queryFn: () => unitsService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}