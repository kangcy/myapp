var audio = null;
var timestamp = 0;
/*var music_url = "http://static2.ivwen.com/music/DouNiuShiJinXingQu.m4a";*/

function switchsound() {
	if(audio == null) {
		audio = document.createElement('audio');
		audio.id = 'bgsound';
		audio.loop = 'loop';
		audio.innerHTML = '<source src="' + MusicUrl + '" type="audio/mpeg">'
		document.body.appendChild(audio);
	}

	if(audio.paused) {
		audio.play();
		base.Get(MusicID).setAttribute("play", "stop");
	} else if(new Date().getTime() > timestamp + 1000) {
		audio.pause();
		base.Get(MusicID).setAttribute("play", "on");
	}
}

function stopsound() {
	if(audio != null) {
		audio.pause();
	}
	base.Get(MusicID).setAttribute("play", "on");
}

function startsound() {
	document.removeEventListener('touchstart', startsound);
	if(audio == null) {
		audio = document.createElement('audio');
		audio.id = 'bgsound';
		//audio.src = MusicUrl;
		audio.loop = 'loop';
		audio.innerHTML = '<source src="' + MusicUrl + '" type="audio/mpeg">'
		document.body.appendChild(audio);
	}
	audio.play();
	base.Get(MusicID).setAttribute('play', 'stop');
	timestamp = new Date().getTime();
}