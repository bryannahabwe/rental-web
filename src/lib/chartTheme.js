/**
 * Chart colours, in one place.
 *
 * SVG `fill`/`stroke` cannot consume a Tailwind class, so charts need
 * concrete values — but they must come from here, never from a literal at
 * the call site. Keep these in sync with the `@theme` block in index.css.
 */

/**
 * Categorical series order. On-brand and hue-separated.
 * `success-500` is deliberately excluded — it reads as a near-duplicate of
 * `primary-500`, so it stays reserved for semantic encoding.
 */
export const CHART_SERIES = [
    "#0F6E56", // primary-500
    "#3645BD", // info-500
    "#F5A623", // warning-500
    "#E5484D", // danger-500
    "#85889C", // neutral-40
    "#012118", // primary-900
]

/** Sequential ramp, light → dark. For heat/intensity encodings. */
export const CHART_SEQUENTIAL = [
    "#D5F3E7", // primary-100
    "#A2E2CA", // primary-200
    "#64CDAB", // primary-300
    "#14A27F", // primary-400
    "#0F6E56", // primary-500
    "#024937", // primary-700
]

export const CHART_GRID = "#E7E8ED" // neutral-5
export const CHART_AXIS = "#85889C" // neutral-40

/** Semantic encodings — never reuse these for a neutral series. */
export const CHART_SEMANTIC = {
    success: "#00B59A",
    warning: "#F5A623",
    danger: "#E5484D",
    info: "#3645BD",
}

/** Shared recharts axis props, so every chart's axes match. */
export const axisProps = {
    tick: {fill: CHART_AXIS, fontSize: 11},
    axisLine: false,
    tickLine: false,
}

/** Shared recharts grid props. */
export const gridProps = {
    stroke: CHART_GRID,
    vertical: false,
}

export const seriesColor = (index) => CHART_SERIES[index % CHART_SERIES.length]
