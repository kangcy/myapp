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
function pulldownRefresh(callback) {
	if(isLoading) {
		return;
	}
	isLoading = true;
	base.CurrAnimate = base.GetUid();
	currpage = 1;
	totalpage = 2;
	base.Get('scroll-view').innerHTML = "";
	Load(function() {
		++currpage;
		if(callback) {
			callback();
		}
		self.endPullToRefresh();
		isLoading = false;
	})
}

/**
 * 上拉加载 
 */
function pullupRefresh() {
	if(isLoading) {
		return;
	}
	isLoading = true;
	if(currpage > totalpage) {
		isLoading = false;
		return false;
	}
	if(base.Get("scroll-more"))
		base.Get("scroll-more").classList.remove("hide");
	base.CurrAnimate = base.GetUid();
	Load(function() {
		++currpage;
		isLoading = false;
		if(base.Get("scroll-more"))
			base.Get("scroll-more").classList.add("hide");
	})
}