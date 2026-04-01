import api from "./api"

export const reportsService = {
    getSummary: () => api.get("/reports/summary"),
    getPaymentReport: (params) => api.get("/reports/payments", {params}),
    getOccupancy: () => api.get("/reports/occupancy"),
}