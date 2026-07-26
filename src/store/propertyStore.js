import {create} from "zustand"
import {persist} from "zustand/middleware"

// The active property a landlord is viewing. `selectedPropertyId === null`
// means "All properties" — the landlord-wide aggregate view. The id is sent
// to the API on every request via the X-Property-Id header (see services/api.js)
// and is folded into React Query keys so switching properties refetches.
const usePropertyStore = create(
    persist(
        (set) => ({
            selectedPropertyId: null,

            setSelectedProperty: (id) => set({selectedPropertyId: id}),

            reset: () => set({selectedPropertyId: null}),
        }),
        {name: "rentflow-property"}
    )
)

export default usePropertyStore
