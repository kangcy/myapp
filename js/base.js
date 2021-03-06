(function(doc, win) {
	// 分辨率Resolution适配
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			var screenwidth = localStorage.getItem('$screenwidth');
			if(screenwidth) {
				clientWidth = screenwidth;
			}
			if(!clientWidth) return;
			docEl.style.fontSize = 16 * (clientWidth / 320) + 'px';
			docEl.style.width = '100%';
			docEl.style.height = '100%';
			//docEl.style.overflow = 'hidden';
		};

	if(!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);

	// 一物理像素在不同屏幕的显示效果不一样。要根据devicePixelRatio来修改meta标签的scale,要注释上面的meta标签
	(function() {
		return;
		var dpr = scale = 1;
		var isIPhone = win.navigator.appVersion.match(/iphone/gi);
		var devicePixelRatio = win.devicePixelRatio;
		if(isIPhone) {
			// iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
			if(devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
				dpr = 3;
			} else if(devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
				dpr = 2;
			} else {
				dpr = 1;
			}
		} else {
			// 其他设备下，仍旧使用1倍的方案
			dpr = 1;
		}
		scale = 1 / dpr;
		var metaEl = "";
		metaEl = doc.createElement('meta');
		metaEl.setAttribute('name', 'viewport');
		metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
		if(docEl.firstElementChild) {
			docEl.firstElementChild.appendChild(metaEl);
		} else {
			var wrap = doc.createElement('div');
			wrap.appendChild(metaEl);
			doc.write(wrap.innerHTML);
		}
	})();

})(document, window);

var waiting = new function() {
	//创建
	this.create = function(title) {
		var item = base.Get("waiting");
		if(item) {
			base.Get("waiting_title").innerHTML = title;
			return item;
		}
		var div = document.createElement('div');
		div.className = 'waiting c333 f13 tc';
		div.setAttribute("id", "waiting");
		div.style.zIndex = "2147483647";
		div.innerHTML = '<div><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg><span id="waiting_title">' + title + '</span></div>';
		document.getElementsByTagName("body")[0].appendChild(div);
		return div;
	}
	this.setTitle = function(title) {
		var item = this.create(title);
		base.Get("waiting_title").innerHTML = title;
	}
	this.show = function(title) {
		var item = this.create(title);
		item.classList.remove("hide");
	}
	this.close = function() {
		var item = this.create("");
		item.classList.add("hide");
	}
	this.isshow = function() {
		var item = document.getElementById("waiting");
		if(!item) {
			return false;
		}
		return item.className.indexOf("hide") < 0;
	}
}

//等待框
/*var waiting = new function() {
	//创建
	this.create = function(title) {
		var item = base.Get("waiting");
		if(item) {
			base.Get("waiting_title").innerHTML = title;
			return item;
		}
		var div = document.createElement('div');
		div.className = 'waiting c333 f13 tc';
		div.setAttribute("id", "waiting");
		div.style.zIndex = "2147483647";
		div.innerHTML = '<div><img src="../images/loading.gif" class="fl" /><span id="waiting_title">' + title + '</span></div>';
		document.getElementsByTagName("body")[0].appendChild(div);
		return div;
	}
	this.setTitle = function(title) {
		var item = this.create(title);
		base.Get("waiting_title").innerHTML = title;
	}
	this.show = function(title) {
		var item = this.create(title);
		item.classList.remove("hide");
	}
	this.close = function() {
		var item = this.create("");
		item.classList.add("hide");
	}
	this.isshow = function() {
		var item = document.getElementById("waiting");
		if(!item) {
			return false;
		}
		return item.className.indexOf("hide") < 0;
	}
}*/

//是否数组
var isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}

//浏览器类型
var browser = {
	versions: function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		return { //移动终端浏览器版本信息   
			trident: u.indexOf("Trident") > -1, //IE内核  
			presto: u.indexOf("Presto") > -1, //opera内核  
			webKit: u.indexOf("AppleWebKit") > -1, //苹果、谷歌内核  
			gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1, //火狐内核  
			mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端  
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端  
			android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1, //android终端或者uc浏览器  
			iPhone: u.indexOf("iPhone") > -1, //是否为iPhone或者QQHD浏览器  
			iPad: u.indexOf("iPad") > -1, //是否iPad  
			webApp: u.indexOf("Safari") == -1 //是否web应该程序，没有头部与底部  
		};
	}(),
	language: (navigator.browserLanguage || navigator.language).toLowerCase()
}

