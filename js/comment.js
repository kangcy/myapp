var self = null;
var action = "";
var saveSelection, restoreSelection;
var showIcon = false; //显示表情
var showPosition = 1; //显示定位
var $edit = null;

//当前选中
var curredit = {
	Id: 0,
	Number: "",
	ParentCommentNumber: 0,
	ParentUserNumber: 0,
	ArticleNumber: "",
	Count: 0
}

var NewId = 0; //最新添加评论ID
var editor = null;
var $commentwrapper = null;
var $commentwrapperReady = false;
var $bottomAction = base.Get("bottomAction");

var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
	$commentwrapper.classList.remove("bounceInUp");
	$commentwrapper.classList.add("bounceOutUp");

	if($bottomAction) {
		$bottomAction.classList.remove("hide");
		$bottomAction.classList.add("bounceIn");
	}
	base.Get("divIcon").classList.add("height");
	CommentClear();
	//SetPullEnable(true);
});

//评论初始化
function InitComment() {
	mui('#divcomment').load("../part/comment.html", function(response) {
		$commentwrapper = base.Get("commentwrapper");
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

		$commentwrapperReady = true;

		if(base.IsNullOrEmpty(action)) {
			$bottomAction.classList.remove("hide");
			$bottomAction.classList.add("bounceIn");
		} else {
			Comment();
		}
	});

	//用户
	base.ShowUser("#scroll-view");

	//回复列表
	mui('#scroll-view').on('tap', '.sub', function() {
		if(base.TriggerMain) {
			return false;
		}
		base.TriggerMain = true
		mui.later(function() {
			base.TriggerMain = false;
		}, 500);
		var number = this.getAttribute("number");
		var name = this.getAttribute("name");
		base.OpenWindow("subcomment", "subcomment.html", {
			Number: number,
			ArticleNumber: curredit.ArticleNumber,
			Name: name
		});
	});

	//点击评论
	mui('#scroll-view').on('tap', '.mui-table-view-cell', function() {
		if(base.TriggerMain) {
			return false;
		}
		var $this = this
		this.style.background = "#e5e5e5";

		curredit.Id = this.getAttribute("id");
		curredit.ParentCommentNumber = this.getAttribute("cid");
		curredit.ParentUserNumber = this.getAttribute("userid");
		curredit.ArticleNumber = this.getAttribute("articlenumber");
		curredit.Count = this.getAttribute("count");

		mui('#action').popover('show');
		mui.later(function() {
			$this.style.background = "";
		}, 150)
	});
}

//回复评论
function Reply() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	mui('#action').popover('hide');
	ShowComment(true);
	isLoading = false;
}

//复制评论
function Copy() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	mui('#action').popover('hide');
	$("#remark").html(base.Get("summary" + curredit.ParentCommentNumber).innerHTML)
	ShowComment(true);
	isLoading = false;
}

//显示编辑器
function ShowComment(show) {
	if(!$commentwrapperReady) {
		return;
	}
	if(show == 0) {
		mask.close();
	} else {
		base.Get("commenttitle").innerHTML = base.IsNullOrEmpty(curredit.ParentCommentNumber) ? "发表评论" : "回复楼主";
		mask.show();
		if($bottomAction) {
			$bottomAction.classList.remove("fadeInUp");
			$bottomAction.classList.add("hide");
		}
		$commentwrapper.classList.remove("hide");
		$commentwrapper.classList.remove("bounceOutUp");
		$commentwrapper.classList.add("bounceInUp");

		base.ShowLoading(false);

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
	curredit.ParentCommentNumber = "";
	curredit.ParentUserNumber = "";
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
	HttpPost(base.RootUrl + "Comment/Edit_1_3", {
		ID: userinfo.ID,
		ArticleNumber: curredit.ArticleNumber,
		ParentCommentNumber: curredit.ParentCommentNumber,
		ParentUserNumber: curredit.ParentUserNumber,
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
		base.CheckLogin(userinfo, data.code);
		mui.later(function() {
			mask.close();
			mui.toast(data.result ? "感谢您的评论" : data.message);
			if(data.result) {
				NewId = data.message;
				if(base.IsNullOrEmpty(curredit.ParentCommentNumber)) {
					AppendComment();
				} else {
					var $item = $("#comment0" + curredit.ParentCommentNumber);
					var $parent = $item.parents(".mui-table-view-cell");
					var count = (parseInt(curredit.Count) + 1);
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
				//var div = AppendStr(data.message);

				var div = document.createElement("div");
				div.innerHTML = template('comment', {
					list: [data.message]
				});

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
	div.setAttribute("id", "article" + item.Number);
	div.setAttribute("cid", item.Number);
	div.setAttribute("userid", item.UserNumber);
	div.setAttribute("articlenumber", item.ArticleNumber);
	div.setAttribute("count", item.SubCommentCount);

	var model = [];
	model.push('<div class="oa-contact-cell mui-table mt10 mb10">');
	model.push('<div class="mui-table-cell oa-contact-avatar"><img onload="StorageImg(this)" src="../images/avatar.png" data-lazyload="' + base.ShowThumb(item.Avatar, 1) + '" class="user" userid="' + item.UserNumber + '" /></div>');
	model.push('<p class="f12 user bold" style="color:#576B95;display:inline-block;" userid="' + item.UserNumber + '">' + base.UnUnicodeText(item.NickName) + '</p><p class="f12 c888 mt3 full">' + item.CreateDateText + (item.ShowPosition == 1 ? '<span class="ml5 mr5">来自</span>' + item.City : '') + '</p>');
	model.push('<div class="f12 c333 mt5 full summary" style="line-height:1.3rem;">' + base.UnUnicodeText(item.Summary));
	model.push('<p class="tip tip1 mb0 f12 mt5 ' + (item.SubCommentCount > 1 ? "" : "hide") + '"><span class="blue sub" number="' + item.Number + '" id="comment0' + item.Number + '" name="' + item.NickName + '">查看' + item.SubCommentCount + '条回复</span></p>');
	model.push('<p class="tip tip0 mb0 f12 mt5 ' + (item.SubCommentCount == 1 ? "" : "hide") + '"><span class="blue summary">' + base.UnUnicodeText(item.SubUserName) + '<span class="c999"> : ' + base.UnUnicodeText(item.SubSummary) + '</span></span></p>');
	div.innerHTML = model.join('');
	return div;
}