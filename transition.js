// Add this stuff to the state management later
let currentPage = (location.pathname.match(/[^\/].*?(?=\/|$)/i) || [""])[0].split(".")[0].trim()
let transitioning = false
let firstLoad = false

// If we're reloading the page, go back to the last page we were on
const routerPathes = {
  "index": "/pages/index/index.html",
  "parallax": "/pages/parallax/index.html"
}

if (Object.keys(routerPathes).includes(currentPage)) {initiateTransition(currentPage, routerPathes[currentPage])}
else {initiateTransition("index", "/pages/index/index.html")}

document.addEventListener("click", clickHandler)
window.addEventListener("popstate", popstateHandler)

function clickHandler(event) {
  // Check if this clicked div will initiate a page transition
  let clickedLink = event.target.getAttribute("href")
  if (clickedLink) {
    clickedLink = (clickedLink.match(/[^\/].*?(?=\/|$)/i) || [""])[0].split(".")[0].trim()
    console.log("Clicked:", clickedLink)

    // If the div has data-type="transition__override", the animation will not play and the page will reload
    if (event.target.dataset.type == "transition__override" || !clickedLink) return

    // Prevent page reload and begin transitioning page
    event.preventDefault()
    if (!transitioning) {
      if (Object.keys(routerPathes).includes(clickedLink)) { initiateTransition(clickedLink, routerPathes[clickedLink]) }
      else { initiateTransition("index", "/pages/index/index.html") }
    }

    // Safari is dumb and triggers a popstate event when the page loads, so this is a janky solution
    firstLoad = true
  }
}

function popstateHandler() {
  if (firstLoad) {
    let newPage = (location.pathname.match(/[^\/].*?(?=\/|$)/i) || [""])[0].split(".")[0].trim()
    if (!transitioning && currentPage != newPage) {
      if (Object.keys(routerPathes).includes(newPage)) { initiateTransition(newPage, routerPathes[newPage]) }
      else { initiateTransition("index", "/pages/index/index.html") }
    }
  } else {
    firstLoad = true
  }
}

function initiateTransition(displayedLocation, actualLocation) {
  transitioning = true

  // Update content wrapper's list of classes to reflect change
  const contentWrapper = document.querySelector(`[data-type="transition__content-wrapper"]`)
  contentWrapper.classList.remove(`transition__${currentPage.slice(0, -5)}`)
  contentWrapper.classList.add(`transition__${displayedLocation.slice(0, -5)}`)

  // Make an async get request to the location of the new content
  const getContent = new Promise((resolve, reject) => {
    const XHR = new XMLHttpRequest()

    XHR.open("GET", actualLocation, true)
    XHR.onreadystatechange = () => {
      if (XHR.readyState === 4) {
        resolve(new DOMParser().parseFromString(XHR.responseText, "text/html"))
      }
    }

    // Send request to the server
    XHR.send()
  })

  getContent.then((pageDOM) => {
    // When content is loaded, do the page out animation
    return new Promise((resolve) => {
      onpageout()
      setTimeout(() => { resolve(pageDOM) }, 1000)
    })
  }).then((pageDOM) => {
    // Replace the content in the current wrapper with the content in the new wrapper
    contentWrapper.innerHTML = pageDOM.querySelector(`div[data-type="transition__content-wrapper"]`).innerHTML

    // Only add a history entry if the user went forward, not if they refreshed or went back
    if (displayedLocation != window.location.href) {
      console.log(displayedLocation, actualLocation, `${window.location.origin}/${displayedLocation}`)
      history.replaceState({}, "", `${window.location.origin}/${displayedLocation}`)
    }

    document.getElementsByTagName("title")[0].innerHTML = pageDOM.getElementsByTagName("title")[0].innerHTML

    // Remove existing scripts and styles
    Array.prototype.slice.call(document.getElementsByTagName("script")).forEach(
      (item) => {
        if (!item.attributes.src.nodeValue.match("transition.js")) {
        item.parentNode.removeChild(item)
      }}
    )

    Array.prototype.slice.call(document.getElementsByTagName("link")).forEach(
      (item) => {
        if ((item.attributes.rel ? item.attributes.rel.nodeValue : false) == "stylesheet") {
          item.parentNode.removeChild(item)
      }}
    )

    // Add new file's styles and scripts
    const styles = pageDOM.getElementsByTagName("link")
    for (const sheet of styles) {
      (function (d) {
        const style = d.createElement("link")
        style.rel = "stylesheet"
        style.href = sheet.attributes.href.nodeValue
        d.getElementsByTagName("body")[0].appendChild(style)
      } (document))
    }

    const scripts = pageDOM.getElementsByTagName("script")
    for (const path of scripts) {
      if (!path.attributes.src.nodeValue.match("transition.js")) {
        (function (d) {
          const script = d.createElement("script")
          script.type = "text/javascript"
          script.src = path.attributes.src.nodeValue
          d.getElementsByTagName("body")[0].appendChild(script)
        } (document))
      }
    }
  }).then(() => {
    return new Promise((resolve) => {
      // Pause a little bit with the cover in front
      setTimeout(() => { onpagein() }, 500)

      // The cover is out of the way now, move on to resetting the cover for next run
      setTimeout(() => { resolve() }, 1250)
    })
  }).then(() => {
    return new Promise((resolve) => {
      // Hide cover as it resets
      document.getElementById("transition__cover").style.visibility = "hidden"

      resetTransition()

      // Once the transition has made it back to the other side, reset the visibility
      setTimeout(() => {
        document.getElementById("transition__cover").style.visibility = "visible"

        // Setting up for next page transition
        transitioning = false
        currentPage = displayedLocation

        resolve()
      }, 750)
    })
  }).catch((reason) => {
    console.log(`Uh oh... getContent promise errored out because "${reason}"`)
  })
}

function onpageout() {
  document.getElementById("transition__cover").style.transform = "translateX(0%)"
}

function onpagein() {
  document.getElementById("transition__cover").style.transform = "translateX(100%)"
}

function resetTransition() {
  document.getElementById("transition__cover").style.transform = "translateX(-100%)"
}