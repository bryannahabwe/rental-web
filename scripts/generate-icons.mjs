import { createCanvas } from "canvas"
import { writeFileSync } from "fs"

function generateIcon(size, outputPath) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext("2d")

    // Background
    ctx.fillStyle = "#0a4a38"
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, size * 0.2)
    ctx.fill()

    // Letter R
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${size * 0.5}px serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("R", size / 2, size / 2)

    writeFileSync(outputPath, canvas.toBuffer("image/png"))
    console.log(`Generated ${outputPath}`)
}

generateIcon(192, "public/icons/icon-192.png")
generateIcon(512, "public/icons/icon-512.png")