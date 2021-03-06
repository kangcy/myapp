var ArticleNumber = "";
var ArticleID = 0;
var ArticleUserNumber = "";
var IsKeep = false;
var IsFan = false;
var isLoading = false;
var bgview = null;
var customview = null;

//操作
function CreateActionView() {
	//绘制背景
	bgview = new plus.nativeObj.View('bgview', {
		top: '0px',
		left: '0px',
		height: '100%',
		width: '100%',
		backgroundColor: 'rgba(0,0,0,0.5)'
	});

	//绘制底部区域
	customview = new plus.nativeObj.View('customview', {
		left: '0px',
		bottom: '0px',
		width: '100%',
		height: '200px',
		backgroundColor: '#fff'
	});

	//绘制底部边线
	customview.draw([{
			tag: 'rect',
			id: 'line1',
			color: '#f5f5f5',
			position: {
				bottom: '50px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'rect',
			id: 'line2',
			color: '#f5f5f5',
			position: {
				bottom: '100px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'rect',
			id: 'line3',
			color: '#f5f5f5',
			position: {
				bottom: '150px',
				left: '0px',
				width: '100%',
				height: '1px'
			}
		},
		{
			tag: 'font',
			id: 'font1',
			text: '添加收藏',
			textStyles: {
				size: '16px',
				color: '#000'
			},
			position: {
				bottom: '150px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font2',
			text: '添加关注',
			textStyles: {
				size: '16px',
				color: '#000'
			},
			position: {
				bottom: '100px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font3',
			text: '举报',
			textStyles: {
				size: '16px',
				color: '#ff0000'
			},
			position: {
				bottom: '50px',
				height: '50px'
			}
		},
		{
			tag: 'font',
			id: 'font4',
			text: '取消',
			textStyles: {
				size: '16px',
				color: '#ff0000'
			},
			position: {
				bottom: '0px',
				height: '50px'
			}
		}
	]);

	bgview.interceptTouchEvent(true);
	customview.interceptTouchEvent(true);

	//关闭
	bgview.addEventListener("click", function(e) {
		HideView();
	}, false);
	customview.addEventListener("click", function(e) {
		//相对容器位置
		var y = e.clientY;
		if(y <= 50) {
			//收藏
			if(IsKeep) {
				OutKeep();
			} else {
				Keep()
			}
		} else if(y > 50 && y <= 100) {
			//关注
			if(IsFan) {
				OutFollow();
			} else {
				Follow();
			}
		} else if(y > 100 && y <= 150) {
			//举报
			Report();
		}
		//取消
		HideView();
	}, false);
}

//子窗口弹窗
function ActionTan(show, articleNumber, articleId, articleUserNumber) {
	ArticleNumber = articleNumber;
	ArticleID = articleId;
	ArticleUserNumber = articleUserNumber;

	var item = base.Get("article" + ArticleID);

	/*//判断收藏
	IsKeep = item.getAttribute("iskeep") == 0 ? false : true;
	customview.drawText(IsKeep ? "取消收藏" : "添加收藏", {
		bottom: '150px',
		height: '50px'
	}, {
		size: '16px',
		color: '#000'
	}, 'font1');

	//判断关注
	IsFan = item.getAttribute("isfollow") == 0 ? false : true;
	customview.drawText(IsFan ? "取消关注" : "添加关注", {
		bottom: '100px',
		height: '50px'
	}, {
		size: '16px',
		color: '#000'
	}, 'font2');

	ShowView();*/
}

//收藏
function Keep() {
	if(base.RepeatAction()) {
		return;
	}
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
			mui.toast(data.result ? "收藏成功,在[收藏]中可以找到Ta哦!" : data.message);
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
	var item = base.Get("article" + ArticleID);
	mui.confirm('确定取消收藏？', '', ['确定', '取消'], function(e) {
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
						if(self.id == "keep") {
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
				base.Get("guanzhu" + ArticleID).setAttribute("src", "../images/base/follow1.png");
				base.Get("guanzhu" + ArticleID).classList.remove("guanzhu");
				base.UpdateFan(userinfo, data.message);
			}
			mui.toast(data.result ? "关注成功,在[关注]中可以找到Ta哦!" : data.message);
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
	HttpGet(base.RootUrl + "Api/Fan/Delete", {
		ID: userinfo.ID,
		ToUserNumber: ArticleUserNumber
	}, function(data) {
		data = JSON.parse(data);
		if(data.result) {
			var item = base.Get("article" + ArticleID);
			item.setAttribute("isfollow", 0);
			base.Get("guanzhu" + ArticleID).setAttribute("src", "../images/base/follow0.png");
			base.Get("guanzhu" + ArticleID).classList.remove("guanzhu2");
			base.Get("guanzhu" + ArticleID).classList.add("guanzhu");
			base.UpdateFan(userinfo, data.message);
		} else {
			mui.toast(data.message);
		}
	});
}

//举报
function Report() {
	base.OpenWindow("edittext", "edittext.html", {
		source: "report",
		ArticleNumber: ArticleNumber
	});
}

/**
 * 拼接文章Html(ismy:是否我的,isuser:是否用户,islazyload:是否延迟加载,isdel:是否有左滑操作)
 */
function AppendArticle(userNumber, item, ismy, isuser, islazyload, isdel) {
	var div = document.createElement('div');
	div.className = 'mui-card inline article';
	div.style.margin = "3% 3% 0";

	div.setAttribute("articleid", item.ArticleID);
	div.setAttribute("userid", item.UserNumber);
	div.setAttribute("power", item.ArticlePower);
	div.setAttribute("nickname", item.NickName);

	div.setAttribute("iskeep", item.IsKeep); //是否收藏
	div.setAttribute("isfollow", item.IsFollow); //是否关注
	div.setAttribute("id", "article" + item.ArticleID);

	var model = [];

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

		//加精、置顶
		/*if(item.Recommend == 99) {
			model.push('<div class="c999 f11 star">');
			model.push('<img src="../images/article/star.png" class="fl" /><span class="fl">精华</span>');
			model.push('<div style="width:1.5rem;height:100%;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><a class="mui-action-menu mui-icon mui-icon-arrowdown fr f16 mt10 c999"></a></div></div>');
		} else if(item.Recommend == 100) {
			model.push('<div class="c999 f11 star">');
			model.push('<img src="../images/article/top.png" class="fl" /><span class="fl">置顶</span>');
			model.push('<div style="width:1.5rem;height:100%;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><a class="mui-action-menu mui-icon mui-icon-arrowdown fr f16 mt10 c999"></a></div></div>');
		}*/

		//用户
		model.push('<div class="mui-card-header noborder mui-card-media">');

		if(islazyload) {
			model.push('<img class="user" userid="' + item.UserNumber + '" nickname="' + item.NickName + '"avatar="' + item.Avatar + '"cover="' + item.UserCover + '" onload="StorageImg(this)" src="../images/avatar.png" data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
		} else {
			model.push('<img class="user" userid="' + item.UserNumber + '" nickname="' + item.NickName + '"avatar="' + item.Avatar + '"cover="' + item.UserCover + '"src="' + base.ShowThumb(item.Avatar, 1) + '" style="border-radius:50%;width:2rem !important;height:2rem !important;" />');
		}

		model.push('<div class="mui-media-body f14 mt0" style="position:relative;"><span class="user c333" userid="' + item.UserNumber + '"nickname="' + item.NickName + '"avatar="' + item.Avatar + '"cover="' + item.UserCover + '">' + base.UnUnicodeText(item.NickName) + '</span><p class="f10 full mt1">');
		model.push('<span>' + item.CreateDate + '</span>');
		if(!base.IsNullOrEmpty(item.City)) {
			model.push('<span class="blue ml5">' + item.Province + ' • ' + item.City + '</span>');
		}
		model.push('</p>');
		//如果是自己隐藏关注按钮
		if(userNumber != "" && userNumber != item.UserNumber) {
			model.push('<img id="guanzhu' + item.ArticleID + '" class="' + (item.IsFollow == 0 ? "guanzhu" : "guanzhu2") + '" userid="' + item.UserNumber + '" articleid="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '" src="../images/base/' + (item.IsFollow == 0 ? "follow0" : "follow1") + '.png" style="position:absolute;right:0px;top:0.3rem;width:3.8rem;" />');
		}
		model.push('</div></div></div>');
	}

	//内容·
	model.push('<div class="mui-card-content show"><div class="mui-card-content-inner">');

	model.push('<div class="c333 fl full mb10 f12" style="line-height:1.3rem;">');

	model.push('<div class="c333 fl article f12" style="width:100%;display:inline-block;" articleid="' + item.ArticleID + '" userid="' + item.UserNumber + '" power="' + item.ArticlePower + '" nickname="' + item.NickName + '">');
	if(base.IsNullOrEmpty(item.Title)) {
		item.Title = "我的小微篇";
	}
	model.push(base.UnUnicodeText(item.Title) + '</div>');

	model.push("</div>");

	//图片拼接 
	var parts = item.ArticlePart;
	model.push('<div class="inline full">');
	if(parts.length == 0) {
		if(islazyload) {
			model.push('<div class="onefloor" href="' + base.ShowThumb(item.Cover, 0) + '" articleid="' + item.ArticleID + '"><img onload="StorageImg(this)" src="../images/default.png" data-lazyload="' + base.ShowThumb(item.Cover, 2) + '" /></div>');
		} else {
			model.push('<div class="onefloor" href="' + base.ShowThumb(item.Cover, 0) + '" articleid="' + item.ArticleID + '"><img src="' + base.ShowThumb(item.Cover, 2) + '" /></div>');
		}
	} else {
		if(parts.length == 1) {
			if(islazyload) {
				model.push('<div class="onefloor" href="' + base.ShowThumb(parts[0].Introduction, 0) + '" articleid="' + item.ArticleID + '"><img onload="StorageImg(this)" src="../images/default.png" data-lazyload="' + base.ShowThumb(parts[0].Introduction, 2) + '" /></div>');
			} else {
				model.push('<div class="onefloor" href="' + base.ShowThumb(parts[0].Introduction, 0) + '" articleid="' + item.ArticleID + '"><img src="' + base.ShowThumb(parts[0].Introduction, 2) + '" /></div>');
			}
		} else {
			var name = parts.length == 3 ? "thirdfloor" : "secondfloor";
			for(var i = 0; i < parts.length; i++) {
				if(islazyload) {
					model.push('<div class="' + name + '" href="' + base.ShowThumb(parts[i].Introduction, 0) + '" articleid="' + item.ArticleID + '"><img onload="StorageImg(this)" src="../images/default.png" data-lazyload="' + base.ShowThumb(parts[i].Introduction, 2) + '" /></div>');
				} else {
					model.push('<div class="' + name + '" href="' + base.ShowThumb(parts[i].Introduction, 0) + '" articleid="' + item.ArticleID + '"><img src="' + base.ShowThumb(parts[i].Introduction, 2) + '" /></div>');
				}
			}
		}
	}
	model.push('</div></div></div>');

	model.push('<div class="mui-card-footer fl full c333 f11 inline">');
	var style = "height:1.5rem;display:inline-block;";

	model.push('<div style="' + style + '" class="fl tl"><img src="../images/article/view.png" style="width:1rem;" class="ml5 mr5 fl" /><span class="f13 fl mr10">' + item.Views + '</span></div>');
	model.push('<div style="' + style + '" class="fl tl goods ' + (item.IsZan == 0 ? "" : "red") + '" articleid="' + item.ArticleID + '" already="' + (item.IsZan == 0 ? 0 : 1) + '"><img src="../images/article/' + (item.IsZan == 0 ? "btn_good" : "btn_good2") + '.png" style="width:0.9rem;" class="ml5 mr5 fl" /><span class="f13 fl mr10">' + item.Goods + '</span></div>');
	model.push('<div style="' + style + '" class="comments fl tl" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '"><img id="icomments' + item.ArticleID + '" src="../images/article/btn_comment.png" style="width:0.9rem;" class="mt1 fl ml5 mr10" /><span class="f13 fl mr10" >' + item.Comments + '</span></div>');
	/*if(item.IsPay == 1) {
		model.push('<div style="' + style + '" class="pays fl tl" articleid="' + item.ArticleID + '" ArticleNumber="' + item.ArticleNumber + '" UserNumber="' + item.UserNumber + '" NickName="' + item.NickName + '" Avatar="' + item.Avatar + '" articleid="' + item.ArticleID + '"><img id="ipays' + item.ArticleID + '" src="../images/article/btn_pay.png" style="width:0.9rem;" class="mt1 ml5" /></div>');
	}*/

	if(userNumber != "" && userNumber != item.UserNumber) {
		model.push('<div style="width:1.5rem;height:100%;" class="fr tanaction" articleId="' + item.ArticleID + '" articleNumber="' + item.ArticleNumber + '" articleUserNumber="' + item.UserNumber + '"><img src="../images/article/btn_more.png" style="width:1rem;" class="mt1" /></div>');
	}
	model.push('</div>');
	div.innerHTML = model.join('');
	return div;
}

//文章列表操作(关注、点赞、评论、打赏)
function ArticleAction(id, userinfo) {
	//ArticleAddZan(id, userinfo);
	//ArticleAddPay(id, userinfo);
	//ArticleAddComment(id, userinfo);
	ArticleAddGuanZhu(id, userinfo, function() {
		mui.toast("关注成功,在[关注]中可以找到Ta哦!");
	});
	ArticleOutGuanZhu(id, userinfo);

	//图片预览
	mui(id).on('tap', '.onefloor,.secondfloor,.thirdfloor', function() {
		if(isLoading) {
			return false;
		}
		isLoading = true;
		base.TriggerMain = true;
		mui.later(function() {
			base.TriggerMain = false;
		}, 500);
		var href = this.getAttribute('href');
		var CurrID = 0;
		base.PreviewImageList = [];
		mui.each(this.parentNode.childNodes, function(i, item) {
			if(href == item.getAttribute('href')) {
				CurrID = i;
			}
			base.PreviewImageList.push(item.getAttribute('href'));
		});
		PreviewImage(CurrID);
		isLoading = false;
	});

	mui(id).on('tap', '.tanaction', function() {
		if(isLoading) {
			return false;
		}
		isLoading = true;
		base.TriggerMain = true;
		mui.later(function() {
			base.TriggerMain = false;
		}, 500);
		ArticleNumber = this.getAttribute("articleNumber");
		ArticleID = this.getAttribute("articleId");
		ArticleUserNumber = this.getAttribute("articleUserNumber");
		var item = base.Get("article" + ArticleID);
		var iskeep = item.getAttribute("iskeep");
		var isfollow = item.getAttribute("isfollow")
		var ismy = ArticleUserNumber == userinfo.Number ? 1 : 0;
		var view = base.GetView("action");
		if(view) {
			view.evalJS("ResetAction(2,'" + PageName + "','" + iskeep + "','" + isfollow + "','" + ismy + "')");
		} else {
			base.OpenWindow("action", "action.html", {
				Type: 2,
				PageName: PageName,
				IsKeep: iskeep,
				IsFollow: isfollow,
				IsMy: ismy
			}, "none", false, false, "transparent");
		}
		isLoading = false;
	});
}

//文章列表添加点赞
function ArticleAddZan(id, userinfo) {
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
						$this.classList.remove("red");
						$this.classList.remove("heartbeat");
						$this.childNodes[0].setAttribute("src", "../images/article/btn_good.png");
						var num = parseInt($this.childNodes[1].innerHTML);
						$this.childNodes[1].innerHTML = num - 1 < 0 ? 0 : num - 1;
					} else {
						$this.setAttribute("already", "1");
						$this.childNodes[0].setAttribute("src", "../images/article/btn_good2.png");
						var num = parseInt($this.childNodes[1].innerHTML);
						$this.childNodes[1].innerHTML = num + 1;
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

//文章列表打赏
function ArticleAddPay(id, userinfo) {
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

//文章列表添加评论
function ArticleAddComment(id, userinfo) {
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

//关注
function ArticleAddGuanZhu(id, userinfo, callback) {
	mui(id).on('tap', '.guanzhu', function(event) {
		if(isLoading) {
			return false;
		}
		isLoading = true;
		base.TriggerMain = true;
		mui.later(function() {
			base.TriggerMain = false;
		}, 500);
		var $this = this;
		var userId = this.getAttribute("userid");
		var articleId = this.getAttribute("articleid");
		this.classList.remove("guanzhu");
		HttpGet(base.RootUrl + "Api/Fan/Edit", {
			ID: userinfo.ID,
			ToUserNumber: userId
		}, function(data) {
			data = JSON.parse(data);
			base.CheckLogin(userinfo, data.code);
			if(data != null) {
				if(data.result) {
					$this.classList.remove("guanzhu");
					$this.classList.add("guanzhu2");
					$this.setAttribute("src", "../images/base/follow1.png");
					base.UpdateFan(userinfo, data.message);
					base.Get("article" + articleId).setAttribute("isfollow", 1);
					if(callback) {
						callback($this);
					}
				} else {
					mui.toast(data.message);
					$this.classList.add("guanzhu");
				}
			} else {
				mui.toast("失败");
				$this.classList.add("guanzhu");
			}
			isLoading = false;
		});
	});
}

//取消关注
function ArticleOutGuanZhu(id, userinfo, callback) {
	mui(id).on('tap', '.guanzhu2', function(event) {
		if(isLoading) {
			return false;
		}
		isLoading = true;
		base.TriggerMain = true;
		mui.later(function() {
			base.TriggerMain = false;
		}, 500);
		ArticleNumber = this.getAttribute("articlenumber");
		ArticleID = this.getAttribute("articleid");
		ArticleUserNumber = this.getAttribute("articleusernumber");
		OutFollow();
		isLoading = false;
	});
}