var base = new function() {

	/**
	 * 接口错误码
	 **/
	this.ErrorCode = {
		UnLogin: 1,
		Delete: 2,
		NoPower: 3
	}

	/**
	 * 触发层级(触发父元素事件)
	 **/
	this.TriggerMain = false;

	/**
	 * 初始化定位
	 **/
	this.InitPosition = function(callback1, callback2) {
		plus.geolocation.getCurrentPosition(function(p) {
			var position = {
				Province: p.address.province, //省份
				City: p.address.city, //城市
				District: p.address.district, //地区
				Street: p.address.street, //街道
				DetailName: p.address.poiName, //详细定位
				CityCode: p.address.cityCode, //城市编码
				Latitude: p.coords.latitude, //纬度
				Longitude: p.coords.longitude //经度
			}
			localStorage.setItem('$position', JSON.stringify(position));
			if(callback1) {
				callback1();
			}
		}, function(e) {
			localStorage.removeItem('$position');
			if(callback2) {
				callback2();
			}
		});
	};

	/**
	 * 系统定位
	 **/
	this.GetCurrentPosition = function() {
		var settingsText = localStorage.getItem('$position') || "";
		if(base.IsNullOrEmpty(settingsText)) {
			return {
				Province: "",
				City: "",
				District: "",
				Street: "",
				DetailName: "",
				CityCode: "",
				Latitude: "",
				Longitude: ""
			};
		}
		return JSON.parse(settingsText);
	}

	/**
	 * 优酷
	 **/
	this.youku_client_id = "59bec9b0be1fc34b";
	this.youku_client_secret = "244a6bbc4b212e01b8702745b879e52d";

	/**
	 * 是否正在加载
	 **/
	this.IsLoading = false;

	/**
	 * 当前动画标识
	 **/
	this.CurrAnimate = "";

	/**
	 * 列表每次请求数
	 **/
	this.PageSize = 15;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 350;

	/**
	 * 接口请求根路径
	 **/
	//this.RootUrl = "http://www.xiaoweipian.com/";
	this.RootUrl = "http://www.xiaoweipian.com:8080/";
	this.RootUrlTest = "http://www.xiaoweipian.com:8080/";
	this.UploadUrl = "http://www.xiaoweipian.com:1010/";

	/** 
	 * 默认图片
	 **/
	this.DefaultImg = "../images/logo_default.png";

	/**
	 * 默认头像
	 **/
	this.DefaultAvatar = "../images/avatar.png";

	// 预览图片集合
	this.PreviewImageList = []

	/**
	 * 显示等待、关闭等待
	 **/
	this.ShowLoading = function(show) {
		if(base.Get("loader")) {
			if(show)
				base.Get("loader").classList.remove("hide");
			else
				base.Get("loader").classList.add("hide");
		}
	}

	/**
	 * 显示列表空、关闭列表空
	 **/
	this.ShowNone = function(show) {
		if(show)
			base.Get("none").classList.remove("hide");
		else
			base.Get("none").classList.add("hide");
	}

	/**
	 * 获取当前用户信息
	 **/
	this.GetUserInfo = function() {
		var settingsText = localStorage.getItem('$userinfo') || "";
		if(settingsText == "") {
			return "";
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
	 * 判断用户是否登录
	 **/
	this.CheckLogin = function(userinfo, code) {
		if(userinfo == "" || code == base.ErrorCode.UnLogin) {
			base.IsLoading = false;
			base.OpenWindow("login", "../page/login.html", {}, "fade-in");
			return false;
		}
	}

	/**
	 * 校验字符串是否为空
	 **/
	this.IsNullOrEmpty = function(str) {
		if(!str) {
			return true;
		}
		if(str == "") {
			return true;
		}
		if(str.toString().toLowerCase() == "null") {
			return true;
		}
		if(str.toString().toLowerCase() == "undefined") {
			return true;
		}
		return false;
	}

	/**
	 * 格式化字符串显示
	 **/
	this.FormatStr = function(str, defaultStr) {
		return base.IsNullOrEmpty(str) || str == " " ? defaultStr : str
	}

	/**
	 * 产生一个随机数
	 **/
	this.GetUid = function() {
		return new Date().getTime().toString();
	}

	/**
	 * 手机号码校验
	 **/
	this.CheckPhone = function(phone) {
		if(base.IsNullOrEmpty(phone)) {
			return false;
		}
		return phone.length == 11 && !isNaN(phone) && (/^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/.test(phone));
	};

	/**
	 * 打开等待提示框 
	 **/
	this.ShowWaiting = function(title) {
		waiting.show(title);
	}

	/**
	 * 关闭等待提示框
	 **/
	this.CloseWaiting = function() {
		waiting.close();
	}

	/**
	 * 校验等待提示框
	 **/
	this.CheckWaiting = function() {
		var wait = waiting.isshow();
		if(wait) {
			return true;
		}
		var item = document.getElementById("mui-backdrop");
		if(!item) {
			return false;
		}
		return item.className.indexOf("hide") < 0;
	}

	//等待提示框
	this.Waiting = function(show, title) {
		if(show) {
			plus.nativeUI.showWaiting(title, {
				width: "80%",
				padding: "5%",
				background: "rgba(0,0,0,0.6)",
				loading: {
					display: "inline"
				}
			})
		} else {
			plus.nativeUI.closeWaiting();
		}
	}

	/**
	 * 创建弹出层
	 **/
	this.CreateMask = function(enable, callback) {
		var element = document.createElement('div');
		element.classList.add('mui-backdrop');
		element.setAttribute("id", "mui-backdrop");
		element.addEventListener(mui.EVENT_MOVE, mui.preventDefault);
		element.addEventListener('tap', function() {
			if(mask._enable) {
				mask.close();
			}
		});
		var mask = [element];
		mask._show = false;
		mask._enable = enable;
		mask.show = function() {
			mask._show = true;
			element.setAttribute('style', 'opacity:1');
			document.body.appendChild(element);
			return mask;
		};
		mask._remove = function() {
			if(mask._show) {
				mask._show = false;
				element.setAttribute('style', 'opacity:0');
				mui.later(function() {
					var body = document.body;
					element.parentNode === body && body.removeChild(element);
				}, 350);
			}
			return mask;
		};
		mask.close = function() {
			mask._remove();
			callback();
		};
		return mask;
	};

	/**
	 * 防止连续点击
	 */
	var Repeat_Action = null;
	this.RepeatAction = function() {
		if(Repeat_Action) {
			return true;
		}
		Repeat_Action = new Date().getTime();
		mui.later(function() {
			Repeat_Action = null;
		}, 1000);
		return false;
	}

	/**
	 * 窗体动画
	 **/
	this.ShowAnimate = function() {
		var show = "pop-in";
		//var show = "slide-in-right";
		if(mui.os.android) {
			if(parseFloat(mui.os.version) < 4.4) {
				show = "slide-in-right";
			}
		}
		return show;
	}

	/**
	 * 窗体动画
	 **/
	this.HideAnimate = function() {
		var show = "pop-out";
		//var show = "slide-in-right";
		if(mui.os.android) {
			if(parseFloat(mui.os.version) < 4.4) {
				show = "slide-out-right";
			}
		}
		return show;
	}

	/**
	 * 打开新页面
	 **/
	this.OpenWindow = function(id, url, data, aniShow, bounce, back, background) {
		if(base.RepeatAction()) {
			return;
		}
		var webview_style = {
			//hardwareAccelerated: true, //开启硬件加速
			//render: "always" // Webview在任何时候都渲染
			/*titleNView: {
				backgroundColor: '#20a0ff',
				titleText: '标题栏文字',
				titleColor: '#ffffff',
				autoBackButton: true,
				type: "transparent",
				progress: {
					color: '#999999'
				}
			},*/
			//background: "transparent",
			top: "0px",
			bottom: "0px",
			width: "100%",
			height: "100%",
			popGesture: "close",
			//zindex: 10000,
			bounce: bounce ? bounce : "none",
			scrollIndicator: "none", //显示滚动条
			backButtonAutoControl: back ? back : "none" //监听返回键
		}
		if(background) {
			webview_style.background = background;
		}
		mui.openWindow({
			id: id,
			url: url,
			show: {
				autoShow: true,
				duration: aniShow && aniShow == "none" ? 0 : base.AnimateDuration,
				aniShow: aniShow ? aniShow : base.ShowAnimate()
			},
			styles: webview_style,
			createNew: true,
			waiting: {
				autoShow: false
			},
			extras: data
		});
	}

	//5+ 预截原动画 打开webview
	this.OpenWindowNew = function(url, id, op, data) {
		var nw = plus.webview.create(url, id, op, data),
			bitmap = new plus.nativeObj.Bitmap('nwbitmap');

		console.log("aa");

		//开始原生动画
		var startAnimation = function(type, bitmap, callback) {
			console.log("aaaa");
			plus.nativeObj.View.startAnimation({
				type: type || 'pop-in' //默认
			}, {}, {
				bitmap: bitmap
			}, function() {
				console.log('动画结束');
				callback && callback();
				//关闭原生动画 
				//plus.nativeObj.View.clearAnimation();
			});
		}

		console.log("bb");

		//webview截图
		var drawWebView = function(webview, bitmap, callback) {
			bitmap = bitmap || new plus.nativeObj.Bitmap('defultBitMap');
			webview.draw(bitmap, function() {
				callback && callback(bitmap);
			}, function(err) {
				callback && callback();
				console.log('截图错误：' + JSON.stringify(err))
			});
		}

		console.log("cc");

		//webview onloaded事件
		nw.onloaded = function(e) {
			console.log("dd");
			//开始截图open
			drawWebView(nw, bitmap, function(bitmap) {
				console.log(bitmap)
				if(!bitmap) {
					nw.show('pop-in', 250);
					return;
				}
				//播放页面打开的动画
				startAnimation('pop-in', bitmap, function() {
					console.log("ee")
					//动画播放完毕后
					//显示webview
					nw.show('none', 0, function() {
						console.log("ff")
						//当webview关闭时
						nw.onclose = function() {
							//播放页面关闭动画
							startAnimation('pop-out', bitmap, function() {
								//关闭页面原生动画 
								plus.nativeObj.View.clearAnimation();
							});
						}
						//关闭页面原生动画 
						plus.nativeObj.View.clearAnimation();
					})
				});
			});
		}
	}

	/**
	 * 更新关注数
	 **/
	this.UpdateFan = function(userinfo, num) {
		if(num) {
			userinfo.Follows = num;
		} else {
			userinfo.Follows += 1;
		}
		localStorage.setItem('$userinfo', JSON.stringify(userinfo));
		base.RefreshUser();
	}

	/**
	 * 监听标题滑动切换
	 **/
	this.InitSlider = function(isbounce) {
		mui('.mui-slider').slider({
			bounce: isbounce
		});
		mui('.mui-scroll-wrapper.mui-slider-indicator.mui-segmented-control').scroll({
			scrollY: false,
			scrollX: true,
			indicators: false,
			bounce: false,
			snap: '.mui-control-item'
		});
	}

	/**
	 * 初始化滚动条
	 **/
	this.InitScroll = function(isbounce) {
		var deceleration = mui.os.ios ? 0.003 : 0.0009; // 阻尼系数
		mui('.mui-scroll-wrapper').scroll({
			bounce: isbounce ? isbounce : false,
			indicators: false, // 是否显示滚动条
			deceleration: deceleration
		});
	}

	/**
	 * 刷新滚动条
	 **/
	this.RefreshScroll = function() {
		mui(".mui-scroll-wrapper").scroll().refresh(); //刷新下拉
	}

	//双击顶部滚动到顶部
	this.ToTop = function() {
		base.Get("header").addEventListener("doubletap", function() {
			if(base.IsLoading) {
				return;
			}
			base.IsLoading = true;
			mui.scrollTo(0, 250);
			mui.later(function() {
				base.IsLoading = false;
			}, 250)
		}, false);
	}

	/**
	 * 更新用户信息
	 **/
	this.UpdateUser = function(id, callback) {
		HttpGet(base.RootUrl + "User/Info", {
			Number: id
		}, function(data) {
			if(data != null) {
				if(data.result) {
					data = data.message;
					var info = {
						ID: data.ID,
						Sex: data.Sex,
						Signature: data.Signature,
						Password: data.Password,
						Avatar: data.Avatar == "" ? base.DefaultImg : data.Avatar,
						NickName: data.NickName,
						Address: data.Address,
						Birthday: data.BirthdayText,
						Follows: data.Follows,
						Fans: data.Fans,
						Articles: data.Articles,
						Keeps: data.Keeps,
						Comments: data.Comments,
						Zans: data.Zans,
						Cover: data.Cover,
						Phone: data.Phone,
						WeiXin: data.WeiXin,
						QQ: data.QQ,
						Weibo: data.Weibo,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money,
						UseDraw: data.UseDraw,
						Number: data.Number,
						ShowZan: data.ShowZan,
						ShowKeep: data.ShowKeep,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan,
						ShowPush: data.ShowPush,
						ShowPosition: data.ShowPosition,
						UserRole: data.UserRole,
						CreateDate: data.CreateDateText,
						Star: data.Star,
						DrawText: data.DrawText,
						RelatedNumber: data.RelatedNumber
					}
					localStorage.setItem('$userinfo', JSON.stringify(info));

					if(callback) {
						callback(info);
					}
				}
			}
		});
	}

	/**
	 * 展示用户信息
	 **/
	this.ShowUser = function(id) {
		mui(id).on('tap', '.user', function(event) {
			if(base.TriggerMain) {
				return false;
			}
			base.TriggerMain = true;
			mui.later(function() {
				base.TriggerMain = false;
			}, 500);
			var userid = this.getAttribute("userid");
			var nickname = this.getAttribute("nickname");
			var cover = this.getAttribute("cover");
			var avatar = this.getAttribute("avatar");

			base.OpenWindow("user" + userid, "user.html", {
				UserNumber: userid,
				NickName: nickname,
				Cover: cover,
				Avatar: avatar
			}, "", "none");

			/*var pagename = "user" + userid;
			var view = base.GetView(pagename);
			if(view) {
				view.evalJS("ResetUser('" + pagename + "','" + userid + "','" + nickname + "','" + avatar + "','" + cover + "')");
			} else {
				base.OpenWindow(pagename, "user.html", {
					UserNumber: userid,
					NickName: nickname,
					Cover: cover,
					Avatar: avatar,
					PageName: pagename
				}, base.ShowAnimate(), false, 'none');
			}*/
		});
	}

	/**
	 * 展示文章信息
	 **/
	this.ShowArticle = function(id, Source, currUserNumber) {
		mui(id).on('tap', '.article', function(event) {
			if(base.TriggerMain) {
				return;
			}
			var articleId = this.getAttribute("articleid");
			var userNumber = this.getAttribute("userid");
			var power = this.getAttribute("power").toString();
			var nickname = this.getAttribute("nickname").toString();
			if(currUserNumber == userNumber) {
				power = 3;
			}
			base.OpenWindow("articledetail", "articledetail.html", {
				ArticleID: articleId,
				Source: Source,
				ArticlePower: power,
				NickName: nickname
			}, null, "none");
		});
	}

	/**
	 * 格式化缩略图显示
	 */
	this.ShowThumbBase = function(url, thumb) {
		if(base.IsNullOrEmpty(url)) {
			return base.DefaultAvatar;
		}
		if(url.indexOf('_0') < 0) {
			return url;
		}
		url = url.replace("_0", "_" + thumb);
		return url;
	}
	this.ShowThumb = function(url, thumb) {
		if(base.IsNullOrEmpty(url)) {
			return base.DefaultAvatar;
		}
		if(url.indexOf('_0') < 0) {
			return url;
		}
		url = url.replace("_0", "_" + thumb);
		if(url.toString().toLowerCase().indexOf("http://") < 0) {
			url = base.UploadUrl + url;
		}
		return url;
	}

	/**
	 * 分享日志
	 */
	this.ShareLog = function(usernumber, number, source, type) {
		HttpGet(base.RootUrl + "ShareLog/Edit", {
			UserNumber: usernumber,
			Number: number,
			Source: source,
			ShareType: type
		}, function(data) {

		});
	}

	/**
	 * 切换Switch
	 */
	this.SwitchChange = function(id, isopen) {
		base.ToggleClass(["#" + id], "active", isopen);
	}

	//btn：(1:关注,2:解除黑名单)
	this.AppendUser = function(item, isSignature, isDistance, isLazy, showAnimate, btn) {
		var div = document.createElement('div');
		if(showAnimate) {
			div.className = 'mui-table-view-cell user user1 bounceInUp';
		} else {
			div.className = 'mui-table-view-cell user user1';
		}
		div.setAttribute("userid", item.Number);
		div.setAttribute("nickname", item.NickName);
		div.setAttribute("cover", item.Cover);
		div.setAttribute("avatar", item.Avatar);
		var model = [];
		model.push('<div class="flex-box flex-row">');
		//头像
		model.push('<div style="flex:0 0 16%;" class="flex-item tl">');
		if(isLazy) {
			model.push('<div class="avatar"><img onload="StorageImg(this)" src="../images/avatar.png" data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" class="fl"  /></div>');
		} else {
			model.push('<div class="avatar"><img src="' + base.ShowThumb(item.Avatar, 1) + '" class="fl"  /></div>');
		}
		model.push('</div>');
		//昵称信息
		if(btn > 0)
			model.push('<div style="flex:0 0 64%;" class="flex-item tl">');
		else
			model.push('<div style="flex:0 0 84%;" class="flex-item">');
		model.push('<p class="f13 c333 mt3">' + base.UnUnicodeText(item.NickName) + '</p>');
		if(isSignature) {
			model.push('<p class="f10 mt3 c999">' + base.UnUnicodeText(item.Signature) + '</p>');
		}
		if(isDistance) {
			var distance = parseFloat(item.Distance);
			var meter = parseInt(distance / 100);
			if(meter < 9) {
				model.push('<p class="f10 mt3 c999">' + (meter + 1) + '00米以内</p>');
			} else {
				model.push('<p class="f10 mt3 c999">' + (parseInt(distance / 1000) + 1) + '公里以内</p>');
			}
		}
		model.push('</div>');
		//关注
		if(btn > 0) {
			model.push('<div style="flex:0 0 20%;" class="flex-item tr">');
			if(btn == 1) {
				if(item.IsFollow == 0 && userinfo.Number != item.Number) {
					model.push('<div class="guanzhu" userid="' + item.Number + '"><img src="../images/base/follow0.png" class="fr" /></div>');
				} else {
					model.push('<div class="guanzhu2" userid="' + item.Number + '"><img src="../images/base/follow1.png" class="fr" /></div>');
				}
			} else if(btn == 2) {
				model.push('<div class="blackrelease"><img src="../images/base/follow2.png" class="fr" style="width:3.8rem !important;" /></div>');
			}
			model.push('</div>');
		}
		model.push('</div>');
		div.innerHTML = model.join('');
		return div;
	}

	/**
	 * 用户列表关注操作
	 * id:容器ID
	 * userinfo:当前用户信息
	 */
	this.UserFan = function(id, userinfo) {
		base.UserAddFan(id, userinfo);
		base.UserOutFan(id, userinfo);
	}

	/**
	 * 用户列表添加关注
	 * id:容器ID
	 * userinfo:当前用户信息
	 */
	this.UserAddFan = function(id, userinfo) {
		mui(id).on('tap', '.guanzhu', function(event) {
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			base.TriggerMain = true;
			mui.later(function() {
				base.TriggerMain = false;
			}, 500);
			var $this = this;
			var UserNumber = this.getAttribute("userid");
			var data = {
				ID: userinfo.ID,
				ToUserNumber: UserNumber
			}
			HttpGet(base.RootUrl + "Api/Fan/Edit", data, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data != null) {
					if(data.result) {
						$this.classList.remove("guanzhu");
						$this.classList.add("guanzhu2");
						$this.childNodes[0].setAttribute("src", "../images/base/follow1.png");
						base.UpdateFan(userinfo, data.message);
					}
					mui.toast(data.result ? "关注成功,在[关注]中可以找到Ta哦!" : data.message);
				} else {
					mui.toast("失败");
				}
				base.IsLoading = false;
			});
		});
	}

	/**
	 * 用户列表取消关注
	 * id:容器ID
	 * userinfo:当前用户信息
	 */
	this.UserOutFan = function(id, userinfo) {
		mui(id).on('tap', '.guanzhu2', function(event) {
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			base.TriggerMain = true;
			mui.later(function() {
				base.TriggerMain = false;
			}, 500);
			var $this = this;
			var UserNumber = this.getAttribute("userid");
			HttpGet(base.RootUrl + "Api/Fan/Delete", {
				ID: userinfo.ID,
				ToUserNumber: UserNumber
			}, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data.result) {
					$this.classList.remove("guanzhu2");
					$this.classList.add("guanzhu");
					$this.childNodes[0].setAttribute("src", "../images/base/follow0.png");
					base.UpdateFan(userinfo, data.message);
				} else {
					mui.toast(data.message);
				}
				base.IsLoading = false;
			});
		});
	}

	/**
	 * js Unicode编码
	 */
	this.UnicodeText = function(str) {
		if(base.IsNullOrEmpty(str)) {
			return "";
		}
		return escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
	}

	/**
	 * js Unicode解码
	 */
	this.UnUnicodeText = function(str) {
		if(base.IsNullOrEmpty(str)) {
			return "";
		}
		return unescape(str.replace(/\\u/gi, '%u'));
	}

	/**
	 * 新增样式
	 * name:元素名称集合
	 * classname:样式名称集合
	 */
	this.AddClass = function(name, classname) {
		this.ToggleClass(name, classname, true);
	}

	/**
	 * 删除样式
	 * name:元素名称集合
	 * classname:样式名称集合
	 */
	this.RemoveClass = function(name, classname) {
		this.ToggleClass(name, classname, false);
	}

	/**
	 * 切换样式
	 * name:元素名称集合
	 * classname:样式名称集合
	 */
	this.ToggleClass = function(name, classnames, add) {
		if(base.IsNullOrEmpty(name)) {
			return;
		}
		var classname = classnames.split(' ');
		if(add) {
			mui.each(name, function(index1, n) {
				if(n.indexOf('.') < 0) {
					var item = mui(n)[0];
					mui.each(classname, function(index2, cn) {
						item.classList.add(cn);
					});
				} else {
					mui.each(classname, function(index2, cn) {
						mui(n).each(function(index3, item) {
							item.classList.add(cn);
						});
					});
				}
			});
		} else {
			mui.each(name, function(index1, n) {
				if(n.indexOf('.') < 0) {
					var item = mui(n)[0];
					mui.each(classname, function(index2, cn) {
						item.classList.remove(cn);
					});
				} else {
					mui.each(classname, function(index2, cn) {
						mui(n).each(function(index3, item) {
							item.classList.remove(cn);
						});
					});
				}
			});
		}
	}

	//是否包含样式
	this.HasClass = function(item, name) {
		return item.className.indexOf(name) >= 0;
	}

	//获取对象
	this.Get = function(name) {
		if(name.indexOf('.') < 0) {
			return mui("#" + name)[0];
		} else {
			return mui(name);
		}
	}

	//获取页面对象
	this.GetView = function(id) {
		return plus.webview.getWebviewById(id);
	}

	//刷新用户信息
	this.RefreshUser = function() {
		if(base.GetView("my") != null)
			base.GetView("my").evalJS("Refresh()");
	}

	/**
	 * 初始化下拉
	 * id：容器ID
	 * downCallback：下拉回调方法
	 * upCallback：上拉回调方法
	 */
	this.InitPull = function(id, downCallback, upCallback) {
		mui(base.Get(id)).pullToRefresh({
			down: {
				callback: function() {
					if(downCallback) {
						downCallback();
					}
					var self = this;
					pulldownRefresh(self);
				}
			},
			up: {
				auto: true,
				callback: function() {
					if(upCallback) {
						upCallback();
					}
					var self = this;
					pullupRefresh(self);
				}
			}
		});
	}

	//浏览器前缀
	this.BrowserName = function() {
		var name = "";
		if(browser.versions.webKit) {
			name = "-webkit-"; //谷歌内核
		} else if(browser.versions.gecko) {
			name = "-moz-"; //火狐内核
		} else if(browser.versions.presto) {
			name = "-o-"; //opera内核
		} else if(browser.versions.trident) {
			name = "-ms-"; //IE内核 
		}
		return name;
	}

	//沉浸式状态栏(蓝色)
	this.Immersed = function(effect) {
		var immersed = 0;
		var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
		if(ms && ms.length >= 3) {
			immersed = parseFloat(ms[2]);
		}
		if(!immersed) {
			return;
		}
		var t = document.getElementById('header');
		if(t) {
			t.style.paddingTop = immersed + 'px';
			t.style.paddingBottom = '45px';
			if(t.getAttribute("immersed") != "none") {
				t.style.background = '-webkit-linear-gradient(left,#4e8cfb 0%,#24c3fb 75%,#39b8fd 100%)';
				var name = base.BrowserName();
				t.style.background = name + 'linear-gradient(left,#4e8cfb 0%,#24c3fb 75%,#39b8fd 100%)';

				t = document.getElementById('scroll-wrapper');
				if(t) {
					t.style.marginTop = immersed + 'px';
				}
			} else {
				t.style.background = "transparent";
				t = document.getElementById('scroll-wrapper');
				if(t) {
					t.style.marginTop = '0px';
				}
			}
		}
		t = document.getElementById('muicontent');
		if(t) {
			t.style.paddingTop = immersed + 45 + 'px';
		}
	}

	//沉浸式状态栏(白色)
	this.Immersed_White = function(effect) {
		var immersed = 0;
		var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
		if(ms && ms.length >= 3) {
			immersed = parseFloat(ms[2]);
		}
		if(!immersed) {
			return;
		}
		var t = document.getElementById('header');
		if(t) {
			t.style.paddingTop = immersed + 'px';
			t.style.paddingBottom = '45px';
			if(t.getAttribute("immersed") != "none") {
				t.style.background = '#ffffff';
				t = document.getElementById('scroll-wrapper');
				if(t) {
					t.style.marginTop = immersed + 'px';
				}
			} else {
				t.style.background = "transparent";
				t = document.getElementById('scroll-wrapper');
				if(t) {
					t.style.marginTop = '0px';
				}
			}
		}
		t = document.getElementById('muicontent');
		if(t) {
			t.style.paddingTop = immersed + 45 + 'px';
		}
	}

	//打开模板页
	this.ShowTemplate = function(id, url, title, param, animate, top, isnew) {
		if(base.RepeatAction()) {
			return;
		}
		var name = isnew ? "template" + base.GetUid() : "template";
		var view = plus.webview.create("template.html", name, {
			top: "0px",
			bottom: "0px",
			scrollIndicator: "none",
		}, {
			subid: id,
			suburl: url,
			subtitle: title,
			subparam: param,
			subtop: top,
			subanimate: animate,
			isnew: isnew ? 1 : 0
		});
		//view.show(base.IsNullOrEmpty(animate) ? base.ShowAnimate() : animate, base.AnimateDuration);
	}

	//批量赋值
	this.Html = function(ids, html) {
		var model = null;
		mui.each(ids, function(index, item) {
			model = base.Get(item);
			if(model) {
				model.innerHTML = html;
			}
		});
	}

	//批量赋值
	this.Text = function(ids, html) {
		var model = null;
		mui.each(ids, function(index, item) {
			model = base.Get(item);
			if(model) {
				model.innerText = html;
			}
		});
	}

	//批量修改属性
	this.Attr = function(model, attrs) {
		mui.each(attrs, function(index, item) {
			model.setAttribute(item[0], item[1]);
		});
	}
}

