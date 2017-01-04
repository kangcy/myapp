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
	this.RootUrl = "http://139.224.51.196:8080/";

	/**
	 * 默认图片
	 **/
	this.DefaultImg = "../images/logo.png";

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
	 * 打开等待提示框
	 **/
	this.ShowWaiting = function(title) {
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

	/**
	 * 关闭等待提示框
	 **/
	this.CloseWaiting = function() {
		plus.nativeUI.closeWaiting();
	}

	/**
	 * 打开新页面
	 **/
	this.OpenWindow = function(id, url, data) {
		mui.openWindow({
			id: id,
			url: url,
			show: {
				autoShow: true,
				duration: base.AnimateDuration
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
			userinfo.Fans += 1;
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
						AutoMusic: data.AutoMusic,
						IsPay: data.IsPay,
						Money: data.Money
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
			base.ShowWaiting("载入中...");
			var userId = this.getAttribute("userid");
			base.OpenWindow("user", "user.html", {
				UserID: userId
			});
		});
	}

	/**
	 * 展示文章信息
	 **/
	this.ShowArticle = function(id, Source, curruserid) {
		mui(id).on('tap', '.article', function(event) {
			var articleId = this.getAttribute("articleid");
			var userid = this.getAttribute("userid");
			var power = this.getAttribute("power").toString();
			if(power == "0" && curruserid != userid) {
				return mui.toast("私密文章，不可见");
			} else if(power == "2" && curruserid != userid) {
				return mui.toast("仅作者分享可见");
			} else if(power == "1" && curruserid != userid) {
				var btnArray = ['确定', '取消'];
				mui.prompt('确认密码', '输入4位数字密码', '权限验证', btnArray, function(e) {
					if(e.index == 0) {
						base.CheckPowerPwd(articleId, e.value, function() {
							base.ShowWaiting("载入中...");
							base.OpenWindow("articledetail", "articledetail.html", {
								ArticleID: articleId,
								Source: Source
							});
						});
					}
				})
			} else {
				base.ShowWaiting("载入中...");
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
		base.ShowWaiting("校验中...");
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
	 * 拼接文章Html(ismy:是否我的,isuser:是否用户,islazyload:是否延迟加载)
	 */
	this.AppendArticle = function(item, ismy, isuser, islazyload) {
		var div = document.createElement('div');
		div.className = 'mui-card';
		div.setAttribute("id", "article" + item.ArticleID)
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
			model.push('<div class="mui-media-body f12" style="margin:0px;margin-top:0.2rem;"><span class="fl caaa">');
			if(base.IsNullOrEmpty(item.City)) {
				model.push(item.CreateDate);
			} else {
				model.push(item.CreateDate + '<span style="margin-left:10px;margin-right:10px;">来自</span> ' + item.City);
			}
			model.push('</span><span style="border:1px solid #ff6900;color:#ff6900;border-radius:5px;padding:2px 5px;margin-top:-0.1rem;" class="f11 fr">' + power + '</span>');
			model.push('</div></div>');
		} else {
			if(isuser) {
				model.push('<div class="mui-card-header mui-card-media"><div class="mui-media-body f12"><span class="fr caaa">');
				if(base.IsNullOrEmpty(item.City)) {
					model.push(item.CreateDate);
				} else {
					model.push(item.CreateDate + '<span style="margin-left:10px;margin-right:10px;">来自</span> ' + item.City);
				}
				model.push('</span></div></div>');
			} else {
				if(islazyload) {
					model.push('<div class="mui-card-header mui-card-media user" userid="' + item.UserID + '"><img data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
				} else {
					model.push('<div class="mui-card-header mui-card-media user" userid="' + item.UserID + '"><img src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
				}

				if(base.IsNullOrEmpty(item.City)) {
					model.push('<div class="mui-media-body f13">' + item.NickName + '<span class="fr caaa">' + item.CreateDate + '</span></div></div>');
				} else {
					model.push('<div class="mui-media-body f13 mt0">' + item.NickName + '<p class="f11 full caaa mt5">' + item.CreateDate + '<span style="margin-left:10px;margin-right:10px;">来自</span> ' + item.City + '</p></div></div>');
				}
			}
		}

		model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

		model.push('<p class="c333 fl article full mt5 mb10 f15" articleid="' + item.ArticleID + '" userid="' + item.UserID + '" power="' + item.ArticlePower + '">');
		if(item.Tag == 99) {
			model.push('<span class="fl f12" style="padding:1px;border-radius:5px;background:#ff0000;color:#fff;margin-right:5px;">精</span>');
		}
		if(base.IsNullOrEmpty(item.Title)) {
			item.Title = "我的GO";
		}
		model.push(item.Title + '</p>');

		//部分拼接 
		var parts = item.ArticlePart;
		if(parts.length == 1) {
			if(islazyload) {
				model.push('<div class="onefloor"><img data-lazyload="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			} else {
				model.push('<div class="onefloor"><img src="' + base.ShowThumb(parts[0].Introduction, 1) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
			}
		} else {
			var name = parts.length == 3 ? "thirdfloor" : "secondfloor";
			for(var i = 0; i < parts.length; i++) {
				if(islazyload) {
					model.push('<div class="' + name + '"><img data-lazyload="' + base.ShowThumb(parts[i].Introduction, 2) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				} else {
					model.push('<div class="' + name + '"><img src="' + base.ShowThumb(parts[i].Introduction, 2) + '" data-preview-src="" data-preview-group="' + item.ArticleID + '" /></div>');
				}
			}
		}
		model.push('</div></div>');
		model.push('<div class="mui-card-footer fl full">');
		model.push('<span style="border:1px solid #459df5;color:#459df5;border-radius:5px;padding:2px 5px;margin:0px;" class="f11 fl">' + (item.TypeName == "" ? "其它" : item.TypeName) + '</span><span class="f11">' + item.Views + '次阅 · ' + item.Comments + '评论 · ' + item.Goods + '喜欢 · ' + item.Pays + '打赏</span></div>');
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
	this.ShareLog = function(userid, articleid, source) {
		HttpGet(base.RootUrl + "ShareLog/Edit", {
			ID: userid,
			ArticleID: articleid,
			Source: source
		}, function(data) {

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
 * Slider切换动态触发
 **/
function ChangeSlider(index) {
	mui('#slider').slider().gotoItem(index);
}

//编辑器弹窗
function EditorTan(index) {
	if(index == 0) {
		$(".emojionearea").removeClass("bounceIn").addClass("bounceOut").addClass("hide");
	} else {
		$(".emojionearea").removeClass("hide").removeClass("bounceOut").addClass("bounceIn");
	}
}