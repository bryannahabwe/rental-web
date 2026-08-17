import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {expensesService} from "@/services/expensesService"
import usePropertyStore from "@/store/propertyStore"

export function useExpenses(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["expenses", propertyId, params],
        queryFn: () => expensesService.getAll(params).then(r => r.data),
    })
}

export function useExpense(id) {
    return useQuery({
        queryKey: ["expenses", id],
        queryFn: () => expensesService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}

// An expense changes net-income figures, so reports refresh alongside the
// expenses list (mirrors how payments invalidate ["reports"]).
function invalidateExpensesAndReports(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["expenses"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
}

export function useCreateExpense() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: expensesService.create,
        onSuccess: () => invalidateExpensesAndReports(queryClient),
    })
}

export function useUpdateExpense() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => expensesService.update(id, data),
        onSuccess: () => invalidateExpensesAndReports(queryClient),
    })
}

export function useDeleteExpense() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: expensesService.remove,
        onSuccess: () => invalidateExpensesAndReports(queryClient),
    })
}
