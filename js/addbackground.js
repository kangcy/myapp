//拍照
function Camera() {
	mui('#power').popover('hide');
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p) {
		plus.io.resolveLocalFileSystemURL(p, function(entry) {
			var localurl = entry.toLocalURL();
			base.OpenWindow("custom", "custom.html", {
				ArticleNumber: articleNumber,
				Url: localurl
			});
		});
	});
}

//相册
function Gallery() {
	mui('#power').popover('hide');
	plus.gallery.pick(function(e) {
		var url = [];
		for(var i = 0; i < e.files.length; i++) {
			url.push(e.files[i]);
		}
		base.OpenWindow("custom", "custom.html", {
			ArticleNumber: articleNumber,
			Url: url.join(',')
		});
	}, function(e) {

	}, {
		filter: "image",
		multiple: true,
		maximum: multiple == 0 ? 1 : 20,
		system: false
	});
}

//微篇相册
function Pic() {
	mui('#power').popover('hide');
	base.OpenWindow("mypic", "mypic.html", {
		Source: "customsetting",
		Multiple: multiple
	});
}

//我的相册选择图片回调
function ConfirmImg(src) {
	if(base.IsNullOrEmpty(src)) {
		return false;
	}
	base.OpenWindow("custom", "custom.html", {
		ArticleNumber: articleNumber,
		Url: src
	});
}