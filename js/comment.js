var ArticleNumber = "";
var ParentCommentNumber = 0;
var ParentUserNumber = 0;
var Count = 0;
var NewId = 0; //最新添加评论ID
var editor = null;

var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
	$(".emojionearea").removeClass("zoomIn").addClass("zoomOut hide");
	$("#bottomAction").removeClass("hide").addClass("bounceIn");
	if(editor != null) {
		editor[0].emojioneArea.setText("");
	}
});

//评论初始化
function InitComment() {

	base.InitPull("scroll", function() {
		NewId = 0;
	});

	base.ShowUser("#scroll");

	//点赞
	mui('#scroll').on('tap', '.goods', function() {
		if(isLoading) {
			return;
		}
		isLoading = true;
		var commentid = this.getAttribute("cid");
		HttpGet(base.RootUrl + "Api/Zan/CommentZanEdit", {
			ID: userinfo.ID,
			CommentNumber: commentid
		}, function(data) {
			data = JSON.parse(data);
			base.CheckLogin(userinfo, data.code);
			if(data != null) {
				if(data.result) {
					var item = $("#goods" + commentid);
					var count = parseInt(item.find("span").html());
					var already = data.message.split('|');
					if(already[0] == 1) {
						item.removeClass("heartbeat red");
						item.attr("already", "0");
						item.find("img").attr("src", "../images/base/like_nor.png");
						item.find("span").html(count - 1 < 0 ? 0 : count - 1);
					} else {
						item.addClass("heartbeat red");
						item.attr("already", "1");
						item.find("img").attr("src", "../images/base/like_hig.png");
						item.find("span").html(count + 1);
					}
				}
			} else {
				mui.toast("失败");
			}
			isLoading = false;
		});
	});

	//回复评论 
	mui('#scroll').on('tap', '.comments', function() {
		if(isLoading) {
			return;
		}
		isLoading = true;
		ParentCommentNumber = this.getAttribute("cid");
		ParentUserNumber = this.getAttribute("userid");
		Count = this.getAttribute("count");
		if(editor == null) {
			editor = $("#textarea").emojioneArea({
				template: "<editor/><filters/><tabs/>"
			});
		}
		EditorShow();
		isLoading = false;
	});

	//回复
	mui('#scroll').on('tap', '.sub', function() {
		var number = this.getAttribute("number");
		var name = this.getAttribute("name");
		base.OpenWindow("subcomment", "subcomment.html", {
			Number: number,
			ArticleNumber: ArticleNumber,
			Name: name
		});
	});
}

//发表评论
function Comment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	ParentCommentNumber = "";
	ParentUserNumber = "";
	if(editor == null) {
		editor = $("#textarea").emojioneArea({
			template: "<editor/><filters/><tabs/>"
		});
	}
	EditorShow();
	isLoading = false;
}

//编辑器弹窗
function EditorShow() {
	mask.show();
	$("#bottomAction").removeClass("bounceIn").addClass("hide");
	$(".emojionearea").removeClass("zoomOut hide").addClass("zoomIn");
}

//隐藏编辑器
function EditorHide() {
	$(".emojionearea").removeClass("zoomIn").addClass("zoomOut hide");
	$("#bottomAction").removeClass("hide").addClass("bounceIn");
	if(editor != null) {
		editor[0].emojioneArea.setText("");
	}
}

//隐藏编辑器
function EditorClose() {
	mask.close();
}

