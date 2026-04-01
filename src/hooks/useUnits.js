import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {unitsService} from "@/services/unitsService"

export function useUnits(params) {
    return useQuery({
        queryKey: ["units", params],
        queryFn: () => unitsService.getAll(params).then(r => r.data),
    })
}

export function useAllUnits() {
    return useQuery({
        queryKey: ["units", "all"],
        queryFn: () => unitsService.getAll({page: 0, size: 100}).then(r => r.data.content),
    })
}

export function useCreateUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: unitsService.create,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["units"]}),
    })
}

export function useUpdateUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => unitsService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["units"]}),
    })
}

export function useDeleteUnit() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: unitsService.delete,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["units"]}),
    })
}