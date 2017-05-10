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
		var already = this.getAttribute("already") == "1";
		var commentid = this.getAttribute("cid");
		HttpGet(base.RootUrl + "Api/Zan/CommentZanEdit", {
			ID: userinfo.ID,
			CommentNumber: commentid
		}, function(data) {
			data = JSON.parse(data);
			if(data != null) {
				if(data.result) {
					var item = $("#goods" + commentid);
					var count = parseInt(item.find("span").html());
					if(already) {
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
		base.OpenWindow("subcomment", "subcomment.html", {
			Number: number,
			ArticleNumber: ArticleNumber
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
	model.push('<p class="tip mb0 f12 ' + (item.SubCommentCount == 0 ? "hide" : "") + '"><span class="blue sub" number="' + item.Number + '" id="comment0' + item.Number + '">查看' + item.SubCommentCount + '条回复</span></p>');
	model.push('<div class="full tr mt10 mb5 c999" style="display:inline-block;"><img src="../images/base/comment_nor.png" style="width:0.9rem;" class="ml15 fr mt1 comments" cid="' + item.Number + '" userid="' + item.UserNumber + '" count="' + item.SubCommentCount + '" id="comment1' + item.Number + '" />');
	model.push('<div id="goods' + item.Number + '" cid="' + item.Number + '" already="' + (item.IsZan == 0 ? 0 : 1) + '" class="goods fr ' + (item.IsZan == 0 ? "" : "red") + '">');
	model.push('<span class="f13 ml5 fr" >' + item.Goods + '</span><img src="../images/base/' + (item.IsZan == 0 ? "like_nor" : "like_hig") + '.png" style="width:0.9rem;" class="ml15 fr"  />');
	model.push('</div></div></div></div>');
	div.innerHTML = model.join('');
	return div;
}