/**
 * Get请求
 **/
function HttpGet(url, data, callback) {
	mui.getJSON(url, data, callback);
}

/**
 * Post请求
 **/
function HttpPost(url, data, callback) {
	mui.post(url, data, callback, 'json');
}

//样式切换
function ChangeSlider($this) {
	var item = $this.parentNode.children[0];
	item.style.width = $this.clientWidth + "px";
	item.style.transform = "translateX(" + $this.offsetLeft + "px)";
	base.RemoveClass([".tabs_item"], "is-active");
	$this.classList.add("is-active");
}

/**
 * 加载封装 
 * url：接口请求地址
 * data：接口请求参数
 * showNone：是否显示空提示
 * showNone：是否显示加载动画
 * appendCallback：拼接方法
 * endCallback：回调方法
 */
function LoadPull(id, url, data, showNone, showAnimate, appendCallback, endCallback) {
	HttpGet(url, data, function(data) {
		//console.log(JSON.stringify(data));
		var foo = "";
		data = JSON.parse(data);
		if(data != null) {
			if(data.result) {
				data = data.message;
				totalpage = data.totalpage;
				records = data.records;
				if(showNone) {
					base.ShowNone(false);
				}
				var id = base.IsNullOrEmpty(id) ? "scroll-view" : id;
				var table = base.Get(id);
				if(records > 0) {
					foo = data.list;
					if(showAnimate) {
						DelayEachArray(data.list, 0, 50, base.CurrAnimate, function(item) {
							var div = appendCallback(item);
							table.appendChild(div);
						})
					} else {
						//使用容器存放临时变更， 最后再一次性更新DOM
						/*var fragment = document.createDocumentFragment();
						mui.each(data.list, function(index, item) {
							fragment.appendChild(appendCallback(item));
						});
						table.appendChild(fragment);*/

						mui.each(data.list, function(index, item) {
							table.appendChild(appendCallback(item));
						});
					}
				}
			} else {
				totalpage = 1;
				records = 0;
			}
		}
		if(records == 0 && showNone) {
			base.ShowNone(true);
		}
		if(endCallback) {
			endCallback(foo);
		}
		base.ShowLoading(false);
	});
}

