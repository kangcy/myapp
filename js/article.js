//调用父窗口
function SubIndexPageTan(show) {
	if(subindexPage == null) {
		subindexPage = plus.webview.getWebviewById("subindex");
	}
	subindexPage.evalJS("ActionTan(" + show + ",'" + PageName + "')");
}

//子窗口弹窗
function ActionTan(show) {
	if(show) {
		mask.show();
		SubIndexPageTan(show);
		document.getElementById("action").classList.add("mui-active");
	} else {
		mask.close();
		SubIndexPageTan(show);
		document.getElementById("action").classList.remove("mui-active");
	}
}

//父窗口关闭回调
function ActionTan2() {
	mask.close();
}