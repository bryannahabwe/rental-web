// The backend uses two different error shapes: IllegalArgumentException-style
// responses carry {message}, Bean Validation failures (@NotBlank, @Positive,
// @Pattern, etc.) carry {errors: {field: "reason", ...}} with no top-level
// message at all. Every form's catch block needs both, not just the first.
export function getErrorMessage(err, fallback = "Something went wrong") {
    const data = err?.response?.data
    if (!data) return fallback

    if (data.message) return data.message

    if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors).filter(Boolean)
        if (messages.length > 0) return messages.join(", ")
    }

    return fallback
}