//arttemplate 读取列表
function LoadPull2(id, url, data, showNone, appendCallback, endCallback) {
	HttpGet(url, data, function(data) {
		var foo = "";
		data = JSON.parse(data);
		if(data != null) {
			if(data.result) {
				data = data.message;
				totalpage = data.totalpage;
				records = data.records;
				if(showNone) {
					base.ShowNone(false);
				}
				var id = base.IsNullOrEmpty(id) ? "scroll-view" : id;
				var table = base.Get(id);
				if(records > 0) {
					foo = data.list;
					table.appendChild(appendCallback(data.list));
				}
			} else {
				totalpage = 1;
				records = 0;
			}
		}
		if(records == 0 && showNone) {
			base.ShowNone(true);
		}
		if(endCallback) {
			endCallback(foo);
		}
		base.ShowLoading(false);
	});
}

/**
 * 动态加载JS 
 * url：JS地址
 * callback：回调方法
 */
function LoadScript(url, callback) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	if(typeof(callback) != "undefined") {
		if(script.readyState) {
			script.onreadystatechange = function() {
				if(script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					callback();
				}
			};
		} else {
			script.onload = function() {
				callback();
			};
		}
	}
	script.src = url;
	document.body.appendChild(script);
}

/**
 * 延迟遍历 
 * arr：集合
 * index：当前遍历索引
 * delay：延迟毫秒数
 * curranimate：当前动画标识
 * callback：回调方法
 */
