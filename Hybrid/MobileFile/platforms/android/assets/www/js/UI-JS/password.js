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
            setUpHeadView: function () {
                if (passwordInLocal == "" || passwordInLocal == undefined) {
                    var title = $('.middle-title');
                    title.text('设置密码');
                    $('#bar-right-itemoneID').show();
                } else {
                    $('.middle-title').text('验证密码');
                    $('#bar-right-itemoneID').hide();
                }
            },
            getPassword: function () {
                passwordInLocal = fileDealer.getDataFromFile(fileDealer.localFileSystemCreateName.userData,
                    keyUserPassword,
                    function (password) {
                        passwordInLocal = password;
                        loadApp.dataInit.setUpHeadView();
                    });
            },
            loadData: function () {
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

            $('#bar-left-itemoneID').on('click', function () {
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
            $('#bar-right-itemoneID').on('click', function () {
                if (passwordArray.length == 4) {
                    htmlUtil.showNotifyView("请输入密保问题,用于找回密码");
                    $('#dialogView').show();
                    $('#dialogView').data('type', questionInputType.question);
                    document.getElementById("inputID").placeholder = "输入密保问题:(如我的最爱是?)";
                } else {
                    htmlUtil.showNotifyView("请输入4位数密码!");
                }
            });

            $('#confirmButton').on('click', function () {
                var inputValue = $('#inputID').val();
                if (inputValue.length > 0) {
                    var type = $('#dialogView').data('type');
                    if (type == questionInputType.question) {
                        fileDealer.writeDataToFile(fileDealer.localFileSystemCreateName.userData, keyQuestion, inputValue, function () {
                            $('#dialogView').data('type', questionInputType.answer);
                            htmlUtil.showNotifyView("请输入密保答案")
                            $('#inputID').val("");
                            document.getElementById("inputID").placeholder = "输入密保答案";
                        });
                    } else if (type == questionInputType.answer) {
                        fileDealer.writeDataToFile(fileDealer.localFileSystemCreateName.userData, keyAnswer, inputValue, function () {
                            $('#dialogView').hide();
                            var goToPage = locaDBManager.getDataByKey(keyPassWordFinishPage);
                            locaDBManager.saveData(keyDidFinishSettingPathWord, true);
                            fileDealer.writeDataToFile(fileDealer.localFileSystemCreateName.userData, keyUserPassword, finalPassWord, function () {
                                //校验成功
                                window.plugins.nativepagetransitions.fade({
                                        // the defaults for direction, duration, etc are all fine
                                        "href": goToPage
                                    }, function (msg) {
                                        setTimeout(htmlUtil.showNotifyView("设置成功!你的密码是:" + finalPassWord), 500);
                                        console.log("success: " + msg)
                                    }, // called when the animation has finished
                                    function (msg) {
                                        alert("error: " + msg);
                                        // called in case you pass in weird values;
                                    });
                            });
                        });
                    }
                }
            });


            var setStarsInTheSquare = function (starsNumber, visible) {
                var squares = $('.pass-box');
                squares.each(function (index, item) {
                    $(item).text("");
                });
                for (var i = 0; i < starsNumber; i++) {
                    var box = squares[i];
                    if (visible) {
                        $(box).text(passwordArray[i]);
                    } else {
                        $(box).text("*");
                    }
                }
            };

            var clickingNumbers = function () {
                if (passwordArray.length < 4) {
                    var userInput = $(this).text();
                    passwordArray.push(userInput);
                    setStarsInTheSquare(passwordArray.length, (passwordInLocal == ""));
                    if (passwordArray.length == 4) {
                        passwordArray.forEach(function (item, index) {
                            finalPassWord = finalPassWord + item;
                        });
                        if (passwordInLocal != "" && passwordInLocal != undefined) {
                            if (passwordInLocal == finalPassWord) {
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
                            } else {
                                //校验失败
                                htmlUtil.showNotifyView("密码错误!");
                            }
                        }
                    }
                }
            };
            $('#number-one').on('click', function () {
                clickingNumbers.bind(this)();
            });

            $('#number-two').on('click', function () {
                clickingNumbers.bind(this)();
            });

            $('#number-three').on('click', function () {
                clickingNumbers.bind(this)();
            });

            $('#number-four').on('click', function () {
                clickingNumbers.bind(this)();
            });

            $('#number-five').on('click', function () {
                clickingNumbers.bind(this)();
            });
            $('#number-six').on('click', function () {
                clickingNumbers.bind(this)();
            });
            $('#number-seven').on('click', function () {
                clickingNumbers.bind(this)();
            });
            $('#number-eight').on('click', function () {
                clickingNumbers.bind(this)();
            });
            $('#number-nine').on('click', function () {
                clickingNumbers.bind(this)();
            });
            $('#number-zero').on('click', function () {
                clickingNumbers.bind(this)();
            });

            $('#findPassword').on('click', function () {
                window.plugins.nativepagetransitions.fade({
                        // the defaults for direction, duration, etc are all fine
                        "href": 'findPassword.html'
                    }, function (msg) {
                        console.log("success: " + msg)
                    }, // called when the animation has finished
                    function (msg) {
                        alert("error: " + msg)
                        // called in case you pass in weird values;
                    });
            });

            $('#delete').on('click', function () {
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