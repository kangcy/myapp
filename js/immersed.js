(function(w) {

	document.addEventListener('plusready', function() {
		console.log("Immersed-UserAgent: " + navigator.userAgent);
	}, false);

	var immersed = 0;
	var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(ms && ms.length >= 3) {
		immersed = parseFloat(ms[2]);
	}
	//w.immersed = immersed;

	if(!immersed) {
		return;
	}
	var t = document.getElementById('header');
	if(t) {
		t.style.paddingTop = immersed + 'px';
		t.style.paddingBottom = '45px';
		t.style.background = '-webkit-linear-gradient(top,rgba(0,122,255,1),rgba(0,122,255,0.5))';
		t.style.color = '#FFF';
	}
	t = document.getElementById('scroll-wrapper');
	t && (t.style.marginTop = immersed + 'px');

})(window);