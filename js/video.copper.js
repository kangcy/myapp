var File = plus.android.importClass("java.io.File");
var Uri = plus.android.importClass("android.net.Uri");
var MediaStore = plus.android.importClass("android.provider.MediaStore");
var Intent = plus.android.importClass("android.content.Intent");

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
		console.log(path);
		// 读文件大小
		var file = new File(path);
		var FileInputStream = plus.android.importClass("java.io.FileInputStream");
		var fileSize = new FileInputStream(file);
		var size = fileSize.available();
		// 单位转换
		var fileSizeString;
		if(size == 0) {
			fileSizeString = "0B";
		} else if(size < 1024) {
			fileSizeString = size + "B";
		} else if(size < 1048576) {
			fileSizeString = (size / 1024).toFixed(2) + "KB";
		} else if(size < 1073741824) {
			fileSizeString = (size / 1048576).toFixed(2) + "MB";
		} else {
			fileSizeString = (size / 1073741824).toFixed(2) + "GB";
		}
		console.log(fileSizeString);

		console.log(path);
		//return;
		//创建上传任务
		var task = plus.uploader.createUpload(base.RootUrl + "Upload/UploadFile", {}, function(t, status) {
			var data = JSON.parse(t.responseText);
			//上传完成 
			if(status == 200) {
				clearInterval(i);
				base.ShowWaiting("正在同步视频")
				if(data.result) {
					AddVideo(base.RootUrl + data.message, 1)
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
		$("#myprogressbg,#myprogress").removeClass("hide");
		var i = setInterval(function() {
			var totalSize = task.totalSize;
			var downloadedSize = task.uploadedSize;
			document.getElementById("proDownFile").setAttribute("value", downloadedSize);
			document.getElementById("proDownFile").setAttribute("max", totalSize);
			if(totalSize > 0) {
				document.getElementById("persent").innerHTML = parseInt(100 * downloadedSize / totalSize) + "%";
			}
		}, 100);
	}, function(e) {
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
		title: "从视频库选择"
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