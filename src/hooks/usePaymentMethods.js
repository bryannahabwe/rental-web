import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {paymentMethodsService} from "@/services/paymentMethodsService"

// Payment methods are account-wide (not property-scoped).
export function usePaymentMethods() {
    return useQuery({
        queryKey: ["paymentMethods"],
        queryFn: () => paymentMethodsService.getAll().then(r => r.data),
    })
}

function invalidate(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["paymentMethods"]})
    void queryClient.invalidateQueries({queryKey: ["expenses"]})
}

export function useCreatePaymentMethod() {
    const queryClient = useQueryClient()
    return useMutation({mutationFn: paymentMethodsService.create, onSuccess: () => invalidate(queryClient)})
}

export function useUpdatePaymentMethod() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => paymentMethodsService.update(id, data),
        onSuccess: () => invalidate(queryClient),
    })
}

export function useDeletePaymentMethod() {
    const queryClient = useQueryClient()
    return useMutation({mutationFn: paymentMethodsService.remove, onSuccess: () => invalidate(queryClient)})
}
