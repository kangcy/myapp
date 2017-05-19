(function(doc, win) {
	// 分辨率Resolution适配
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function() {
			var clientWidth = docEl.clientWidth;
			if(!clientWidth) return;
			docEl.style.fontSize = 16 * (clientWidth / 320) + 'px';
			docEl.style.width = '100%';
			docEl.style.height = '100%';
			docEl.style.overflow = 'hidden';
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

//等待框
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
}

var base = new function() {

	/**
	 * 接口错误码
	 **/
	this.ErrorCode = {
		UnLogin: 1
	}

	/**
	 * 触发层级(触发父元素事件)
	 **/
	this.TriggerMain = true;

	/**
	 * 当前定位信息
	 **/
	this.Province = ""; //省份名称
	this.City = ""; //城市名称
	this.District = ""; //地区名称
	this.Street = ""; //街道名称
	this.DetailName = ""; //详细定位
	this.CityCode = ""; //城市编码
	this.Latitude = ""; //纬度
	this.Longitude = ""; //经度

	/**
	 * 系统定位
	 **/
	this.GetCurrentPosition = function(callback1, callback2) {
		plus.geolocation.getCurrentPosition(function(p) {
			base.Province = p.address.province;
			base.City = p.address.city;
			base.District = p.address.district;
			base.Street = p.address.street;
			base.DetailName = p.address.poiName;
			base.CityCode = p.address.cityCode;
			base.Latitude = p.coords.latitude;
			base.Longitude = p.coords.longitude;
			if(callback1) {
				callback1();
			}
		}, function(e) {
			base.Province = "";
			base.City = "";
			base.District = "";
			base.Street = "";
			base.DetailName = "";
			base.CityCode = "";
			base.Latitude = "";
			base.Longitude = "";
			if(callback2) {
				callback2();
			}
		});
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
	this.PageSize = 10;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 200;

	/**
	 * 接口请求根路径
	 **/
	this.RootUrl = "http://www.ishaoxia.com/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/logo_default.png";

	/**
	 * 默认头像
	 **/
	this.DefaultAvatar = "../images/avatar.png";

	/**
	 * 显示等待、关闭等待
	 **/
	this.ShowLoading = function(show) {
		if(show)
			base.Get("loader").classList.remove("hide");
		else
			base.Get("loader").classList.add("hide");
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
		var settingsText = localStorage.getItem('$userinfo') || "{}";
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
		if(userinfo == "{}" || code == base.ErrorCode.UnLogin) {
			base.IsLoading = false;
			base.OpenWindow("login", "../page/login.html", {}, "slide-in-bottom");
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
	 * 创建弹出层
	 **/
	this.CreateMask = function(enable, callback) {
		var element = document.createElement('div');
		element.classList.add('mui-backdrop');
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
		if(mui.os.android) {
			if(parseFloat(mui.os.version) < 4.4) {
				show = "slide-in-right";
			}
		}
		return show;
	}

	/**
	 * 打开新页面
	 **/
	this.OpenWindow = function(id, url, data, aniShow) {
		if(base.RepeatAction()) {
			return;
		}
		mui.openWindow({
			id: id,
			url: url,
			show: {
				autoShow: true,
				duration: base.AnimateDuration,
				aniShow: aniShow ? aniShow : base.ShowAnimate()
			},
			/*styles: {
				zindex: 1000
			},*/
			createNew: true,
			waiting: {
				autoShow: false
			},
			extras: data
		});
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
	 * 关注
	 **/
	this.GuanZhu = function(id, userinfo, callback) {
		mui(id).on('tap', '.guanzhu', function(event) {
			var userId = this.getAttribute("userid");
			if(userNumber == userinfo.Number) {
				if(callback) {
					callback($this);
				}
				return;
			}
			var $this = this;
			HttpGet(base.RootUrl + "Api/Fan/Edit", {
				ID: userinfo.ID,
				ToUserNumber: userNumber
			}, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data != null) {
					if(data.result) {
						base.UpdateFan(userinfo, data.message);
						if(callback) {
							callback($this);
						}
					} else {
						mui.toast(data.message);
					}
				} else {
					mui.toast("失败");
				}
			});
		});
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

		base.ScrollTop();
	}

	/**
	 * 刷新滚动条
	 **/
	this.RefreshScroll = function() {
		mui(".mui-scroll-wrapper").scroll().refresh(); //刷新下拉
	}

	/**
	 * 双击顶部滚动到顶部
	 **/
	this.ScrollTop = function() {
		if(document.querySelectorAll('header').length > 0) {
			document.querySelector('header').addEventListener('doubletap', function() {
				mui.each(mui(".mui-scroll-wrapper"), function() {
					mui(this).scroll().scrollTo(0, 0, 1000);
				});
			});
		}
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
						Sex: data.Sex == "0" ? "男" : "女",
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
						ShowArticle: data.ShowArticle,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan,
						ShowPush: data.ShowPush,
						ShowPosition: data.ShowPosition,
						UserRole: data.UserRole
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
			if(!base.TriggerMain) {
				return false;
			}
			var userNumber = this.getAttribute("userid");
			base.OpenWindow("user" + userNumber, "user.html", {
				UserNumber: userNumber
			});
		});
	}

	/**
	 * 展示文章信息
	 **/
	this.ShowArticle = function(id, Source, currUserNumber) {
		mui(id).on('tap', '.article', function(event) {
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
			});
		});
	}

	/**
	 * 拼接文章Html(ismy:是否我的,isuser:是否用户,islazyload:是否延迟加载,isdel:是否有左滑操作)
	 */
	this.AppendArticle = function(userNumber, item, ismy, isuser, islazyload, isdel) {
		var div = document.createElement('div');
		if(isdel) {
			div.className = 'mui-card mui-table-view-cell bounceInUp';
			div.style.padding = "0px";
			div.setAttribute("kid", item.ArticleNumber);
		} else {
			div.className = 'mui-card';
		}
		div.setAttribute("iskeep", item.IsKeep); //是否收藏
		div.setAttribute("isfollow", item.IsFollow); //是否关注
		div.style.paddingBottom = "0.8rem";

		div.setAttribute("id", "article" + item.ArticleID)
		var model = [];
		if(isdel) {
			model.push('<div class="mui-slider-right mui-disabled tc"><a class="mui-btn mui-btn-red">删除</a></div>');
		}

		var power = "";
		var name = "";
		switch(item.ArticlePower) {
			case "0":
				name = "power0.png";
				power = "私密";
				break;
			case 1:
				name = "power2.png";
				power = "密码可见";
				break;
			case 2:
				name = "power2.png";
				power = "分享可见";
				break;
			case 3:
				name = "power1.png";
				power = "公开";
				break;
			default:
				name = "power0.png";
				power = "私密";
				break;
		}
		if(ismy) {
			model.push('<div class="c999 f11 star mb10"><img src="../images/article/' + name + '" class="fl" /><span class="fl">' + power + '</span><span class="fr">' + item.CreateDate + '</span></div>');
		} else {
			if(isdel) {
				model.push('<div class="mui-slider-cell mui-slider-handle">');
			}

			//加精、置顶
			if(item.Recommend == 99) {
				model.push('<div class="c999 f11 star">');
				model.push('<img src="../images/article/star.png" class="fl" /><span class="fl">精华</span>');
				model.push('<div style="width:1.5rem;height:100%;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><a class="mui-action-menu mui-icon mui-icon-arrowdown fr f16 mt10 c999"></a></div></div>');
			} else if(item.Recommend == 100) {
				model.push('<div class="c999 f11 star">');
				model.push('<img src="../images/article/top.png" class="fl" /><span class="fl">置顶</span>');
				model.push('<div style="width:1.5rem;height:100%;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><a class="mui-action-menu mui-icon mui-icon-arrowdown fr f16 mt10 c999"></a></div></div>');
			}

			//用户
			model.push('<div class="mui-card-header noborder mui-card-media">');
			if(islazyload) {
				model.push('<img class="user" userid="' + item.UserNumber + '" data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
			} else {
				model.push('<img class="user" userid="' + item.UserNumber + '" src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
			}

			model.push('<div class="mui-media-body f14 mt0" style="position:relative;"><span class="user c333" userid="' + item.UserNumber + '">' + base.UnUnicodeText(item.NickName) + '</span><p class="f10 full c999 mt5">' + item.CreateDate);
			if(!base.IsNullOrEmpty(item.City)) {
				model.push('<span class="ml5 mr5 c999">来自</span><span class="c999">' + item.Province + ' • ' + item.City + '</span>');
			}
			model.push('</p>');
			//如果是自己隐藏关注按钮
			/*if(userNumber != "" && userNumber != item.UserNumber) {
				if(item.IsFollow == 0) {
					model.push('<img class="' + (item.IsFollow == 0 ? "guanzhu" : "") + '" userid="' + item.UserNumber + '" src="../images/base/' + (item.IsFollow == 0 ? "follow0" : "follow1") + '.png" style="position:absolute;right:0px;top:2%;width:3rem;" />');
				}
			}*/

			if(item.Recommend == 0) {
				model.push('<div style="width:1.5rem;height:100%;position:absolute;right:0rem;top:0rem;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><a class="mui-action-menu mui-icon mui-icon-arrowdown fr f16 mt10 c999"></a></div></div>');
			}
			model.push('</div></div>');
		}

		//内容
		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

		model.push('<div class="c333 fl article full mt5 mb10 f12" style="line-height:1.3rem;" articleid="' + item.ArticleID + '" userid="' + item.UserNumber + '" power="' + item.ArticlePower + '" nickname="' + item.NickName + '">');
		if(base.IsNullOrEmpty(item.Title)) {
			item.Title = "我的小微篇";
		}
		model.push(base.UnUnicodeText(item.Title) + '</div>');

		//图片拼接 
		var parts = item.ArticlePart;
		if(parts.length == 0) {
			if(islazyload) {
				model.push('<div class="onefloor"><img data-lazyload="' + base.ShowThumb(item.Cover, 1) + '" href="' + base.ShowThumb(item.Cover, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			} else {
				model.push('<div class="onefloor"><img src="' + base.ShowThumb(item.Cover, 1) + '" href="' + base.ShowThumb(item.Cover, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			}
		} else {
			if(parts.length == 1) {
				if(islazyload) {
					model.push('<div class="onefloor"><img data-lazyload="' + base.ShowThumb(parts[0].Introduction, 1) + '" href="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				} else {
					model.push('<div class="onefloor"><img src="' + base.ShowThumb(parts[0].Introduction, 1) + '" href="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				}
			} else {
				var name = parts.length == 3 ? "thirdfloor" : "secondfloor";
				for(var i = 0; i < parts.length; i++) {
					if(islazyload) {
						model.push('<div class="' + name + '"><img data-lazyload="' + base.ShowThumb(parts[i].Introduction, 2) + '" href="' + base.ShowThumb(parts[i].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
					} else {
						model.push('<div class="' + name + '"><img src="' + base.ShowThumb(parts[i].Introduction, 2) + '" href="' + base.ShowThumb(parts[i].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
					}
				}
			}
		}
		model.push('</div></div>');

		model.push('<div class="mui-card-footer fl full c999 f11" style="display:inline-block;"><span class="fl mt1">浏览' + item.Views + '次</span>');
		if(item.IsPay == 1) {
			model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="pays fr tc" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '" UserNumber="' + item.UserNumber + '" NickName="' + item.NickName + '" Avatar="' + item.Avatar + '" articleid="' + item.ArticleID + '"><img id="ipays' + item.ArticleID + '" src="../images/base/reward_nor.png" style="width:0.9rem;" class="mt1" /></div>');
		}
		model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="comments fr tc" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '"><img id="icomments' + item.ArticleID + '" src="../images/base/comment_nor.png" style="width:0.9rem;" class="mt1" /></div>');
		model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="fr tc"><img src="../images/base/' + (item.IsZan == 0 ? "like_nor" : "like_hig") + '.png" style="width:0.9rem;" class="mr10 fr goods ' + (item.IsZan == 0 ? "" : "red") + '" articleid="' + item.ArticleID + '" already="' + (item.IsZan == 0 ? 0 : 1) + '" /></div>');
		model.push('</div>');

		if(isdel) {
			model.push('</div>');
		}
		div.innerHTML = model.join('');
		return div;
	}

	/**
	 * 文章列表操作(关注、点赞、评论、打赏)
	 */
	this.ArticleAction = function(id, userinfo) {
		base.ArticleAddZan(id, userinfo);
		base.ArticleAddPay(id, userinfo);
		base.ArticleAddComment(id, userinfo);
	}

	/**
	 * 文章列表添加点赞
	 */
	this.ArticleAddZan = function(id, userinfo) {
		mui(id).on('tap', '.goods', function(event) {
			if(base.RepeatAction()) {
				return;
			}
			var $this = this;
			var ArticleID = $this.getAttribute("articleid");
			HttpGet(base.RootUrl + "Api/Zan/ArticleZanEdit", {
				ID: userinfo.ID,
				ArticleID: ArticleID
			}, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data != null) {
					if(data.result) {
						var already = data.message.split('|');
						if(already[0] == 1) {
							$this.setAttribute("already", "0");
							$this.setAttribute("src", "../images/base/like_nor.png");
							$this.classList.remove("red");
							$this.classList.remove("heartbeat");
						} else {
							$this.setAttribute("already", "1");
							$this.setAttribute("src", "../images/base/like_hig.png");
							$this.classList.add("red");
							$this.classList.add("heartbeat");
						}
					} else {
						mui.toast(data.message);
					}
				} else {
					mui.toast("失败");
				}
			});
		});
	}

	/**
	 * 文章列表打赏
	 */
	this.ArticleAddPay = function(id, userinfo) {
		mui(id).on('tap', '.pays', function(event) {
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			var ArticleNumber = this.getAttribute("ArticleNumber");
			var NickName = this.getAttribute("NickName");
			var Avatar = this.getAttribute("Avatar");

			base.IsLoading = false;

			base.OpenWindow("money", "../page/money.html", {
				ArticleNumber: ArticleNumber,
				ArticleUserNumber: "",
				Name: NickName,
				Avatar: Avatar
			});
		});
	}

	/**
	 * 文章列表添加评论
	 */
	this.ArticleAddComment = function(id, userinfo) {
		mui(id).on('tap', '.comments', function(event) {
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			var ArticleNumber = this.getAttribute("ArticleNumber");
			base.IsLoading = false;

			base.OpenWindow("articleComment", "../page/articleComment.html", {
				ArticleNumber: ArticleNumber
			});
		});
	}

	/**
	 * 格式化缩略图显示
	 */
	this.ShowThumb = function(url, thumb) {
		if(base.IsNullOrEmpty(url)) {
			return base.DefaultImg;
		}
		if(url.indexOf('_0') < 0) {
			return url;
		}
		return url.replace("_0", "_" + thumb);
	}

	/**
	 * 分享日志
	 */
	this.ShareLog = function(userid, articleNumber, source) {
		HttpGet(base.RootUrl + "ShareLog/Edit", {
			ID: userid,
			ArticleNumber: articleNumber,
			Source: source
		}, function(data) {

		});
	}

	/**
	 * 切换Switch
	 */
	this.SwitchChange = function(id, isopen) {
		base.ToggleClass(["#" + id], "active", isopen);
	}

	/**
	 * 拼接用户列表
	 * item:JSON数据
	 * isSignature:是否显示签名
	 * isFollow:是否显示关注
	 * isDelete:是否显示删除
	 * deletNname:删除名称
	 * isDistance:显示距离
	 */
	this.AppendUser = function(item, isSignature, isFollow, isDelete, deleteName, isDistance) {
		var div = document.createElement('div');
		div.className = 'mui-table-view-cell user user1 bounceInUp';
		div.setAttribute("userid", item.Number);
		var model = [];
		if(isDelete) {
			model.push('<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">' + deleteName + '</a></div>');
			model.push('<div class="mui-slider-cell mui-slider-handle">');
		}
		model.push('<div class="mui-table oa-contact-cell">');
		model.push('<div class="mui-table-cell avatar"><img src="' + base.ShowThumb(item.Avatar, 1) + '"  /></div>');
		model.push('<div class="mui-table-cell"><p class="f14 mb5 c333">' + base.UnUnicodeText(item.NickName) + '</p>');
		if(isSignature) {
			model.push('<p class="f11 c999">' + base.UnUnicodeText(item.Signature) + '</p>');
		}
		if(isDistance) {
			var distance = parseFloat(item.Distance);
			var meter = parseInt(distance / 100);
			if(meter < 9) {
				model.push('<p class="f11 c999">' + (meter + 1) + '00米以内</p>');
			} else {
				model.push('<p class="f11 c999">' + (parseInt(distance / 1000) + 1) + '公里以内</p>');
			}
		}
		model.push('</div>');
		if(isFollow) {
			if(item.IsFollow == 0 && userinfo.Number != item.Number) {
				model.push('<div class="mui-table-cell guanzhu" userid="' + item.Number + '"><img src="../images/base/follow0.png" /></div>');
			} else {
				model.push('<div class="mui-table-cell guanzhu2"><img src="../images/base/follow1.png" /></div>');
			}
		}
		model.push('</div>');
		if(isDelete) {
			model.push('</div>');
		}
		div.innerHTML = model.join('');
		return div;
	}

	/**
	 * 用户列表添加关注
	 * id:容器ID
	 * userinfo:当前用户信息
	 */
	this.UserAddFan = function(id, userinfo) {
		mui(id).on('tap', '.guanzhu', function(event) {
			base.TriggerMain = false;
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
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
					mui.toast(data.result ? "关注成功" : data.message);
				} else {
					mui.toast("失败");
				}
				base.IsLoading = false;
				base.TriggerMain = true;
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
		if(base.IsNullOrEmpty(name) || base.IsNullOrEmpty(classnames)) {
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

	/**
	 * 获取对象
	 */
	this.Get = function(name) {
		if(name.indexOf('.') < 0) {
			return mui("#" + name)[0];
		} else {
			return mui(name);
		}
	}

	/**
	 * 获取页面对象
	 */
	this.GetView = function(id) {
		return plus.webview.getWebviewById(id);
	}

	/**
	 * 刷新用户信息
	 */
	this.RefreshUser = function() {
		base.GetView("subindex").evalJS("Refresh()");
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

	/**
	 * 沉浸式状态栏
	 **/
	this.Immersed = function() {
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
			} else {
				t.style.background = "transparent";
			}
			t.style.color = '#FFF';
		}
		t = document.getElementById('scroll-wrapper');
		if(t) {
			t.style.marginTop = immersed + 'px';
		}
		t = document.getElementById('muicontent');
		if(t) {
			t.style.paddingTop = immersed + 45 + 'px';
		}
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

/**
 * Slider切换动态触发
 **/
function ChangeSlider(index) {
	mui('#slider').slider().gotoItem(index);
}

//显示遮罩
function ShowMask(show, showmask, pageid) {
	var view = base.GetView(pageid);
	if(view == null) {
		return;
	}
	if(show) {
		view.setStyle({
			top: '0px',
			bottom: '0px'
		});
	} else {
		view.setStyle({
			top: '0px',
			bottom: '50px'
		});
	}
	if(showmask) {
		view.setStyle({
			mask: "rgba(0,0,0,0.6)"
		});
	} else {
		view.setStyle({
			mask: "none"
		});
	}
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
function LoadPull(url, data, showNone, showAnimate, appendCallback, endCallback) {
	HttpGet(url, data, function(data) {
		data = JSON.parse(data);
		base.ShowLoading(false);
		if(data != null) {
			if(data.result) {
				data = data.message;
				totalpage = data.totalpage;
				records = data.records;
				if(showNone) {
					base.ShowNone(false);
				}
				var table = base.Get('scroll-view');
				if(records > 0) {
					if(showAnimate) {
						DelayEachArray(data.list, 0, 50, base.CurrAnimate, function(item) {
							var div = appendCallback(item);
							table.appendChild(div);
						})
					} else {
						mui.each(data.list, function(index, item) {
							var div = appendCallback(item);
							table.appendChild(div);
						});
					}
				}
			}
		}
		if(records == 0 && showNone) {
			base.ShowNone(true);
		}
		if(endCallback) {
			endCallback();
		}
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