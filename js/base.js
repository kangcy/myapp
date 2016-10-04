var base = new function() {
	/**
	 * 是否测试
	 **/
	this.IsTest = mui.os.plus ? false : true;

	/**
	 * 列表每次请求数
	 **/
	this.PageSize = 10;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 300;

	/**
	 * 接口请求根路径
	 **/
	this.RootUrl = "http://139.224.51.196/app/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/60x60.gif";

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

		if(base.IsTest) {
			return {
				ID: 1,
				Sex: "男",
				Signature: "一个傻瓜一个傻瓜一个傻瓜一个傻瓜一个傻瓜一个傻瓜一个傻瓜一个傻瓜一个傻瓜",
				UserName: "18652913873",
				Password: "123456",
				Avatar: "../images/logo.png",
				NickName: "一个傻瓜",
				Address: "",
				Birthday: "",
				Follows: 0,
				Fans: 0,
				Articles: 0,
				Keeps: 0,
				Comments: 0,
				Zans: 0
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
	 * 跳转搜索页
	 **/
	this.ShowSearch = function(id) {
		document.getElementById('search').addEventListener('tap', function(event) {
			mui.openWindow({
				id: 'search',
				url: 'search.html',
				show: {
					autoShow: true,
					duration: base.AnimateDuration
				},
				waiting: {
					autoShow: false
				}
			});
		})
	}

	/**
	 * 展示用户信息
	 **/
	this.ShowUser = function(id) {
		mui(id).on('tap', '.user', function(event) {
			plus.nativeUI.showWaiting("跳转中...");
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
			plus.nativeUI.showWaiting("跳转中...");
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
		model.push('<img data-lazyload="' + item.Avatar + '" style="border-radius:50%;" /><div class="mui-media-body">' + item.NickName + '<p>' + item.CreateDate + '</p></div></div>');
		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');
		model.push('<p class="c333 fl article" articleid="' + item.ArticleID + '">' + item.Title + '</p>');

		//部分拼接
		var parts = item.ArticlePart;
		if(parts.length == 0) {
			model.push('<div class="onefloor"><img data-lazyload="' + item.Cover + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
		} else {
			model.push('<div class="secondfloor"><img data-lazyload="' + item.Cover + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			for(var i = 0; i < parts.length; i++) {
				model.push('<div class="secondfloor"><img data-lazyload="' + parts[i].Introduction + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			}
		}
		model.push('</div></div>');
		model.push('<div class="mui-card-footer fl full"><span style="border:1px solid #459df5;color:#459df5;border-radius:5px;padding:5px 10px;" class="f11">' + item.TypeName + '</span><span class="f11">' + item.Views + '次阅 · ' + item.Comments + '评论 · ' + item.Goods + '喜欢 · 41打赏</span></div>');
		div.innerHTML = model.join('');
		return div;
	}
}

/**
 * Get请求
 **/
function HttpGet(url, data, callback) {
	/*$.ajax({
		url: url,
		type: "GET",
		dataType: "jsonp",
		data: data,
		jsonp: 'jsoncallback',
		contentType: "application/json;utf-8", //返回Json类型 
		success: function(res) {
			callback(res)
		}
	});*/
	mui.getJSON(url, data, callback);
}

/**
 * Slider切换动态触发
 **/
function ChangeSlider(index) {
	mui('#slider').slider().gotoItem(index);
}