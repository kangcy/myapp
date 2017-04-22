/**检查更新**/

function CheckUpdate(callback) {
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		var version = inf.version;
		if(mui.os.ios) {
			client = 'ios';
		} else {
			client = 'android';
		}
		HttpGet(base.RootUrl + "System/CheckUpdate", {
			version: version,
			client: client
		}, function(data) {
			plus.nativeUI.closeWaiting();
			if(data == null) {
				return;
			}
			if(data.result) {
				var remark = data.remark;
				remark = remark.replace(/ /g, "\n");
				mui.confirm(remark, '发现最新版本', ['立即更新', '暂不更新'], function(z) {
					if(z.index == 0) {
						base.Get("myprogressbg").classList.remove("hide");

						base.Get("myprogress").classList.remove("hide");
						callback(1);
						base.Get("myprogress").classList.add("bounceIn");

						var dtask = plus.downloader.createDownload(data.url, {}, function(d, status) {
							if(status == 200) {
								clearInterval(i);
								base.Get("persent").innerHTML = "100%";
								plus.nativeUI.toast("正在准备安装环境，请稍后！");
								setTimeout(function() {
									var path = d.filename;
									plus.runtime.install(path); //安装下载的apk文件
									//清除用户信息
									var userinfo = {};
									localStorage.setItem('$userinfo', JSON.stringify(userinfo));
								}, 1000);
							} else {
								mui.toast("更新失败");
							}
						});
						dtask.start();
						var i = setInterval(function() {
							var totalSize = dtask.totalSize;
							var downloadedSize = dtask.downloadedSize;
							base.Get("proDownFile").setAttribute("value", downloadedSize);
							base.Get("proDownFile").setAttribute("max", totalSize);
							if(totalSize > 0) {
								base.Get("persent").innerHTML = parseInt(100 * downloadedSize / totalSize) + "%";
							}
						}, 100);
					}
				});
			}
		});
	});
}

//立即下载
function Download() {
	base.Get("myprogress_btn").classList.add("hide");
	base.Get("myprogress_progress").classList.remove("hide");

	var persent = base.Get("persent");
	var proDownFile = base.Get("proDownFile");
	var totalProgress = document.getElementById("proDownFile").clientWidth;
	base.Get("persent").style.width = document.getElementById("myprogress_progress").clientWidth * 0.16 + "px";

	var index = 0;
	var i = setInterval(function() {
		proDownFile.value = index;
		persent.style.left = totalProgress * index / 100 + "px";
		persent.innerHTML = index + "%";
		index++;
		if(index > 100) {
			clearInterval(i);
		}
	}, 100);
}

//下次再说
function Next() {

}