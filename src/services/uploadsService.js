import api from "./api"

export const uploadsService = {
    // Uploads a file and resolves to its public URL. `folder` is one of the
    // API's allowlisted folders (e.g. "receipts").
    upload: (file, folder = "receipts") => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", folder)
        return api.post("/uploads", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        })
    },
}
