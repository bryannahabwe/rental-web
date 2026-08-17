import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {incomeService} from "@/services/incomeService"
import usePropertyStore from "@/store/propertyStore"

export function useIncome(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["income", propertyId, params],
        queryFn: () => incomeService.getAll(params).then(r => r.data),
    })
}

export function useOtherIncome(id) {
    return useQuery({
        queryKey: ["income", "other", id],
        queryFn: () => incomeService.getOther(id).then(r => r.data),
        enabled: !!id,
    })
}

// A manual income entry changes the ledger AND net-income figures, so refresh
// both the income list and the reports (mirrors payments → ["reports"]).
function invalidateIncomeAndReports(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["income"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
}

export function useCreateOtherIncome() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: incomeService.createOther,
        onSuccess: () => invalidateIncomeAndReports(queryClient),
    })
}

export function useUpdateOtherIncome() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => incomeService.updateOther(id, data),
        onSuccess: () => invalidateIncomeAndReports(queryClient),
    })
}

export function useDeleteOtherIncome() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: incomeService.removeOther,
        onSuccess: () => invalidateIncomeAndReports(queryClient),
    })
}
