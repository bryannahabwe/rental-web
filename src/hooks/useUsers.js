import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {usersService} from "@/services/usersService"

export function useUsers() {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => usersService.getAll().then(r => r.data),
    })
}

export function useMe() {
    return useQuery({
        queryKey: ["users", "me"],
        queryFn: () => usersService.me().then(r => r.data),
    })
}

export function useUpdateMe() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: usersService.updateMe,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}

export function useInviteUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: usersService.invite,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, data}) => usersService.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}

export function useDeactivateUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: usersService.deactivate,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}

export function useResendInvite() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: usersService.resendInvite,
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}

export function useTransferOwnership() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: usersService.transferOwnership,
        // Roles change for both the caller and the target, so refresh the user
        // list and the caller's own permissions.
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["users"]}),
    })
}