function DelayEachArray(arr, index, delay, curranimate, callback) {
	if(index == 0) {
		base.CurrAnimate = curranimate;
	}
	if(curranimate != base.CurrAnimate) {
		return;
	}

	if(callback) {
		callback(arr[index]);
	}
	index++;
	if(index < arr.length) {
		mui.later(function() {
			DelayEachArray(arr, index, delay, curranimate, callback);
		}, delay);
	} else {
		base.CurrAnimate = "";
	}
}

//返回顶部
function Top() {
	mui.scrollTo(0, 250);
}

//下拉启用
function SetPullEnable(enable, offset, callback) {
	if(enable) {
		self.setPullToRefresh({
			support: true,
			height: "100px",
			offset: offset ? offset : (Math.round(plus.navigator.getStatusbarHeight()) + 45) + "px",
			style: "circle"
		}, function() {
			if(callback) {
				callback();
			} else {
				pulldownRefresh();
			}
		});
	} else {
		self.setPullToRefresh({
			support: false,
			style: "circle",
			height: "0px"
		}, function() {

		});
	}
}

//懒加载图片
function LazyImg(item) {
	item.removeAttribute("onload");
	var img = new Image();
	var src = item.getAttribute("data-lazyload");

	img.src = src;
	if(img.complete) {
		item.setAttribute("src", src);
	} else {
		img.onload = function() {
			item.setAttribute("src", src);
		};
	}
}

