/*(function($) {

	$.fn.snow = function(options) {
		var $flake = $('<div id="snowbox" />').css({
				'position': 'fixed',
				'top': '-50px'
			}).html('&#10052;'),
			}).html('<img src="http://www.xiaoweipian.com/Images/Showy/01/01.png" style="width:100%;" />'),
			documentHeight = $(document).height(),
			documentWidth = $(document).width(),
			defaults = {
				minSize: 10, //图片大小尺寸
				maxSize: 20, //图片最大尺寸
				newOn: 1000, //
				flakeColor: "#ff6900"
			},
			options = $.extend({}, defaults, options);

		var interval = setInterval(function() {
			var startPositionLeft = Math.random() * documentWidth,
				startOpacity = 0.5 + Math.random(),
				sizeFlake = options.minSize + Math.random() * options.maxSize,
				endPositionTop = documentHeight,
				endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
				durationFall = documentHeight * 10 + Math.random() * 5000;
			$flake.clone().appendTo('body').css({
				left: startPositionLeft,
				opacity: startOpacity,
				'font-size': sizeFlake,
				color: options.flakeColor
			}).animate({
				top: endPositionTop,
				left: endPositionLeft,
				opacity: 0.2
			}, durationFall, 'linear', function() {
				$(this).remove()
			});

		}, options.newOn);

	};

	$.fn.snow = new function() {
		var snowinterval = 0;

		//初始化
		this.init = function(options) {
			var documentHeight = window.innerHeight,
				documentWidth = window.innerWidth,
				defaults = {
					wrapper: "body",
					size: 1,
					newOn: 1200,
					src: "http://www.xiaoweipian.com/Images/Showy/01/01.png" //图片链接
				},
				options = $.extend({}, defaults, options);
			var $flake = $('<div />').css({
				'position': 'fixed',
				'z-index': '999',
				'top': -options.size * 2 + 'rem'
			}).html('<img src="' + options.src + '" style="width:100%;" />')
			snowinterval = setInterval(function() {
				var startPositionLeft = documentWidth * Math.random(),
					startOpacity = 0.5 + Math.random(),
					sizeFlake = (1 + Math.random() / 2) * options.size,
					endPositionTop = documentHeight,
					endPositionLeft = Math.random() > 0.5 ? documentWidth * (Math.random() + 0.5) : documentWidth * (Math.random() - 0.5),
					durationFall = documentHeight * 10 + Math.random() * 10000;
				$flake.clone().appendTo(options.wrapper).css({
					left: startPositionLeft,
					width: sizeFlake + "rem"
				}).animate({
					top: endPositionTop,
					left: endPositionLeft,
				}, durationFall, 'linear', function() {
					$(this).remove()
				});
			}, options.newOn);
		}
		//清除
		this.clear = function(id) {
			clearInterval(snowinterval);
			$(id).empty();
		}
	};

})(jQuery);*/

/*$(function() {
	$.fn.snow({
		minSize: 5, //雪花的最小尺寸
		maxSize: 40, //雪花的最大尺寸
		newOn: 100 //雪花出现的频率 这个数值越小雪花越多
	});
});*/

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
		d.clearRect(0, 0, e, f);
		for(var a = 0; g > a; a++) {
			var c = h[a];
			d.drawImage(img, c.x, c.y, 20, 20);
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
		img = document.getElementById("snowimg");
		if(img == null) {
			img = document.createElement("img");
			img.classList.add("hide");
			img.setAttribute("src", src)
			img.setAttribute("id", "snowimg");
			document.body.appendChild(img);
		}
		c = document.getElementById(id);
		if(c) {
			d = c.getContext("2d")
			c.width = e, c.height = f;
			for(g = count, h = [], i = 0; g > i; i++) h.push({
				x: Math.random() * e,
				y: Math.random() * f,
				r: 4 * Math.random() + 1,
				d: Math.random() * g
			});
			snowinterval = setInterval(a, 30)
		}
	}

	//清除
	this.clear = function() {
		clearInterval(snowinterval);
		d.clearRect(0, 0, e, f);
	}
};