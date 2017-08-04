function getSel(w) {
	return w.getSelection ? w.getSelection() : w.document.selection;
}

function setRange(sel, r) {
	sel.removeAllRanges();
	sel.addRange(r);
}

function filterPasteData(originalText) {
	var newText = originalText;
	//do something to filter unnecessary data 
	return newText;
}

function block(e) {
	e.preventDefault();
}
var w, or, divTemp, originText;
var newData;

function pasteClipboardData(editorId, e) {
	var objEditor = document.getElementById(editorId);
	var edDoc = objEditor.contentWindow.document;
	if(isIE) {
		var orRange = objEditor.contentWindow.document.selection.createRange();
		var ifmTemp = document.getElementById("ifmTemp");
		if(!ifmTemp) {
			ifmTemp = document.createElement("IFRAME");
			ifmTemp.id = "ifmTemp";
			ifmTemp.style.width = "1px";
			ifmTemp.style.height = "1px";
			ifmTemp.style.position = "absolute";
			ifmTemp.style.border = "none";
			ifmTemp.style.left = "-10000px";
			ifmTemp.src = "iframeblankpage.html";
			document.body.appendChild(ifmTemp);
			ifmTemp.contentWindow.document.designMode = "On";
			ifmTemp.contentWindow.document.open();
			ifmTemp.contentWindow.document.write("<body></body>");
			ifmTemp.contentWindow.document.close();
		} else {
			ifmTemp.contentWindow.document.body.innerHTML = "";
		}
		originText = objEditor.contentWindow.document.body.innerText;
		ifmTemp.contentWindow.focus();
		ifmTemp.contentWindow.document.execCommand("Paste", false, null);
		objEditor.contentWindow.focus();
		newData = ifmTemp.contentWindow.document.body.innerHTML;
		//filter the pasted data 
		newData = filterPasteData(newData);
		ifmTemp.contentWindow.document.body.innerHTML = newData;
		//paste the data into the editor 
		orRange.pasteHTML(newData);
		//block default paste 
		if(e) {
			e.returnValue = false;
			if(e.preventDefault)
				e.preventDefault();
		}
		return false;
	} else {
		enableKeyDown = false;
		//create the temporary html editor 
		var divTemp = edDoc.createElement("DIV");
		divTemp.id = 'htmleditor_tempdiv';
		divTemp.innerHTML = '\uFEFF';
		divTemp.style.left = "-10000px"; //hide the div 
		divTemp.style.height = "1px";
		divTemp.style.width = "1px";
		divTemp.style.position = "absolute";
		divTemp.style.overflow = "hidden";
		edDoc.body.appendChild(divTemp);
		//disable keyup,keypress, mousedown and keydown 
		objEditor.contentWindow.document.addEventListener("mousedown", block, false);
		objEditor.contentWindow.document.addEventListener("keydown", block, false);
		enableKeyDown = false;
		//get current selection; 
		w = objEditor.contentWindow;
		or = getSel(w).getRangeAt(0);
		//move the cursor to into the div 
		var docBody = divTemp.firstChild;
		rng = edDoc.createRange();
		rng.setStart(docBody, 0);
		rng.setEnd(docBody, 1);
		setRange(getSel(w), rng);
		originText = objEditor.contentWindow.document.body.textContent;
		if(originText === '\uFEFF') {
			originText = "";
		}
		window.setTimeout(function() {
			//get and filter the data after onpaste is done 
			if(divTemp.innerHTML === '\uFEFF') {
				newData = "";
				edDoc.body.removeChild(divTemp);
				return;
			}
			newData = divTemp.innerHTML;
			// Restore the old selection 
			if(or) {
				setRange(getSel(w), or);
			}
			newData = filterPasteData(newData);
			divTemp.innerHTML = newData;
			//paste the new data to the editor 
			objEditor.contentWindow.document.execCommand('inserthtml', false, newData);
			edDoc.body.removeChild(divTemp);
		}, 0);
		//enable keydown,keyup,keypress, mousedown; 
		enableKeyDown = true;
		objEditor.contentWindow.document.removeEventListener("mousedown", block, false);
		objEditor.contentWindow.document.removeEventListener("keydown", block, false);
		return true;
	}
}

//这里的pasteClipboardData是用做onpaste回调函数的， 要使用它的话， 可以通过下面的代码把它加到Html编辑器的iframe的onpaste事件上。
//复制代码 代码如下:

var ifrm = document.getElementById("editor")
if(isIE) {
	ifrm.contentWindow.document.documentElement.attachEvent("onpaste", function(e) {
		return pasteClipboardData(ifrm.id, e);
	});
} else {
	ifrm.contentWindow.document.addEventListener("paste", function(e) {
		return pasteClipboardData(ifrm.id, e);
	}, false);
}