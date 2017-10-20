//摄像
function getVideo() {

	var intent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
	intent.putExtra(MediaStore.EXTRA_VIDEO_QUALITY, 1); //0 最低质量, 1高质量MediaStore.EXTRA_SIZE_LIMIT
	intent.putExtra(MediaStore.EXTRA_DURATION_LIMIT, 10); //10秒视频
	var main = plus.android.runtimeMainActivity();
	main.startActivityForResult(intent, 1);

	//停止录像 
	main.onActivityResult = function(request, code, data) {
		if(request != 1001 && code == -1) {
			galleryVideo();
		}
	}
}

//相册选取视频
function galleryVideo() {
	plus.gallery.pick(function(path) {
			//创建上传任务
			var task = plus.uploader.createUpload(base.UploadUrl + "Upload/UploadFile", {}, function(t, status) {
				var data = JSON.parse(t.responseText);
				//上传完成 
				if(status == 200) {
					clearInterval(i);
					base.ShowWaiting("正在同步视频")
					if(data.result) {
						AddVideo(base.UploadUrl + data.message, 1)
					}
				} else {
					mui.toast("上传失败");
				}
			});
			task.addFile(path, {
				key: "testdoc"
			});
			task.addData("folder", "video");
			task.start();
			var change = false;
			var i = setInterval(function() {
					var totalSize = task.totalSize;
					//超过5M
					if(parseInt(totalSize / 1048576) > 5) {
						clearInterval(i);
						plus.uploader.clear();
						mui.toast("请上传5M内视频文件")
						return;
					} else {
						if(!change) { 
							change = true;
							base.RemoveClass(["#myprogressbg", "#myprogress"], "hide");
						}
						var downloadedSize = task.uploadedSize;
						base.Get("proDownFile").setAttribute("value", downloadedSize);
						base.Get("proDownFile").setAttribute("max", totalSize);
						if(totalSize > 0) {
							base.Get("persent").innerHTML = parseInt(100 * downloadedSize / totalSize) + "%";
						}
					}
				}, 
				100);
		},
		function(e) {
			console.log("取消选择视频");
		}, {
			filter: "video"
		});
}

//选择
function showActionSheet() {
	var bts = [{
		title: "拍摄"
	}, {
		title: "调用视频库"
	}];
	plus.nativeUI.actionSheet({
			cancel: "取消",
			buttons: bts
		},
		function(e) {
			if(e.index == 1) {
				getVideo();
			} else if(e.index == 2) {
				galleryVideo();
			}
		}
	);
}