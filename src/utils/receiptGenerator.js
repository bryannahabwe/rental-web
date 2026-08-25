import { jsPDF } from "jspdf"

const formatUGX = (amount) =>
    amount == null ? "UGX 0" : `UGX ${Number(amount).toLocaleString()}`

const formatDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "long", year: "numeric",
    })
}

const formatCycleDate = (dateStr) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-UG", {
        day: "numeric", month: "short",
    })
}

const formatCycle = (start, end) => {
    if (!start || !end) return "—"
    return `${formatCycleDate(start)} – ${formatCycleDate(end)}`
}

/**
 * What the tenant still owes on the period this receipt covers.
 *
 * Taken from the period's total (`periodPaidAmount`), not from this row's
 * amount: a cycle is routinely settled by more than one payment — the tail of
 * a rollover chain plus a cash top-up — and subtracting a single row from the
 * rent hands the tenant a balance for money they have already paid.
 *
 * Manual receipts carry a balance typed in by the landlord and keep it.
 */
const periodBalance = (payment) => {
    if (payment.isManual) return Number(payment.balance || 0)

    const amount = Number(payment.amount || 0)
    const overpayment = Number(payment.overpayment || 0)
    const applied = overpayment > 0 ? amount - overpayment : amount
    // Pre-dates the field, or an older cached row: this payment's own
    // contribution understates a shared period but never overstates it.
    const periodPaid = payment.periodPaidAmount != null
        ? Number(payment.periodPaidAmount)
        : applied

    return Math.max(0, Number(payment.expectedAmount || 0) - periodPaid)
}

// Convert number to words (UGX amounts)
const numberToWords = (num) => {
    if (num === 0) return "Zero"
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
        "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
        "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"]

    const convert = (n) => {
        if (n < 20) return ones[n]
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" +
            (n % 100 ? " " + convert(n % 100) : "")
        if (n < 1_000_000) return convert(Math.floor(n / 1000)) + " Thousand" +
            (n % 1000 ? " " + convert(n % 1000) : "")
        if (n < 1_000_000_000) return convert(Math.floor(n / 1_000_000)) + " Million" +
            (n % 1_000_000 ? " " + convert(n % 1_000_000) : "")
        return convert(Math.floor(n / 1_000_000_000)) + " Billion" +
            (n % 1_000_000_000 ? " " + convert(n % 1_000_000_000) : "")
    }

    return convert(Math.round(num)) + " Shillings Only"
}

// ── Load image as base64 ─────────────────────────────────
const loadImageAsBase64 = (url) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")
            ctx.drawImage(img, 0, 0)
            resolve(canvas.toDataURL("image/png"))
        }
        img.onerror = () => resolve(null) // fail silently
        img.src = url
    })
}

