var drags = [];

//创建后两个页面
function InitView(currview, callback) {
	if(drags.length == groupItems.length) {
		if(callback) {
			callback();
		}
		return;
	}

	var start = 0;
	var end = 0;

	if(currview > 0) {
		start = currview - 1;
	} else {
		start = 0;
	}
	if(currview < groupItems.length) {
		end = currview + 1;
	} else {
		end = groupItems.length;
	}
	var totalview = 0;
	var viewsold = groupItems.slice(start, end + 1);
	var views = viewsold;
	var views = [];
	mui.each(viewsold, function(i, view) {
		if(base.GetView(view.id) == null) {
			views.push(view);
		}
	});
	if(views.length == 0) {
		//判断当前页是否加载手势事件
		var result = drags.some(function(x) {
			return x === currview
		});
		if(!result) {
			InitDrag(currview);
		}
		if(callback) {
			callback();
		}
		return;
	}
	mui.each(views, function(i, view) {
		menu_style.left = view.index * 100 + "%";
		var currview = plus.webview.create(view.url, view.id, menu_style, {
			ArticleType: view.ArticleType,
			PageName: view.PageName,
			headheight: headheight,
			index: view.index
		});
		currview.show("none");
		currview.onloaded = function() {
			totalview += 1;
		};
	});
	var i = setInterval(function() {
		if(totalview == views.length) {
			clearInterval(i);
			InitDrag(currview);
			if(callback) {
				callback();
			}
		}
	}, 100);
}

//当前页面手势事件（已加载前一个页面+下一个页面）
function InitDrag(index) {
	drags.push(index);

	//左滑
	if(index < groupItems.length - 1) {
		var self = base.GetView("articletab" + index);
		var menu = base.GetView("articletab" + (index + 1));
		self.drag({
			direction: 'left',
			moveMode: 'followFinger'
		}, {
			view: menu,
			moveMode: 'follow'
		}, function(e) {
			if(e.type == "end" && e.result) {
				base.GetView("subindex").evalJS('scroll.gotoPage(' + (index + 1) + ');ChangeItem(mui(".mui-control-item")[' + (index + 1) + '])');
				InitView(index + 1);

				//隐藏左右多余页面
				mui.each(groupItems, function(i, view) {
					if(i == index) {
						return;
					}
					if(i < index - 2 || i > index + 2) {
						var page = base.GetView(view.id);
						if(page != null) {
							page.hide("none");
						}
					} else {
						var page = base.GetView(view.id);
						if(page != null) {
							page.show("none");
						}
					}
				})
			}
		});
	}

	//右滑
	if(index > 0) {
		var self = base.GetView("articletab" + index);
		var menu = base.GetView("articletab" + (index - 1));
		self.drag({
			direction: 'right',
			moveMode: 'followFinger'
		}, {
			view: menu,
			moveMode: 'follow'
		}, function(e) {
			if(e.type == "end" && e.result) {
				base.GetView("subindex").evalJS('scroll.gotoPage(' + (index - 1) + ');ChangeItem(mui(".mui-control-item")[' + (index - 1) + '])');
				InitView(index - 1);

				//隐藏左右多余页面
				mui.each(groupItems, function(i, view) {
					if(i == index) {
						return;
					}
					if(i < index - 2 || i > index + 2) {
						var page = base.GetView(view.id);
						if(page != null) {
							page.hide("none");
						}
					} else {
						var page = base.GetView(view.id);
						if(page != null) {
							page.show("none");
						}
					}
				})
			}
		});
	}

	//最后一页右滑
	if(index == groupItems.length - 2) {
		var self = base.GetView("articletab" + (index + 1));
		var menu = base.GetView("articletab" + index);
		self.drag({
			direction: 'right',
			moveMode: 'followFinger'
		}, {
			view: menu,
			moveMode: 'follow'
		}, function(e) {
			if(e.type == "end" && e.result) {
				base.GetView("subindex").evalJS('scroll.gotoPage(' + index + ');ChangeItem(mui(".mui-control-item")[' + index + '])');
				InitView(index)

				//隐藏左右多余页面
				mui.each(groupItems, function(i, view) {
					if(i == index) {
						return;
					}
					if(i < index - 2 || i > index + 2) {
						var page = base.GetView(view.id);
						if(page != null) {
							page.hide("none");
						}
					} else {
						var page = base.GetView(view.id);
						if(page != null) {
							page.show("none");
						}
					}
				})
			}
		});
	}
}