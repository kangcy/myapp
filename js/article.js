var ArticleNumber = "";
var ArticleID = 0;
var ArticleUserNumber = "";
var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
	mui('#action').popover('hide');
});

//首页调用打开
function OpenMask() {
	mask = base.CreateMask(false, function() {});
	mask.show();
	base.ShowWaiting("");
}

//首页调用关闭
function CloseMask() {
	mask = base.CreateMask(true, function() {
		base.CloseWaiting();
		mui('#action').popover('hide');
	});
	mask.close();
}

//子窗口弹窗
function ActionTan(show, articleNumber, articleId, articleUserNumber) {
	if(show) {
		ArticleNumber = articleNumber;
		ArticleID = articleId;
		ArticleUserNumber = articleUserNumber;

		var item = base.Get("article" + ArticleID);
		//判断收藏
		if(item.getAttribute("iskeep") == 0) {
			base.Get("action_keep").classList.remove("hide");
			base.Get("action_outkeep").classList.add("hide");
		} else {
			base.Get("action_keep").classList.add("hide");
			base.Get("action_outkeep").classList.remove("hide");
		}
		//判断关注
		if(item.getAttribute("isfollow") == 0) {
			base.Get("action_follow").classList.remove("hide");
			base.Get("action_outfollow").classList.add("hide");
		} else {
			base.Get("action_follow").classList.add("hide");
			base.Get("action_outfollow").classList.remove("hide");
		}
		mui('#action').popover('show');
	}
}

//收藏
function Keep() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	HttpGet(base.RootUrl + "Api/Keep/Edit", {
		ID: userinfo.ID,
		ArticleID: ArticleID
	}, function(data) {
		data = JSON.parse(data);
		base.CheckLogin(userinfo, data.code);
		if(data != null) {
			if(data.result) {
				userinfo.Keeps += 1;
				localStorage.setItem('$userinfo', JSON.stringify(userinfo));
				var item = base.Get("article" + ArticleID);
				item.setAttribute("iskeep", 1);
				base.RefreshUser();
			}
			mui.toast(data.result ? "收藏成功" : data.message);
		} else {
			mui.toast("失败");
		}
	});
}

//取消收藏
function OutKeep() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	var item = base.Get("article" + ArticleID);
	mui.confirm('确认取消收藏？', '', ['确认', '取消'], function(e) {
		if(e.index < 0) {
			return;
		}
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Api/Keep/Delete", {
				ID: userinfo.ID,
				ArticleNumber: ArticleNumber
			}, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data != null) {
					if(data.result) {
						if(PageName == "keep") {
							item.parentNode.removeChild(item);
							records = records - 1;
							if(records < 0) {
								records = 0;
							}
							if(records <= 0) {
								base.ShowNone(true);
							}
							userinfo.Keeps = records;
						} else {
							userinfo.Keeps = userinfo.Keeps - 1;
							if(userinfo.Keeps < 0) {
								userinfo.Keeps = 0;
							}
							item.setAttribute("iskeep", 0);
						}
						localStorage.setItem('$userinfo', JSON.stringify(userinfo));
						base.RefreshUser();
					} else {
						mui.toast(data.message);
					}
				} else {
					mui.toast("失败");
				}
			});
		}
	});
}

//关注
function Follow() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	HttpGet(base.RootUrl + "Api/Fan/Edit", {
		ID: userinfo.ID,
		ToUserNumber: ArticleUserNumber
	}, function(data) {
		data = JSON.parse(data);
		base.CheckLogin(userinfo, data.code);
		if(data != null) {
			if(data.result) {
				var item = base.Get("article" + ArticleID);
				item.setAttribute("isfollow", 1);
				base.UpdateFan(userinfo, data.message);
			}
			mui.toast(data.result ? "关注成功" : data.message);
		} else {
			mui.toast("失败");
		}
	});
}

//取消关注
function OutFollow() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	mui.confirm('确认取消关注？', '', ['确认', '取消'], function(e) {
		if(e.index < 0) {
			return;
		}
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Api/Fan/Delete", {
				ID: userinfo.ID,
				ToUserNumber: ArticleUserNumber
			}, function(data) {
				data = JSON.parse(data);
				if(data.result) {
					userinfo.Follows = userinfo.Follows - 1;
					if(userinfo.Follows < 0) {
						userinfo.Follows = 0;
					}
					var item = base.Get("article" + ArticleID);
					item.setAttribute("isfollow", 0);
					localStorage.setItem('$userinfo', JSON.stringify(userinfo));
					base.RefreshUser();
				} else {
					mui.toast(data.message);
				}
			});
		}
	});
}

