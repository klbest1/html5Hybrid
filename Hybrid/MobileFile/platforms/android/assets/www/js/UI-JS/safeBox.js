/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var safeApp = {
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
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        document.addEventListener('active', this.onActivated, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //笔记
        $(function () {
            ready();
        });
    },
    onPause: function () {
        console.log('onPause');
    },
    onResume: function () {
        console.log('onResume');
        //查看后删除文件
        fileDealer.deleteFile(cordova.file.externalDataDirectory + "com.mobileFile.UnzipedFiles");
    },
    onActivated: function () {
        console.log('onActivated');
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
    var safeBoxsData = [];
    var isCanceledUnzip = false;
    var loadApp = {
        setScreen: function () {
            // var size = $(window).width() / 41;
            // $('html').css('font-size', size);
        },
        dataInit: {
            listItemClickFun: function (event) {
                console.log('clicked');
                var isSim = device.isVirtual;
                var fileItem = $(this);
                var safeData = fileItem.data(keySafeData);
                var zipedPath = safeData[keyFilePath] + ".zip";
                //先解压
                var targetPath = cordova.file.externalDataDirectory + "com.mobileFile.UnzipedFiles";

                zip.unzip(zipedPath, targetPath, function (code) {
                    if (code == 0) {
                        console.log('success');
                        // var fileNeedOpenPath = stringDealer.stringByRepalce(targetPath,'file:///','/');
                        var fileNeedOpenPath = targetPath + "/" + safeData[keyFileName];
                        fileNeedOpenPath = decodeURIComponent(fileNeedOpenPath);
                        if (!isCanceledUnzip){
                            //打开文件
                            cordova.plugins.fileOpener2.open(
                                fileNeedOpenPath, // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
                                safeData[keyFileMIMEType],
                                {
                                    error: function (e) {
                                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                                    },
                                    success: function () {
                                        console.log('file opened successfully');
                                    }
                                }
                            );
                        }else {
                            isCanceledUnzip = false;
                            //删除文件
                            fileDealer.deleteFile(cordova.file.externalDataDirectory + "com.mobileFile.UnzipedFiles");
                        }
                    }
                }, function (progressEvent) {
                    var progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    var cssString =  progress + '%';
                    var sizeString = (progressEvent.loaded/ 1024).toFixed(2) +'MB' + '/' + (progressEvent.total/1024).toFixed(2) + "MB";
                    $('#opening-process-wrapper').show();
                    $('#opening-filename').text(safeData[keyFileName]);
                    $('#opening-percentage').text(cssString);
                    $('#opening-size').text(sizeString);
                    $('#opening-process-line-incresing').css('width',cssString);
                    if(progress == 100){
                        $('#opening-process-wrapper').hide();
                    }
                    console.log("progress:" + progress + "%");
                });

            },
            addCheckEvent: function () {
                var _this = this;
                var isSim = device.isVirtual;

                var clearOtherCheckBoxes = function () {
                    $('.icon-ok-squared').each(function (index, elem) {
                        $(elem).removeClass('icon-ok-squared').addClass('icon-check-empty');
                    });
                };
                var changeCheckState = function (checkEle) {
                    if (checkEle.hasClass('icon-check-empty')) {
                        clearOtherCheckBoxes();
                        checkEle.removeClass('icon-check-empty').addClass('icon-ok-squared');
                    } else {
                        checkEle.removeClass('icon-ok-squared').addClass('icon-check-empty');
                    }

                    //有选项被选中
                    if ($('.icon-ok-squared').length > 0) {
                        if (isSim) {
                            var elems = $('.listItem');
                            elems.each(function (index, elem) {
                                removeEvent($(elem));
                            });
                        } else {
                            $('.list').off('click', '.listItem', _this.listItemClickFun);
                        }

                    } else {
                        if (isSim) {
                            var elems = $('.listItem');
                            elems.each(function (index, elem) {
                                attachMyEvent($(elem), _this.listItemClickFun, false);
                            });
                        } else {
                            $('.list').on('click', '.listItem', _this.listItemClickFun);
                        }
                    }
                };

                if (isSim) {
                    attachMyEvent($('.icon-check-common'), function () {
                        var _this = $(this);
                        changeCheckState(_this);
                    }, true);
                } else {
                    $('.icon-check-common').on('click', function (event) {
                        var _this = $(this);
                        changeCheckState(_this);
                        event.stopPropagation();

                    });
                }
            },
            getSafeBoxDatas: function () {
                safeBoxsData = locaDBManager.getAllDataFromTable(locaDBManager.tableNames.SafeBoxFileInfo);

            },
            loadData: function () {
                loadApp.dataInit.getSafeBoxDatas();
                //这里设置引用,以便外部可以引用到datainit里面的方法
                safeApp.app = loadApp;
            }
        },
        setupView: function () {
            this.myScroll = new IScroll('#wrapper', {
                scrollY: true,
                // scrollX: true,
                momentum: false,
                snap: true,
            });
            document.addEventListener('touchmove', function (e) {
                e.preventDefault();
            }, isPassive() ? {
                capture: false,
                passive: false
            } : false);
        },
        loadResource: function () {
            var _this = this;
            htmlDealer.myscrollView = _this.myScroll;
            htmlDealer.createSafeBoxFileList(safeBoxsData);
            _this.dataInit.addCheckEvent();
        },
        bindEvents: function () {
            var _this = this;
            var backToHome = function (success) {
                window.plugins.nativepagetransitions.fade({
                        // the defaults for direction, duration, etc are all fine
                        "href": "index.html",
                        "direction": "right" // 'left|right|up|down', default 'left' (which is like 'next')
                    }, function (msg) {
                        console.log("success: " + msg)
                        success();
                    }, // called when the animation has finished
                    function (msg) {
                        alert("error: " + msg)
                    } // called in case you pass in weird values;
                );
            };

            //添加点击事件
            $('.list').on("click", ".listItem", 0, _this.dataInit.listItemClickFun);

            $('#myFile').on('click', function () {
                backToHome();
            });

            $('#opening-cancel-button').on('click',function () {
               $('#opening-process-wrapper').hide();
                isCanceledUnzip = true;
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

safeApp.initialize();
