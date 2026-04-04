import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {paymentsService} from "@/services/paymentsService"

export function usePayments(params) {
    return useQuery({
        queryKey: ["payments", params],
        queryFn: () => paymentsService.getAll(params).then(r => r.data),
    })
}

export function useCreatePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: paymentsService.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["payments"]})
            void queryClient.invalidateQueries({queryKey: ["reports"]})
        },
    })
}

export function usePayment(id) {
    return useQuery({
        queryKey: ["payments", id],
        queryFn: () => paymentsService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}