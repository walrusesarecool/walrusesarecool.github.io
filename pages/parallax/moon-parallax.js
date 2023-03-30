let mouseCoords = [1000, 1920]
let movementRange = [-15, 15]
let moonCoords = []


let dimensions = [window.innerWidth, window.innerHeight]
let starsCount = Math.floor(Math.sqrt(Math.min(...dimensions) / 2))
let starsRange = []
let stars = []

let moonWidth = 0
const starPadding = 20

function initStars() {
  starsRange = [dimensions[0], document.getElementById("anchor").getBoundingClientRect().top]
  moonWidth = starsRange[1]
  starsRange[0] -= dimensions[0] - document.getElementById("moon").getBoundingClientRect().left
  starsCount = Math.floor(Math.sqrt(Math.min(...dimensions) / 2))
  stars = []

  const radii = []
  for (let i = 0; i < starsCount; i++) radii.push(biasedInt(4, 8, 6, 1))

  const starPositions = [spacedRandom(starPadding, starsRange[0] - starPadding, starsCount, radii), randInt(starPadding, starsRange[1] - starPadding, starsCount)]
  const starsContainer = document.querySelector("#starsContainer")
  starsContainer.innerHTML = ""
  
  starPositions[0].forEach((value, index) => {
    if (value && starPositions[1][index]) {
      const star = document.createElement("div")
      star.style = `position: absolute; 
      top: ${starPositions[1][index]}px; 
      left: ${value}px; 
      height: ${radii[index]}px; 
      width: ${radii[index]}px;
      border-radius: 50%;
      background-color: #FFFFFF;`
      starsContainer.appendChild(star)
    }
  })
}

dimensions.forEach((dimension, index) => {
  // Convert mouse position to moon position through range conversion
  moonCoords[index] = round(fitToRange(0, dimension, ...movementRange, mouseCoords[index]), 3)
})

function round(value, places) {
  return Math.round(value * (10 ** places)) / (10 ** places)
}

function fitToRange(originalLower, originalUpper, newLower, newUpper, value) {
  return value * (newUpper - newLower) / (originalUpper - originalLower) + newLower
}

function randInt(min, max, count = 0, array = []) {
  min = Math.ceil(min || 1)
  max = Math.floor(max || 100)
  function recurse(min, max, count, array) {
    if (count > 0) {
      array.push(Math.floor(Math.random() * (max - min + 1) + min))
      randInt(min, max, count - 1, array)
    }
    return array
  }

  return count == 0 ? [Math.floor(Math.random() * (max - min + 1) + min)] : recurse(min, max, count, array);
}

function biasedInt(min, max, bias, influence) {
  min = Math.ceil(min || 1) 
  max = Math.floor(max || 100) 

  const sample = Math.random() * (max - min + 1) + min
  const mix = Math.random() * influence

  return Math.floor(sample * (1 - mix) + mix * bias)
}

function spacedRandom(min, max, count, radii) {
  // Divide the range into intervals and generate a random value within that interval (so the values will, on average have a section worth of padding)
  const values = []
  const endpoints = [0]
  for (let i = 0; i < count; i++) {
      const value = randInt(0, (max - min) / (count - 1) - radii[i])[0]
      endpoints.push(endpoints[i] + (max - min) / (count - 1))
      values.push(endpoints[i] + value - radii[i] / 2)
  }

  return values
}

window.addEventListener("resize", initStars)

initStars()

// function drawStars() {
//   const canvas = document.getElementById("starsCanvas")
//   const context = canvas.getContext("2d")
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
  
//   context.clearRect(0, 0, canvas.width, canvas.height)
//   context.fillStyle = "white"

//   context.beginPath()
//   context.moveTo(0, starsRange[1])
//   context.lineTo(...starsRange)
//   context.stroke()

  
//   stars.forEach((star, index) => {
//     const gradient = context.createLinearGradient(0, 0, 500, 0);               // create gradient
//     gradient.addColorStop(0, `hsl(${index * 20 % 360},100%, 50%)`);   // start color
//     gradient.addColorStop(1, `hsl(${index * 20 % 360},100%, 50%)`);   // end color
//     context.fillStyle = gradient
//     context.beginPath()
//     context.arc(star.x, star.y, star.radius, 0, 2*Math.PI)
//     context.fill()
//   })
// }

// function spacedRandom(min, max, space = 10, maxCount = 10) {
//   min = Math.ceil(min || 1)
//   max = Math.floor(max || 100)

//   function branch(value, min, max, tree = []) {
//     if (tree.length < maxCount) {
//       tree.push(value)
//       if (min + space < value - space) branch(randInt(min + space, value - space), min, value, tree)
//       if (value + space < max - space) branch(randInt(value + space, max - space), value, max, tree)
//     }
//     return tree
//   }

//   return branch(randInt(min, max), min - space, max + space)
// }

// function spacedRandom(min, max, space, maxCount) {

// }

// function initStars() {
//   if (starsCount % 2) {
//     starsCount ++
//   }

  // starsRange = [window.innerWidth, document.getElementById("anchor").getBoundingClientRect().top]

  // starsCount = Math.floor(Math.sqrt(Math.min(...dimensions) / 2))

//   canvasBiases = {x:[], y:[]}
//   stars = []

//   for (let i = 0; i < starsCount; i++) {
//     const star = {}
//     // Bias the star's position toward the top left corner

//     if (i) {
//       biases = {x:[], y:[]}
//       stars.forEach((star) => {
//           biases.x.push(starsRange[0] - star.x)
//           biases.y.push(starsRange[1] - star.y)
//       })
  
//       let biasX = biases.x.reduce((a, b) => a + b) / biases.x.length
//       let biasY = biases.y.reduce((a, b) => a + b) / biases.y.length
//       canvasBiases.x.push(biasX)
//       canvasBiases.y.push(biasY)
//       star.x = biasedInt(starPadding, starsRange[0] - starPadding, biasX, 1)
//       star.y = biasedInt(starPadding, starsRange[1] - starPadding, biasY, 1)
//       console.log(biasX, biasY, star.x, star.y)
//       console.log()
//     } else {
//       star.x = sqrtBias(starPadding, starsRange[0] - starPadding)
//       star.y = sqrtBias(starPadding, starsRange[1] - starPadding)
//     }

//     star.radius = biasedInt(1, maxStarWidth, 4, 1)
//     stars.push(star)
//   }

//   console.log(starsRange)

//   drawStars()
// }

// function sqrtBias(min, max, sampleFunction) {
//   min = Math.ceil(min || 1) 
//   max = Math.floor(max || 100) 

//   // Inverse transform sampling
//   const sample = sampleFunction || (1 - Math.sqrt(1 - Math.random()))

//   return Math.floor(sample * (max - min + 1) + min)
// }