//拼接Html 
function AppendStr(item) {
	var div = document.createElement('div');
	div.className = 'mui-table-view-cell bounceInUp';
	div.setAttribute("id", "article" + item.Number)
	var model = [];
	model.push('<div class="mui-slider-cell mt10 mb10"><div class="oa-contact-cell mui-table">');
	model.push('<div class="mui-table-cell oa-contact-avatar"><img src="' + base.ShowThumb(item.Avatar, 1) + '" class="user" userid="' + item.UserNumber + '" /></div>');
	model.push('<div class="mui-table-cell pb0"><p class="f13 user c333" userid="' + item.UserNumber + '">' + base.UnUnicodeText(item.NickName) + '<span class="fr f12 c999">' + item.CreateDateText + '</span></p>');
	model.push('<p class="f12 c999 mt3 mb10" style="line-height:1.3rem;">' + base.UnUnicodeText(item.Summary) + '</p>');
	model.push('<p class="tip tip1 mb0 f12 ' + (item.SubCommentCount > 1 ? "" : "hide") + '"><span class="blue sub" number="' + item.Number + '" id="comment0' + item.Number + '" name="' + item.NickName + '">查看' + item.SubCommentCount + '条回复</span></p>');
	model.push('<p class="tip tip0 mb0 f12 ' + (item.SubCommentCount == 1 ? "" : "hide") + '"><span class="c999">' + base.UnUnicodeText(item.SubUserName) + ' : ' + base.UnUnicodeText(item.SubSummary) + '</span></p>');
	model.push('<div class="full tr mt10 mb5 c999" style="display:inline-block;"><img src="../images/base/comment_nor.png" style="width:0.9rem;" class="ml15 fr mt1 comments" cid="' + item.Number + '" userid="' + item.UserNumber + '" count="' + item.SubCommentCount + '" id="comment1' + item.Number + '" />');
	model.push('<div id="goods' + item.Number + '" cid="' + item.Number + '" already="' + (item.IsZan == 0 ? 0 : 1) + '" class="goods fr ' + (item.IsZan == 0 ? "" : "red") + '"><span class="f13 ml5 fr" >' + item.Goods + '</span><img src="../images/base/' + (item.IsZan == 0 ? "like_nor" : "like_hig") + '.png" style="width:0.9rem;" class="ml15 fr"  />');
	model.push('</div></div></div></div>');
	div.innerHTML = model.join('');
	return div;
}

//拼接新增评论
function AppendComment() {
	HttpGet(base.RootUrl + "Api/Comment/Detail", {
		ID: NewId
	}, function(data) {
		data = JSON.parse(data);
		base.CheckLogin(userinfo, data.code);
		if(data != null) {
			if(data.result) {
				$("#none").addClass("hide");
				var table = base.Get('scroll-view');
				var div = AppendStr(data.message);
				table.appendChild(div);
			}
		} else {
			mui.toast("失败");
		}
		isLoading = false;
	});
}

//提交编辑
function EditorSubmit() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	if(editor == null) {
		isLoading = false;
		return mui.toast("信息异常");
	}
	var val = editor[0].emojioneArea.getHtml();
	if(base.IsNullOrEmpty(val)) {
		isLoading = false;
		return mui.toast("请填写内容");
	}
	mask.show();
	base.ShowWaiting("正在提交");
	EditorHide();
	HttpGet(base.RootUrl + "Api/Comment/Edit", {
		ID: userinfo.ID,
		ArticleNumber: ArticleNumber,
		ParentCommentNumber: ParentCommentNumber,
		ParentUserNumber: ParentUserNumber,
		Summary: escape(val)
	}, function(data) {
		data = JSON.parse(data);
		base.CheckLogin(userinfo, data.code);
		mui.later(function() {
			mask.close();
			mui.toast(data.result ? "感谢您的评论" : data.message);
			if(data.result) {
				NewId = data.message;
				if(base.IsNullOrEmpty(ParentCommentNumber)) {
					AppendComment();
				} else {
					var $item = $("#comment0" + ParentCommentNumber);
					var $parent = $item.parents(".mui-table-view-cell");
					var count = (parseInt(Count) + 1);
					$item.html('查看' + count + '条回复');
					$parent.find(".tip0").find("span").html(base.UnUnicodeText(userinfo.NickName) + " : " + base.UnUnicodeText(val));
					if(count == 1) {
						$parent.find(".tip1").addClass("hide");
						$parent.find(".tip0").removeClass("hide");
					}
					if(count > 1) {
						$parent.find(".tip0").addClass("hide");
						$parent.find(".tip1").removeClass("hide");
					}
					$("#comment1" + ParentCommentNumber).attr("count", count);
				}
				//更新文章评论数
				var page = plus.webview.getWebviewById("articledetail");
				if(page) {
					page.evalJS("UpdateComment()")
				}
			}
			isLoading = false;
		}, 500);
	});
}