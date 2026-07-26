import {useQuery} from "@tanstack/react-query"
import {auditService} from "@/services/auditService"

// Account-wide activity — not scoped by the selected property (admin-only).
export function useActivity(params) {
    return useQuery({
        queryKey: ["activity", params],
        queryFn: () => auditService.getAll(params).then(r => r.data),
    })
}
