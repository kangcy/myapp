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
		base.Get("nickname1").classList.add("hide");
		base.Get("nickname0").classList.remove("hide");
		base.Get("x-content").classList.remove("mt10");
		$head.style.marginTop = "1rem";
	} else {
		base.Get("x-avatar").classList.remove("hide");
		base.Get("x-article").classList.remove("tl");
		base.Get("x-article").classList.add("tc");
		base.Get("nickname0").classList.add("hide");
		base.Get("nickname1").classList.remove("hide");
		base.Get("x-content").classList.add("mt10");
		$head.style.marginTop = "3rem";
	}

	mui.each(mui(".edit"), function(i, item) {
		item.classList.remove("well2");
	})

	//容器间距
	switch(CurrTemplateJson.PaddingFixed) {
		case 0:
			$body.classList.add("well2");
			$edit.classList.add("temp");
			break;
		case 1:
			$edit.classList.remove("temp");
			$body.classList.add("well2");
			break;
		case 2:
			$body.classList.remove("well2");
			$edit.classList.add("temp");
			break;
		case 3:
			$body.classList.remove("well2");
			$edit.classList.remove("temp");
			mui.each(mui(".edit"), function(i, item) {
				item.classList.add("well2");
			})
			break;
		default:
			$body.classList.add("well2");
			$edit.classList.add("temp");
			break;
	}
	ChangeMusic();
	//UpdateShowy(CurrTemplateJson.Showy);

	$top.classList.add("hide");
	$bottom.classList.add("hide");
	$body.style.margin = "0";
	$wrapper.style.color = "#333";
	$wrapper.style.backgroundColor = "";
	$wrapper1.classList.remove("x-cover");
	$wrapper1.style.background = "";
	$cover.style.backgroundColor = "";
	$cover1.style.backgroundColor = "";
	$wrapper2.classList.add("hide");
	$wrapper21.classList.add("hide");
	$wrapper2.style.background = "";
	$wrapper2.style.opacity = "1";
	$wrapper21.style.background = "";
	$wrapper21.style.opacity = "0";
	$avatarbg.style.backgroundImage = "";
	$avatarbg.style.width = "5rem";
	$avatarbg.style.height = "5rem";
	$avatar.style.width = "100%";
	$avatar.style.left = "0";
	$avatar.style.top = "0";
	$avatar.style.borderRadius = "50%";
	$avatar.style.border = "";
	$avatar.style.zIndex = "-1";
	$avatarbg.style.marginBottom = "1rem";
	if(CurrTemplateJson.ShowAvatar < 0) {
		base.Get("x-avatar").classList.add("hide");
	}
	if(!base.IsNullOrEmpty(CurrTemplateJson.FontColor)) {
		$wrapper.style.color = CurrTemplateJson.FontColor;
	}
	if(CurrTemplate > 1) {
		//头尾
		if(!base.IsNullOrEmpty(CurrTemplateJson.TopImage)) {
			var tophtml = [];
			for(var i = 0; i < CurrTemplateJson.TopImage.length; i++) {
				var top = CurrTemplateJson.TopImage[i];
				tophtml.push('<img src="' + top.Url + '" class="' + top.Align + '" style="width:' + top.Width + '" />');
			}
			$top.innerHTML = tophtml.join('');
			$top.classList.remove("hide");
		}
		if(!base.IsNullOrEmpty(CurrTemplateJson.BottomImage)) {
			$bottom.setAttribute("src", CurrTemplateJson.BottomImage);
			$bottom.classList.remove("hide");
		}

		//头像
		if(CurrTemplateJson.Avatar != null) {
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.BackgroundImage)) {
				$avatarbg.style.backgroundImage = "url(" + CurrTemplateJson.Avatar.BackgroundImage + ")";
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Width)) {
				$avatarbg.style.width = CurrTemplateJson.Avatar.Width;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Height)) {
				$avatarbg.style.height = CurrTemplateJson.Avatar.Height;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.MarginBottom)) {
				$avatarbg.style.marginBottom = CurrTemplateJson.Avatar.MarginBottom;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.MarginTop)) {
				if(CurrTemplateJson.TransparencyFixed == 0) {
					$head.style.marginTop = CurrTemplateJson.Avatar.MarginTop;
				} else {
					$body.style.marginTop = CurrTemplateJson.Avatar.MarginTop;
					$head.style.marginTop = "1rem";
				}
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.SubWidth)) {
				$avatar.style.width = CurrTemplateJson.Avatar.SubWidth;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Top)) {
				$avatar.style.top = CurrTemplateJson.Avatar.Top;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Left)) {
				$avatar.style.left = CurrTemplateJson.Avatar.Left;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.BorderRadius)) {
				$avatar.style.borderRadius = CurrTemplateJson.Avatar.BorderRadius;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Index)) {
				$avatar.style.zIndex = CurrTemplateJson.Avatar.Index;
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Avatar.Border)) {
				$avatar.style.border = CurrTemplateJson.Avatar.Border;
			}
		}

		if(CurrTemplateJson.TransparencyFixed == 0) {
			$cover.style.backgroundColor = CurrTemplateJson.Transparency;
		} else {
			$cover1.style.backgroundColor = CurrTemplateJson.Transparency;
		}

		if(CurrTemplateJson.CoverFixed == 0) {
			$wrapper1.classList.add("x-cover");
			if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundImage)) {
				var imglist = [];
				var imgs = CurrTemplateJson.BackgroundImage.split('?');
				for(var i = 0; i < imgs.length; i++) {
					imglist.push("url(" + imgs[i] + ")");
				}
				$wrapper1.style.backgroundImage = imglist.join(',');
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundPosition)) {
					$wrapper1.style.backgroundPosition = CurrTemplateJson.BackgroundPosition;
				}
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
		} else {
			if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundImage)) {
				var imglist = [];
				var imgs = CurrTemplateJson.BackgroundImage.split('?');
				for(var i = 0; i < imgs.length; i++) {
					imglist.push("url(" + imgs[i] + ")");
				}
				$wrapper2.style.backgroundImage = imglist.join(',');
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundPosition)) {
					$wrapper2.style.backgroundPosition = CurrTemplateJson.BackgroundPosition;
				}
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundRepeat)) {
					$wrapper2.style.backgroundRepeat = CurrTemplateJson.BackgroundRepeat;
				}
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundSize)) {
					$wrapper2.style.backgroundSize = CurrTemplateJson.BackgroundSize;
				}
				$wrapper2.classList.remove("hide");
			}
			if(CurrTemplateJson.CoverFixed == 2) {
				if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundBlurImage)) {
					var imglist = [];
					var imgs = CurrTemplateJson.BackgroundBlurImage.split('?');
					for(var i = 0; i < imgs.length; i++) {
						imglist.push("url(" + imgs[i] + ")");
					}
					$wrapper21.style.backgroundImage = imglist.join(',');
					if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundPosition)) {
						$wrapper21.style.backgroundPosition = CurrTemplateJson.BackgroundPosition;
					}
					if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundRepeat)) {
						$wrapper21.style.backgroundRepeat = CurrTemplateJson.BackgroundRepeat;
					}
					if(!base.IsNullOrEmpty(CurrTemplateJson.BackgroundSize)) {
						$wrapper21.style.backgroundSize = CurrTemplateJson.BackgroundSize;
					}
					$wrapper21.classList.remove("hide");
				}
			}
			if(!base.IsNullOrEmpty(CurrTemplateJson.Background)) {
				if(CurrTemplateJson.Background.startWith("#") || CurrTemplateJson.Background.startWith("rgba")) {
					$wrapper2.style.backgroundColor = CurrTemplateJson.Background;
				} else {
					$wrapper2.style.background = CurrTemplateJson.Background;
					$wrapper2.style.background = base.BrowserName() + CurrTemplateJson.Background;
				}
				$wrapper2.classList.remove("hide");
			}
		}
	} else if(CurrTemplate == 1) {
		//自定义
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
			$body.classList.add("well2");
			$edit.classList.add("temp");
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
	mui.confirm('确定要删除这篇文章吗？删除后将无法在浏览器中浏览', '', btnArray, function(e) {
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

							base.GetView("article").evalJS("Refresh()");
							self.close();
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
	mui.confirm('确定要取消收藏吗？', '', ['确定', '取消'], function(e) {
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