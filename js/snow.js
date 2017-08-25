var snow = new function() {
	var snowinterval = 0,
		c = null,
		d = null,
		img = null,
		e = window.innerWidth,
		f = window.innerHeight,
		g = 0,
		j = 0;

	function a() {
		for(var a = 0; g > a; a++) {
			var c = h[a];
			c.img.style.left = c.x;
			c.img.style.top = c.y;
		}
		b()
	}

	function b() {
		j += .01;
		for(var a = 0; g > a; a++) {
			var b = h[a];
			b.y += Math.cos(j + b.d) + 1 + b.r / 2, b.x += 2 * Math.sin(j), (b.x > e + 5 || b.x < -5 || b.y > f) && (a % 3 > 0 ? h[a] = {
				x: Math.random() * e,
				y: -10,
				r: b.r,
				d: b.d
			} : Math.sin(j) > 0 ? h[a] = {
				x: -5,
				y: Math.random() * f,
				r: b.r,
				d: b.d
			} : h[a] = {
				x: e + 5,
				y: Math.random() * f,
				r: b.r,
				d: b.d
			})
		}
	}

	this.init = function(id, count, src) {
		img = new Image();
		img.src = src;
		img.style.width = "25px";
		img.onload = function() {
			c = document.getElementById(id);
			if(c) {
				c.width = e, c.height = f;
				for(g = count, h = [], i = 0; g > i; i++) {
					h.push({
						x: Math.random() * e,
						y: Math.random() * f,
						r: 4 * Math.random() + 1,
						d: Math.random() * g,
						img: img
					});
				}
				snowinterval = setInterval(a, 33)
			}
		}
	}

	//清除
	this.clear = function() {
		clearInterval(snowinterval);
		d.clearRect(0, 0, e, f);
	}
};