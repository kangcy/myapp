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
				remark = remark.replace(" ", "\n");
				mui.confirm(remark, '发现最新版本', ['立即更新', '暂不更新'], function(z) {
					if(z.index == 0) {
						document.getElementById("myprogressbg").classList.remove("hide");
						
						document.getElementById("myprogress").classList.remove("hide");
						callback(1);
						document.getElementById("myprogress").classList.add("bounceIn");
						
						var dtask = plus.downloader.createDownload(data.url, {}, function(d, status) {
							if(status == 200) {
								clearInterval(i);  
								document.getElementById("persent").innerHTML = "100%";
								plus.nativeUI.toast("正在准备安装环境，请稍后！");
								setTimeout(function() {
									var path = d.filename;
									plus.runtime.install(path); //安装下载的apk文件
								}, 1000);
							} else {
								mui.toast("更新失败");
							}
						});
						dtask.start();
						var i = setInterval(function() {
							var totalSize = dtask.totalSize;
							var downloadedSize = dtask.downloadedSize;
							document.getElementById("proDownFile").setAttribute("value", downloadedSize);
							document.getElementById("proDownFile").setAttribute("max", totalSize);
							if(totalSize > 0) {
								document.getElementById("persent").innerHTML = parseInt(100 * downloadedSize / totalSize) + "%";
							}
						}, 100);
					}
				});
			}
		});
	});
}