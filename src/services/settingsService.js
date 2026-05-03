import api from "./api.js"

export const settingsService = {
    getSettings: () => api.get("/settings"),
    updateSettings: (data) => api.put("/settings", data),
    uploadLogo: (formData) => api.post("/settings/logo", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    }),
    getNextReceiptNumber: () => api.post("/settings/receipt-number"),
}