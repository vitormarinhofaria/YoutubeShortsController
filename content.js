/** @type {string} */
let lastVideoSrc = ""
/** @type {HTMLDivElement | null} */
let controlsContainer = null

let currentPlaybackRate = 1
const playbackRateDict = { 0.5: 0, 1.0: 1, 1.5: 2, 2.0: 3 }

function setForCurrentVideo() {
    if (controlsContainer !== null) {
        controlsContainer.remove()
    }

    /** @type {HTMLVideoElement | null} */
    let videoElement = document.querySelector("#shorts-player > div.html5-video-container > video")

    console.log(videoElement)
    if (videoElement === null) {
        return false
    }
    if (lastVideoSrc === videoElement.src) {
        return false
    }

    lastVideoSrc = videoElement.src

    videoElement.playbackRate = currentPlaybackRate

    controlsContainer = document.createElement("div")
    controlsContainer.style.position = "absolute"
    controlsContainer.style.top = "50%"
    controlsContainer.style.left = "20%"

    let pauseButton = document.createElement("button")
    pauseButton.innerText = "Pause"
    pauseButton.addEventListener("click", () => {
        if (videoElement.paused) {
            videoElement.play()
            pauseButton.innerText = "Pause"
        } else {
            videoElement.pause()
            pauseButton.innerText = "Play"
        }
    })

    /** @type {HTMLSelectElement} */
    let dropDownMenu = document.createElement("select")
    dropDownMenu.name = "speed-selector"
    dropDownMenu.style.display = "flex"
    dropDownMenu.style.flexDirection = "column"

    Object.entries(playbackRateDict).sort().forEach(([rate, ind]) => {
        createSpeedOption(Number.parseFloat(rate), dropDownMenu)
    })

    dropDownMenu.selectedIndex = playbackRateDict[currentPlaybackRate]

    dropDownMenu.addEventListener("change", (e) => {
        currentPlaybackRate = dropDownMenu.selectedOptions.item(0).value
        videoElement.playbackRate = currentPlaybackRate
    })
    let progressCountSec = document.createElement("p")
    let progressSlider = document.createElement("input")
    progressSlider.style.width = "25rem"
    progressSlider.step = 1
    progressSlider.type = "range"
    progressSlider.min = 0
    progressSlider.max = videoElement.duration

    progressSlider.addEventListener("input", (e) => videoElement.currentTime = progressSlider.value)
    videoElement.addEventListener("timeupdate", (e) => { progressSlider.value = videoElement.currentTime; progressCountSec.innerText = videoElement.currentTime })

    controlsContainer.appendChild(pauseButton)
    controlsContainer.appendChild(dropDownMenu)
    controlsContainer.appendChild(progressSlider)
    controlsContainer.appendChild(progressCountSec)

    docBody.append(controlsContainer)
    return true
}

function createSpeedOption(value, parent) {
    let option = document.createElement("option")
    option.value = value
    option.text = value
    parent.appendChild(option)
    return option
}

function onUrlChanged() {
    setTimeout(() => {
        if (!setForCurrentVideo()) {
            onUrlChanged()
        }
    }, 500)
}

//starts here
window.addEventListener("load", main)
let docBody = undefined
function main() {
    docBody = document.querySelector("body")
    let oldHref = ""
    let observer = new MutationObserver((mutations) => {
        if (window.location.href.search("/shorts/") === -1) {
            controlsContainer.remove()
            return
        }
        if (window.location.href != oldHref) {
            oldHref = window.location.href
            lastVideoSrc = ""
            window.dispatchEvent(new Event('locationchanged'))
        }
    })

    observer.observe(docBody, {
        childList: true,
        subtree: true
    })
    window.addEventListener("locationchanged", onUrlChanged)
}