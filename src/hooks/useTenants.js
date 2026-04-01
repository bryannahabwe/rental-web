import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantsService } from "@/services/tenantsService"

export function useTenants(params) {
    return useQuery({
        queryKey: ["tenants", params],
        queryFn: () => tenantsService.getAll(params).then(r => r.data),
    })
}

export function useAllTenants() {
    return useQuery({
        queryKey: ["tenants", "all"],
        queryFn: () => tenantsService.getAll({ page: 0, size: 100 }).then(r => r.data.content),
    })
}

export function useCreateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: tenantsService.create,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["tenants"] })
        },
    })
}

export function useUpdateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }) => tenantsService.update(id, data),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["tenants"] })
        },
    })
}

export function useDeleteTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: tenantsService.delete,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ["tenants"] })
        },
    })
}