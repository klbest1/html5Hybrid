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

    var passwordInLocal = "";
    var loadApp = {
        setScreen: function () {

        },
        dataInit: {
            setUpHeadView:function () {
                if (passwordInLocal == "" || passwordInLocal == undefined){
                    var title =  $('.middle-title');
                    title.text('设置密码');
                    $('#bar-right-itemoneID').show();
                }else {
                    $('.middle-title').text('验证密码');
                    $('#bar-right-itemoneID').hide();
                }
            },
            getPassword:function () {
                passwordInLocal = fileDealer.getDataFromFile(fileDealer.localFileSystemCreateName.userData,
                    keyUserPassword,
                    function (password) {
                        passwordInLocal = password;
                        loadApp.dataInit.setUpHeadView();
                });
            },
            loadData:function () {
                this.getPassword();
            }
        },
        setupView: function () {

        },
        loadResource: function () {
            var _this = this;
        },
        bindEvents: function () {

            var passwordArray = [];
            var finalPassWord = "";

            $('#bar-left-itemoneID').on('click',function () {
                window.plugins.nativepagetransitions.fade({
                        // the defaults for direction, duration, etc are all fine
                        "href": "index.html"
                    }, function (msg) {
                        console.log("success: " + msg)
                    }, // called when the animation has finished
                    function (msg) {
                        alert("error: " + msg)
                    } // called in case you pass in weird values;
                );
            });

            //设置好密码后,存入本地文件并加密
            $('#bar-right-itemoneID').on('click',function () {
                if (passwordArray.length == 4){
                    fileDealer.writeDataToFile(fileDealer.localFileSystemCreateName.userData,keyUserPassword,finalPassWord,function () {
                        var goToPage = locaDBManager.getDataByKey(keyPassWordFinishPage);
                        //校验成功
                        window.plugins.nativepagetransitions.fade({
                                // the defaults for direction, duration, etc are all fine
                                "href": goToPage
                            }, function (msg) {
                                htmlUtil.showNotifyView("设置成功!你的密码是:"+finalPassWord);
                                console.log("success: " + msg)
                            }, // called when the animation has finished
                            function (msg) {
                                alert("error: " + msg)
                                // called in case you pass in weird values;
                            });
                    });
                }else {
                    htmlUtil.showNotifyView("请输入4位数密码!");
                }
            });


            var setStarsInTheSquare = function (starsNumber,visible) {
                var squares = $('.pass-box');
                squares.each(function (index,item) {
                    $(item).text("");
                });
                for (var i = 0; i<starsNumber;i++){
                    var box = squares[i];
                    if (visible){
                        $(box).text(passwordArray[i]);
                    }else {
                        $(box).text("*");
                    }
                }
            };

            $('.key-number').on('click',function () {
                if (passwordArray.length < 4){
                    var userInput = $(this).text();
                    passwordArray.push(userInput);
                    setStarsInTheSquare(passwordArray.length,(passwordInLocal == ""));
                    if (passwordArray.length == 4){
                        passwordArray.forEach(function (item,index){
                            finalPassWord = finalPassWord + item;
                        });
                       if (passwordInLocal != "" && passwordInLocal != undefined){
                           if(passwordInLocal == finalPassWord){
                               //校验成功
                               window.plugins.nativepagetransitions.fade({
                                       // the defaults for direction, duration, etc are all fine
                                       "href": "safeBox.html"
                                   }, function (msg) {
                                       console.log("success: " + msg)
                                   }, // called when the animation has finished
                                   function (msg) {
                                       alert("error: " + msg)
                                   } // called in case you pass in weird values;
                               );
                           }else {
                               //校验失败
                               htmlUtil.showNotifyView("密码错误!");
                           }
                        }
                    }
                }
            });
            
            $('#findPassword').on('click',function () {
                
            });

            $('#delete').on('click',function () {
                passwordArray.pop();
                finalPassWord = "";
                setStarsInTheSquare(passwordArray.length);
            });


        },

        startLoadingApp: function () {
            this.setScreen();
            this.dataInit.loadData();
            this.setupView();
            this.loadResource();
            this.bindEvents();
        }

    };

    loadApp.startLoadingApp();
}

app.initialize();