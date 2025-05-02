const video = document.querySelector("#custom-video-player");
const playPauseBtn = document.querySelector("#play-pause-btn");
const playPauseImg = document.querySelector("#play-pause-img");
const progress = document.querySelector('.video-progress')
const progressBar = document.querySelector("#progress-bar-fill");
const volume = document.querySelector('.#volume')
const currentTimeElement = document.querySelector('.current')
const durationTimeElement = document.querySelector('.duration')



video.addEventListener('timeupdate', currentTime)

video.removeAttribute("controls");
// playPauseBtn.addEventListener("click", togglePlayPause);
video.addEventListener("timeupdate", updateProgressBar);
function togglePlayPause() {
  if (video.paused || video.ended) {
    video.play();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/pause--v1.png";
  } else {
    video.pause();
    playPauseImg.src = "https://img.icons8.com/ios-glyphs/30/play--v1.png";
  }
}
function updateProgressBar() {
  const value = (video.currentTime / video.duration) * 100;
  progressBar.style.width = value + "%";
}
// Add other functionalities here

volume.addEventListener('mousemove', (e)=> {
    video.volume = e.target.value
    })


    //current time and duration
const currentTime = () => {
    let currentMinutes = Math.floor(video.currentTime / 60)
    let currentSeconds = Math.floor(video.currentTime- currentMinutes * 60)
    let durationMinutes = Math.floor(video.duration / 60)
    let durationSeconds = Math.floor(video.duration - durationMinutes * 60)

    currentTimeElement.innerHTML = `${currentMinutes}:${currentSeconds < 10 ? '0' + currentSeconds : currentSeconds}`
    durationTimeElement.innerHTML = `${durationMinutes}:${durationSeconds}`
}

video.addEventListener('timeupdate', currentTime)


//Progess bar
video.addEventListener('timeupdate', () =>{
    const percentage = (video.currentTime / video.duration) * 100
    progressbar.style.width = `&{percentage}%`
})

//change progress bar Through Nav
progress.addEventListener('click', (e) =>{
    const progressTime = (e.offsetx / progress.offsetWidth) * video.duration
    video.currentTime = progressTime
})