//切换音乐
function ChangeMusic(index) {
	MusicID = "music" + index;
	if(!base.IsNullOrEmpty(MusicUrl)) {
		if(Article.AutoMusic == 1) {
			document.addEventListener('touchstart', startsound);
		}
		base.Get("music" + index).classList.remove("hide");
	} else {
		base.AddClass(["#music0", "#music1"], "hide");
	}
}

//背景状态切换
function ChangeBg() {
	InitHeader();

	//纯白背景
	if(CurrTemplate == 0) {
		$wrapper.style.backgroundColor = "transparent";
		$wrapper1.style.background = "none";
		$wrapper2.style.background = "#fff";
		$cover.style.backgroundColor = "RGBA(255, 255, 255, 1)";
	} else if(CurrTemplate > 1) {
		$wrapper2.style.background = "none";
		$wrapper1.style.background = "url(" + CurrCover + ") top center no-repeat";
		$wrapper1.style.backgroundSize = "100% auto";
		$cover.style.backgroundColor = "RGBA(255, 255, 255, 0.5)";
	} else {
		$wrapper.style.backgroundColor = "transparent";
		$wrapper1.style.background = "none";

		if(CurrBackground == null) {
			//全屏
			$wrapper2.style.background = "#fff";
		} else {
			//背景透明度
			$cover.style.background = "RGBA(255, 255, 255, " + (100 - CurrBackground.Transparency) / 100 + ")";

			var url = CurrBackground.Url;
			if(CurrBackground.High == 0) {
				url = base.ShowThumb(url, 1);
			} else {
				url = base.ShowThumb(url, 0);
			}
			switch(CurrBackground.Full) {
				case 0:
					//居顶 
					$wrapper2.style.background = "url(" + url + ") no-repeat top center";
					$wrapper2.style.backgroundSize = "100% 15.5rem";
					break;
				case 1:
					//全屏
					$wrapper2.style.background = "url(" + url + ") center center no-repeat";
					$wrapper2.style.backgroundSize = "100% auto";
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
		plus.webview.close("addarticle");
	});
}

//重新加载数据 
function UpdateDetail2() {
	ChooseTan(function() {
		Load(function() {
			plus.webview.close("custom", "none");
			plus.webview.close("customsetting", "none");
		});
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

							plus.webview.close("articledetail", "none");
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

//加载模板
function LoadTemplate() {
	HttpGet(base.RootUrl + "Article/Template", {}, function(data) {
		if(data != null) {
			var length = data.records;
			if(length > 0) {
				var table = base.Get('temp');
				var fragment = document.createDocumentFragment();
				mui.each(data.list, function(i, item) {
					fragment.appendChild(AppendTemplate(item));
				})
				table.appendChild(fragment);
			}
		}

		//模板选择
		mui('#temps').on('tap', '.temp', function() {
			base.RemoveClass([".temp"], "hover");
			this.classList.add("hover");
			CurrTemplate = this.getAttribute("tid");

			if(CurrTemplate == 1) {
				base.OpenWindow("customsetting", "customsetting.html", {
					ArticleNumber: Article.Number
				});
				TempTan(0);
				return;
			} else if(CurrTemplate > 1) {
				CurrCover = this.getAttribute("cover");
			} else {
				CurrCover = "";
			}
			$wrapper.style.backgroundColor = this.getAttribute("color");
			var templatetype = this.getAttribute("type");

			//纯白背景
			if(templatetype == 0) {
				base.Get("main1").classList.add("hide");
				base.Get("main0").classList.remove("hide");
			} else {
				base.Get("main0").classList.add("hide");
				base.Get("main1").classList.remove("hide");
			}

			ChangeBg(); //背景切换 

			ChangeMusic(templatetype); //音乐切换
		});

		base.RemoveClass(["#action", "#btnTemp"], "hide");
	});
}

function AppendTemplate(item) {
	var div = document.createElement('div');
	div.className = 'mui-control-item temp';
	div.setAttribute("tid", item.ID);
	div.setAttribute("color", item.Background);
	div.setAttribute("cover", item.Cover);
	div.setAttribute("type", item.TemplateType);
	div.innerHTML = '<img src="' + item.ThumbUrl + '" />';
	return div;
}

//重新加载数据
function UpdatePower(ArticlePower, ArticlePowerPwd, ArticleType, ArticleTypeName) {
	Article.ArticlePower = ArticlePower;
	Article.ArticlePowerPwd = ArticlePowerPwd;
	Article.TypeID = ArticleType;
	Article.TypeName = ArticleTypeName;
}