import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {agreementsService} from "@/services/agreementsService"

export function useAgreements(params) {
    return useQuery({
        queryKey: ["agreements", params],
        queryFn: () => agreementsService.getAll(params).then(r => r.data),
    })
}

export function useCreateAgreement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: agreementsService.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["agreements"]})
            void queryClient.invalidateQueries({queryKey: ["units"]})
            void queryClient.invalidateQueries({queryKey: ["reports"]})
        },
    })
}

export function useMoveOut() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => agreementsService.moveOut(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["agreements"]})
            void queryClient.invalidateQueries({queryKey: ["units"]})
            void queryClient.invalidateQueries({queryKey: ["reports"]})
        },
    })
}

export function useAgreement(id) {
    return useQuery({
        queryKey: ["agreements", id],
        queryFn: () => agreementsService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}