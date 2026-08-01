/**
 * Dialog geometry, split out from Dialog.jsx so that file exports only a
 * component (fast refresh) and so the lookup can be tested on its own.
 */
export const DIALOG_BASE = "fixed z-100 flex flex-col bg-white shadow-dialog"

/**
 * Every position × size combination is present. The source system used a
 * switch that silently ignored `size` for right/bottom drawers; an
 * exhaustive lookup makes that impossible.
 */
const SURFACE = {
    responsive: {
        sm: "inset-x-0 bottom-16 max-h-[calc(85vh-4rem)] rounded-t-3xl animate-slide-up md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-md md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:animate-scale-in",
        md: "inset-x-0 bottom-16 max-h-[calc(85vh-4rem)] rounded-t-3xl animate-slide-up md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-lg md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:animate-scale-in",
        lg: "inset-x-0 bottom-16 max-h-[calc(85vh-4rem)] rounded-t-3xl animate-slide-up md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-2xl md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:animate-scale-in",
        xl: "inset-x-0 bottom-16 max-h-[calc(85vh-4rem)] rounded-t-3xl animate-slide-up md:inset-auto md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-4xl md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:animate-scale-in",
        full: "inset-x-0 bottom-16 max-h-[calc(85vh-4rem)] rounded-t-3xl animate-slide-up md:inset-4 md:bottom-4 md:max-h-none md:rounded-3xl md:animate-scale-in",
    },
    center: {
        sm: "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-scale-in",
        md: "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-scale-in",
        lg: "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-2xl max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-scale-in",
        xl: "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-4xl max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-scale-in",
        full: "inset-4 rounded-3xl animate-scale-in",
    },
    right: {
        sm: "inset-y-0 right-0 h-full w-full sm:w-[380px] rounded-l-3xl animate-slide-left",
        md: "inset-y-0 right-0 h-full w-full sm:w-[440px] rounded-l-3xl animate-slide-left",
        lg: "inset-y-0 right-0 h-full w-full sm:w-[560px] rounded-l-3xl animate-slide-left",
        xl: "inset-y-0 right-0 h-full w-full sm:w-[720px] rounded-l-3xl animate-slide-left",
        full: "inset-y-0 right-0 h-full w-full sm:w-[calc(100vw-4rem)] rounded-l-3xl animate-slide-left",
    },
    left: {
        sm: "inset-y-0 left-0 h-full w-full sm:w-[380px] rounded-r-3xl animate-slide-right",
        md: "inset-y-0 left-0 h-full w-full sm:w-[440px] rounded-r-3xl animate-slide-right",
        lg: "inset-y-0 left-0 h-full w-full sm:w-[560px] rounded-r-3xl animate-slide-right",
        xl: "inset-y-0 left-0 h-full w-full sm:w-[720px] rounded-r-3xl animate-slide-right",
        full: "inset-y-0 left-0 h-full w-full sm:w-[calc(100vw-4rem)] rounded-r-3xl animate-slide-right",
    },
    bottom: {
        sm: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-slide-up sm:mx-auto sm:max-w-md",
        md: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-slide-up sm:mx-auto sm:max-w-lg",
        lg: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-slide-up sm:mx-auto sm:max-w-2xl",
        xl: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-slide-up sm:mx-auto sm:max-w-4xl",
        full: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-slide-up",
    },
}

export function surfaceClass(position, size) {
    return SURFACE[position]?.[size] ?? SURFACE.responsive.md
}

