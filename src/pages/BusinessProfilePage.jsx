import {useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {Camera, X} from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import {useSettings, useUpdateSettings, useUploadLogo} from "@/hooks/useSettings"
import {Alert, Button, Card, FormField, Input, LoadingPanel, Textarea, toast} from "@/components/ui"
import {getErrorMessage} from "@/utils/errorMessage"

const MAX_LOGO_BYTES = 5 * 1024 * 1024

export default function BusinessProfilePage() {
    const {data: settings, isLoading} = useSettings()
    const updateSettings = useUpdateSettings()
    const uploadLogo = useUploadLogo()
    const fileInputRef = useRef(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState("")

    const {register, handleSubmit} = useForm({
        values: {
            companyName: settings?.companyName || "",
            address: settings?.address || "",
        },
    })

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file")
            return
        }
        if (file.size > MAX_LOGO_BYTES) {
            setError("Image must be under 5MB")
            return
        }

        // Show a preview immediately, then upload.
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(file)

        try {
            setError("")
            const formData = new FormData()
            formData.append("file", file)
            await uploadLogo.mutateAsync(formData)
            toast.success("Logo uploaded")
        } catch (err) {
            setError(getErrorMessage(err, "Logo upload failed"))
            setPreview(null)
        }
    }

    const onSubmit = async (data) => {
        setError("")
        try {
            await updateSettings.mutateAsync({
                companyName: data.companyName || null,
                address: data.address || null,
            })
            toast.success("Business profile updated")
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const currentLogo = preview || settings?.logoUrl

    return (
        <AppShell title="Business Profile" subtitle="How your business appears on receipts" showBack>
            {isLoading ? (
                <LoadingPanel/>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex max-w-2xl flex-col gap-5">
                    <Card title="Logo" subtitle="Shown on receipts and in the sidebar">
                        <div className="flex flex-wrap items-center gap-4">
                            <div
                                className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-10 bg-neutral-0">
                                {currentLogo ? (
                                    <>
                                        <img src={currentLogo} alt="Company logo"
                                             className="h-full w-full object-contain"/>
                                        <button
                                            type="button"
                                            aria-label="Remove logo preview"
                                            onClick={() => setPreview(null)}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-50 shadow-xs transition-colors hover:text-neutral-80"
                                        >
                                            <X size={14}/>
                                        </button>
                                    </>
                                ) : (
                                    <Camera size={26} className="text-neutral-30"/>
                                )}
                            </div>

                            <div className="min-w-0">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    iconLeft={Camera}
                                    loading={uploadLogo.isPending}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {currentLogo ? "Replace logo" : "Upload logo"}
                                </Button>
                                <p className="mt-2 text-xs text-neutral-40">PNG or JPG, under 5MB.</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Business Details">
                        <div className="flex flex-col gap-4">
                            <FormField label="Company / Property name">
                                <Input {...register("companyName")} placeholder="e.g. Nansana Apartments"/>
                            </FormField>

                            <FormField label="Address" hint="Appears on printed receipts.">
                                <Textarea {...register("address")} rows={3}
                                          placeholder="Plot 14, Kira Road, Kampala"/>
                            </FormField>
                        </div>
                    </Card>

                    {error && <Alert>{error}</Alert>}

                    <Button type="submit" size="lg" loading={updateSettings.isPending}>Save changes</Button>
                </form>
            )}
        </AppShell>
    )
}
