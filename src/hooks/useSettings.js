import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsService } from "@/services/settingsService"
import useSettingsStore from "@/store/settingsStore"

export function useSettings() {
    const setSettings = useSettingsStore(s => s.setSettings)

    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const res = await settingsService.getSettings()
            setSettings(res.data)
            return res.data
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}

export function useUpdateSettings() {
    const queryClient = useQueryClient()
    const setSettings = useSettingsStore(s => s.setSettings)

    return useMutation({
        mutationFn: (data) => settingsService.updateSettings(data),
        onSuccess: (res) => {
            setSettings(res.data)
            void queryClient.invalidateQueries({ queryKey: ["settings"] })
        },
    })
}

export function useUploadLogo() {
    const queryClient = useQueryClient()
    const setSettings = useSettingsStore(s => s.setSettings)

    return useMutation({
        mutationFn: (formData) => settingsService.uploadLogo(formData),
        onSuccess: (res) => {
            setSettings(res.data)
            void queryClient.invalidateQueries({ queryKey: ["settings"] })
        },
    })
}