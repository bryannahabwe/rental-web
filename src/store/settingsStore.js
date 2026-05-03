import { create } from "zustand"
import { persist } from "zustand/middleware"

const useSettingsStore = create(
    persist(
        (set) => ({
            settings: null,
            setSettings: (settings) => set({ settings }),
            clearSettings: () => set({ settings: null }),
        }),
        { name: "rentflow-settings" }
    )
)

export default useSettingsStore