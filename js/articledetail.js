//切换音乐
function ChangeMusic(index) {
	MusicID = "music" + index;
	if(!base.IsNullOrEmpty(MusicUrl)) {
		if(Article.AutoMusic == 1) {
			document.addEventListener('touchstart', startsound);
		}
		$("#music0,#music1").removeClass("hide");
	} else {
		$("#music0,#music1").addClass("hide");
	}
}

//背景状态切换
function ChangeBg() {
	var $bg = $("#bg");
	if(CurrTemplate > 0) {
		if(CurrTemplate == 1) {
			$("#bg").css({
				"background": "none",
			});
			$bg = $("#wrapper");
		} else {
			$("#wrapper").css({
				"background-image": "none",
			});
			$bg = $("#bg");
		}
	}

	//纯白背景
	if(CurrTemplate == 0) {
		$bg.css("background", "#fff");
	} else if(CurrTemplate > 1) {
		$bg.css({
			"background": "url(" + CurrCover + ") top center no-repeat",
			"background-size": "100% auto"
		});
	} else {
		if(CurrBackground == null) {
			//全屏
			$("#bg").css("background", "#fff");
		} else {
			var url = CurrBackground.Url;
			if(CurrBackground.High == 0) {
				url = base.ShowThumb(url, 1);
			} else {
				url = base.ShowThumb(url, 0);
			}
			switch(CurrBackground.Full) {
				case 0:
					//居顶 
					$bg.css({
						"background": "url(" + url + ") no-repeat top center",
						"background-size": "100% auto"
					});
					break;
				case 1:
					//全屏
					$bg.css({
						"background": "url(" + url + ") center center no-repeat",
						"background-size": "100% 100%",
					});
					break;
				default:
					break;
			}
		}
	}
}

//更新文章评论数
function UpdateComment() {
	Article.Comments += 1;
	$("#footer_comment").html(Article.Comments);
}

//重新加载数据 
function UpdateDetail() {
	Load(function() {
		plus.webview.close("addarticle");
	});
}

//删除
function Delete() {
	ActionTan(0);
	var btnArray = ['确定', '取消'];
	mui.confirm('删除后将无法在浏览器中浏览', '确定要删除这篇文章吗？', btnArray, function(e) {
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Article/Delete", {
				ID: userinfo.ID,
				ArticleID: ArticleID
			}, function(data) {
				setTimeout(function() {
					if(data != null) {
						if(data.result) {
							plus.webview.close("articledetail");
							/*var articlePage = plus.webview.getWebviewById("articleSub");
							if(articlePage) {
								articlePage.evalJS("Delete(" + ArticleID + ")");
							}*/
						}
					}
				}, 500);
			});
		}
	});
}

//复制
function Copy() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	ActionTan(0);
	mask.show();
	base.ShowWaiting("正在复制");
	HttpGet(base.RootUrl + "Article/Copy", {
		ID: userinfo.ID,
		ArticleID: ArticleID,
		Province: base.Province,
		City: base.City,
		District: base.District,
		Street: base.Street,
		DetailName: base.DetailName,
		CityCode: base.CityCode,
		Latitude: base.Latitude,
		Longitude: base.Longitude
	}, function(data) {
		mui.later(function() {
			mask.close();
			mui.toast(data.result ? "复制成功,请刷新我的动态查看" : data.message);
			isLoading = false;
		}, 500);
	});
}

//编辑 
function Edit() {
	ActionTan(0);
	mask.show();
	base.ShowWaiting("正在同步文章内容");
	base.OpenWindow("addarticle", "addarticle.html", {
		ArticleID: ArticleID,
		ArticleNumber: Article.Number,
		Source: Source
	});
	mui.later(function() {
		mask.close();
	}, 2000);
}

//权限
function Power() {
	ActionTan(0);
	base.OpenWindow("sharesetting", "sharesetting.html", {
		ArticleID: ArticleID,
		ArticleNumber: Article.Number,
		ArticlePower: Article.ArticlePower,
		ArticlePowerPwd: Article.ArticlePowerPwd,
		ArticleType: Article.TypeID,
		ArticleTypeName: Article.TypeName
	});
}

//收藏
function Keep() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	HttpGet(base.RootUrl + "Keep/Edit", {
		ID: userinfo.ID,
		ArticleID: ArticleID
	}, function(data) {
		if(data != null) {
			if(data.result) {
				$("#iskeep,#isnotkeep").toggleClass("hide");
				userinfo.Keeps += 1;
				localStorage.setItem('$userinfo', JSON.stringify(userinfo));
			}
			mui.toast(data.result ? "收藏成功" : data.message);
		}
		isLoading = false;
	});
}

//取消收藏
function OutKeep() {
	mui.confirm('确认取消收藏？', '', ['确认', '取消'], function(e) {
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Keep/Delete", {
				ID: userinfo.ID,
				ArticleNumber: Article.Number
			}, function(data) {
				if(data != null) {
					if(data.result) {
						$("#iskeep,#isnotkeep").toggleClass("hide");
						userinfo.Keeps -= 1;
						if(userinfo.Keeps < 0) {
							userinfo.Keeps = 0;
						}
						localStorage.setItem('$userinfo', JSON.stringify(userinfo));
					}
					mui.toast(data.result ? "已取消收藏" : data.message);
				}
				isLoading = false;
			});
		}
	});
}

//加载模板
function LoadTemplate() {
	HttpGet(base.RootUrl + "Article/Template", {}, function(data) {
		if(data != null) {
			var length = data.records;
			if(length > 0) {
				var table = $('#temp');
				var index = 0;
				for(var i = 0, len = data.list.length; i < len; i++) {
					index += 1;
					var item = data.list[i];
					table.append('<div class="mui-control-item temp ' + (item.ID == CurrTemplate ? "hover" : "") + '" tid="' + item.ID + '" color="' + item.Background + '" cover="' + item.Cover + '" type="' + item.TemplateType + '"><img src="' + item.ThumbUrl + '" /></div>');
				}
			}
		}
	});
}

//重新加载数据
function UpdatePower(ArticlePower, ArticlePowerPwd, ArticleType, ArticleTypeName) {
	Article.ArticlePower = ArticlePower;
	Article.ArticlePowerPwd = ArticlePowerPwd;
	Article.TypeID = ArticleType;
	Article.TypeName = ArticleTypeName;
}