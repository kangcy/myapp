//切换音乐
function ChangeMusic() {
	base.AddClass(["#music0", "#music1"], "hide");
	MusicID = "music" + (CurrTemplate == 0 ? 0 : 1);
	if(!base.IsNullOrEmpty(MusicUrl)) {
		if(Article.AutoMusic == 1) {
			document.addEventListener('touchstart', startsound);
		}
		base.Get("music" + (CurrTemplate == 0 ? 0 : 1)).classList.remove("hide");
	}
}

//背景状态切换
function ChangeBg() {
	if(CurrTemplate == 0) {
		base.Get("x-avatar").classList.add("hide");
		base.Get("x-article").classList.remove("tc");
		base.Get("x-article").classList.add("tl");
		base.Get("nickname0").classList.remove("hide");
		base.Get("desc").classList.remove("temp");
	} else {
		base.Get("x-avatar").classList.remove("hide");
		base.Get("x-article").classList.remove("tl");
		base.Get("x-article").classList.add("tc");
		base.Get("nickname1").classList.remove("hide");
		base.Get("desc").classList.add("temp");
	}

	ChangeMusic();

	//纯白背景
	if(CurrTemplate == 0) {

		$wrapper.style.backgroundColor = "";
		$wrapper1.style.background = "";
		$cover.style.backgroundColor = "";
		$wrapper2.style.background = "";
	} else if(CurrTemplate > 1) {
		//模板 
		base.Get("x-avatar").style.paddingTop = CurrTemplateJson.MarginTop + "rem";
		$cover.style.backgroundColor = CurrTemplateJson.Transparency;

		if(CurrTemplateJson.CoverFixed == 0) {
			if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundImage)) {
				$wrapper1.style.backgroundImage = "url(" + CurrTemplateJson.BackgroundImage + ")";
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundRepeat)) {
					$wrapper1.style.backgroundRepeat = CurrTemplateJson.BackgroundRepeat;
				}

				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundSize)) {
					$wrapper1.style.backgroundSize = CurrTemplateJson.BackgroundSize;
				}
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Background)) {
				$wrapper.style.background = CurrTemplateJson.Background;
				if(!CurrTemplateJson.Background.startWith("#") && !CurrTemplateJson.Background.startWith("rgba")) {
					$wrapper.style.background = base.BrowserName() + CurrTemplateJson.Background;
				}
			}
		} else if(CurrTemplateJson.CoverFixed == 1) {
			if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundImage)) {
				$wrapper2.style.backgroundImage = "url(" + CurrTemplateJson.BackgroundImage + ")";
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundRepeat)) {
					$wrapper2.style.backgroundRepeat = CurrTemplateJson.BackgroundRepeat;
				}
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundSize)) {
					$wrapper2.style.backgroundSize = CurrTemplateJson.BackgroundSize;
				}
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Background)) {
				if(CurrTemplateJson.Background.startWith("#") || CurrTemplateJson.Background.startWith("rgba")) {
					$wrapper2.style.backgroundColor = CurrTemplateJson.Background;
				} else {
					$wrapper2.style.background = CurrTemplateJson.Background;
					$wrapper2.style.background = base.BrowserName() + CurrTemplateJson.Background;
				}
			}
			$wrapper2.classList.remove("hide");
		}
	} else {
		//自定义
		$wrapper.style.backgroundColor = "transparent";
		$wrapper1.style.background = "";
		if(CurrBackground == null) {
			//全屏
			$wrapper2.style.background = "";
			$wrapper2.className = "";
		} else {
			//背景透明度
			$cover.style.backgroundColor = "RGBA(255, 255, 255, " + (100 - CurrBackground.Transparency) / 100 + ")";
			var url = CurrBackground.Url;
			if(CurrBackground.High == 0) {
				url = base.ShowThumb(url, 1);
			} else {
				url = base.ShowThumb(url, 0);
			}
			$wrapper2.className = "";
			switch(CurrBackground.Full) {
				case 0:
					//居顶 
					$wrapper2.style.background = "url(" + url + ") no-repeat top center";
					$wrapper2.style.backgroundSize = "100% 15.5rem";
					break;
				case 1:
					//全屏
					$wrapper2.style.background = "url(" + url + ") center center no-repeat";
					$wrapper2.style.backgroundSize = "cover";
					//$wrapper2.style.backgroundSize = "100% auto";
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
	base.Get("footer_comment").innerHTML = Article.Comments;
}

//重新加载数据 
function UpdateDetail() {
	Load(function() {
		mui.later(function() {
			plus.webview.close("articlepreview", "none");
			plus.webview.close("addarticle", "none");
			plus.webview.close("sharesetting");
			plus.webview.show("articledetail", "fade-in");
		}, 500);
	});
}

//删除
function Delete() {
	mask.close();
	var btnArray = ['确定', '取消'];
	mui.confirm('删除后将无法在浏览器中浏览', '确定要删除这篇文章吗？', btnArray, function(e) {
		if(e.index < 0) {
			return;
		}
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Article/Delete", {
				ID: userinfo.ID,
				ArticleID: ArticleID
			}, function(data) {
				setTimeout(function() {
					if(data != null) {
						if(data.result) {
							userinfo.Articles -= 1;
							localStorage.setItem('$userinfo', JSON.stringify(userinfo));
							base.RefreshUser();

							plus.webview.close("articledetail");
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
	mui('#topPopover').popover('hide');
	mask.show();
	base.ShowWaiting("正在复制");
	var position = base.GetCurrentPosition();
	HttpGet(base.RootUrl + "Article/Copy", {
		ID: userinfo.ID,
		ArticleID: ArticleID,
		Province: position.Province,
		City: position.City,
		District: position.District,
		Street: position.Street,
		DetailName: position.DetailName,
		CityCode: position.CityCode,
		Latitude: position.Latitude,
		Longitude: position.Longitude
	}, function(data) {
		mui.later(function() {
			mask.close();
			mui.toast(data.result ? "复制成功,前往我的动态查看" : data.message);
			isLoading = false;
			if(data.result) {
				base.OpenWindow("article", "article.html", {
					CreateUserNumber: userinfo.Number,
					ArticleTypeName: "我的动态",
					Source: "My"
				});

				userinfo.Articles += 1;
				localStorage.setItem('$userinfo', JSON.stringify(userinfo));
				base.RefreshUser();
			}
		}, 500);
	});
}

//编辑 
function Edit() {
	stopsound();
	mui('#topPopover').popover('hide');
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
	stopsound();
	mask.close();
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
	HttpGet(base.RootUrl + "Api/Keep/Edit", {
		ID: userinfo.ID,
		ArticleID: ArticleID
	}, function(data) {
		data = JSON.parse(data);
		base.CheckLogin(userinfo, data.code);
		if(data != null) {
			if(data.result) {
				base.Get("iskeep").classList.remove("hide");
				base.Get("isnotkeep").classList.add("hide");
				userinfo.Keeps += 1;
				localStorage.setItem('$userinfo', JSON.stringify(userinfo));
				base.RefreshUser();
			}
			mui.toast(data.result ? "收藏成功,在[收藏]中可以找到Ta哦!" : data.message);
		} else {
			mui.toast("失败");
		}
		isLoading = false;
	});
}

//取消收藏
function OutKeep() {
	mui.confirm('确认取消收藏？', '', ['确认', '取消'], function(e) {
		if(e.index < 0) {
			return;
		}
		if(e.index == 0) {
			HttpGet(base.RootUrl + "Api/Keep/Delete", {
				ID: userinfo.ID,
				ArticleNumber: Article.Number
			}, function(data) {
				data = JSON.parse(data);
				base.CheckLogin(userinfo, data.code);
				if(data != null) {
					if(data.result) {
						base.Get("iskeep").classList.add("hide");
						base.Get("isnotkeep").classList.remove("hide");
						userinfo.Keeps -= 1;
						if(userinfo.Keeps < 0) {
							userinfo.Keeps = 0;
						}
						localStorage.setItem('$userinfo', JSON.stringify(userinfo));
						base.RefreshUser();
					}
					mui.toast(data.result ? "" : data.message);
				} else {
					mui.toast("失败");
				}
				isLoading = false;
			});
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

//投稿审核操作
function UpdateAction() {
	base.AddClass(["#popover_delete", "#popover_edit", "#popover_power"], "hide");
	plus.webview.close("sharesetting");
}