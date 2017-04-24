var UpdateUrl = "";

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
			base.CloseWaiting();
			if(data == null) {
				return;
			}
			if(data.result) {
				UpdateUrl = data.url;

				base.Get("persent").innerHTML = "0%";
				base.Get("myprogress_desc").innerHTML = "";
				var remarks = data.remark.split("|");
				var remark = [];
				for(var i = 0; i < remarks.length; i++) {
					remark.push('<p class="full tl mb10">' + remarks[i] + '</p>');
				}
				base.Get("myprogress_desc").innerHTML = remark.join("");
				base.RemoveClass(["#myprogressbg", "#myprogress"], ["hide"]);
				base.AddClass(["#myprogress"], ["bounceInUp"]);

				callback(1);
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
	var dtask = plus.downloader.createDownload(UpdateUrl, {}, function(d, status) {
		if(status == 200) {
			clearInterval(i);
			persent.innerHTML = "100%";
			plus.nativeUI.toast("正在准备安装环境，请稍后！");
			mui.later(function() {
				Next();
			}, 2000);
			var path = d.filename;
			plus.runtime.install(path); //安装下载的apk文件
			//清除用户信息
			var userinfo = {};
			localStorage.setItem('$userinfo', JSON.stringify(userinfo));
		} else {
			mui.toast("更新失败");
			Next();
		}
	});
	dtask.start();
	var i = setInterval(function() {
		var totalSize = dtask.totalSize;
		if(totalSize > 0) {
			proDownFile.setAttribute("max", totalSize);
			var downloadedSize = dtask.downloadedSize;
			proDownFile.setAttribute("value", downloadedSize);
			persent.style.left = totalProgress * downloadedSize / totalSize + "px";
			persent.innerHTML = parseInt(100 * downloadedSize / totalSize) + "%";
		}
	}, 100);

}

//下次再说
function Next() {
	base.AddClass(["#myprogress", "#myprogressbg"], ["hide"]);
	var subindexPage = plus.webview.getWebviewById("subindex");
	subindexPage.evalJS("PreviewTan2(0)");
}