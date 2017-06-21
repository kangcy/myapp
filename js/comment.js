var self = null;
var action = "";
var saveSelection, restoreSelection;
var showIcon = false; //显示表情
var showPosition = 1; //显示定位
var $edit = null;

var Number = "";
var ArticleNumber = "";
var ParentCommentNumber = 0;
var ParentUserNumber = 0;
var Count = 0;
var NewId = 0; //最新添加评论ID
var editor = null;

var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
	base.Get("commentwrapper").classList.remove("bounceIn");
	base.Get("commentwrapper").classList.add("hide");

	if(base.Get("bottomAction")) {
		base.Get("bottomAction").classList.remove("hide");
		base.Get("bottomAction").classList.add("bounceIn");
	}
	base.Get("divIcon").classList.add("height");
	CommentClear();
	SetPullEnable(true);
});

//评论初始化
function InitComment() {
	pulldownRefresh(function() {
		NewId = 0;
	})

	mui('#divcomment').load("../part/comment.html", function(response) {
		base.Get("tab0").setAttribute("src", base.RootUrl + "/Images/Icons/face/0.png");
		base.Get("tab1").setAttribute("src", base.RootUrl + "/Images/Icons/animal/49.png");
		base.Get("tab2").setAttribute("src", base.RootUrl + "/Images/Icons/food/0.png");
		base.Get("tab3").setAttribute("src", base.RootUrl + "/Images/Icons/heart/0.png");
		base.Get("tab4").setAttribute("src", base.RootUrl + "/Images/Icons/travel/0.png");

		//系统定位
		var position = base.GetCurrentPosition();
		base.Get("address").innerHTML = base.IsNullOrEmpty(position.City) ? "未识别" : position.City;

		$edit = base.Get("remark");
		//document.onkeyup = function() {
		//$edit.innerHTML = $edit.innerHTML.replace(/(^.{250}).*/g, '$1');
		//}

		if(window.getSelection && document.createRange) {
			saveSelection = function(el) {
				var range = window.getSelection().getRangeAt(0);
				var preSelectionRange = range.cloneRange();
				preSelectionRange.selectNodeContents(el);
				preSelectionRange.setEnd(range.startContainer, range.startOffset);
				return preSelectionRange.toString().length;
			};

			restoreSelection = function(el, sel) {
				var charIndex = 0,
					range = document.createRange();
				range.setStart(el, 0);
				range.collapse(true);
				var nodeStack = [el],
					node, foundStart = false,
					stop = false;

				while(!stop && (node = nodeStack.pop())) {
					if(node.nodeType == 3) {
						var nextCharIndex = charIndex + node.length;
						if(!foundStart && sel >= charIndex && sel <= nextCharIndex) {
							range.setStart(node, sel - charIndex);
							range.setEnd(node, sel - charIndex);
							stop = true;
						}
						charIndex = nextCharIndex;
					} else {
						var i = node.childNodes.length;
						while(i--) {
							nodeStack.push(node.childNodes[i]);
						}
					}
				}

				sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} else if(document.selection && document.body.createTextRange) {
			saveSelection = function(el) {
				var selectedTextRange = document.selection.createRange(),
					preSelectionTextRange = document.body.createTextRange();
				preSelectionTextRange.moveToElementText(el);
				preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
				var start = preSelectionTextRange.text.length;

				return [start, start + selectedTextRange.text.length];
			};

			restoreSelection = function(el, sel) {
				var textRange = document.body.createTextRange();
				textRange.moveToElementText(el);
				textRange.collapse(true);
				textRange.moveEnd("character", sel[1]);
				textRange.moveStart("character", sel[0]);
				textRange.select();
			};
		}

		var icons = [{
			Name: "face",
			Count: 80
		}, {
			Name: "animal",
			Count: 146
		}, {
			Name: "food",
			Count: 58
		}, {
			Name: "heart",
			Count: 97
		}, {
			Name: "travel",
			Count: 70
		}];

		var fragment = document.createDocumentFragment();
		var index = 0;
		var groupHtml = [];
		var tipHtml = [];

		mui.each(icons, function(j, item) {
			index = 0;
			groupHtml = [];
			tipHtml = [];
			groupHtml.push('<div class="mui-slider-group">');
			tipHtml.push('<div class="mui-slider-indicator">');
			for(var i = 0; i < item.Count; i++) {
				index++;
				var el = document.createElement("img");
				el.setAttribute("src", base.RootUrl + "Images/Icons/" + item.Name + "/" + i + ".png");
				el.className = "commenticon";
				fragment.appendChild(el);
				if((index >= 21 && index % 21 == 0) || (index == item.Count && index % 21 > 0)) {
					var div = document.createElement("div");
					div.className = "mui-slider-item";
					div.appendChild(fragment);
					groupHtml.push(div.outerHTML);
					fragment = document.createDocumentFragment();
					if(index == 21) {
						tipHtml.push('<div class="mui-indicator mui-active"></div>');
					} else {
						tipHtml.push('<div class="mui-indicator"></div>');
					}
				}
			}
			groupHtml.push('</div>');
			tipHtml.push('</div>');
			base.Get("slider" + (j + 1)).innerHTML = groupHtml.join('') + tipHtml.join('');
		});

		if(base.IsNullOrEmpty(action)) {
			$("#bottomAction").removeClass("hide").addClass("bounceIn");
		} else {
			Comment();
		}
	});

	//用户
	base.ShowUser("#scroll-view");

	//点赞
	mui('#scroll-view').on('tap', '.goods', function() {
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
						item.find("img").attr("src", "../images/article/btn_good.png");
						item.find("span").html(count - 1 < 0 ? 0 : count - 1);
					} else {
						item.addClass("heartbeat red");
						item.attr("already", "1");
						item.find("img").attr("src", "../images/article/btn_good2.png");
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
	mui('#scroll-view').on('tap', '.comments', function() {
		if(isLoading) {
			return;
		}
		isLoading = true;
		ParentCommentNumber = this.getAttribute("cid");
		ParentUserNumber = this.getAttribute("userid");
		ArticleNumber = this.getAttribute("articlenumber");
		Count = this.getAttribute("count");
		ShowComment(true);
		isLoading = false;
	});

	//回复
	mui('#scroll-view').on('tap', '.sub', function() {
		var number = this.getAttribute("number");
		var name = this.getAttribute("name");
		base.OpenWindow("subcomment", "subcomment.html", {
			Number: number,
			ArticleNumber: ArticleNumber,
			Name: name
		});
	});

}

//显示编辑器
function ShowComment(show) {
	if(show == 0) {
		mask.close();
	} else {
		base.Get("commenttitle").innerHTML = base.IsNullOrEmpty(ParentCommentNumber) ? "发表评论" : "回复楼主";

		mask.show();
		SetPullEnable(false);
		if(base.Get("bottomAction")) {
			base.Get("bottomAction").classList.remove("bounceIn");
			base.Get("bottomAction").classList.add("hide");
		}
		base.Get("commentwrapper").classList.remove("hide");
		base.Get("commentwrapper").classList.add("bounceIn");

		if(!showIcon) {
			showIcon = true;
			//初始化
			mui("#slider1,#slider2,#slider3,#slider4,#slider5").slider({
				interval: 0
			});
			var $slider = mui("#slider0").slider({
				interval: 0
			});
			//表情分类切换
			mui('#iconTab').on('tap', 'div', function() {
				//$edit.focus();
				mui("#iconTab>div").each(function(i, model) {
					model.classList.remove("curr");
				})
				$slider.gotoItem(this.getAttribute("index"));
				this.classList.add("curr");
			});
			//添加表情
			mui('#commentwrapper').on('tap', '.commenticon', function() {
				$edit.focus();
				saveSelection($edit);
				InsertIcon('<img src="' + this.getAttribute("src") + '" />');
			});
		}
	}
}

//显示定位
function ShowPosition(show) {
	showPosition = show;
	if(show == 0) {
		base.Get("addresswrapper1").classList.add("hide");
		base.Get("addresswrapper2").classList.remove("hide");
	} else {
		base.Get("addresswrapper2").classList.add("hide");
		base.Get("addresswrapper1").classList.remove("hide");
	}
}

//显示表情
function ShowIcon() {
	base.Get("divIcon").classList.toggle("height");
}

//发表评论
function Comment() {
	ParentCommentNumber = "";
	ParentUserNumber = "";
	ShowComment(true);
}

//提交评论
function CommitComment() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	var val = $edit.innerHTML;
	if(base.IsNullOrEmpty(val)) {
		isLoading = false;
		return mui.toast("请填写内容");
	}
	mask.show();
	base.ShowWaiting("正在提交");
	ShowComment(false);
	var position = base.GetCurrentPosition();
	HttpGet(base.RootUrl + "Api/Comment/Edit", {
		ID: userinfo.ID,
		ArticleNumber: ArticleNumber,
		ParentCommentNumber: ParentCommentNumber,
		ParentUserNumber: ParentUserNumber,
		Summary: escape(val),
		Province: position.Province,
		City: position.City,
		District: position.District,
		Street: position.Street,
		DetailName: position.DetailName,
		CityCode: position.CityCode,
		Latitude: position.Latitude,
		Longitude: position.Longitude,
		ShowPosition: showPosition
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
					base.Get("comment1" + ParentCommentNumber).setAttribute("count", count);
				}
				//更新文章评论数
				var page = base.GetView("articledetail");
				if(page) {
					page.evalJS("UpdateComment()")
				}
			}
			isLoading = false;
		}, 500);
	});
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

