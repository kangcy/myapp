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
	this.RootUrl = "http://139.224.51.196/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/60x60.gif";

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
				Zans: 0,
				Cover: "../images/header.png",
				FanText: "",
				KeepText: "",
				Phone: "18652913873",
				UserLogin: [],
				ShareNick: 0,
				AutoMusic: 0
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
	 * 添加收藏
	 **/
	this.AddKeep = function(userinfo, articleid) {
		if(userinfo.KeepText.indexOf("," + articleid + ",") >= 0) {
			return true;
		} else {
			userinfo.KeepText += articleid + ",";
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
		userid = "," + articleid + ",";
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
	 * 添加关注
	 **/
	this.AddFan = function(userinfo, userid) {
		if(userinfo.FanText.indexOf("," + userid + ",") >= 0) {
			return true;
		} else {
			userinfo.FanText += userid + ",";
			localStorage.setItem('$userinfo', JSON.stringify(userinfo));
			mui.toast("关注成功");
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
			var $this = $(this);
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
	 * 更新用户信息
	 **/
	this.UpdateUser = function(id, callback) {
		HttpGet(base.RootUrl + "User/Detail", {
			ID: id
		}, function(data) {
			if(data != null) {
				if(data.result) {
					//更新用户缓存信息
					data = data.message;
					var info = {
						ID: data.ID,
						Sex: data.Sex == "0" ? "男" : "女",
						Signature: data.Signature,
						UserName: data.UserName,
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
						Phone: data.Phone,
						UserLogin: data.UserLogin,
						ShareNick: data.ShareNick,
						AutoMusic: data.AutoMusic
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
			plus.nativeUI.showWaiting("载入中...");
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
	this.ShowArticle = function(id, Source) {
		mui(id).on('tap', '.article', function(event) {
			var articleId = this.getAttribute("articleid");
			var power = this.getAttribute("power");
			if(power.toString() == "1") {
				var btnArray = ['确定', '取消'];
				mui.prompt('确认密码', '输入4位数字密码', '权限验证', btnArray, function(e) {
					if(e.index == 0) {
						base.CheckPowerPwd(articleId, e.value, function() {
							plus.nativeUI.showWaiting("载入中...");
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
									ArticleID: articleId,
									Source: Source
								}
							});
						});
					}
				})
			} else {
				plus.nativeUI.showWaiting("载入中...");
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
						ArticleID: articleId,
						Source: "View"
					}
				});
			}
		});
	}

	/**
	 * 验证权限密码
	 */
	this.CheckPowerPwd = function(articleid, pwd, callback) {
		plus.nativeUI.showWaiting("校验中...");
		HttpGet(base.RootUrl + "Article/CheckPowerPwd", {
			ArticleID: articleid,
			ArticlePowerPwd: pwd
		}, function(data) {
			plus.nativeUI.closeWaiting();
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
	 * 拼接文章Html
	 */
	this.AppendArticle = function(item, ismy) {
		var div = document.createElement('div');
		div.className = 'mui-card';
		var model = [];

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
			model.push('<div class="mui-media-body f12" style="margin:0px;margin-top:0.2rem;"><span class="fl caaa">' + item.CreateDate + '</span><span style="border:1px solid #ff6900;color:#ff6900;border-radius:5px;padding:2px 5px;margin-top:-0.1rem;" class="f11 fr">' + power + '</span>');
			model.push('</div></div>');
		} else {
			model.push('<div class="mui-card-header mui-card-media user" userid="' + item.UserID + '"><img data-lazyload="' + item.Avatar + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
			model.push('<div class="mui-media-body f12">' + item.NickName + '<span class="fr caaa">' + item.CreateDate + '</span></div></div>');
		}

		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');
		model.push('<p class="c333 fl article full mt5" articleid="' + item.ArticleID + '" power="' + item.ArticlePower + '">' + item.Title + '</p>');

		//部分拼接
		var parts = item.ArticlePart;
		if(parts.length == 0) {
			model.push('<div class="onefloor"><img data-lazyload="' + item.Cover + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
		} else {
			var exist = false;
			for(var i = 0; i < parts.length; i++) {
				if(parts[i].Introduction == item.Cover) {
					exist = true;
				}
			}
			if(exist) {
				if(parts.length == 1) {
					model.push('<div class="onefloor"><img data-lazyload="' + item.Cover + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				} else {
					for(var i = 0; i < parts.length; i++) {
						model.push('<div class="secondfloor"><img data-lazyload="' + parts[i].Introduction + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
					}
				}
			} else {
				model.push('<div class="secondfloor"><img data-lazyload="' + item.Cover + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				for(var i = 0; i < parts.length; i++) {
					model.push('<div class="secondfloor"><img data-lazyload="' + parts[i].Introduction + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				}
			}
		}
		model.push('</div></div>');
		model.push('<div class="mui-card-footer fl full">');
		model.push('<span style="border:1px solid #459df5;color:#459df5;border-radius:5px;padding:2px 5px;margin:0px;" class="f11 fl">' + (item.TypeName == "" ? "其它" : item.TypeName) + '</span><span class="f11">' + item.Views + '次阅 · ' + item.Comments + '评论 · ' + item.Goods + '喜欢 · ' + item.Pays + '打赏</span></div>');
		div.innerHTML = model.join('');
		return div;
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