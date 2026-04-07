import {useEffect, useState} from "react"
import PageWrapper from "@/components/layout/PageWrapper"
import {useCreateUnit, useDeleteUnit, useUnits, useUpdateUnit} from "@/hooks/useUnits"
import {useForm} from "react-hook-form"
import {Plus, Pencil, Trash2, X, ChevronRight} from "lucide-react"
import UnitDetailSheet from "@/components/ui/UnitDetailSheet"


const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: "14px",
    borderRadius: "8px", border: "1px solid #d1d5db",
    outline: "none", boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: "#fff", color: "#111827",
}

const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: "#374151", marginBottom: "6px",
}

const formatUGX = (amount) =>
    amount == null ? "—" : `UGX ${Number(amount).toLocaleString()}`

const nullIfEmpty = (val) => (val === "" || val === undefined) ? null : val

function UnitModal({unit, onClose}) {
    const isEdit = !!unit
    const createUnit = useCreateUnit()
    const updateUnit = useUpdateUnit()
    const [error, setError] = useState("")
    const [isAvailable, setIsAvailable] = useState(unit ? unit.isAvailable : true)

    const {register, handleSubmit, formState: {errors}} = useForm({
        defaultValues: unit ? {
            roomNumber: unit.roomNumber,
            description: unit.description,
            rentAmount: unit.rentAmount,
        } : {},
    })

    const onSubmit = async (data) => {
        setError("")
        try {
            const payload = {
                roomNumber: data.roomNumber,
                description: nullIfEmpty(data.description),
                rentAmount: parseFloat(data.rentAmount),
                isAvailable,
            }
            if (isEdit) {
                await updateUnit.mutateAsync({id: unit.id, data: payload})
            } else {
                await createUnit.mutateAsync(payload)
            }
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong")
        }
    }

    const loading = createUnit.isPending || updateUnit.isPending

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "480px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                maxHeight: "90vh", overflowY: "auto",
            }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 24px", borderBottom: "1px solid #f3f4f6",
                    position: "sticky", top: 0, backgroundColor: "#fff", zIndex: 1,
                }}>
                    <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0}}>
                        {isEdit ? "Edit Unit" : "Add New Unit"}
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#9ca3af", padding: "4px",
                    }}>
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                        <div>
                            <label style={labelStyle}>Room number</label>
                            <input
                                {...register("roomNumber", {required: "Room number is required"})}
                                style={inputStyle} placeholder="A1"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.roomNumber && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.roomNumber.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>Monthly rent (UGX)</label>
                            <input
                                {...register("rentAmount", {
                                    required: "Rent amount is required",
                                    min: {value: 1, message: "Must be greater than 0"},
                                })}
                                type="number" style={inputStyle} placeholder="180000"
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                            {errors.rentAmount && (
                                <p style={{fontSize: "12px", color: "#ef4444", marginTop: "4px"}}>
                                    {errors.rentAmount.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Description{" "}
                                <span style={{color: "#9ca3af", fontWeight: "400"}}>(optional)</span>
                            </label>
                            <textarea
                                {...register("description")} rows={3}
                                style={{...inputStyle, resize: "vertical"}}
                                placeholder="Single room with bathroom..."
                                onFocus={e => e.target.style.borderColor = "#0F6E56"}
                                onBlur={e => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>

                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: "8px",
                            border: "1px solid #e5e7eb", backgroundColor: "#f9fafb",
                        }}>
                            <div>
                                <div style={{fontSize: "13px", fontWeight: "500", color: "#374151"}}>
                                    Available for rent
                                </div>
                                <div style={{fontSize: "12px", color: "#9ca3af", marginTop: "2px"}}>
                                    Uncheck if unit is already occupied
                                </div>
                            </div>
                            <div
                                onClick={() => setIsAvailable(v => !v)}
                                style={{
                                    width: "44px", height: "24px", borderRadius: "24px",
                                    backgroundColor: isAvailable ? "#0F6E56" : "#d1d5db",
                                    position: "relative", cursor: "pointer",
                                    transition: "background-color 0.2s", flexShrink: 0,
                                }}
                            >
                                <div style={{
                                    position: "absolute", width: "18px", height: "18px",
                                    backgroundColor: "#fff", borderRadius: "50%",
                                    top: "3px", left: isAvailable ? "23px" : "3px",
                                    transition: "left 0.2s",
                                }}/>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                                padding: "10px 14px", borderRadius: "8px", borderLeft: "3px solid #ef4444",
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: "flex", gap: "10px", justifyContent: "flex-end",
                        padding: "16px 24px", borderTop: "1px solid #f3f4f6",
                    }}>
                        <button type="button" onClick={onClose} style={{
                            padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                            border: "1px solid #e5e7eb", backgroundColor: "#fff",
                            color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                            backgroundColor: loading ? "#6b9e8f" : "#0F6E56",
                            color: "#fff", border: "none", cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                        }}>
                            {loading ? "Saving..." : isEdit ? "Save changes" : "Add unit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function DeleteConfirm({unit, onClose}) {
    const deleteUnit = useDeleteUnit()
    const [error, setError] = useState("")

    const handleDelete = async () => {
        try {
            await deleteUnit.mutateAsync(unit.id)
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || "Could not delete unit")
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: "16px",
        }}>
            <div style={{
                backgroundColor: "#fff", borderRadius: "16px",
                width: "100%", maxWidth: "400px",
                padding: "28px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}>
                <h2 style={{fontSize: "16px", fontWeight: "600", color: "#111827", margin: "0 0 8px"}}>
                    Delete unit?
                </h2>
                <p style={{fontSize: "14px", color: "#6b7280", margin: "0 0 20px", lineHeight: "1.5"}}>
                    Are you sure you want to delete unit <strong>{unit.roomNumber}</strong>?
                </p>
                {error && (
                    <div style={{
                        backgroundColor: "#fef2f2", color: "#dc2626", fontSize: "13px",
                        padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                        borderLeft: "3px solid #ef4444",
                    }}>
                        {error}
                    </div>
                )}
                <div style={{display: "flex", gap: "10px", justifyContent: "flex-end"}}>
                    <button onClick={onClose} style={{
                        padding: "9px 18px", borderRadius: "8px", fontSize: "14px",
                        border: "1px solid #e5e7eb", backgroundColor: "#fff",
                        color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={deleteUnit.isPending} style={{
                        padding: "9px 20px", borderRadius: "8px", fontSize: "14px",
                        backgroundColor: "#dc2626", color: "#fff", border: "none",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
                    }}>
                        {deleteUnit.isPending ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function UnitsPage() {
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [availabilityFilter, setAvailabilityFilter] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [editUnit, setEditUnit] = useState(null)
    const [deleteUnit, setDeleteUnit] = useState(null)
    const [selectedUnitId, setSelectedUnitId] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(0)
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

    const {data, isLoading} = useUnits({
        page, size: 10, sortBy: "createdAt", sortDir: "desc",
        search: debouncedSearch || undefined,
        isAvailable: availabilityFilter,
    })

    const units = data?.content || []
    const totalPages = data?.totalPages || 0

    const actions = (
        <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500",
        }}>
            <Plus size={16}/> Add Unit
        </button>
    )

    const mobileAction = (
        <button onClick={() => setShowModal(true)} style={{
            width: "54px", height: "54px", borderRadius: "50%",
            backgroundColor: "#0F6E56", color: "#fff", border: "none",
            cursor: "pointer", fontSize: "28px", fontWeight: "300",
            boxShadow: "0 4px 16px rgba(15,110,86,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            +
        </button>
    )

    return (
        <PageWrapper title="Units" actions={actions} mobileAction={mobileAction}>

            {/* Search + filter */}
            <div style={{
                marginBottom: "16px", display: "flex",
                gap: "10px", alignItems: "center", flexWrap: "wrap",
            }}>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by room number..."
                    style={{
                        flex: 1, minWidth: "160px", maxWidth: "360px",
                        padding: "10px 14px", fontSize: "14px",
                        borderRadius: "8px", border: "1px solid #e5e7eb",
                        outline: "none", boxSizing: "border-box",
                        fontFamily: "'DM Sans', sans-serif", color: "#111827",
                        backgroundColor: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0F6E56"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                {[
                    {label: "All", value: null},
                    {label: "Available", value: true},
                    {label: "Occupied", value: false},
                ].map(f => (
                    <button
                        key={String(f.value)}
                        onClick={() => {
                            setAvailabilityFilter(f.value);
                            setPage(0)
                        }}
                        style={{
                            padding: "9px 14px", borderRadius: "8px", fontSize: "13px",
                            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                            border: "1px solid",
                            borderColor: availabilityFilter === f.value ? "#0F6E56" : "#e5e7eb",
                            backgroundColor: availabilityFilter === f.value ? "#0F6E56" : "#fff",
                            color: availabilityFilter === f.value ? "#fff" : "#6b7280",
                            fontWeight: availabilityFilter === f.value ? "500" : "400",
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid #f0f0f0", overflow: "hidden",
            }}>
                {isLoading ? (
                    <div style={{padding: "60px", textAlign: "center", color: "#9ca3af", fontSize: "14px"}}>
                        Loading units...
                    </div>
                ) : units.length === 0 ? (
                    <div style={{padding: "60px", textAlign: "center"}}>
                        <p style={{color: "#9ca3af", fontSize: "14px", marginBottom: "16px"}}>
                            {search ? `No units found for "${search}"` : "No units yet."}
                        </p>
                        {!search && (
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: "6px",
                                    padding: "9px 16px", borderRadius: "8px", fontSize: "14px",
                                    backgroundColor: "#0F6E56", color: "#fff", border: "none",
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                <Plus size={16}/> Add Unit
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="desktop-table">
                            <table style={{width: "100%", borderCollapse: "collapse"}}>
                                <thead>
                                <tr style={{backgroundColor: "#f9fafb"}}>
                                    {["Room", "Rent / Month", "Description", "Status", ""].map((h, i) => (
                                        <th key={i} style={{
                                            padding: "11px 20px", textAlign: "left",
                                            fontSize: "11px", fontWeight: "500", color: "#9ca3af",
                                            textTransform: "uppercase", letterSpacing: "0.05em",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {units.map((unit) => (
                                    <tr key={unit.id} style={{borderTop: "1px solid #f9f9f9"}}>
                                        <td style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            color: "#111827",
                                            fontWeight: "600"
                                        }}>
                                            {unit.roomNumber}
                                        </td>
                                        <td style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            color: "#111827",
                                            fontWeight: "500"
                                        }}>
                                            {formatUGX(unit.rentAmount)}
                                        </td>
                                        <td style={{padding: "14px 20px", fontSize: "14px", color: "#6b7280"}}>
                                            {unit.description || "—"}
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                        <span style={{
                            display: "inline-block", padding: "3px 10px",
                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                            backgroundColor: unit.isAvailable ? "#E1F5EE" : "#fef2f2",
                            color: unit.isAvailable ? "#0F6E56" : "#dc2626",
                        }}>
                          {unit.isAvailable ? "Available" : "Occupied"}
                        </span>
                                        </td>
                                        <td style={{padding: "14px 20px"}}>
                                            <div style={{display: "flex", gap: "8px", justifyContent: "flex-end"}}>
                                                <button onClick={() => setEditUnit(unit)} style={{
                                                    padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                    border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                    color: "#374151", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}>
                                                    <Pencil size={13}/> Edit
                                                </button>
                                                <button onClick={() => setDeleteUnit(unit)} style={{
                                                    padding: "6px 12px", borderRadius: "6px", fontSize: "13px",
                                                    border: "1px solid #fee2e2", backgroundColor: "#fff",
                                                    color: "#dc2626", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}>
                                                    <Trash2 size={13}/> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="mobile-cards" style={{display: "none", flexDirection: "column"}}>
                            {units.map((unit, i) => (
                                <div key={unit.id}
                                     onClick={() => setSelectedUnitId(unit.id)}
                                     style={{
                                         padding: "14px 16px",
                                         borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                                         cursor: "pointer"
                                     }}
                                >
                                    {/* Row 1 — room + status */}
                                    <div style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between", marginBottom: "4px",
                                    }}>
                                    <span style={{fontSize: "18px", fontWeight: "700", color: "#111827"}}>
                                      {unit.roomNumber}
                                    </span>
                                        <span style={{
                                            display: "inline-block", padding: "3px 10px",
                                            borderRadius: "20px", fontSize: "12px", fontWeight: "500",
                                            backgroundColor: unit.isAvailable ? "#E1F5EE" : "#fef2f2",
                                            color: unit.isAvailable ? "#0F6E56" : "#dc2626",
                                        }}>
                                          {unit.isAvailable ? "Available" : "Occupied"}
                                        </span>
                                        <ChevronRight size={16} color="#9ca3af"/>
                                    </div>

                                    {/* Row 2 — rent */}
                                    <div style={{
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        color: "#0F6E56",
                                        marginBottom: "4px"
                                    }}>
                                        {formatUGX(unit.rentAmount)}<span style={{color: "#9ca3af", fontWeight: "400"}}> / month</span>
                                    </div>

                                    {/* Row 3 — description */}
                                    {unit.description && (
                                        <div style={{fontSize: "13px", color: "#6b7280", marginBottom: "10px"}}>
                                            {unit.description}
                                        </div>
                                    )}

                                    {/* Row 4 — actions */}
                                    {/*<div style={{*/}
                                    {/*    display: "flex",*/}
                                    {/*    gap: "8px",*/}
                                    {/*    marginTop: unit.description ? "0" : "10px"*/}
                                    {/*}}>*/}
                                    {/*    <button onClick={() => setEditUnit(unit)} style={{*/}
                                    {/*        flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px",*/}
                                    {/*        border: "1px solid #e5e7eb", backgroundColor: "#fff",*/}
                                    {/*        color: "#374151", cursor: "pointer",*/}
                                    {/*        display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",*/}
                                    {/*        fontFamily: "'DM Sans', sans-serif",*/}
                                    {/*    }}>*/}
                                    {/*        <Pencil size={13}/> Edit*/}
                                    {/*    </button>*/}
                                    {/*    <button onClick={() => setDeleteUnit(unit)} style={{*/}
                                    {/*        flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px",*/}
                                    {/*        border: "1px solid #fee2e2", backgroundColor: "#fff",*/}
                                    {/*        color: "#dc2626", cursor: "pointer",*/}
                                    {/*        display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",*/}
                                    {/*        fontFamily: "'DM Sans', sans-serif",*/}
                                    {/*    }}>*/}
                                    {/*        <Trash2 size={13}/> Delete*/}
                                    {/*    </button>*/}
                                    {/*</div>*/}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "14px 20px", borderTop: "1px solid #f3f4f6",
                            }}>
                <span style={{fontSize: "13px", color: "#9ca3af"}}>
                  Page {page + 1} of {totalPages}
                </span>
                                <div style={{display: "flex", gap: "8px"}}>
                                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                            style={{
                                                padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                color: page === 0 ? "#d1d5db" : "#374151",
                                                cursor: page === 0 ? "not-allowed" : "pointer",
                                            }}>
                                        Previous
                                    </button>
                                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                                            style={{
                                                padding: "6px 14px", borderRadius: "6px", fontSize: "13px",
                                                border: "1px solid #e5e7eb", backgroundColor: "#fff",
                                                color: page >= totalPages - 1 ? "#d1d5db" : "#374151",
                                                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                                            }}>
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showModal && <UnitModal onClose={() => setShowModal(false)}/>}
            {editUnit && <UnitModal unit={editUnit} onClose={() => setEditUnit(null)}/>}
            {deleteUnit && <DeleteConfirm unit={deleteUnit} onClose={() => setDeleteUnit(null)}/>}
            {selectedUnitId && (
                <UnitDetailSheet
                    unitId={selectedUnitId}
                    onClose={() => setSelectedUnitId(null)}
                    onEdit={(unit) => setEditUnit(unit)}
                    onDelete={(unit) => setDeleteUnit(unit)}
                />
            )}
        </PageWrapper>
    )
}