import api from "./api"

export const reportsService = {
    getSummary: () => api.get("/reports/summary"),
    getPaymentReport: (params) => api.get("/reports/payments", {params}),
    getMonthlyCollection: (params) => api.get("/reports/payments/monthly", {params}),
    getOccupancy: () => api.get("/reports/occupancy"),
}