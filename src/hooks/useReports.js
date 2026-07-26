import {useQuery} from "@tanstack/react-query"
import {reportsService} from "@/services/reportsService"
import usePropertyStore from "@/store/propertyStore"

export function useSummary() {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["reports", propertyId, "summary"],
        queryFn: () => reportsService.getSummary().then(r => r.data),
    })
}

export function useOccupancy() {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["reports", propertyId, "occupancy"],
        queryFn: () => reportsService.getOccupancy().then(r => r.data),
    })
}

export function usePaymentReport(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["reports", propertyId, "payments", params],
        queryFn: () => reportsService.getPaymentReport(params).then(r => r.data),
        enabled: !!params.from && !!params.to,
    })
}

export function useMonthlyCollection(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["reports", propertyId, "payments", "monthly", params],
        queryFn: () => reportsService.getMonthlyCollection(params).then(r => r.data),
        enabled: !!params.from && !!params.to,
    })
}