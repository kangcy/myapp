var defaultSettingOptions = {
	imgStoragePath: "_downloads/imgs/", //默认的图片缓存目录-存到应用的downloads/imgs下
	defaultImgBase: "../images/", //默认图片的基座路径
	loadingImgName: "default.png", //loading图片的名称
	errorImgName: "default.png", //error图片名称
	imgsTimeStamp: 1000 * 60 * 60 * 24 * 1, //图片缓存的时间戳,毫秒单位,默认为1天
	concurrentDownloadCount: 3, //同时最多的downloader 并发下载数目,默认为3个
	maxTimeSingleDownloadTaskSpend: 1000 * 10 //单个下载任务最大的请求时间,单位毫秒,默认10秒
};

/**
 * 存img dom
 * 图片缓存池,用来解决多张图片并发请求问题
 * 默认是空的,当有多张图片是同一个请求时,缓存池子中会有数据
 * 格式  {'url1':[dom1,dom2]}
 */
var requestImgsPool = {};
var currentDownloadTasks = []; //下载文件网络地址
//并发下载任务,包括下载队列,处理最大并发数下载
var concurrentDownloadTask = {
	Queue: [], //任务池-还没有下载的任务
	CurrentTaskCount: 0 //当前正在下载的任务数量
};

/**
 * @description 从网络下载图片,并给指定的img dom赋值
 * @param {HTMLElement} $img 目标img 原生dom
 * @param {String} loadUrl 网络图片路径
 * @param {String} relativePath 图片下载后的本地路径,如果不指定,采用默认值 在_downloads/imgs/下
 */
function setImgFromNet($img, loadUrl, relativePath) {

	//解决网络缓存问题
	var loadUrl = MobileFrame.changImgUrlTypeNoCache(loadUrl);

	if(loadUrl.toString().toLowerCase().indexOf("http://") < 0) {
		loadUrl = base.RootUrl + loadUrl;
	}

	//创建下载任务
	var dtask = plus.downloader.createDownload(loadUrl, {
		filename: loadUrl,
		timeout: 3,
		retryInterval: 3
	}, function(d, status) {
		if(status == 200) {
			console.log("下载成功=" + relativePath);

			//缓存图片地址
			setImgFromLocalCache($img, relativePath);
		} else {

			//下载失败，删除临时文件
			MobileFrame.delFile(relativePath);
		}
		//下载完成,从当前下载队列中去除
		currentDownloadTasks[dtask.url] = null;
		executeDownloadTasks();
	});

	//启动下载任务,添加进入下载队列中
	concurrentDownloadTask.Queue.push(dtask);

	//执行并发下载队列
	executeDownloadTasks();
}

//执行下载任务,通过队列中一个一个的进行
function executeDownloadTasks() {
	console.log('检查下载队列');

	mui.each(currentDownloadTasks, function(index, taskItem) {
		if(taskItem == null) {
			currentDownloadTasks.splice(index, 1);
			concurrentDownloadTask.CurrentTaskCount--;
			console.log('存在为空的任务,手动剔除');
		} else {
			//如果当前下载人已经超时,并且没有自动触发回调,终止任务下载
			if(taskItem.timeBegin && (new Date()).valueOf() - taskItem.timeBegin > defaultSettingOptions.maxTimeSingleDownloadTaskSpend) {
				taskItem.taskObj && taskItem.taskObj.abort && taskItem.taskObj.abort();
				currentDownloadTasks.splice(index, 1);
				concurrentDownloadTask.CurrentTaskCount--;
				console.log('存在超时的任务,手动剔除');
			}
		}
	});

	//当前下载任务小于并发下载数       
	if(concurrentDownloadTask.CurrentTaskCount < defaultSettingOptions.concurrentDownloadCount) {
		if(concurrentDownloadTask.Queue.length > 0) {
			var nowTask = concurrentDownloadTask.Queue.shift(); //shift()方法用于把数组的第一个元素从其中删除，并返回第一个元素的值,即返回第一个下载任务
			nowTask.start()

			concurrentDownloadTask.CurrentTaskCount++; //当前任务数++
			currentDownloadTasks[nowTask.url] = {
				taskObj: nowTask,
				timeBegin: (new Date()).valueOf()
			}
			console.log('添加一个下载任务');
		} else {
			console.log('已经没有了下载任务');
		}
	} else {
		console.log('已经达到最大下载数量,延迟下载');
	}
};

