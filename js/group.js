//文章段落互换效果
function Group(ele, margin) {
	margin = margin || 0;
	var panels = children(ele);
	for(var i = 0, h = 0; i < panels.length; i++) {
		var p = panels[i];
		p.style.position = 'absolute';

		//开始创建头部操作按钮
		$(p).find(".edit-up")[0].onclick = moveup;
		$(p).find(".edit-down")[0].onclick = movedown;
		$(p).find(".edit-content").attr("id", "edit-content" + i);
		//结束创建头部操作按钮

		p.style.top = h + 'px';
		p.index = i;
		//新增
		p.setAttribute("index", i);
		h += p.offsetHeight + margin;
	}
	ele.style.height = h + 'px';
	ele.style.position = 'relative';
	check(0, i - 1);

	function check() {
		for(var i = 0; i < panels.length; i++) {
			$(panels[i]).find(".edit-up").css("visibility", i == 0 ? 'hidden' : 'visible');
			$(panels[i]).find(".edit-down").css("visibility", i == panels.length - 1 ? 'hidden' : 'visible')
			panels[i].index = i;
			panels[i].setAttribute("index", i);
		}
	}

	//向上移动
	function moveup(evt) {
		var p = evt ? evt.target : event.srcElement;
		p = p.parentNode.parentNode.parentNode;
		swap(p, panels[p.index - 1]); 
	}

	//向下移动
	function movedown(evt) {
		var p = evt ? evt.target : event.srcElement;
		p = p.parentNode.parentNode.parentNode;
		swap(p, panels[p.index + 1]);
	}

	//交换位置
	function swap(p1, p2) {
		var N = 10;
		var INTV = 300;
		var arr1, arr2;
		var t1 = parseInt(p1.style.top),
			t2 = parseInt(p2.style.top);
		var h1 = p1.offsetHeight + margin,
			h2 = p2.offsetHeight + margin;
		arr1 = makeArr(t1, t1 < t2 ? h2 : -h2);
		arr2 = makeArr(t2, t1 < t2 ? -h1 : h1);
		for(var i = 0; i < N; i++)(function() {
			var j = i;
			mui.later(function() {
				p1.style.top = arr1[j] + "px";
				p2.style.top = arr2[j] + "px";
				if(j == N - 1) {
					panels[p1.index] = p2;
					panels[p2.index] = p1;
					check(p1.index, p2.index);
				}
			}, (j + 1) * INTV / N);
		})();

		function makeArr(f, x) {
			var ret = [];
			for(var i = 0; i < N; i++)
				ret[i] = Math.round(f + i * x / (N - 1));
			return ret;
		}
	}

	function children(e) {
		var ret = [];
		for(var i = 0, c = e.childNodes; i < c.length; i++)
			if(c[i].nodeType == 1)
				ret.push(c[i]);
		return ret;
	}
}