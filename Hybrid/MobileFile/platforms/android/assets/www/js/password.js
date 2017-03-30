var app = {
    // Application Constructor
    initialize: function () {
        var size = $(window).width() / 41;
        $('html').css('font-size', size);
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //笔记
        $(function () {
            ready()
        });
    }
};

function isPassive() {
    var supportsPassiveOption = false;
    try {
        addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassiveOption = true;
            }
        }));
    } catch (e) {
    }
    return supportsPassiveOption;
}

/***iscroll 不能滑动了,怎么回事?????开始记录解决心路....
 1.调试
 2.经过接近半个小时的折腾，经过调试终于发现，style没有被写上
 3.原来是scss,自动把我的类名.listContainer转为小写了，我的饿fuck,
 4.所以要经常看chorme调试界面右边的css设置!!!
 */

function ready() {
    
    var loadApp = {
        setScreen: function () {

        },
        dataInit: {
            
        },
        setupView: function () {

        },
        loadResource: function () {
            var _this = this;
        },
        bindEvents: function () {
            
        },

        startLoadingApp: function () {
            this.setScreen();
            this.setupView();
            this.loadResource();
            this.bindEvents();
        }

    };

    loadApp.startLoadingApp();
}

app.initialize();