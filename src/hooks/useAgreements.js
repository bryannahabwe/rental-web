import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {agreementsService} from "@/services/agreementsService"
import usePropertyStore from "@/store/propertyStore"

export function useAgreements(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["agreements", propertyId, params],
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
            // A deposit applied at move-out credits the tenant's balance and is
            // reflected in the ledger, so refresh tenants + payments too.
            void queryClient.invalidateQueries({queryKey: ["tenants"]})
            void queryClient.invalidateQueries({queryKey: ["payments"]})
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

export function useUpdateAgreement() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => agreementsService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["agreements"]})
        },
    })
}

export function useAgreementCycles(agreementId) {
    return useQuery({
        queryKey: ["agreement-cycles", agreementId],
        queryFn: async () => {
            if (!agreementId) return []
            const res = await agreementsService.getCycles(agreementId)
            return res.data
        },
        enabled: !!agreementId,
    })
}