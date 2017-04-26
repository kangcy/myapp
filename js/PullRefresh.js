var currpage = 1;
var totalpage = 2;
var records = 0;
var isLoading = false;
var pagesize = base.PageSize;
var userinfo = base.GetUserInfo();

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
	Load(function() {
		++currpage;
		self.endPullUpToRefresh(currpage > totalpage);
		isLoading = false;
	})
}

/**
 * 加载封装 
 * url：接口请求地址
 * data：接口请求参数
 * showNone：是否显示空提示
 * appendCallback：拼接方法
 * endCallback：回调方法
 */
/*function LoadPull(url, data, showNone, appendCallback, endCallback) {
	HttpGet(url, data, function(data) {
		data = JSON.parse(data);
		base.ShowLoading(false);
		if(data != null) {
			if(data.result) {
				data = data.message;
				totalpage = data.totalpage;
				records = data.records;
				if(showNone) {
					base.ShowNone(false);
				}
				var table = base.Get('scroll-view');
				if(records > 0) {
					for(var i = 0, len = data.list.length; i < len; i++) {
						var div = appendCallback(data.list[i]);
						table.appendChild(div);
					}
				} 
			}
		}
		if(records == 0 && showNone) {
			base.ShowNone(true);
		}
		if(endCallback) {
			endCallback();
		}
	});
}*/