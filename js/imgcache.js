//日期格式化
Date.prototype.format = function(n) {
	var i = {
			"M+": this.getMonth() + 1,
			"d+": this.getDate(),
			"h+": this.getHours(),
			"m+": this.getMinutes(),
			"s+": this.getSeconds(),
			"q+": Math.floor((this.getMonth() + 3) / 3),
			S: this.getMilliseconds()
		},
		t;
	/(y+)/.test(n) && (n = n.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)))
	for(t in i) new RegExp("(" + t + ")").test(n) && (n = n.replace(RegExp.$1, RegExp.$1.length == 1 ? i[t] : ("00" + i[t]).substr(("" + i[t]).length)))
	return n
}

var defaultSettingOptions = {
	imgStoragePath: "_downloads/imgs/", //默认的图片缓存目录-存到应用的downloads/imgs下
	defaultImgBase: "../images/", //默认图片的基座路径
	loadingImgName: "default.png", //loading图片的名称
	errorImgName: "default.png", //error图片名称
	imgsTimeStamp: 1000 * 60 * 60 * 24 * 1, //图片缓存的时间戳,毫秒单位,默认为1天
	concurrentDownloadCount: 3, //同时最多的downloader 并发下载数目,默认为3个
	maxTimeSingleDownloadTaskSpend: 1000 * 10 //单个下载任务最大的请求时间,单位毫秒,默认10秒
};

//图片缓存的session的管理者
var imageSessionManagerKey = 'imageSessionKey_util_Manager';
/**
 * 存img dom
 * 图片缓存池,用来解决多张图片并发请求问题
 * 默认是空的,当有多张图片是同一个请求时,缓存池子中会有数据
 * 格式  {'url1':[dom1,dom2]}
 */
var requestImgsPool = [];
var currentDownloadTasks = []; //下载文件网络地址
//并发下载任务,包括下载队列,处理最大并发数下载
var concurrentDownloadTask = {
	Queue: [], //任务池-还没有下载的任务
	CurrentTaskCount: 0 //当前正在下载的任务数量
};
var dateStorage = {}; //日期缓存图片集合

/**
 * @description 从网络下载图片,并给指定的img dom赋值
 * @param {HTMLElement} $img 目标img 原生dom
 * @param {String} loadUrl 网络图片路径
 * @param {String} relativePath 图片下载后的本地路径,如果不指定,采用默认值 在_downloads/imgs/下
 */
