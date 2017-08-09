(function($) {

	/*$.fn.snow = function(options) {
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

	};*/

	$.fn.snow = new function() {
		var snowinterval = 0;

		//初始化
		this.init = function(options) {
			var documentHeight = window.innerHeight,
				documentWidth = window.innerWidth,
				defaults = {
					wrapper: "body",
					size: 1, //图片大小尺寸
					newOn: 1000, //
					src: "http://www.xiaoweipian.com/Images/Showy/01/01.png" //图片链接
				},
				options = $.extend({}, defaults, options);
			var $flake = $('<div />').css({
				'position': 'fixed',
				'top': -options.size * 2 + 'rem'
			}).html('<img src="' + options.src + '" style="width:100%;" />')
			snowinterval = setInterval(function() {
				var startPositionLeft = documentWidth * Math.random(),
					startOpacity = 0.5 + Math.random(),
					sizeFlake = (1 + Math.random()) * options.size,
					endPositionTop = documentHeight,
					endPositionLeft = documentWidth * Math.random(),
					durationFall = documentHeight * 10 + Math.random() * 8000;
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

})(jQuery);

/*$(function() {
	$.fn.snow({
		minSize: 5, //雪花的最小尺寸
		maxSize: 40, //雪花的最大尺寸
		newOn: 100 //雪花出现的频率 这个数值越小雪花越多
	});
});*/