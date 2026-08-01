import {Card} from "@/components/ui"

/**
 * The shared chrome for sign-in, register and accept-invite: brand wordmark,
 * a white card, and an optional footer line. The three pages supply only
 * their form.
 *
 * Deliberately keeps the app's light page rather than the source design
 * system's dark gradient — the gradient is a bigger visual departure than
 * this port is making.
 */
export default function AuthLayout({title, subtitle, footer, children}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-0 p-4">
            <div className="w-full max-w-110">
                <div className="mb-8 text-center">
                    {/* Always RentFlow here — the tenant's own branding isn't
                        loaded until after they sign in. */}
                    <h1 className="font-heading text-3xl text-secondary-900">RentFlow</h1>
                    <p className="mt-1 text-sm text-neutral-40">Property Management</p>
                </div>

                <Card bodyClass="p-6 sm:p-9">
                    <div className="mb-7">
                        <h2 className="font-heading text-2xl font-medium tracking-tight text-secondary-900">
                            {title}
                        </h2>
                        {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-neutral-40">{subtitle}</p>}
                    </div>

                    <div className="mb-7 h-px bg-neutral-5"/>

                    {children}
                </Card>

                {footer && <p className="mt-6 text-center text-sm text-neutral-40">{footer}</p>}
            </div>
        </div>
    )
}