//图片预加载
function LazyCover(url, callback) {
	var img = new Image();
	img.src = url;
	if(img.complete) {
		callback.call(img);
		return;
	}
	img.onload = function() {
		callback.call(img);
	}
}

//缓存图片
function StorageImg(img) {
	//img.setAttribute("src", img.getAttribute("data-lazyload"));
	MobileFrame.init(img);
}

//推送类型
var PushType = {
	Comment: 1, //用户评论
	Money: 2, //用户打赏
	Fan: 3, //关注用户
	FanArticle: 4, //关注用户发布文章
	Article: 5, //系统文章推荐
	Red: 6, //红包
	Update: 10 //APP升级
}

//重置未读推送信息
function ClearPush(usernumber, pushtype) {
	HttpGet(base.RootUrl + "Push/Clear", {
		number: usernumber,
		pushtype: pushtype
	}, function(data) {
		if(data) {
			var tipsetting = base.GetView('tipsetting');
			if(tipsetting) {
				tipsetting.evalJS("PushClear('" + pushtype + "')");
			}
			var my = base.GetView('my');
			if(my) {
				my.evalJS("InitPush()");
			}
			base.GetView('subindex').evalJS("InitPush()");
		}
	});
}

function CreatPageWaiting(headheight, bottomheight) {
	var pageWaiting = plus.nativeObj.View.getViewById('pageWaiting');
	if(pageWaiting) {
		return pageWaiting;
	}
	pageWaiting = new plus.nativeObj.View('pageWaiting', {
		top: headheight + "px",
		bottom: bottomheight + "px",
		left: "0%",
		width: "100%"
	});
	pageWaiting.interceptTouchEvent(true);

	//绘制等待内容区背景色
	pageWaiting.drawText('加 载 中 ...', {
		top: headheight + 'px',
		left: '0px',
		width: '100%',
		height: '50%'
	}, {
		size: '13px',
		color: 'rgb(100,100,100)'
	});
	return pageWaiting;
}

