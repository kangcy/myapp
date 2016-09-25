var base = new function() {
	/**
	 * 是否测试
	 **/
	this.IsTest = false;

	/**
	 * 列表每次请求数
	 **/
	this.PageSize = 10;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 300;

	/**
	 * 获取接口请求根路径
	 **/
	this.RootUrl = "http://139.224.51.196/app/";

	/**
	 * 获取当前用户ID
	 **/
	this.GetUserID = function() {
		return 2;
	}

	/**
	 * 获取当前用户信息
	 **/
	this.GetUserInfo = function() {
		var settingsText = localStorage.getItem('$userinfo') || "{}";

		if(base.IsTest && settingsText == "{}") {
			return {
				ID: 1,
				UserName: 18652913873,
				Password: 123456,
				NickName: "一个傻瓜",
				Avatar: "",
				NickName: "",
				Address: "",
				Birthday: ""
			}
		}
		return JSON.parse(settingsText);
	}

	/**
	 * 设置应用本地配置
	 **/
	this.GetSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 校验字符串是否为空
	 **/
	this.IsNullOrEmpty = function(str) {
		if(str == null || str == undefined || str == "") {
			return true;
		}
		return false;
	}

	/**
	 * 产生一个随机数
	 **/
	this.GetUid = function() {
		return new Date().getTime().toString();
	}

	/**
	 * 监听标题滑动切换
	 **/
	this.InitSlider = function() {
		document.getElementById('slider').addEventListener('slide', function(e) {
			var topicPage = plus.webview.currentWebview().parent();
			mui.fire(topicPage, "updateCurr", {
				index: e.detail.slideNumber
			});
		});
	}

	/**
	 * 初始化滚动条
	 **/
	this.InitScroll = function() {
		var deceleration = mui.os.ios ? 0.003 : 0.0009; // 阻尼系数
		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: false, // 是否显示滚动条
			deceleration: deceleration
		});
	}

	/**
	 * 展示用户信息
	 **/
	this.ShowUser = function(id) {
		mui(id).on('tap', '.user', function(event) {
			var userId = this.getAttribute("userid");
			mui.openWindow({
				id: 'user',
				url: 'user.html',
				show: {
					autoShow: true,
					duration: base.AnimateDuration
				},
				waiting: {
					autoShow: false
				},
				extras: {
					UserID: userId
				}
			});
		});
	}

	/**
	 * 展示文章信息
	 **/
	this.ShowArticle = function(id) {
		mui(id).on('tap', '.article', function(event) {
			var articleId = this.getAttribute("articleid");
			mui.openWindow({
				id: 'articledetail',
				url: 'articledetail.html',
				show: {
					autoShow: true,
					duration: base.AnimateDuration
				},
				waiting: {
					autoShow: false
				},
				extras: {
					ArticleID: articleId
				}
			});
		});
	}

	/**
	 * 拼接文章Html
	 */
	this.AppendArticle = function(item) {
		var div = document.createElement('div');
		div.className = 'mui-card';
		var model = [];
		model.push('<div class="mui-card-header mui-card-media user" userid="' + item.UserID + '">');
		model.push('<img src="' + item.Avatar + '" /><div class="mui-media-body">' + item.NickName + '<p>' + item.CreateDate + '</p></div></div>');
		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');
		model.push('<p class="c333 fl article" articleid="' + item.ArticleID + '">' + item.Title + '</p>');
		var num = parseInt(Math.random() * 4);
		if(num == 1) {
			model.push('<div class="onefloor"><img src="http://www.dcloud.io/hellomui/images/' + parseInt(Math.random() * 5 + 1) + '.jpg?version=' + Math.random() * 1000 + '" data-preview-src="" data-preview-group="' + item.ID + '" /></div>');
		}
		if(num > 1) {
			for(var j = 1; j <= num; j++) {
				model.push('<div class="secondfloor"><img src="http://www.dcloud.io/hellomui/images/' + parseInt(Math.random() * 5 + 1) + '.jpg?version=' + Math.random() * 1000 + '" data-preview-src="" data-preview-group="' + item.ID + '" /></div>');
			}
		}
		model.push('</div></div>');
		model.push('<div class="mui-card-footer fl full"><a class="mui-card-link">Like</a><a class="mui-card-link">Read more</a></div>');
		div.innerHTML = model.join('');
		return div;
	}
}

/**
 * Get请求
 **/
function HttpGet(url, data, callback) {
	$.ajax({
		url: url,
		type: "GET",
		dataType: "jsonp",
		data: data,
		jsonp: 'jsoncallback',
		contentType: "application/json;utf-8", //返回Json类型 
		success: function(res) {
			callback(res)
		}
	});
}

/**
 * Slider切换动态触发
 **/
function ChangeSlider(index) {
	mui('#slider').slider().gotoItem(index);
}