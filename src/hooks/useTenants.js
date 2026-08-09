import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {tenantsService} from "@/services/tenantsService"
import usePropertyStore from "@/store/propertyStore"

export function useTenants(params) {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["tenants", propertyId, params],
        queryFn: () => tenantsService.getAll(params).then(r => r.data),
    })
}

export function useAllTenants() {
    const propertyId = usePropertyStore(s => s.selectedPropertyId)
    return useQuery({
        queryKey: ["tenants", propertyId, "all"],
        queryFn: () => tenantsService.getAll({page: 0, size: 100}).then(r => r.data.content),
    })
}

// Adding or removing a tenant changes the dashboard's counts and outstanding
// totals, so reports must refresh alongside the tenant list.
function invalidateTenantsAndReports(queryClient) {
    void queryClient.invalidateQueries({queryKey: ["tenants"]})
    void queryClient.invalidateQueries({queryKey: ["reports"]})
}

export function useCreateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: tenantsService.create,
        onSuccess: () => invalidateTenantsAndReports(queryClient),
    })
}

export function useUpdateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => tenantsService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({queryKey: ["tenants"]})
        },
    })
}

export function useDeleteTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: tenantsService.delete,
        onSuccess: () => invalidateTenantsAndReports(queryClient),
    })
}

export function useTenant(id) {
    return useQuery({
        queryKey: ["tenants", id],
        queryFn: () => tenantsService.getById(id).then(r => r.data),
        enabled: !!id,
    })
}

export function useTenantLedger(id) {
    return useQuery({
        queryKey: ["tenants", id, "ledger"],
        queryFn: () => tenantsService.getLedger(id).then(r => r.data),
        enabled: !!id,
    })
}