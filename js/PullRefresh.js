var currpage = 1;
var totalpage = 2;
var records = 0;
var isLoading = false;
var pagesize = base.PageSize;
var userinfo = base.GetUserInfo();

//刷新下拉
function PullRefresh() {
	currpage = 1;
	totalpage = 2;
	records = 0;
	isLoading = false;
	base.Get('scroll-view').innerHTML = "";
}

/**
 * 下拉刷新
 */
function pulldownRefresh(self) {
	if(isLoading == true) {
		return;
	}
	isLoading = true;
	base.CurrAnimate = base.GetUid();
	currpage = 1;
	totalpage = 2;
	base.Get('scroll-view').innerHTML = "";
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
	base.CurrAnimate = base.GetUid();
	Load(function() {
		++currpage;
		self.endPullUpToRefresh(currpage > totalpage);
		isLoading = false;
	})
}