var MobileFrame = {};

//初始化
MobileFrame.init() {
	var imgs = document.querySelectorAll('img');
	MobileFrame.each(imgs, function(key, value) {
		var src = this.getAttribute('data-lazyload');
		if(!bsae.IsNullOrEmpty(src)) {
			ImgLoaderFactory.setImgWidthLocalCache(this, src);
		}
	});
}

/**
 * @description 得到相对路径对应的key,这个key可以使缓存池的或者是本地缓存键值
 * 主要作用是去除非法字符
 * @param {String} relativePath
 */
MobileFrame.getRelativePathKey = function(relativePath) {
	var finalKey = relativePath.replace(/[&\|\\\*^%$#@\-]/g, "");
	console.log('finalKey:' + relativePath + ',' + finalKey)
	return finalKey;
};

//更改url类型,去除cache,因为cache会造成一些困扰
MobileFrame.changImgUrlTypeNoCache = function(url) {
	url = url || '';
	if(url.indexOf('?') != -1) {
		url += '&timeRandKey=' + Math.random();
	} else {
		url += '?timeRandKey=' + Math.random();
	}
	return url;
};

/**
 * @description 给指定的图片dom 设置本地图片属性
 * @param {HTMLElement} $img 目标图片dom,这里为原生的dom对象
 * @param {String} relativePath 本地图片路径
 */
MobileFrame.setImgFromLocalCache = function($img, relativePath) {
	if(!relativePath) {
		return;
	}
	/** 相对路径:downloads/imgs/logo.jpg转成SD卡绝对路径
	 * "/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/imgs/logo.jpg"
	 **/
	var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
	MobileFrame.setImgSrc($img, sd_path, relativePath);
};

/**
 * @description 设置图片的src地址,根据一个url,为所有需要的图片赋值
 * @param {HTMLElement} $img 图片的dom,这里为原生dom对象
 * @param {String} srcUrl 图片的路径
 * @param {String} relativePath 相对路径,用来判断缓存池的
 */
MobileFrame.setImgSrc = function($img, srcUrl, relativePath) {
	if(!srcUrl) {
		return;
	}
	MobileFrame.setImgSrcByDom($img, srcUrl);
	if(!relativePath) {
		return;
	}
	var relativePathKey = MobileFrame.getRelativePathKey(relativePath);
	if(requestImgsPool && requestImgsPool[relativePathKey]) {
		var imgsData = requestImgsPool[relativePathKey];
		//如果是数组
		if(Array.isArray(imgsData)) {
			mui.each(imgsData, function(i, item) {
				MobileFrame.setImgSrcByDom(item, srcUrl);
			})
		} else {
			//单条数据--单个dom对象
			MobileFrame.setImgSrcByDom(imgsData, srcUrl);
		}
		if(srcUrl != defaultLoadingImg) {
			//如果不是loading图片就清空,清空图片池子中的该条键值
			requestImgsPool[relativePathKey] = null;
		}
	}
};

/**
 * @description 设置图片的src地址,一个dom和一个 src一一对应
 * @param {HTMLElement} $img 图片的dom,原生dom对象
 * @param {String} srcUrl 图片的路径
 */
MobileFrame.setImgSrcByDom = function($img, srcUrl) {
	if(!$img || !($img instanceof HTMLElement)) {
		console.log('该dom不是原生对象,url:' + srcUrl);
		return;
	}
	srcUrl = MobileFrame.changImgUrlTypeNoCache(srcUrl);
	console.log("srcUrl:" + srcUrl)
	$img.setAttribute('src', srcUrl);
};

/**
 * @description 删除指定路径的文件
 * @param {String} relativePath  绝对路径或相对路径例如:  _downloads/imgs/test.jpg
 * @param {Function} successCallback  删除成功回调
 * @param {Function} errorCallback  失败回调
 */
MobileFrame.delFile = function(relativePath, successCallback, errorCallback) {
	if(!relativePath) {
		return;
	}
	plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
		entry.remove(function(entry) {
			if(successCallback && typeof(successCallback) == 'function') {
				successCallback(true);
			}
		}, function(e) {
			if(errorCallback && typeof(errorCallback) == 'function') {
				errorCallback('删除文件失败!');
			}
		});
	}, function() {
		if(errorCallback && typeof(errorCallback) == 'function') {
			errorCallback('打开文件路径失败!');
		}
	});
};