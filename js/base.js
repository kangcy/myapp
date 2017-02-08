var base = new function() {
	/**
	 * 优酷
	 **/
	this.youku_client_id = "59bec9b0be1fc34b";
	this.youku_client_secret = "244a6bbc4b212e01b8702745b879e52d";

	/**
	 * 是否测试
	 **/
	this.IsTest = mui.os.plus ? false : true;

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
	this.RootUrl = "http://139.224.51.196/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/logo_default.png";

	/**
	 * 获取当前用户ID
	 **/
	this.GetUserID = function() {
		var userinfo = base.GetUserInfo();
		return userinfo.ID || 0;
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
	 * 校验字符串是否为空
	 **/
	this.IsNullOrEmpty = function(str) {
		if(!str) {
			return true;
		}
		return false;
	}

	/**
	 * 格式化字符串显示
	 **/
	this.FormatStr = function(str, defaultStr) {
		return base.IsNullOrEmpty(str) ? defaultStr : str
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
	 * 打开新页面
	 **/
	this.OpenWindow = function(id, url, data, aniShow) {
		mui.openWindow({
			id: id,
			url: url,
			show: {
				autoShow: true,
				duration: base.AnimateDuration,
				aniShow: aniShow ? aniShow : "slide-in-right"
			},
			waiting: {
				autoShow: false
			},
			extras: data
		});
	}

	/**
	 * 添加收藏
	 **/
	this.AddKeep = function(userinfo, articleid) {
		if(userinfo.KeepText.indexOf("," + articleid + ",") >= 0) {
			return true;
		} else {
			userinfo.KeepText += articleid + ",";
			userinfo.Keeps += 1;
			localStorage.setItem('$userinfo', JSON.stringify(userinfo));
			mui.toast("收藏成功");
			return true;
		}
		return false;
	}

	/**
	 * 判断是否收藏
	 **/
	this.CheckKeep = function(keeps, articleid) {
		articleid = "," + articleid + ",";
		if(base.IsNullOrEmpty(keeps)) {
			return false;
		}
		if(keeps.indexOf(articleid) >= 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 判断是否加入黑名单
	 **/
	this.CheckBlack = function(blacks, userid) {
		userid = "," + userid + ",";
		if(base.IsNullOrEmpty(blacks)) {
			return false;
		}
		if(blacks.indexOf(userid) >= 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 添加关注
	 **/
	this.AddFan = function(userinfo, userid) {
		if(userinfo.FanText.indexOf("," + userid + ",") >= 0) {
			return true;
		} else {
			userinfo.FanText += userid + ",";
			userinfo.Follows += 1;
			localStorage.setItem('$userinfo', JSON.stringify(userinfo));
			return true;
		}
		return false;
	}

	/**
	 * 判断是否关注
	 **/
	this.CheckFan = function(fans, userid) {
		userid = "," + userid + ",";
		if(base.IsNullOrEmpty(fans)) {
			return false;
		}
		if(fans.indexOf(userid) >= 0) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 关注
	 **/
	this.GuanZhu = function(id, userinfo, callback) {
		mui(id).on('tap', '.guanzhu', function(event) {
			var userId = this.getAttribute("userid");
			var $this = this;
			HttpGet(base.RootUrl + "Fan/Edit", {
				ID: userinfo.ID,
				ToUserID: userId
			}, function(data) {
				if(data != null) {
					if(data.result) {
						base.AddFan(userinfo, userId);
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
		document.getElementById('slider').addEventListener('slide', function(e) {
			if(parentPage == null) {
				parentPage = plus.webview.currentWebview().parent();
			}
			parentPage.evalJS("UpdateCurr(" + e.detail.slideNumber + ")");
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
					//更新用户缓存信息
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
						FanText: data.FanText,
						KeepText: data.KeepText,
						BlackText: data.BlackText,
						Phone: data.Phone,
						UserLogin: data.UserLogin,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money,
						UseDraw: data.UseDraw,
						Number: data.Number,
						ShowArticle: data.ShowArticle,
						ShowFollow: data.ShowFollow,
						ShowFan: data.ShowFan
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
	 * 跳转搜索页
	 **/
	this.ShowSearch = function(id) {
		document.getElementById('search').addEventListener('tap', function(event) {
			base.OpenWindow("search", "search.html", {});
		})
	}

	/**
	 * 展示用户信息
	 **/
	this.ShowUser = function(id) {
		mui(id).on('tap', '.user', function(event) {
			base.ShowWaiting("正在加载");
			var userNumber = this.getAttribute("userid");
			base.OpenWindow("user2", "user2.html", {
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
			if(power == "0" && currUserNumber != userNumber) {
				return mui.toast("私密文章，不可见");
			} else if(power == "2" && currUserNumber != userNumber) {
				return mui.toast("仅作者分享可见");
			} else if(power == "1" && currUserNumber != userNumber) {
				var btnArray = ['确定', '取消'];
				mui.prompt('确认密码', '输入4位数字密码', '权限验证', btnArray, function(e) {
					if(e.index == 0) {
						base.CheckPowerPwd(articleId, e.value, function() {
							base.ShowWaiting("正在加载");
							base.OpenWindow("articledetail", "articledetail.html", {
								ArticleID: articleId,
								Source: Source
							});
						});
					}
				})
			} else {
				base.ShowWaiting("正在加载");
				base.OpenWindow("articledetail", "articledetail.html", {
					ArticleID: articleId,
					Source: "View"
				});
			}
		});
	}

	/**
	 * 验证权限密码
	 */
	this.CheckPowerPwd = function(articleid, pwd, callback) {
		base.ShowWaiting("正在校验");
		HttpGet(base.RootUrl + "Article/CheckPowerPwd", {
			ArticleID: articleid,
			ArticlePowerPwd: pwd
		}, function(data) {
			base.CloseWaiting();
			if(data != null) {
				if(data.result) {
					if(callback) {
						callback();
					}
				} else {
					mui.toast("密码不正确");
				}
			} else {
				mui.toast("密码不正确");
			}
		});
	}

	/**
	 * 拼接文章Html(ismy:是否我的,isuser:是否用户,islazyload:是否延迟加载,isdel:是否有左滑操作)
	 */
	this.AppendArticle = function(item, ismy, isuser, islazyload, isdel) {
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
			model.push('<div class="mui-card-header mui-card-media">');
			model.push('<div class="mui-media-body f12" style="margin:0px;margin-top:0.2rem;"><span class="fl c999">');
			if(base.IsNullOrEmpty(item.City)) {
				model.push(item.CreateDate);
			} else {
				model.push(item.CreateDate + '<span class="ml10 mr10">来自</span> ' + item.City);
			}
			model.push('</span><span style="border:1px solid #ff6900;color:#ff6900;border-radius:5px;padding:2px 5px;margin-top:-0.1rem;" class="f11 fr">' + power + '</span>');
			model.push('</div></div>');
		} else {
			if(isuser) {
				model.push('<div class="mui-card-header noborder mui-card-media"><div class="mui-media-body f12"><span class="fr c999">');
				if(base.IsNullOrEmpty(item.City)) {
					model.push(item.CreateDate);
				} else {
					model.push(item.CreateDate + '<span class="ml10 mr10">来自</span> ' + item.City);
				}
				model.push('</span></div></div>');
			} else {
				if(isdel) {
					model.push('<div class="mui-slider-cell mui-slider-handle">');
				}
				if(islazyload) {
					model.push('<div class="mui-card-header noborder mui-card-media user" userid="' + item.UserNumber + '"><img data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
				} else {
					model.push('<div class="mui-card-header noborder mui-card-media user" userid="' + item.UserNumber + '"><img src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
				}

				if(base.IsNullOrEmpty(item.City)) {
					model.push('<div class="mui-media-body f12">' + item.NickName + '<span class="fr caaa">' + item.CreateDate + '</span></div></div>');
				} else {
					model.push('<div class="mui-media-body f12 mt0">' + item.NickName + '<p class="f11 full caaa mt5">' + item.CreateDate + '<span style="margin-left:10px;margin-right:10px;">来自</span> ' + item.City + '</p></div></div>');
				}
			}
		}

		//内容
		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

		model.push('<p class="c333 fl article full mb20 f13" articleid="' + item.ArticleID + '" userid="' + item.UserNumber + '" power="' + item.ArticlePower + '">');
		//加精
		if(item.Recommend == 99) {
			model.push('<span class="fl f12" style="padding:1px;border-radius:5px;background:#ff0000;color:#fff;margin-right:5px;">精</span>');
		}
		if(base.IsNullOrEmpty(item.Title)) {
			item.Title = "我的GO";
		}
		model.push(item.Title + '</p>');

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
		//底部统计
		model.push('<div class="mui-card-footer fl full c999"><span class="f12">' + item.Views + '次阅 · ' + item.Comments + '评论 · ' + item.Goods + '喜欢 · ' + item.Pays + '打赏</span><span style="border:1px solid #459df5;color:#459df5;border-radius:5px;padding:2px 5px;margin:0px;" class="f12 fl">' + (item.TypeName == "" ? "其它" : item.TypeName) + '</span></div>');
		//评论
		if(item.CommentList.length > 0) {
			model.push('<div class="mui-card-footer fl full c999">');
			for(var i = 0; i < item.CommentList.length; i++) {
				model.push('<div class="f12 full fl" style="line-height:1.3rem;"><span class="blue f12">' + item.CommentList[i].UserName + '</span>&nbsp;:<span class="ml5">' + item.CommentList[i].Summary + '</span><div>');
			}
			model.push('</div">');
		}
		if(isdel) {
			model.push('</div>');
		}
		div.innerHTML = model.join('');
		return div;
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
	 * 判断网络状态
	 */
	this.NetChange = function() {
		document.addEventListener("netchange", function() {
			if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
				mui.toast("网络异常，请检查网络设置！");
			}
		}, false);
	}

	/**
	 * 切换Switch
	 */
	this.SwitchChange = function(id, isopen) {
		if(isopen) {
			document.getElementById(id).classList.add("active");
		} else {
			document.getElementById(id).classList.remove("active");
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