// ── DIGITAL receipt ──────────────────────────────────────
const generateDigital = async (doc, payment, settings, receiptNumber) => {
    const periodDisplay = payment.isManual
        ? (payment.manualPeriod || "—")
        : formatCycle(payment.periodStartDate, payment.periodEndDate)

    const W = 210  // A5 width in mm
    const primary = "#0F6E56"
    const dark = "#111827"
    const gray = "#6b7280"
    const lightGray = "#f3f4f6"

    let y = 0

    // Header bar
    doc.setFillColor(10, 74, 56)
    doc.rect(0, 0, W, 36, "F")

    // Logo
    if (settings?.logoUrl) {
        const logoBase64 = await loadImageAsBase64(settings.logoUrl)
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 10, 6, 24, 24, undefined, "FAST")
        }
    }

    // Company name
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    const nameX = settings?.logoUrl ? 40 : 10
    doc.text(settings?.companyName || "RentFlow", nameX, 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(200, 230, 220)
    doc.text("Property Management", nameX, 22)

    if (settings?.address) {
        doc.setFontSize(8)
        doc.text(settings.address, nameX, 28)
    }

    // RECEIPT label top right
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text("RECEIPT", W - 10, 20, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(200, 230, 220)
    doc.text(receiptNumber, W - 10, 28, { align: "right" })

    y = 46

    // ── Receipt meta ─────────────────────────────────────
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text("DATE", 10, y)
    doc.text("PAYMENT DATE", W / 2, y)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text(formatDate(new Date().toISOString()), 10, y + 5)
    doc.text(formatDate(payment.paymentDate), W / 2, y + 5)

    y += 16

    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.line(10, y, W - 10, y)
    y += 8

    // ── Received from ────────────────────────────────────
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text("RECEIVED FROM", 10, y)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(17, 24, 39)
    doc.text(payment.tenantName || "—", 10, y + 6)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(`Unit ${payment.roomNumber || "—"}`, 10, y + 12)

    y += 22

    // ── Amount box ───────────────────────────────────────
    doc.setFillColor(241, 253, 247)
    doc.roundedRect(10, y, W - 20, 28, 3, 3, "F")

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(15, 110, 86)
    doc.text("AMOUNT PAID", 18, y + 7)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(10, 74, 56)
    doc.text(formatUGX(payment.amount), 18, y + 18)

    // Amount in words
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    const words = numberToWords(Number(payment.amount || 0))
    doc.text(words, 18, y + 24)

    y += 36

    // ── Details grid ─────────────────────────────────────
    const details = [
        { label: "FOR PERIOD", value: periodDisplay },
        { label: "PAYMENT BY",    value: payment.method || "CASH" },
        { label: "EXPECTED RENT", value: formatUGX(payment.expectedAmount) },
        { label: "BALANCE",       value: formatUGX(periodBalance(payment)) },
    ]

    if (payment.reference) {
        details.push({ label: "REFERENCE", value: payment.reference })
    }

    details.forEach((item, i) => {
        const col = i % 2 === 0 ? 10 : W / 2
        const row = Math.floor(i / 2)
        const rowY = y + row * 18

        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(item.label, col, rowY)

        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(17, 24, 39)
        doc.text(item.value, col, rowY + 6)
    })

    y += Math.ceil(details.length / 2) * 18 + 8

    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.line(10, y, W - 10, y)
    y += 10

    // ── Signature line ───────────────────────────────────
    doc.setDrawColor(17, 24, 39)
    doc.setLineWidth(0.4)
    doc.line(10, y + 8, 70, y + 8)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text("Authorised Signature", 10, y + 13)

    // Footer
    const footer = settings?.receiptFooter || "Thank you for your business"
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(15, 110, 86)
    doc.text(footer, W - 10, y + 8, { align: "right" })

    // Bottom strip
    doc.setFillColor(10, 74, 56)
    doc.rect(0, 205, W, 3, "F")
}

// ── FORMAL receipt (like physical book) ─────────────────
const generateFormal = async (doc, payment, settings, receiptNumber) => {
    const periodDisplay = payment.isManual
        ? (payment.manualPeriod || "—")
        : formatCycle(payment.periodStartDate, payment.periodEndDate)
    const W = 210
    let y = 14

    // Header
    if (settings?.logoUrl) {
        const logoBase64 = await loadImageAsBase64(settings.logoUrl)
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", W / 2 - 12, y, 24, 24, undefined, "FAST")
            y += 28
        }
    }

    // Company name
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(17, 24, 39)
    doc.text(settings?.companyName || "RentFlow", W / 2, y, { align: "center" })
    y += 6

    if (settings?.address) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(9)
        doc.setTextColor(107, 114, 128)
        doc.text(settings.address, W / 2, y, { align: "center" })
        y += 5
    }

    y += 4

    // RECEIPT title box
    doc.setDrawColor(17, 24, 39)
    doc.setLineWidth(0.8)
    const boxW = 40
    const boxX = W / 2 - boxW / 2
    doc.rect(boxX, y, boxW, 10)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(17, 24, 39)
    doc.text("RECEIPT", W / 2, y + 7, { align: "center" })
    y += 16

    // Receipt No + Date
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`No.  ${receiptNumber}`, 10, y)
    doc.text(`Date: ${formatDate(payment.paymentDate)}`, W - 10, y, { align: "right" })
    y += 10

    // Dotted line helper
    const dottedLine = (label, value, yPos) => {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(17, 24, 39)
        doc.text(label, 10, yPos)

        const labelW = doc.getTextWidth(label)
        const valueW = doc.getTextWidth(value)
        const lineStart = 10 + labelW + 2
        const lineEnd = W - 10 - valueW - 2

        // Dots
        doc.setDrawColor(150, 150, 150)
        doc.setLineWidth(0.2)
        doc.setLineDashPattern([0.5, 1.5], 0)
        doc.line(lineStart, yPos - 1, lineEnd, yPos - 1)
        doc.setLineDashPattern([], 0)

        doc.setFont("helvetica", "normal")
        doc.text(value, W - 10, yPos, { align: "right" })
    }

    // Received from
    dottedLine("Received with thanks from:", payment.tenantName || "—", y)
    y += 12

    // Sum of shillings
    const words = numberToWords(Number(payment.amount || 0))
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text("The sum of Shillings:", 10, y)

    const labelW = doc.getTextWidth("The sum of Shillings:")
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.2)
    doc.setLineDashPattern([0.5, 1.5], 0)
    doc.line(10 + labelW + 2, y - 1, W - 10, y - 1)
    doc.setLineDashPattern([], 0)
    y += 6

    // Words on second line
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(17, 24, 39)
    doc.text(words, 10, y)
    y += 10

    // Being payment of
    dottedLine(
        "Being payment of:",
        `Rent — ${periodDisplay}`,
        y
    )
    y += 12

    // Amount in figures
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Amount:", 10, y)
    doc.setFont("helvetica", "normal")
    doc.text(formatUGX(payment.amount), W - 10, y, { align: "right" })
    y += 10

    // By cash / reference
    const refText = payment.reference
        ? `${payment.method || "Cash"} / Ref: ${payment.reference}`
        : (payment.method || "Cash")
    dottedLine("By Cash / Cheque No:", refText, y)
    y += 10

    // Balance
    dottedLine("Balance:", formatUGX(periodBalance(payment)), y)
    y += 16

    // Signature + footer
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text("Shs.", 10, y)

    // Amount box
    doc.setDrawColor(17, 24, 39)
    doc.setLineWidth(0.5)
    doc.rect(20, y - 6, 35, 10)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(formatUGX(payment.amount), 37, y, { align: "center" })

    // Signed
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(17, 24, 39)
    doc.text("Signed:", W - 70, y)
    doc.setDrawColor(17, 24, 39)
    doc.setLineWidth(0.3)
    doc.line(W - 52, y, W - 10, y)
    y += 12

    // Footer
    const footer = settings?.receiptFooter || "Thank you for your business"
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(footer, W / 2, y, { align: "center" })
    doc.text("With Thanks", W / 2, y + 6, { align: "center" })
}

// ── Main export ──────────────────────────────────────────
export const generateReceipt = async (payment, settings, receiptNumber) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
    })

    const style = settings?.receiptStyle || "DIGITAL"

    if (style === "FORMAL") {
        await generateFormal(doc, payment, settings, receiptNumber)
    } else {
        await generateDigital(doc, payment, settings, receiptNumber)
    }

    const filename = `${receiptNumber}-${(payment.tenantName || "receipt").replace(/\s+/g, "_")}.pdf`
    doc.save(filename)
}