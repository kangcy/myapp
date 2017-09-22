/*! JRoll-Pulldown v1.0.0 ~ (c) 2016 Author:BarZu Git:https://github.com/chjtx/JRoll/tree/master/extends/jroll-pulldown */
/* global define, JRoll */
(function (window, document, JRoll) {
  'use strict'

  var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
    setTimeout(callback, 17)
  }
  var TSF = JRoll.utils.TSF
  var moveTo = JRoll.utils.moveTo
  var IMG_STYLE = 'width:15px;height:15px;display:block;'

  JRoll.prototype.pulldown = function (params) {
    var me = this
    var keys = Object.keys(params || {})

    var boxDiv
    var iconSpan
    var textSpan
    var loading
    var rotating
    var angle = 0 

    // 默认选项
    var options = {
      iconArrow: "<img style='" + IMG_STYLE + "' src='../jroll/2.png'>",
      iconLoading: "<img style='" + IMG_STYLE + "' src='../jroll/1.png'>",
      iconFinish: "<img style='" + IMG_STYLE + "' src='../jroll/3.png'>",
      textPull: '下拉刷新',
      textRelease: '释放刷新',
      textLoading: '正在加载',
      textFinish: '刷新完成',
      spinning: true, // 应网友要求添加一个选项控制loading时是否旋转icon
      refresh: null // 刷新自定义执行的函数
    }

    for (var k in keys) {
      options[keys[k]] = params[keys[k]]
    }

    // 先行加载图片，触发浏览器缓存起来避免刷新时再加载显得不流畅
    document.createElement('div').innerHTML = options.iconArrow + options.iconLoading + options.iconFinish

    // 创建下拉的div
    boxDiv = document.createElement('div')
    boxDiv.className = 'jroll-plugin-pulldown'
    boxDiv.style.cssText = 'position:absolute;top:-44px;width:100%;height:44px;line-height:44px;font-size:16px;text-align:center;'

    iconSpan = document.createElement('span')
    iconSpan.className = 'jroll-plugin-pulldown-icon'
    iconSpan.style.cssText = 'display:inline-block;width:15px;height:15px;position:absolute;top:13px;left:35%;'
    iconSpan.innerHTML = options.iconArrow
    boxDiv.appendChild(iconSpan)

    textSpan = document.createElement('span')
    textSpan.className = 'jroll-plugin-pulldown-text c999 f12'
    textSpan.innerHTML = options.textPull
    boxDiv.appendChild(textSpan)

    me.wrapper.appendChild(boxDiv)

    // 监听滑动事件
    me.on('scroll', function () {
      boxDiv.style[TSF] = me.scroller.style[TSF]

      // 达到一定位置显示释放刷新
      if (!loading) {
        if (me.y > 44) {
          iconSpan.style[TSF] = 'rotateZ(180deg)'
          textSpan.innerHTML = options.textRelease
        } else {
          iconSpan.style[TSF] = 'rotateZ(0deg)'
          textSpan.innerHTML = options.textPull
        }
      }
    })
    me.on('touchEnd', function () {
      if (me.y >= 44) {
        // 超过44px禁止回弹
        me.y = 0
        me.options.momentum = false

        // 刷新
        iconSpan.style[TSF] = 'rotateZ(0deg)'
        iconSpan.innerHTML = options.iconLoading
        textSpan.innerHTML = options.textLoading
        setTimeout(function () {
          me.scrollTo(0, 44, 200, true, doRefresh).minScrollY = 44
          moveTo(boxDiv, 0, 44, 200)

          me.options.momentum = true
        }, 10)
      } else if (!loading) {
        moveTo(boxDiv, 0, 0, 200)
      }
    })

    // 执行刷新
    function doRefresh () {
      if (!loading) {
        loading = true
        rotating = true
        angle = 0
        if (options.spinning) {
          makeRotate()
        }
        setTimeout(function () {
          if (typeof options.refresh === 'function') {
            options.refresh(function () {
              // 完成刷新
              rotating = false
              iconSpan.innerHTML = options.iconFinish
              textSpan.innerHTML = options.textFinish

              // 收起刷新栏
              setTimeout(function () {
                moveTo(boxDiv, 0, 0, 200)

                me.scrollTo(0, 0, 200, true, function () {
                  loading = false
                  iconSpan.innerHTML = options.iconArrow
                  textSpan.innerHTML = options.textPull
                }).minScrollY = 0
              }, 500)
            })
          }
        }, 200)
      }
    }

    // 使iconSpan旋转下来
    function makeRotate () {
      angle = angle + 6 >= 360 ? 0 : angle + 6
      iconSpan.style[TSF] = 'rotateZ(' + angle + 'deg)'

      if (rotating) {
        rAF(makeRotate)
      } else {
        iconSpan.style[TSF] = 'rotateZ(0deg)'
      }
    }

    return me
  }

  JRoll.prototype.pulldown.version = '1.0.0'

  // CommonJS/AMD/CMD规范导出JRoll
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = JRoll
  }
  if (typeof define === 'function') {
    define(function () {
      return JRoll
    })
  }
})(window, document, JRoll)