//举报
function Report() {
	base.OpenWindow("edittext", "edittext.html", {
		source: "report",
		ArticleNumber: ArticleNumber
	});
	mask.close();
}

/**
 * 拼接文章Html(ismy:是否我的,isuser:是否用户,islazyload:是否延迟加载,isdel:是否有左滑操作)
 */
function AppendArticle(userNumber, item, ismy, isuser, islazyload, isdel) {
	var div = document.createElement('div');
	if(isdel) {
		div.className = 'mui-card mui-table-view-cell';
		div.style.padding = "0px";
		div.setAttribute("kid", item.ArticleNumber);
	} else {
		div.className = 'mui-card';
	}
	div.setAttribute("iskeep", item.IsKeep);
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
		model.push('<div class="c999 f10 star mb10"><img src="../images/article/' + name + '" class="fl" /><span class="fl">' + power + '</span><span class="fr">' + item.CreateDate + '</span></div>');
	} else {
		if(isdel) {
			model.push('<div class="mui-slider-cell mui-slider-handle">');
		}

		//加精、置顶
		model.push('<div class="c999 f10 star">');
		if(item.Recommend == 99) {
			model.push('<img src="../images/article/star.png" class="fl" /><span class="fl">精华</span>');
		} else if(item.Recommend == 100) {
			model.push('<img src="../images/article/top.png" class="fl" /><span class="fl">置顶</span>');
		} else {
			model.push('<img src="../images/article/' + name + '" class="fl" /><span class="fl">' + power + '</span>');
		}
		model.push('<div style="width:1.5rem;height:100%;" class="fr" onclick="ActionTan(true,' + item.ArticleNumber + ',' + item.ArticleID + ')"><a class="mui-action-menu mui-icon mui-icon-bars fr f16 mt10"></a></div></div>');

		//用户
		model.push('<div class="mui-card-header noborder mui-card-media user" userid="' + item.UserNumber + '">');
		if(islazyload) {
			model.push('<img data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
		} else {
			model.push('<img src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
		}

		model.push('<div class="mui-media-body f12 mt0" style="position:relative;"><span>' + base.UnUnicodeText(item.NickName) + '</span><p class="f10 full c999 mt5">' + item.CreateDate);
		if(!base.IsNullOrEmpty(item.City)) {
			model.push('<span class="ml5 mr5 c999">来自</span><span class="c999">' + item.Province + ' • ' + item.City + '</span>');
		}
		model.push('</p>');
		//如果是自己隐藏关注按钮
		if(userNumber != "" && userNumber != item.UserNumber) {
			if(item.IsFollow == 0) {
				model.push('<img class="' + (item.IsFollow == 0 ? "guanzhu" : "") + '" userid="' + item.UserNumber + '" src="../images/base/' + (item.IsFollow == 0 ? "follow0" : "follow1") + '.png" style="position:absolute;right:0px;top:2%;width:3rem;" />');
			}
		}
		model.push('</div></div>');
	}

	//内容
	model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

	model.push('<div class="c333 fl article full mb10 f12" style="line-height:1.3rem;" articleid="' + item.ArticleID + '" userid="' + item.UserNumber + '" power="' + item.ArticlePower + '" nickname="' + item.NickName + '">');
	if(base.IsNullOrEmpty(item.Title)) {
		item.Title = "我的小微篇";
	}
	model.push(item.Title + '</div>');

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

	model.push('<div class="mui-card-footer fl full c999 f10" style="display:inline-block;"><span class="fl mt1">浏览' + item.Views + '次</span>');
	if(item.IsPay == 1) {
		model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="pays fr tc" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '" UserNumber="' + item.UserNumber + '" NickName="' + item.NickName + '" Avatar="' + item.Avatar + '" articleid="' + item.ArticleID + '"><img id="ipays' + item.ArticleID + '" src="../images/base/reward_nor.png" style="width:0.8rem;" class="mt1" /></div>');
	}
	model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="comments fr tc" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '"><img id="icomments' + item.ArticleID + '" src="../images/base/comment_nor.png" style="width:0.8rem;" class="mt1" /></div>');
	if(item.IsZan == 0) {
		model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="fr tc"><img src="../images/base/like_nor.png" style="width:0.8rem;" class="mr10 fr goods" articleid="' + item.ArticleID + '" /></div>');
	} else {
		model.push('<div style="width:2.5rem;height:1.5rem;display:inline-block;" class="fr tc"><img src="../images/base/like_hig.png" style="width:0.8rem;" class="mr10 fr" articleid="' + item.ArticleID + '"  /></div>');
	}
	model.push('</div>');

	if(isdel) {
		model.push('</div>');
	}
	div.innerHTML = model.join('');
	return div;
}