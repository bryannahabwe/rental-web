import {useQuery} from "@tanstack/react-query"
import {reportsService} from "@/services/reportsService"

export function useSummary() {
    return useQuery({
        queryKey: ["reports", "summary"],
        queryFn: () => reportsService.getSummary().then(r => r.data),
    })
}

export function useOccupancy() {
    return useQuery({
        queryKey: ["reports", "occupancy"],
        queryFn: () => reportsService.getOccupancy().then(r => r.data),
    })
}

export function usePaymentReport(params) {
    return useQuery({
        queryKey: ["reports", "payments", params],
        queryFn: () => reportsService.getPaymentReport(params).then(r => r.data),
        enabled: !!params.from && !!params.to,
    })
}