import {useQuery} from "@tanstack/react-query"
import {auditService} from "@/services/auditService"
import usePropertyStore from "@/store/propertyStore"

// Activity for the selected property, or landlord-wide under "All properties"
// (admin-only). The property comes from the X-Property-Id header, so it has to
// be folded into the key or switching properties would serve a stale feed.
// Account-level events — sign-ins, invites, settings — come back in every
// property view, since they belong to all of them rather than to one.
export function useActivity(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["activity", propertyId, params],
        queryFn: () => auditService.getAll(params).then(r => r.data),
    })
}
