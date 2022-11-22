const canvasEl = document.getElementById('assignment')
let ctx;
let points = []
const defaultR = 11
let selectedPointIndx = null

const resetButton = document.getElementById('reset')
const aboutButton = document.getElementById('about')
const closeButton = document.getElementById('close')

const aboutContentEl = document.getElementById('about-content')

const areaEl = document.getElementById(`area`)

resetButton.addEventListener('click', () => {
    for (let i = 0; i < points.length; i++) {
        const pointEl = document.getElementById(`point-${i + 1}`)
        pointEl.textContent = `Point ${i + 1}: `
    }
    areaEl.textContent = 'Area: '
    points = []
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
})

closeButton.addEventListener('click', () => {
    aboutContentEl.style.visibility = 'hidden'
})

aboutButton.addEventListener('click', () => {
    aboutContentEl.style.visibility = 'visible'
})

// set responsive dimension for canvas
function setDimensions(el, width, height) {
    el.setAttribute('width', width)
    el.setAttribute('height', height)
}

setDimensions(canvasEl, window.innerWidth, window.innerHeight)
window.addEventListener('resize', () => {
    setDimensions(canvasEl, this.innerWidth, this.innerHeight)
    updateCanvas()
}) 

function drawCircle(cx, cy, r=defaultR, color='red') {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true)
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.closePath()
}

function drawLine(x1, y1, x2, y2, color="blue") {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.closePath()
}

function drawParallelogram(x1, y1, x2, y2, x3, y3) {
    let x4, y4
    if (x1 === x2) {
        x4 = x3
        if (y1 < y2) {
            y4 = y3 - (y2 - y1)
        } else {
            y4 = y3 + (y1 - y2)
        }
    } else if (y1 === y2) {
        y4 = y3
        if (x1 < x2) {
            x4 = x3 - (x2 - x1)
        } else {
            x4 = x3 + (x1 - x2)
        }
    } else if (x2 === x3) {
        x4 = x1
        if (y2 < y3) {
            y4 = y1 + (y3 - y2)
        } else {
            y4 = y1 - (y2 - y3)
        }
    } else if (y2 === y3) {
        y4 = y1
        if (x2 < x3) {
            x4 = x1 + (x3 - x2)
        } else {
            x4 = x1 - (x2 - x3)
        }
    } else {
        const m1 = (y2 - y1) / (x2 - x1)
        const m2 = (y3 - y2) / (x3 - x2)
        x4 = (y1 - m2 * x1 - y3 + m1 * x3) / (m1 - m2)
        y4 = y3 + m1 * (x4 - x3)
    }
    drawLine(x1, y1, x2, y2)
    drawLine(x2, y2, x3, y3)
    drawLine(x3, y3, x4, y4)
    drawLine(x4, y4, x1, y1)
    return {
        x: x4,
        y: y4
    }
}

function intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const m12 = (y2 - y1) / (x2 - x1)
    const m34 = (y4 - y3) / (x4 - x3)
    const xi = (y3 - y1 + m12 * x1 - m34 * x3) / (m12 - m34)
    const yi = m12 * (xi - x1) + y1
    return {
        x: xi,
        y: yi
    }
}

function distance(x1, y1, x2, y2) {
    const dx = x1 - x2, dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy)
}

function calculateParallelogramArea(x1, y1, x3, y3, x4, y4) {
    if (x3 === x4) {
        return Math.abs(y4 - y3) * Math.abs(x1 - x4)
    } else if (y3 === y4) {
        return Math.abs(x4 - x3) * Math.abs(y4 - y1)
    }
    const m34 = (y4 - y3) / (x4 - x3)
    const mp = -(1.0 / m34)
    const xi = (y3 - y1 + mp * x1 - m34 * x3) / (mp - m34)
    const yi = mp * (xi - x1) + y1
    return distance(x3, y3, x4, y4) * distance(x1, y1, xi, yi)
}

function updateCanvas() {
    // clear canvas
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    areaEl.textContent = 'Area: '

    // draw points
    for (let i = 0; i < points.length; i++) {
        const p = points[i]
        drawCircle(p.x, p.y)
    }
    const newP = drawParallelogram(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y)
    const parallelogramArea = calculateParallelogramArea(points[0].x, points[0].y, points[2].x, points[2].y, newP.x, newP.y)
    areaEl.textContent += parallelogramArea
    const centerOfMass = intersection(points[0].x, points[0].y, points[2].x, points[2].y, points[1].x, points[1].y, newP.x, newP.y)
    drawCircle(centerOfMass.x, centerOfMass.y, Math.sqrt(parallelogramArea / Math.PI), 'orange')
}

function findPoint(x, y) {
    for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (distance(p.x, p.y, x, y) <= defaultR)
            return i
    }
    return null
}

if (canvasEl.getContext) {
    // get context of the canvas
    ctx = canvasEl.getContext('2d')
    canvasEl.addEventListener('click', (event) => {
        if (points.length < 3) {
            const px = event.pageX, py = event.pageY
            drawCircle(px, py)
            points.push({
                x: px,
                y: py
            })
            const pointEl = document.getElementById(`point-${points.length}`)
            pointEl.textContent += `(${px}, ${py})`
            if (points.length === 3) 
                updateCanvas()
        }
    })
    canvasEl.addEventListener('mousedown', (event) => {
        if (points.length === 3) {
            selectedPointIndx = findPoint(event.pageX, event.pageY)
        }
    })
    canvasEl.addEventListener('mousemove', (event) => {
        if (points.length === 3) 
            if (selectedPointIndx !== null) {
                points[selectedPointIndx].x = event.pageX
                points[selectedPointIndx].y = event.pageY
                const pointEl = document.getElementById(`point-${selectedPointIndx + 1}`)
                pointEl.textContent = `Point ${selectedPointIndx + 1}: (${event.pageX}, ${event.pageY})`
                updateCanvas()
            }
    })
    canvasEl.addEventListener('mouseup', (event) => {
        if (points.length === 3 ) 
            if (selectedPointIndx !== null) 
                selectedPointIndx = null
    })
}
