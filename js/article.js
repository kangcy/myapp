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