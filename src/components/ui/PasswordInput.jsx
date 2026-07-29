import {forwardRef, useState} from "react"
import {Eye, EyeOff} from "lucide-react"

/**
 * Password field with a show/hide eye toggle. Forwards the ref and all input
 * props, so it works both with react-hook-form's {...register(...)} and as a
 * controlled input (value/onChange). Pass the same `style` you'd give a plain
 * input — right padding is reserved for the toggle automatically.
 */
const PasswordInput = forwardRef(function PasswordInput({style, ...props}, ref) {
    const [visible, setVisible] = useState(false)

    return (
        <div style={{position: "relative"}}>
            <input
                {...props}
                ref={ref}
                type={visible ? "text" : "password"}
                style={{...style, paddingRight: "42px"}}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                title={visible ? "Hide password" : "Show password"}
                style={{
                    position: "absolute", top: "50%", right: "10px",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", padding: "4px",
                    cursor: "pointer", color: "#9ca3af", display: "flex",
                    alignItems: "center", justifyContent: "center",
                }}
            >
                {visible ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
        </div>
    )
})

export default PasswordInput
