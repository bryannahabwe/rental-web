import {StrictMode} from "react"
import {createRoot} from "react-dom/client"
import {BrowserRouter} from "react-router-dom"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import "./index.css"
import App from "./App"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            // Retrying a 4xx is pointless — a 403/404/409 won't change on a
            // second identical request, and the app has capability-gated routes
            // that legitimately 403. Retry once for network/5xx only.
            retry: (failureCount, error) => {
                const status = error?.response?.status
                if (status && status >= 400 && status < 500) return false
                return failureCount < 1
            },
        },
    },
})

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
)