(function($) {

	$.fn.snow = function(options) {

		/*var $flake = $('<div id="snowbox" />').css({
				'position': 'fixed',
				'top': '-50px'
			}).html('&#10052;'),*/
		var $flake = $('<div id="snowbox" />').css({
				'position': 'fixed',
				'top': '-50px'
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
			var startPositionLeft = Math.random() * documentWidth - 100,
				startOpacity = 0.5 + Math.random(),
				sizeFlake = options.minSize + Math.random() * options.maxSize,
				endPositionTop = documentHeight,
				endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
				durationFall = documentHeight * 10 + Math.random() * 5000;
			$flake.clone().appendTo('body').css({
				left: startPositionLeft,
				opacity: startOpacity,
				//'font-size': sizeFlake,
				width: sizeFlake + "px",
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

})(jQuery);

/*$(function() {
	$.fn.snow({
		minSize: 5, //雪花的最小尺寸
		maxSize: 40, //雪花的最大尺寸
		newOn: 100 //雪花出现的频率 这个数值越小雪花越多
	});
});*/