function setImgFromNet($img, loadUrl, relativePath) {

	//解决网络缓存问题
	var loadUrl = MobileFrame.changImgUrlTypeNoCache(loadUrl);

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

/**
 * @description 给指定的图片dom 设置本地图片属性
 * @param {HTMLElement} $img 目标图片dom,这里为原生的dom对象
 * @param {String} relativePath 本地图片路径
 */
function setImgFromLocalCache($img, relativePath) {
	if(!relativePath) {
		return;
	}
	/** 相对路径:downloads/imgs/logo.jpg转成SD卡绝对路径
	 * "/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/imgs/logo.jpg"
	 **/
	var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
	setImgSrc($img, sd_path, relativePath);
};

/**
 * @description 准备通过网络获取图片
 * @param {HTMLElement} $img 原生dom对象
 * @param {String} loadUrl loadurl
 * @param {String} relativePath 本地相对路径
 */
function readyToGetNetImg($img, loadUrl, relativePath) {
	//如果文件不存在,上网下载
	if(MobileFrame.IsNetWorkCanUse()) {
		//添加进入图片缓存池中
		var relativePathKey = MobileFrame.getRelativePathKey(relativePath);
		if(requestImgsPool && requestImgsPool[relativePathKey] && Array.isArray(requestImgsPool[relativePathKey])) {
			requestImgsPool[relativePathKey].push($img); //如果已经存在该条图片缓存池,代表这条资源已经进行请求了,只需要填进响应池子即可
			return;
		} else {
			//新建缓存池
			requestImgsPool[relativePathKey] = [];
			requestImgsPool[relativePathKey].push($img);
		}
		//如果网络状态能用,联网下载图片
		setImgFromNet($img, loadUrl, relativePath);
	}
};

/**
 * @description 设置图片的src地址,根据一个url,为所有需要的图片赋值
 * @param {HTMLElement} $img 图片的dom,这里为原生dom对象
 * @param {String} srcUrl 图片的路径
 * @param {String} relativePath 相对路径,用来判断缓存池的
 */
function setImgSrc($img, srcUrl, relativePath) {
	if(!srcUrl) {
		return;
	}
	setImgSrcByDom($img, srcUrl);
	if(!relativePath) {
		return;
	}
	var relativePathKey = MobileFrame.getRelativePathKey(relativePath);
	if(requestImgsPool && requestImgsPool[relativePathKey]) {
		var imgsData = requestImgsPool[relativePathKey];
		//如果是数组
		if(Array.isArray(imgsData)) {
			mui.each(imgsData, function(i, item) {
				setImgSrcByDom(item, srcUrl);
			})
		} else {
			//单条数据--单个dom对象
			setImgSrcByDom(imgsData, srcUrl);
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
function setImgSrcByDom($img, srcUrl) {
	if(!$img || !($img instanceof HTMLElement)) {
		console.log('该dom不是原生对象,url:' + srcUrl);
		return;
	}
	srcUrl = MobileFrame.changImgUrlTypeNoCache(srcUrl);
	console.log("srcUrl:" + srcUrl)
	$img.setAttribute('src', srcUrl);
};

var MobileFrame = {};
var ImgLoaderFactory = {};

/**
 * @description 通过本地缓存的方法显示网络图片
 * @param {HTMLElement} img 原生dom对象
 * @param {String} loadUrl 网络图片路径
 */
ImgLoaderFactory.setImgWidthLocalCache = function(img, loadUrl) {
	if(img == null || bsae.IsNullOrEmpty(loadUrl)) return;

	//判断需不需要将路径进行编码,如果是中文路径,需要编码后才能下载
	var tmpLoadUrl = loadUrl.replace(/[\u4E00-\u9FA5]/g, 'chineseRemoveAfter');
	if(tmpLoadUrl.indexOf('chineseRemoveAfter') != -1) {
		loadUrl = encodeURI(loadUrl);
	}
	//判断是否已经缓存过期
	var isCacheOutOfTime = false;

	//获取图片本地缓存路径
	var relativePath = ImgLoaderFactory.getRelativePathFromLoadUrl(loadUrl);
	if(base.IsNullOrEmpty(relativePath)) {
		return;
	}

	//检查图片是否已存在
	plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
		setImgFromLocalCache(img, relativePath);
	}, function(e) {
		readyToGetNetImg(img, loadUrl, relativePath);
	});
};

/**
 * @description 从一个网络URL中,获取本地图片缓存相对路径
 * @param {String} loadUrl 图片的网络路径,如果为null,则返回一个null
 * @example 获取相对路径可以有很多种方法
 */
ImgLoaderFactory.getRelativePathFromLoadUrl = function(loadUrl) {
	if(loadUrl == null) return [false, loadUrl];
	var local = getImageSessionItem(loadUrl); //如果存在本地缓存,并且没有过期,采用本地缓存中的图片
	if(local != null) {
		return local;
	}
	var imgSuffix = loadUrl.substring(loadUrl.lastIndexOf(".") + 1, loadUrl.length).toLowerCase(); //获取图片后缀,如果没有获取到后缀,默认是jpg
	if(imgSuffix != "jpg" && imgSuffix != "jpeg" && imgSuffix != "png" && imgSuffix != "bmp" && imgSuffix != "svg" && imgSuffix != "gif") {
		return [false, loadUrl];
	}
	//替换前：http://www.xiaoweipian.com/Images/Showy/01/05.png
	//替换后：httpwwwxiaoweipiancomImagesShowy0105png

	var imgName = loadUrl.replace(/[&\|\\\*^%$#@\-:.?\/=!]/g, ''); //获取图片名字
	var filename = imgName + '.' + imgSuffix; //最终的名字
	var relativePath = defaultSettingOptions.imgStoragePath + filename;
	console.log('relativePath:' + relativePath + 'loadurl:' + loadUrl + ',fileName:' + filename);
	setImageSessionItem(loadUrl, relativePath);
	return [true, relativePath];
};

/**
 * 获取图片缓存key
 * @param {String} url
 * @return {JSON} item 返回的是一个json对象,包括图片相关的所有属性,包括时间戳,本地路径等
 * @example 包含属性:time localPath
 */
function getImageSessionItem(url) {
	if(url == null) {
		return null;
	}
	url = MobileFrame.getRelativePathKey(url);
	var item = plus.storage.getItem(url);
	try {
		if(item != null) {
			item = JSON.parse(item);
		}
	} catch(e) {}
	return item;
};

/**
 * 设置图片缓存key
 * @param {String} url
 * @param {JSON} value 存进去的是图片相关的所有属性,包括时间戳,本地路径等
 */
function setImageSessionItem(url, value) {
	if(url == null) {
		return;
	}
	addImageToGroup(url); //加入缓存组中
	url = MobileFrame.getRelativePathKey(url);
	value = (value != null) ? value : '';
	value = (typeof(value) == 'string') ? value : JSON.stringify(value);
	plus.storage.setItem(url, value);
};

/**
 * 移除图片缓存key
 * @param {String} url
 */
function removeImageSessionItem(url) {
	if(url == null) {
		return null;
	}
	removeImageFromGroup(url);
	url = MobileFrame.getRelativePathKey(url);
	var items = plus.storage.removeItem(url);
};

/**
 * @description 移除所有的图片缓存键
 */
function deleteGroup(key) {
	var manager = plus.storage.getItem(key);
	if(manager == null) {
		return;
	}
	try {
		manager = JSON.parse(manager);
	} catch(e) {}
	if(Array.isArray(manager)) {
		mui.each(manager, function(i, item) {
			removeImageSessionItem(item);
		})
	}
};

/**
 * @description 加入缓存组中，按日期分组
 * @param {String} key 图片原始路径
 */
function addImageToGroup(url) {
	var key = new Date().format('yyyyMMdd');
	var manager = plus.storage.getItem(key);
	if(manager == null) {
		manager = [];
	} else {
		try {
			manager = JSON.parse(manager);
		} catch(e) {}
	}
	var exist = manager.some(x => {
		return x == url;
	});
	if(!exist) {
		manager.push(url);
	}
	plus.storage.setItem(key, JSON.stringify(manager));
};

/**
 * @description 从缓存管理中移除相应的图片缓存
 * @param {String} key 图片路径对应的key
 */
function removeImageFromGroup(url) {
	var key = new Date().format('yyyyMMdd');
	var manager = plus.storage.getItem(imageSessionManagerKey);
	if(manager == null) {
		return;
	}
	try {
		manager = JSON.parse(manager);
	} catch(e) {}
	var index = -1;
	mui.each(manager, function(i, item) {
		if(item == url) {
			index = i;
		}
	})
	if(index != -1) {
		manager.splice(index, 1);
		plus.storage.setItem(key, JSON.stringify(manager));
	}
};

//初始化
MobileFrame.init(img) {
	img.removeAttribute("onload");
	var src = img.getAttribute('data-lazyload');
	if(!bsae.IsNullOrEmpty(src)) {
		if(src.toString().toLowerCase().indexOf("http://") < 0) {
			src = base.RootUrl + src;
		}
		ImgLoaderFactory.setImgWidthLocalCache(img, src);
	}
}

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
 * @description 判断是否有网络
 */
MobileFrame.IsNetWorkCanUse = function() {
	var IsCanUseNetWork = false;
	var NetStateStr = '未知';
	var types = {};
	types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
	types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
	types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
	types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
	types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
	types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
	types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";
	NetStateStr = types[plus.networkinfo.getCurrentType()];
	if(NetStateStr == '未知' || NetStateStr == '未连接网络') {
		IsCanUseNetWork = false;
	} else {
		IsCanUseNetWork = true;
	}
	return IsCanUseNetWork;
};