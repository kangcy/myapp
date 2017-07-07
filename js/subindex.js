//延迟加载
//var totalview = 0;
//var startview = 0;

//创建前两个页面
function InitViewBefore(startview) {
	console.log("InitViewBefore:" + startview)
	if(startview <= 0) {
		return;
	}
	var totalview = 0;
	var end = startview - 2;
	if(end < 0) {
		end = 0;
	}
	var viewsold = groupItems.slice(end, startview);
	var views = viewsold;

	console.log(JSON.stringify(views))

	/*var views = [];
	mui.each(viewsold, function(i, view) {
		if(base.GetView(view.id) == null) {
			views.push(view);
		}
	});
	if(views.length == 0) {
		return;
	}*/
	if(views.length == 0) {
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
		currview.show("fade-in");
		currview.onloaded = function() {
			totalview += 1;
		};
	});
	var i = setInterval(function() {
		if(totalview == views.length) {
			clearInterval(i);
			mui.each(views, function(i, view) {
				InitDrag(view);
			});
			//base.GetView("subindex").evalJS('InitChangeItem()');
		}
	}, 100);
}

//创建后两个页面
function InitViewAfter(startview, callback) {
	console.log("InitViewAfter:" + startview)
	if(startview >= groupItems.length) {
		return;
	}
	var totalview = 0;
	var end = startview + 2;
	if(end >= groupItems.length) {
		end = groupItems.length;
	}
	var viewsold = groupItems.slice(startview, end);
	var views = viewsold;

	console.log(JSON.stringify(views))

	/*var views = [];
	mui.each(viewsold, function(i, view) {
		if(base.GetView(view.id) == null) {
			views.push(view);
		}
	});
	if(views.length == 0) {
		return;
	}*/
	mui.each(views, function(i, view) {
		menu_style.left = view.index * 100 + "%";
		var currview = plus.webview.create(view.url, view.id, menu_style, {
			ArticleType: view.ArticleType,
			PageName: view.PageName,
			headheight: headheight,
			index: view.index
		});
		currview.show("fade-in");
		currview.onloaded = function() {
			totalview += 1;
		};
	});
	var i = setInterval(function() {
		if(totalview == views.length) {
			clearInterval(i);
			mui.each(views, function(i, view) {
				InitDrag(view);
			});

			if(callback) {
				callback();
			}
		}
	}, 100);
}

function InitDrag(view) {
	var index = view.index;
	console.log(index + "," + groupItems.length + "," + JSON.stringify(view));

	//左滑
	if(index > 0 && index <= groupItems.length - 1) {
		var self = base.GetView("articletab" + (index - 1));
		var menu = base.GetView("articletab" + index);
		self.drag({
			direction: 'left',
			moveMode: 'followFinger'
		}, {
			view: menu,
			moveMode: 'follow'
		}, function(e) {
			if(e.type == "end" && e.result) {
				base.GetView("subindex").evalJS('scroll.gotoPage(' + index + ');ChangeItem(mui(".mui-control-item")[' + index + '])');

				//创建后两个页面
				InitViewAfter(index);
			}
		});
	}

	//右滑
	if(index > 1 && index <= groupItems.length - 1) {
		var self = base.GetView("articletab" + (index - 1));
		var menu = base.GetView("articletab" + (index - 2));
		self.drag({
			direction: 'right',
			moveMode: 'followFinger'
		}, {
			view: menu,
			moveMode: 'follow'
		}, function(e) {
			if(e.type == "end" && e.result) {
				base.GetView("subindex").evalJS('scroll.gotoPage(' + (index - 2) + ');ChangeItem(mui(".mui-control-item")[' + (index - 2) + '])');

				//创建前两个页面
				InitViewBefore(index);
			}
		});
	}

	//最后一页右滑
	if(index == groupItems.length - 1) {
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

				//创建前两个页面
				InitViewBefore(index);
			}
		});
	}
}