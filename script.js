async function songFetch() {
    try {
        let a = await fetch("http://127.0.0.1:5500/songs");
        let response = await a.text();
        console.log(response);

        let div = document.createElement("div");
        div.innerHTML = response;

        let as = div.getElementsByTagName("a");
        let songsname = [];
        let songshref = [];

        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songsname.push(element.title.slice(0, -4));
                songshref.push(element.href);
            }
        }
        console.log(songshref);
        console.log(songsname);
        return { songshref, songsname };
    } catch (error) {
        console.error("Error fetching songs:", error);
        return { songshref: [], songsname: [] };
    }
}

async function listSongs() {
    try {
        let { songshref, songsname } = await songFetch();
        const songcards = document.querySelector(".songs");
        for (let i = 0; i < songsname.length; i++) {
            let div = document.createElement("div");
            div.className = "song-select";
            let a = document.createElement("a");
            a.className = "song-anchor";
            div.innerText = songsname[i];
            a.style.color = "white";
            a.href = songshref[i];
            a.appendChild(div);
            songcards.appendChild(a);
        }
    } catch (error) {
        console.error("Error listing songs:", error);
    }
}
listSongs();

function secondsToMinutesSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}
function updatePlayTime() {
    const currentTimePercentage = (audioElement.currentTime / (audioElement.duration * 2.428)) * 100;
    document.querySelector(".seek .circle").style.left = currentTimePercentage + 31.5 + "%";
    document.querySelector(".currentPlayTime").innerText = `${secondsToMinutesSeconds(audioElement.currentTime)}`;
    document.querySelector(".totalPlayTime").innerText = `${secondsToMinutesSeconds(audioElement.duration)}`;
}
let shufflemode = false;
let audioElement = new Audio();
let playsong = null;
let songstack = [];
let repeatmode = 0;
let currentIndex;
let nextIndex;
let isplaying = false
let queueclickcount = 0;
let play_pause = document.querySelector(".play-pause");
let next = document.querySelector(".next");
let previous = document.querySelector(".previous");
let shuffle = document.querySelector(".shuffle");
let repeat = document.querySelector(".repeat");
let plusten = document.querySelector(".plus_ten");
let minusten = document.querySelector(".minus_ten");
let queue = document.querySelector(".queuebutton");
let volume = document.querySelector(".volume")
async function selectfromLibrary() {
    let { songshref, songsname } = await songFetch();
    const songcards = document.querySelector(".songs");

    songcards.addEventListener("click", async function (e) {
        e.preventDefault();

        play_pause.querySelector("img").src = "button imgs/pause.svg";

        playsong = e.target.closest(".song-anchor");

        let audioResponse = await fetch(playsong.href);
        audioElement.src = audioResponse.url;
        audioElement.play();

        audioElement.addEventListener("timeupdate", () => {
            updatePlayTime();
        });
        
        document.querySelector(".nowplaying-songname").innerText = songsname[songshref.indexOf(audioElement.src)];
        if (document.querySelector(".nowplaying-songname").innerText !== null) {
            document.querySelector(".songimg-container").style.background =
                "rgb(105,64,182)";
            document.querySelector(".songimg-container").style.background =
                "linear-gradient(90deg, rgba(105,64,182,1) 50%, rgba(52,163,169,1) 90%)";
            document.querySelector(".nowplaying-songimage").src =
                "button imgs/music.svg";
        } 
        audioElement.addEventListener("ended", (e) => {
            e.preventDefault();
            handleSongEnd(songshref, songsname)
            audioElement.removeEventListener("click", newclick);
            audioElement.addEventListener("click", newclick);
        });
        handleMusicPlayerButtons(songshref , songsname)
    });
}
selectfromLibrary();
async function selectFromQueue() {
    let { songshref, songsname } = await songFetch();
    const songcards = document.querySelector(".comingup-nextsong-Container");
    console.log("songcards is : ",songcards)
    songcards.addEventListener("click", async function (e) {
        console.log("song from queue clicked")
        e.preventDefault();

        play_pause.querySelector("img").src = "button imgs/pause.svg";

        playsong = e.target.closest(".nextsong-anchor");
        console.log("playsong is :" , playsong)

        let audioResponse = await fetch(playsong.href);
        audioElement.src = audioResponse.url;
        updateQueue(songshref , songsname , currentIndex + 1)
        audioElement.play();

        audioElement.addEventListener("timeupdate", () => {
            updatePlayTime();
        });
        document.querySelector(".nowplaying-songname").innerText = songsname[songshref.indexOf(audioElement.src)];
        if (document.querySelector(".nowplaying-songname").innerText !== null) {
            document.querySelector(".songimg-container").style.background =
                "rgb(105,64,182)";
            document.querySelector(".songimg-container").style.background =
                "linear-gradient(90deg, rgba(105,64,182,1) 50%, rgba(52,163,169,1) 90%)";
            document.querySelector(".nowplaying-songimage").src =
                "button imgs/music.svg";
        }
        audioElement.addEventListener("ended", (e) => {
            e.preventDefault();
            handleSongEnd(songshref, songsname)
            audioElement.removeEventListener("click", newclick);
            audioElement.addEventListener("click", newclick);
        });
        handleMusicPlayerButtons(songshref , songsname)
    });
}
selectFromQueue()
async function updateQueue(songshref , songsname , currentIndex ){
    document.querySelector(".nowPlayingSong").innerHTML = ""
    let a1 = document.createElement("a");
    a1.className = "currentsong-anchor";
    a1.style.color = "white";
    let div1 = document.createElement("div");
    div1.className = "currentsongcontainer";
    console.log(audioElement.src)
    currentIndex = songshref.indexOf(audioElement.src)
    div1.innerHTML = songsname[currentIndex];
    a1.href = songshref[currentIndex]
    a1.appendChild(div1);
    document.querySelector(".nowPlayingSong").appendChild(a1);
    // currentIndex += 1

    for (let i = currentIndex + 1; i < songsname.length; i++) {
        let div = document.createElement("div");
        div.className = "nextsongcontainer";
        let a = document.createElement("a");
        a.className = "nextsong-anchor";
        div.innerHTML = songsname[i];
        a.style.color = "white";
        a.href = songshref[i];
        a.appendChild(div);
        document.querySelector(".comingup-nextsong-Container").appendChild(a);
    }
}
function getRandomIndex(currentIndex, arrayLength) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * arrayLength);
    } while (randomIndex === currentIndex);
    return randomIndex;
}
function handleQueue(songshref, songsname) {
    if (queueclickcount % 2 !== 0) {

        document.querySelector(".container").style.gridTemplateColumns = "21% 54% 24%";
        document.querySelector(".queue").style.gridColumnStart = "3";
        document.querySelector(".queue").style.gridColumnEnd = "4";
        document.querySelector(".main").style.transition = "all 0.8s ease"
        document.querySelector(".queue").style.transition = "all 0.8s ease"
        document.querySelector(".music-player").style.gridColumnStart = "1";
        document.querySelector(".music-player").style.gridColumnEnd = "4";

    } else {
        document.querySelector(".container").style.gridTemplateColumns = "21% 79% 24%";
        document.querySelector(".queue").style.gridColumnStart = "3";
        document.querySelector(".queue").style.gridColumnEnd = "4";
        document.querySelector(".main").style.transition = "left 0.8s"
        document.querySelector(".queue").style.transition = "right 0.8s"
        document.querySelector(".music-player").style.gridColumnStart = "1";
        document.querySelector(".music-player").style.gridColumnEnd = "3";
        document.querySelector(".nowPlayingSong").innerHTML = ""
        document.querySelector(".comingup-nextsong-Container").innerHTML = ""
    }
    queueclickcount += 1
    updateQueue(songshref, songsname , currentIndex + 1)
}
function handleMusicPlayerButtons(songshref , songsname){
    play_pause.addEventListener("click", function newclick(e) {
            e.preventDefault();
            handlePlayPause()
            play_pause.removeEventListener("click", newclick);
            play_pause.addEventListener("click", newclick);
    });
    plusten.addEventListener("click", function newclick(e) {
        e.preventDefault();
        handleplusTen()
    });
    minusten.addEventListener("click", function newclick(e) {
        e.preventDefault();
        handleminusTen()
    });
    next.addEventListener("click", function newclick(e) {
        e.preventDefault();
        updateQueue(songshref , songsname , currentIndex + 1)
        handleNext(songshref, songsname)
        next.removeEventListener("click", newclick);
        next.addEventListener("click", newclick);
    });
    queue.addEventListener("click", (e) => {
                e.preventDefault()
                handleQueue(songshref, songsname)
    });
    previous.addEventListener("click", function newclick(e) {
                e.preventDefault();
                handlePrevious(songshref, songsname)
                previous.removeEventListener("click", newclick);
                previous.addEventListener("click", newclick);
    });
    shuffle.addEventListener("click", function newclick(e) {
        e.preventDefault();
        handleShuffle()
        shuffle.removeEventListener("click", newclick);
        shuffle.addEventListener("click", newclick);
    });
    repeat.addEventListener("click", function newclick(e) {
        e.preventDefault();
        handleRepeat()
        repeat.removeEventListener("click", newclick);
        repeat.addEventListener("click", newclick);
    });
    document.querySelector(".seekbar").addEventListener("click", (e) => {
            e.preventDefault()
            handleSeekbar(e)
    });
}
function handlePlayPause() {
    if (audioElement.paused) {
        audioElement.play();
        play_pause.querySelector("img").src = "button imgs/pause.svg";
    } else {
        audioElement.pause();
        play_pause.querySelector("img").src = "button imgs/play.svg";
    }
}
function handleplusTen() {
    if (audioElement.currentTime + 10 < audioElement.duration) {
        audioElement.currentTime += 10;
        updatePlayTime();
    } else {
        audioElement.currentTime = audioElement.duration - 1;
        updatePlayTime();
    }
}
function handleminusTen() {
    if (audioElement.currentTime - 10 > 0) {
        audioElement.currentTime -= 10;
        updatePlayTime();
    } else {
        audioElement.currentTime = 0;
    }

}
async function handleNext(songshref, songsname) {
    audioElement.pause();
    currentIndex = songshref.indexOf(audioElement.src);
    console.log(currentIndex);
    if (shufflemode) {
        currentIndex = getRandomIndex(currentIndex, songshref.length);
        console.log(currentIndex);
    } else if (repeatmode === 2) {
        nextIndex = currentIndex;
        console.log(nextIndex);
    } else {
        currentIndex = (currentIndex + 1) % songshref.length;
        console.log(nextIndex);
    }
    audioElement.src = songshref[currentIndex];
    songstack.push(audioElement.src);
    await audioElement.play();
    document.querySelector(".nowplaying-songname").innerText = songsname[currentIndex];
    // document.querySelector(".")
    await updateQueue(songshref, songsname , currentIndex + 1)
}
function handleSongEnd(songshref, songsname) {
    audioElement.pause();
    let currentIndex = songshref.indexOf(audioElement.src);
    console.log(currentIndex);
    if (shufflemode) {
        currentIndex = getRandomIndex(currentIndex, songshref.length);
        console.log(currentIndex);
    } else if (repeatmode === 2) {
        nextIndex = currentIndex;
        console.log(nextIndex);
    } else {
        currentIndex = (currentIndex + 1) % songshref.length;
        console.log(currentIndex);
    }
    audioElement.src = songshref[currentIndex];
    songstack.push(audioElement.src);
    audioElement.play();
    document.querySelector(".nowplaying-songname").innerText = songsname[currentIndex];
}
function handlePrevious(songshref, songsname) {
    audioElement.pause();
    currentIndex = songshref.indexOf(songstack.pop())
    let previousIndex = currentIndex - 1;
    audioElement.src = songshref[previousIndex];
    audioElement.play();
    document.querySelector(".nowplaying-songname").innerText =
        songsname[previousIndex];
}
function handleShuffle() {
    shufflemode = !shufflemode;
    shuffle.querySelector("img").style.filter = "invert(1)";
}
function handleRepeat() {
    if (repeatmode === 0) {
        repeatmode = 1;
        repeat.querySelector("img").style.filter = "invert(1)";
        repeat.querySelector("img").src = "button imgs/repeat.svg";
    } else if (repeatmode === 1) {
        repeatmode = 2;
        repeat.querySelector("img").src = "button imgs/repeat-one-01.svg";
    } else if (repeatmode === 2) {
        repeatmode = 0;
        repeat.querySelector("img").style.filter = "invert(1)";
        repeat.querySelector("img").src = "button imgs/repeat-off.svg";
    }
}
function handleSeekbar(e) {
    try {
        let seekbarWidth = document.querySelector(".seekbar").getBoundingClientRect().width;
        let percent = (e.offsetX / seekbarWidth * 2.428) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        audioElement.currentTime = (audioElement.duration / 2.428) * (percent / 100)
        updatePlayTime();
    } catch (error) {
        console.error('Error handling seekbar click:', error);
    }
}
function handleVolume() {
    let volumebutton = document.querySelector(".volumebutton")
    volumebutton.addEventListener("mouseenter", (e) => {
        e.preventDefault();
        let input = document.createElement("input");
        input.type = "range";
        input.min = 0;
        input.max = 100;
        input.step = 0.01;
        input.className = "volume-adjust";
        e.target.appendChild(input);

        input.addEventListener("input", () => {
            audioElement.volume = input.value / 100;
        });
        input.addEventListener("mouseleave", () => {
            volumebutton.removeChild(input);
        });
        e.target.addEventListener("mouseleave", () => {
            volumebutton.removeChild(input);
        });
        // Set the initial value of the input to the current volume
        input.value = audioElement.volume * 100;
    });
}

handleVolume()
function signuppressed(){
    let signup = document.querySelector(".signup")
    signup.addEventListener("click",(e)=>{
        toggleForm("signup-form")
    })
}
signuppressed()
function loginpressed(){
    let login = document.querySelector(".login")
    login.addEventListener("click",(e)=>{
        toggleForm("login-form")
    })
}
loginpressed()
function toggleForm(formId) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (formId === 'signup-form') {
        document.querySelector(".logincontainer").removeChild()
    } else {
        document.querySelector(".signupcontainer").removeChild()
    }
}
function submitpressed(){
    document.querySelector("#login-button").addEventListener("click" , (e)=>{
        e.preventDefault();
        document.querySelector(".loginsignup").style.display = "none"
        document.querySelector(".loginsignup h2").innerHTML = "Welcome Back! Choose Your Mood.."
    })
}

