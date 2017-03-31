/**
 * 下拉刷新
 */
function pulldownRefresh(self) {
	if(isLoading == true) {
		return;
	}
	isLoading = true;
	currpage = 1;
	totalpage = 2;
	document.getElementById('scroll-view').innerHTML = "";
	Load(function() {
		++currpage;
		self.endPullDownToRefresh();
		self.refresh(true);
		isLoading = false;
	})
}

/**
 * 上拉加载
 */
function pullupRefresh(self) {
	if(isLoading == true) {
		return;
	}
	isLoading = true;
	if(currpage > totalpage) {
		isLoading = false;
		self.endPullUpToRefresh(currpage > totalpage);
		return false;
	}
	Load(function() {
		++currpage;
		self.endPullUpToRefresh(currpage > totalpage);
		isLoading = false;
	})
}