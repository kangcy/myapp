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

var base = new function() {

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
	 * 列表每次请求数
	 **/
	this.PageSize = 20;

	/**
	 * 窗口动画持续时间
	 **/
	this.AnimateDuration = 300;

	/**
	 * 接口请求根路径
	 **/
	this.RootUrl = "http://www.ishaoxia.com/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/logo_default.png";

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
	this.CheckLogin = function(userinfo) {
		if(userinfo == "{}") {
			base.IsLoading = false;
			base.TriggerMain = true;
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
		if(mui.os.plus) {
			plus.nativeUI.showWaiting(title, {
				width: "80%",
				padding: "4%",
				background: "rgba(0,0,0,0.6)",
				textalign: "left",
				back: "none",
				loading: {
					display: "inline"
				}
			});
		}
	}

	/**
	 * 关闭等待提示框
	 **/
	this.CloseWaiting = function() {
		if(mui.os.plus) {
			plus.nativeUI.closeWaiting();
		}
	}

	/**
	 * 防止连续点击
	 */
	var Repeat_Action = null;
	this.RepeatAction = function() {
		if(Repeat_Action) {
			return true;
		}
		Repeat_Action = new Date().getTime();
		setTimeout(function() {
			Repeat_Action = null;
		}, 1500);
		return false;
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
				aniShow: aniShow ? aniShow : "slide-in-right"
			},
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
			HttpGet(base.RootUrl + "Fan/Edit", {
				ID: userinfo.ID,
				ToUserNumber: userNumber
			}, function(data) {
				if(data != null) {
					if(data.result) {
						if(data.message != "exist") {
							base.UpdateFan(userinfo);
						}
						if(callback) {
							callback($this);
						}
					} else {
						mui.toast(data.message);
					}
				}
			});
		});
	}

	/**
	 * 监听标题滑动切换
	 **/
	this.InitSlider = function(parentPage) {
		mui('.mui-slider').slider();
		mui('.mui-scroll-wrapper.mui-slider-indicator.mui-segmented-control').scroll({
			scrollY: false,
			scrollX: true,
			indicators: false,
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

	/**
	 * 双击顶部滚动到顶部
	 **/
	this.ScrollTop = function() {
		document.querySelector('header').addEventListener('doubletap', function() {
			mui(".mui-scroll-wrapper").scroll().scrollTo(0, 0, 1000);
		});
	}

	/**
	 * 更新用户信息
	 **/
	this.UpdateUser = function(id, callback) {
		HttpGet(base.RootUrl + "User/Detail", {
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
						callback();
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
			div.className = 'mui-card mui-table-view-cell';
			div.style.padding = "0px";
			div.setAttribute("kid", item.ArticleNumber);
		} else {
			div.className = 'mui-card';
		}
		div.style.paddingBottom = "0.8rem";

		div.setAttribute("id", "article" + item.ArticleID)
		var model = [];
		if(isdel) {
			model.push('<div class="mui-slider-right mui-disabled tc"><a class="mui-btn mui-btn-red">删除</a></div>');
		}
		if(!ismy) {
			if(isdel) {
				model.push('<div class="mui-slider-cell mui-slider-handle">');
			}

			//加精
			if(item.Recommend == 99) {
				model.push('<div class="c999 f10" style="color:#ff0000;border-top:1px solid f5f5f5;border-bottom:1px solid #f5f5f5;height:2rem;line-height:2rem;padding:0px 0.625rem">精华</div>');
			}
			model.push('<div class="mui-card-header noborder mui-card-media user" userid="' + item.UserNumber + '">');
			if(islazyload) {
				model.push('<img data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
			} else {
				model.push('<img src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
			}

			model.push('<div class="mui-media-body f12 mt0" style="position:relative;"><span>' + item.NickName + '</span><p class="f10 full c999 mt5">' + item.CreateDate);
			if(!base.IsNullOrEmpty(item.City)) {
				model.push('<span class="ml5 blue">' + item.Province + ' • ' + item.City + '</span>');
			}
			model.push('</p>');
			//如果是自己隐藏关注按钮
			if(userNumber != "" && userNumber != item.UserNumber) {
				model.push('<img class="' + (item.IsFollow == 0 ? "guanzhu" : "") + '" userid="' + item.UserNumber + '" src="../images/base/' + (item.IsFollow == 0 ? "follow0" : "follow1") + '.png" style="position:absolute;right:0px;top:2%;width:3rem;" />');
			}
			model.push('</div></div>');
		}

		//内容
		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

		model.push('<div class="c333 fl article full mb10 f12" style="line-height:1.3rem;" articleid="' + item.ArticleID + '" userid="' + item.UserNumber + '" power="' + item.ArticlePower + '" nickname="' + item.NickName + '">');
		//加精
		/*if(item.Recommend == 99) {
			model.push('<span class="fl f11" style="color:#ff0000;">「精选」</span>');
		}*/
		if(base.IsNullOrEmpty(item.Title)) {
			item.Title = "我的微篇";
		}
		model.push(item.Title + '</div>');

		if(ismy == true) {
			var power = "";
			switch(item.ArticlePower) {
				case "0":
					power = "私密";
					break;
				case 1:
					power = "密码";
					break;
				case 2:
					power = "分享";
					break;
				case 3:
					power = "公开";
					break;
				default:
					power = "私密";
					break;
			}
			model.push('<div class="mui-card-header full c999 fl" style="margin-top:-0.5rem;padding:0px 0px 0.625rem 0px"><span class="f11 fl">' + item.CreateDate + '</span><span class="f11 fr" style="color:#ff0000;" />「' + power + '」</span></div>');
		}

		//图片拼接 
		var parts = item.ArticlePart;
		if(parts.length == 1) {
			if(islazyload) {
				model.push('<div class="onefloor"><img data-lazyload="' + base.ShowThumb(parts[0].Introduction, 1) + '" href="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			} else {
				model.push('<div class="onefloor"><img src="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
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
		model.push('</div></div>');

		model.push('<div class="mui-card-footer fl full c999 mb10 f12" style="display:inline-block;"><span class="fl">浏览' + item.Views + '次</span>');
		if(item.IsPay == 1) {
			model.push('<span class="pays" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '" UserNumber="' + item.UserNumber + '" NickName="' + item.NickName + '" Avatar="' + item.Avatar + '" articleid="' + item.ArticleID + '"><img id="ipays' + item.ArticleID + '" src="../images/base/reward_nor.png" style="width:0.9rem;" class="ml15 mr10 mt1 fr" /></span>');
		}
		model.push('<span class="comments" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '"><img id="icomments' + item.ArticleID + '" src="../images/base/comment_nor.png" style="width:0.9rem;" class="ml15 mr10 fr mt1" /></span>');
		if(item.IsZan == 0) {
			model.push('<img src="../images/base/like_nor.png" style="width:0.9rem;" class="mr10 fr goods" articleid="' + item.ArticleID + '" />');
		} else {
			model.push('<span><img src="../images/base/like_hig.png" style="width:0.9rem;" class="mr10 fr" /></span>');
		}
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
		base.ArticleAddFan(id, userinfo);
		base.ArticleAddZan(id, userinfo);
		base.ArticleAddPay(id, userinfo);
		base.ArticleAddComment(id, userinfo);
	}

	/**
	 * 文章列表添加关注
	 */
	this.ArticleAddFan = function(id, userinfo) {
		mui(id).on('tap', '.guanzhu', function(event) {
			base.TriggerMain = false;
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			var $this = this;
			var UserNumber = this.getAttribute("userid");
			HttpGet(base.RootUrl + "Fan/Edit", {
				ID: userinfo.ID,
				ToUserNumber: UserNumber
			}, function(data) {
				if(data != null) {
					mui.toast(data.result ? "关注成功" : data.message);
					if(data.result) {
						$this.classList.remove("guanzhu");
						$this.setAttribute("src", "../images/base/follow1.png");
						if(data.message != "exist") {
							base.UpdateFan(userinfo);
						}
					}
				}
				base.IsLoading = false;
				base.TriggerMain = true;
			});
		});
	}

	/**
	 * 文章列表添加点赞
	 */
	this.ArticleAddZan = function(id, userinfo) {
		mui(id).on('tap', '.goods', function(event) {
			if(base.IsLoading) {
				return false;
			}
			base.IsLoading = true;
			var $this = this;
			var ArticleID = $this.getAttribute("articleid");
			HttpGet(base.RootUrl + "Api/Zan/Edit", {
				ID: userinfo.ID,
				ArticleID: ArticleID
			}, function(data) {
				data = JSON.parse(data);
				if(data != null) {
					if(data.result) {
						$this.setAttribute("src", "../images/base/like_hig.png");
						$this.classList.add("heartbeat");
					}
				}
				base.IsLoading = false;
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
			var ArticleUserNumber = this.getAttribute("UserNumber");
			var NickName = this.getAttribute("NickName");
			var Avatar = this.getAttribute("Avatar");

			base.IsLoading = false;

			base.OpenWindow("money", "../page/money.html", {
				ArticleNumber: ArticleNumber,
				ArticleUserNumber: ArticleUserNumber,
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

			base.CheckLogin(userinfo);

			var ArticleID = this.getAttribute("articleid");
			var ArticleNumber = this.getAttribute("ArticleNumber");

			base.IsLoading = false;

			base.OpenWindow("articleComment", "../page/articleComment.html", {
				ArticleID: ArticleID,
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
		var item = document.getElementById(id);
		if(isopen) {
			item.classList.add("active");
		} else {
			item.classList.remove("active");
		}
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
	this.AppendUser = function(item, isSignature, isFollow, isDelete, deletNname, isDistance) {
		var div = document.createElement('div');
		div.className = 'mui-table-view-cell user';
		div.setAttribute("userid", item.Number);
		var model = [];
		if(isDelete) {
			model.push('<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">' + deletNname + '</a></div>');
			model.push('<div class="mui-slider-cell mui-slider-handle">');
		}
		model.push('<div class="mui-table oa-contact-cell">');
		model.push('<div class="mui-table-cell avatar"><img src="' + base.ShowThumb(item.Avatar, 1) + '"  /></div>');
		model.push('<div class="mui-table-cell"><p class="f13 mb5 c333">' + item.NickName + '</p>');
		if(isSignature) {
			model.push('<p class="f11 c999">' + item.Signature + '</p>');
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
			HttpGet(base.RootUrl + "Fan/Edit", data, function(data) {
				if(data != null) {
					if(data.result) {
						$this.classList.remove("guanzhu");
						$this.classList.add("guanzhu2");
						$this.childNodes[0].setAttribute("src", "../images/base/follow1.png");
						if(data.message != "exist") {
							base.UpdateFan(userinfo);
						}
					}
					mui.toast(data.result ? "关注成功" : data.message);
				}
				base.IsLoading = false;
				base.TriggerMain = true;
			});
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

/**
 * Slider切换动态触发
 **/
function ChangeSlider(index) {
	mui('#slider').slider().gotoItem(index);
}

//编辑器弹窗
function EditorTan(index) {
	if(index == 0) {
		$(".emojionearea").removeClass("bounceInUp").addClass("hide");
	} else {
		$(".emojionearea").removeClass("hide").addClass("bounceInUp");
	}
}