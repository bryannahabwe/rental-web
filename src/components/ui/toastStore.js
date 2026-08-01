import {create} from "zustand"

/**
 * A store, not a React context, because mutation onSuccess/onError
 * callbacks fire outside components:
 *
 *   useMutation({ onError: () => toast.error("Couldn't save") })
 *
 * Durations: 5000ms default, 7000ms for errors, 0 to persist until dismissed.
 */
let nextId = 0

const useToastStore = create((set, get) => ({
    toasts: [],

    push: ({variant = "info", title, description, duration}) => {
        const id = ++nextId
        const ms = duration ?? (variant === "error" ? 7000 : 5000)
        set((s) => ({toasts: [...s.toasts, {id, variant, title, description}]}))
        if (ms > 0) setTimeout(() => get().dismiss(id), ms)
        return id
    },

    dismiss: (id) => set((s) => ({toasts: s.toasts.filter((t) => t.id !== id)})),
    clear: () => set({toasts: []}),
}))

export default useToastStore

/**
 * Callable from anywhere — components, mutation callbacks, plain modules.
 *
 *   toast.success("Payment recorded")
 *   toast.error("Upload failed", "Row 12 has an invalid date.")
 */
export const toast = {
    success: (title, description, opts) =>
        useToastStore.getState().push({variant: "success", title, description, ...opts}),
    error: (title, description, opts) =>
        useToastStore.getState().push({variant: "error", title, description, ...opts}),
    warning: (title, description, opts) =>
        useToastStore.getState().push({variant: "warning", title, description, ...opts}),
    info: (title, description, opts) =>
        useToastStore.getState().push({variant: "info", title, description, ...opts}),
    dismiss: (id) => useToastStore.getState().dismiss(id),
}