function ProgressLoading(container, progress, max) {
	mui.later(function() {
		progress += Math.random() * 20;
		if(progress > max) {
			progress = max;
		}
		container.progressbar().setProgress(progress);
		if(progress < max) {
			ProgressLoading(container, progress, max);
		}
		if(progress >= 100) {
			mui.later(function() {
				container.progressbar().hide();
			}, 250);
		}
	}, Math.random() * 50 + 50);
}

//复制到剪贴板 
function CopyToClip(txt) {
	if(!window.plus) return;
	if(mui.os.android) {
		var Context = plus.android.importClass("android.content.Context");
		var main = plus.android.runtimeMainActivity();
		var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
		plus.android.invoke(clip, "setText", txt);

	} else {
		var UIPasteboard = plus.ios.importClass("UIPasteboard");
		var generalPasteboard = UIPasteboard.generalPasteboard();
		//设置、获取文本内容
		generalPasteboard.setValueforPasteboardType(txt, "public.utf8-plain-text");
		var _val = generalPasteboard.plusCallMethod({
			valueForPasteboardType: "public.utf8-plain-text"
		});
		console.log("IOS复制的数据是：", _val);
	}
	mui.toast("分享链接已复制到剪贴板");
}

//设置焦点
function SetFocus(obj) {
	var len = obj.value.length;
	if(obj.setSelectionRange) {
		setTimeout(function() {
			obj.focus();
			obj.setSelectionRange(0, 0);
		}, 100);
	} else {
		if(obj.createTextRange) {
			var range = obj.createTextRange();
			range.collapse(true);
			range.moveEnd("character", len);
			range.moveStart("character", len);
			range.select();
		}
		try {
			obj.focus();
		} catch(e) {}
	}
}

// 图片预览
function PreviewImage(i) {
	if(!window.plus) return;
	if(base.PreviewImageList.length == 0) {
		return;
	}
	plus.nativeUI.previewImage(base.PreviewImageList, {
		current: i,
		indicator: "number",
		loop: true
	});
}

String.prototype.startWith = function(str) {
	var reg = new RegExp("^" + str);
	return reg.test(this);
}

String.prototype.endWith = function(str) {
	var reg = new RegExp(str + "$");
	return reg.test(this);
}