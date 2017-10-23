var files = [];
var uploadFiles = [];
var mask = base.CreateMask(false, function() {
	base.CloseWaiting();
});

// 上传文件
function upload() {
	if(files.length <= 0) {
		return;
	}
	base.ShowWaiting("准备上传" + files.length + "张图片");
	plus.uploader.clear();
	var task = plus.uploader.createUpload(base.UploadUrl + "Upload/UploadImage", {
			method: "POST"
		},
		function(t, status) {
			if(status == 200) {
				clearInterval(i);
				var data = JSON.parse(t.responseText);
				if(base.IsNullOrEmpty(data.message)) {
					mui.toast("上传失败");
					mask.close();
				} else {
					Import(data.message);
				}
			} else {
				mui.toast("上传失败");
			}
		}
	);
	task.addData("standard", "Article");
	task.addData("folder", "Article");
	task.addData("number", userinfo.Number);

	mui.each(uploadFiles, function(index, item) {
		if(!base.IsNullOrEmpty(item.url)) {
			task.addFile(item.url, {
				key: item.id
			});
		}
	});

	task.start();
	var i = setInterval(function() {
			var totalSize = task.totalSize;
			var downloadedSize = task.uploadedSize;
			if(totalSize > 0) {
				base.ShowWaiting("上传进度：" + parseFloat(100 * downloadedSize / totalSize).toFixed(2) + "%");
			}
		},
		100);
}

//拍照  
function Camera() {
	mui('#upload').popover('hide');
	uploadFiles = [];
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			mask.show();
			base.ShowWaiting("正在压缩图片");
			files = [entry.toLocalURL()]
			compressImage(files[0]);
		});
	});
}

// 从相册中选择图片
function Gallery() {
	mui('#upload').popover('hide');
	uploadFiles = [];
	plus.gallery.pick(function(e) {
		mask.show();
		base.ShowWaiting("正在压缩图片");
		files = e.files;
		compressImage(files[0]);
	}, function(e) {
		console.log("取消选择图片");
	}, {
		filter: "image",
		multiple: true,
		maximum: 100,
		system: false
	});
}

//压缩图片 
function compressImage(src) {
	var dstname = "_downloads/" + base.GetUid() + ".jpg"; //设置压缩后图片的路径  
	plus.zip.compressImage({
			src: src,
			dst: dstname,
			overwrite: true,
			quality: 90
		},
		function(event) {
			uploadFiles.push({
				id: base.GetUid(),
				url: event.target
			})
			if(uploadFiles.length < files.length) {
				compressImage(files[uploadFiles.length]);
			} else {
				upload();
			}
		},
		function(error) {
			uploadFiles.push({
				id: 0,
				url: ""
			})
			if(uploadFiles.length < files.length) {
				compressImage(files[uploadFiles.length]);
			} else {
				upload();
			}
		});
}

//创建段落 
function Import(url) {
	base.ShowWaiting("正在同步段落信息");
	var urls = url.split(',');
	var length = urls.length;
	for(var i = 0; i < length; i++) {
		AddPic(base.GetUid(), urls[i], 0);
		if(i >= length - 1) {
			mask.close();
		}
	}
}