var ArticleNumber = "";
var ArticleID = 0;
var subindexPage = null;
var mask = mui.createMask(function() {
	SubIndexPageTan(false);
	document.getElementById("action").classList.remove("mui-active");
	//document.getElementById("action").classList.add("hide");
});

//调用父窗口
function SubIndexPageTan(show) {
	if(!NeedParentPage) {
		return;
	}
	if(subindexPage == null) {
		subindexPage = plus.webview.getWebviewById("subindex");
	}
	subindexPage.evalJS("ActionTan(" + show + ",'" + PageName + "')");
}

//子窗口弹窗
function ActionTan(show, articleNumber, articleId) {
	if(show) {
		ArticleNumber = articleNumber;
		ArticleID = articleId;
		if(PageName != "keep") {
			var item = document.getElementById("article" + ArticleID);
			if(item.getAttribute("iskeep") == 0) {
				document.getElementById("action_keep").classList.remove("hide");
				document.getElementById("action_outkeep").classList.add("hide");
			} else {
				document.getElementById("action_keep").classList.add("hide");
				document.getElementById("action_outkeep").classList.remove("hide");
			}
		}
	}
	if(show) {
		mask.show();
		SubIndexPageTan(show);
		//document.getElementById("action").classList.remove("hide");
		document.getElementById("action").classList.add("mui-active");
	} else {
		mask.close();
		SubIndexPageTan(show);
		document.getElementById("action").classList.remove("mui-active");
		//document.getElementById("action").classList.add("hide");
	}
}

//父窗口关闭回调
function ActionTan2() {
	mask.close();
}

//收藏
function Keep() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	HttpGet(base.RootUrl + "Keep/Edit", {
		ID: userinfo.ID,
		ArticleID: ArticleID
	}, function(data) {
		if(data != null) {
			if(data.result) {
				userinfo.Keeps += 1;
				localStorage.setItem('$userinfo', JSON.stringify(userinfo));
				var item = document.getElementById("article" + ArticleID);
				item.setAttribute("iskeep", 1);
			}
			mui.toast(data.result ? "收藏成功" : data.message);
		}
	});
}

//取消收藏
function OutKeep() {
	if(base.RepeatAction()) {
		return;
	}
	mask.close();
	var item = document.getElementById("article" + ArticleID);
	mui.confirm('确认取消收藏？', '', ['确认', '取消'], function(e) {
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Keep/Delete", {
				ID: userinfo.ID,
				ArticleNumber: ArticleNumber
			}, function(data) {
				if(data) {
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
							var item = document.getElementById("article" + ArticleID);
							item.setAttribute("iskeep", 0);
						}
						localStorage.setItem('$userinfo', JSON.stringify(userinfo));
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
		item.Title = "我的微篇";
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