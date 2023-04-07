history.replaceState({}, "", `${window.location.origin}/theranos-podcast`)

const player = new Shikwasa.Player({
  container: document.querySelector("#player"),
  themeColor: "#470909",
  audio: {
    title: "S1 E1: Questions to Stop the Bleeding",
    artist: "Alex's Podcast",
    cover: "/ep-art.png",
    src: "/ep-recording.wav",
  }
})

class SpringCursor {
  constructor () {
    // Position arrays
    this.previousPosition = []
    this.exactPosition = []
    this.dampedPosition = []

    // Some physics stuff
    this.lastTimestamp = null
    this.currentTimestamp = null

    this.deltaT = 0
    this.deltaX = 0
    this.deltaY = 0

    this.velocityX = 0
    this.velocityY = 0
    this.newVelocityX = 0
    this.newVelocityY = 0

    // Controls how damped the cursor is
    this.springTension = 0.065
    this.damping = 0.1

    // Whether or not damping has begun
    this.cursorStarted = false
  }

  updateCursorVars(event) {
    event = event || window.event

    if (event.pageX == null && event.clientX != null) {
        const eventDocument = (event.target && event.target.ownerDocument) || document
        const doc = eventDocument.documentElement
        const body = eventDocument.body
  
        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0)
          
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 )
    }
  
    if (this.lastTimestamp === null) {
      // Initialize stuffs if first event
      this.lastTimestamp = Date.now()
      this.previousPosition = [event.pageX, event.pageY]
      this.dampedPosition = [event.pageX, event.pageY]
  
      return
    }
  
    // Physics
    this.exactPosition = [event.pageX, event.pageY]
    this.currentTimestamp = Date.now()
  
    this.deltaT = this.currentTimestamp - this.lastTimestamp
    this.deltaX = this.exactPosition[0] - this.previousPosition[0]
    this.deltaY = this.exactPosition[1] - this.previousPosition[1]
  
    // Avoid NaN and Infinity values
    if (this.deltaT !== 0) {
      this.velocityX = Math.round(this.deltaX / this.deltaT * 5)
      this.velocityY = Math.round(this.deltaY / this.deltaT * 5)
    }
    
    // Update time values so they're accurate next cycle
    this.lastTimestamp = this.currentTimestamp
    this.previousPosition = this.exactPosition
  
    // Begin ticker
    if (this.cursorStarted === false) {
      this.cursorStarted = true
    }
  }

  update() {
    // Damping X
    this.newVelocityX = this.newVelocityX * (1 - this.damping)
    this.newVelocityX -= (this.dampedPosition[0] - this.exactPosition[0]) * this.springTension
    this.dampedPosition[0] += this.newVelocityX
  
    // Damping Y
    this.newVelocityY = this.newVelocityY * (1 - this.damping)
    this.newVelocityY -= (this.dampedPosition[1] - this.exactPosition[1]) * this.springTension
    this.dampedPosition[1] += this.newVelocityY
  
    // Stop movement if it's really small anyway
    if (Math.abs(this.newVelocityX) < 0.0005) {
      this.dampedPosition[0] = this.exactPosition[0]
    }
  
    if (Math.abs(this.newVelocityY) < 0.0005) {
      this.dampedPosition[1] = this.exactPosition[1]
    }
  
    // Move the cursor as per the calculated values
    document.getElementById("cursor").style.left = `${this.dampedPosition[0]}px`
    document.getElementById("cursor").style.top = `${this.dampedPosition[1]}px`
  }
}

const cursor = new SpringCursor()

function updateVariables(event) {
  if (event.type == "mousemove") {
    cursor.updateCursorVars(event)
  }
}

document.addEventListener("mousemove", updateVariables)

function render() {
  if (cursor.cursorStarted) cursor.update()
  window.requestAnimationFrame(render)
}

window.requestAnimationFrame(render)