import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {paymentsService} from "@/services/paymentsService"
import usePropertyStore from "@/store/propertyStore"

export function usePayments(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["payments", propertyId, params],
        queryFn: () => paymentsService.getAll(params).then(r => r.data),
    })
}

/**
 * Everything a payment moves. Recording, editing or removing one replays the
 * agreement's whole allocation, so nothing that reads off those rows can be
 * left showing pre-payment figures.
 */
function invalidatePaymentViews(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["payments"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
    // The tenant's ledger — cycle balances, rollovers, transaction history.
    // Covers ["tenants", id, "ledger"].
    void queryClient.invalidateQueries({queryKey: ["tenants"]})
    // Rent is half the unified income ledger.
    void queryClient.invalidateQueries({queryKey: ["income"]})
    // Outstanding balances and per-cycle statuses are derived from the rows.
    void queryClient.invalidateQueries({queryKey: ["agreements"]})
}

export function useCreatePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: paymentsService.create,
        onSuccess: () => invalidatePaymentViews(queryClient),
    })
}

export function useUpdatePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => paymentsService.update(id, data),
        onSuccess: () => invalidatePaymentViews(queryClient),
    })
}

export function useDeletePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: paymentsService.remove,
        onSuccess: () => invalidatePaymentViews(queryClient),
    })
}

export function usePayment(id) {
    return useQuery({
        queryKey: ["payments", id],
        queryFn: () => paymentsService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}
