class AudioController
{
	constructor(playPauseButton, volumeButton, muteButton, timeDisplayer, progressBar, volumeBar, volumeDiv, audio)
	{
		this.playPauseButton = playPauseButton;
		this.volumeButton = volumeButton;
		this.muteButton = muteButton;
		this.timeDisplayer = timeDisplayer;
		this.progressBar = progressBar;
		this.volumeBar = volumeBar;
		this.volumeDiv = volumeDiv;
		this.audio = audio;

		/*this.playPauseButton.style.setProperty("height", "40px");
		this.playPauseButton.style.setProperty("width", this.playPauseButton.clientHeight + "px");
		this.playPauseButton.style.setProperty("border-radius", this.playPauseButton.clientHeight / 2 + "px");*/
		this.playPauseButton.style.setProperty("height", this.playPauseButton.clientWidth + "px");
		this.playPauseButton.style.setProperty("border-radius", this.playPauseButton.clientWidth / 2 + "px");
		this.canvas = this.playPauseButton.querySelector("canvas");
		this.canvas.height = this.playPauseButton.clientHeight / 2;
		this.canvas.width = this.canvas.height * 7 / 8;
		this.canvas.style.setProperty("padding-left", this.canvas.height / 5 + "px");
		drawPlay(this.canvas);
		this.hideElement(this.muteButton);
	}

	switchPlayPause()
	{
		if (this.playPauseButton.title === "Play")
		{
			this.stopOtherAudios();
			this.audio.play();
		}
		else
		{
			this.audio.pause();
		}
	}

	switchPlayPauseButton()
	{
		if (this.playPauseButton.title === "Play")
		{
			this.playPauseButton.title = "Pause";
			this.canvas.style.setProperty("padding-left", 0);
			this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
			drawPause(this.canvas);
		}
		else
		{
			this.playPauseButton.title = "Play";
			this.canvas.style.setProperty("padding-left", this.canvas.height / 5 + "px");
			this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
			drawPlay(this.canvas);
		}
	}

	stop()
	{
		this.audio.pause();
		this.audio.currentTime = 0;
		this.progressBar.value = 0;	
	}

	stopOtherAudios()
	{
		for (let audioController of audioControllers) 
		{
			if (audioController == this || audioController.audio.currentTime == 0) continue;
			else audioController.stop();
		}
	}

	mute()
	{
		this.audio.muted = true;
		this.switchButtons(this.volumeButton, this.muteButton);
	}

	unMute()
	{
		this.audio.muted = false;
		this.switchButtons(this.muteButton, this.volumeButton);
	}

	showElement(el)
	{
		el.removeAttribute('hidden');
	}

	hideElement(el)
	{
		el.setAttributeNode(document.createAttribute('hidden'));
	}

	switchButtons(button1, button2)
	{
		this.hideElement(button1);
		this.showElement(button2);
	}

	adaptTimeToDisplay(time)
	{
		return parseInt(time / 60) + (parseInt(time % 60) < 10 ? ":0" : ":") + parseInt(time % 60);
	}

	updateTimeDisplayer()
	{
		return this.adaptTimeToDisplay(this.audio.currentTime) + " / " + this.adaptTimeToDisplay(this.audio.duration);
	}

	updateProgress()
	{
		this.progressBar.value = this.audio.currentTime;
		this.timeDisplayer.textContent = this.updateTimeDisplayer();
	}

	updateAudioDuration()
	{
		this.progressBar.setAttribute('max', this.audio.duration);
		this.timeDisplayer.textContent = this.updateTimeDisplayer();
	}

	updateAudioCurrentTime()
	{
		this.audio.currentTime = this.progressBar.value;
	}

	updateAudioVolume()
	{
		this.audio.volume = this.volumeBar.value;
		if (this.audio.muted)
			this.unMute();
	}

	displayAudioVolume() {
		this.volumeBar.classList.toggle("volume-bar--displayed");
		this.progressBar.classList.toggle("progress-bar--shortened");
	}

	hideAudioVolume() {
		this.volumeBar.classList.toggle("volume-bar--displayed");
		this.progressBar.classList.toggle("progress-bar--shortened");
	}
}

function drawPlay(canvas)
{
	const context = canvas.getContext("2d");
	
	context.beginPath();
	context.moveTo(0, 0);
	context.lineTo(canvas.width, canvas.height / 2);
	context.lineTo(0, canvas.height);
	context.closePath();
	context.fill();
}

function drawPause(canvas)
{
	const context = canvas.getContext("2d");

	context.beginPath();
	context.moveTo(0, 0);
	context.lineTo(canvas.width * 2 / 5, 0);
	context.lineTo(canvas.width * 2 / 5, canvas.height);
	context.lineTo(0, canvas.height);
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(canvas.width - canvas.width * 2 / 5, 0);
	context.lineTo(canvas.width, 0);
	context.lineTo(canvas.width, canvas.height);
	context.lineTo(canvas.width - canvas.width * 2 / 5, canvas.height);
	context.closePath();
	context.fill();
}

const tracks = document.querySelectorAll(".track");
const audioControllers = [];

for (let track of tracks)
{
	audioControllers.push(new AudioController(
		track.querySelector(".btn-play-pause"),
		track.querySelector('.volumeButton'), 
		track.querySelector('.muteButton'), 
		track.querySelector(".time-displayer"),
		track.querySelector(".progress-bar"),
		track.querySelector(".volume-bar"),
		track.querySelector(".volume"),
		track.querySelector("audio")
	));
}

for (let aC of audioControllers)
{
	aC.playPauseButton.addEventListener("click", function(){aC.switchPlayPause();});
	aC.volumeButton.addEventListener('click', function(){aC.mute();});
	aC.muteButton.addEventListener('click', function(){aC.unMute();});
	aC.progressBar.addEventListener('mousedown', function(){aC.audio.pause();});
	aC.progressBar.addEventListener('input', function(){aC.updateAudioCurrentTime();});
	aC.progressBar.addEventListener('mouseup', function(){aC.audio.play();aC.stopOtherAudios();});
	aC.volumeBar.addEventListener('input', function(){aC.updateAudioVolume();});
	aC.volumeDiv.addEventListener('mouseover', function(){aC.displayAudioVolume();});
	aC.volumeDiv.addEventListener('mouseout', function(){aC.hideAudioVolume();});
	aC.audio.addEventListener('timeupdate', function(){aC.updateProgress();});
	aC.audio.addEventListener('canplay', function(){aC.updateAudioDuration();});
	aC.audio.addEventListener("play", function(){aC.switchPlayPauseButton();});
	aC.audio.addEventListener("pause", function(){aC.switchPlayPauseButton();});
}