//清空评论
function CommentClear() {
	$edit.innerHTML = "";
}

//新增表情
function InsertIcon(html) {
	var sel, range;
	if(window.getSelection) {
		sel = window.getSelection();
		if(sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			range.deleteContents();
			var el = document.createElement("div");
			el.innerHTML = html;
			var frag = document.createDocumentFragment(),
				node, lastNode;
			while((node = el.firstChild)) {
				lastNode = frag.appendChild(node);
			}
			range.insertNode(frag);
			if(lastNode) {
				range = range.cloneRange();
				range.setStartAfter(lastNode);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
	} else if(document.selection && document.selection.type != "Control") {
		document.selection.createRange().pasteHTML(html);
	}
}

//拼接Html 
function AppendStr(item) {
	var div = document.createElement('div');
	div.className = 'mui-table-view-cell';
	div.setAttribute("id", "article" + item.Number)
	var model = [];
	model.push('<div class="mui-slider-cell mt10 mb10"><div class="oa-contact-cell mui-table">');
	model.push('<div class="mui-table-cell oa-contact-avatar"><img src="' + base.ShowThumb(item.Avatar, 1) + '" class="user" userid="' + item.UserNumber + '" /></div>');
	model.push('<div class="mui-table-cell pb0"><p class="f13 user c333" userid="' + item.UserNumber + '">' + base.UnUnicodeText(item.NickName) + '<span class="fr f11 c999">' + item.CreateDateText + '</span></p>');
	model.push('<p class="f12 c999 mt5 mb10 summary" style="line-height:1.3rem;">' + base.UnUnicodeText(item.Summary) + '</p>');
	model.push('<p class="tip tip1 mb0 f12 ' + (item.SubCommentCount > 1 ? "" : "hide") + '"><span class="blue sub" number="' + item.Number + '" id="comment0' + item.Number + '" name="' + item.NickName + '">查看' + item.SubCommentCount + '条回复</span></p>');
	model.push('<p class="tip tip0 mb0 f12 ' + (item.SubCommentCount == 1 ? "" : "hide") + '"><span class="c999 summary">' + base.UnUnicodeText(item.SubUserName) + ' : ' + base.UnUnicodeText(item.SubSummary) + '</span></p>');
	model.push('<div class="full tr mt10 mb5 c999" style="display:inline-block;"><img src="../images/article/btn_comment.png" style="width:0.9rem;" class="ml15 fr mt1 comments" cid="' + item.Number + '" userid="' + item.UserNumber + '" articlenumber="' + item.ArticleNumber + '" count="' + item.SubCommentCount + '" id="comment1' + item.Number + '" />');
	model.push('<div id="goods' + item.Number + '" cid="' + item.Number + '" already="' + (item.IsZan == 0 ? 0 : 1) + '" class="goods fr ' + (item.IsZan == 0 ? "" : "red") + '"><span class="f13 ml5 fr" >' + item.Goods + '</span><img src="../images/article/' + (item.IsZan == 0 ? "btn_good" : "btn_good2") + '.png" style="width:0.9rem;" class="ml15 fr"  />');
	model.push('</div></div></div></div>');
	div.innerHTML = model.join('');
	return div;
}