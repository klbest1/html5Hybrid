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
var app = {
    // Application Constructor
    initialize: function () {
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
    var chosedEntries = [];
    var sdCardRootEntry = null;

    var loadApp = {
        setScreen: function () {
            var size = $(window).width() / 41;
            $('html').css('font-size', size);
        },
        dataInit: {
            listItemClickFun: function (event) {
                console.log('clicked');
                var isSim = device.isVirtual;
                if (!isSim) {
                    var fileItem = $(this);
                    var entry = fileItem.data("entry");
                    fileDealer.openEntry(entry, function (entries) {
                        htmlDealer.createFileList(entries, entry)
                        loadApp.dataInit.addCheckEvent();
                    });
                }
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
                                attachMyEvent($(elem), function () {
                                    htmlDealer.gotoNextDirectory($(elem));
                                }, false);
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
            getEntryPackages: function () {
                var fileData = locaDataManager.getDataByKey(keyEntries);
                var entriesInDataBase = fileData.keyData;
                //entriesInDataBase 这个不是JQUERY对象
                entriesInDataBase.forEach(function (item, index) {
                    if (item.isFile) {
                        sdCardRootEntry.getFile(item.fullPath, {create: false, exclusive: true},
                            function (entry) {
                                chosedEntries.push(entry);
                            }, function (error) {
                                console.log(error);
                            });
                    } else {
                        sdCardRootEntry.getDirectory(item.fullPath, {create: false, exclusive: true},
                            function (entry) {
                                chosedEntries.push(entry);
                            }, function (error) {
                                console.log(error);
                            });
                    }
                    //已被选中的文件,将不会显示作为目标文件
                    var idName = "#" + pinyin.getFullChars(item.name);
                    $(idName).hide();
                });
            }
        },
        setupView: function () {
            this.myScroll = new IScroll('#listContainerId', {
                mouseWheel: true, scrollbars: true
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
            //打开sd卡目录,在回调中创建页面
            fileDealer.openSDCard(function (entries, rootEntry) {
                sdCardRootEntry = rootEntry;
                htmlDealer.myscrollView = loadApp.myScroll;
                htmlDealer.createFileList(entries, rootEntry);
                loadApp.myScroll.refresh();
                _this.dataInit.addCheckEvent();
                _this.dataInit.getEntryPackages();
            });
        },
        bindEvents: function () {
            var _this = this;
            var backToHome = function (success) {
                window.plugins.nativepagetransitions.slide({
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

            $('.upper').on("click", function () {
                var currentEntry = $('.currentPath').data("currentEntry");
                currentEntry.getParent(function (parentEntry) {
                    fileDealer.openEntry(parentEntry, function (entries) {
                        htmlDealer.createFileList(entries, parentEntry);
                        _this.dataInit.addCheckEvent();
                    });
                }, function (error) {
                    console.log("Error" + error);
                })
            });

            //添加点击事件
            $('.list').on("click", ".listItem", 0, _this.dataInit.listItemClickFun);

            //返回按钮
            $('#bar-left-itemoneID').on('click', function () {
                backToHome();
            });

            //确定按钮
            $('#bar-right-itemoneID').on('click', function () {
                var destination = $('.icon-ok-squared').parent('.listItem').data('entry');
                if (destination == null || destination == undefined) {
                    htmlUtil.showNotifyView('请选择文件!');
                    return;
                }

                var fileData = locaDataManager.getDataByKey(keyEntries);
                var type = fileData.keyType;
                if (type == fileDealType.MovingFile) {

                    var moveFile = function (entry) {
                        entry.moveTo(destination, null, function (newEntry) {
                        }, function (error) {
                            htmlUtil.showNotifyView(error);
                        });
                    }

                    var moveAll = function () {
                        if (chosedEntries.length == 0) {
                            backToHome(function () {
                                htmlUtil.showNotifyView('移动成功!');
                            });
                        } else {
                            var entry = chosedEntries.pop();
                            moveFile(entry);
                            moveAll();
                        }
                    };

                    moveAll();

                } else if (type == fileDealType.DuplicateFile) {
                    var copyFile = function (entry) {
                        entry.copyTo(destination, null, function (newEntry) {

                        }, function (error) {
                            htmlUtil.showNotifyView(error);
                        });
                    }

                    var copyAll = function () {
                        if (chosedEntries.length == 0) {
                            backToHome(function () {
                                htmlUtil.showNotifyView('拷贝成功!');
                            });
                        } else {
                            var entry = chosedEntries.pop();
                            copyFile(entry);
                            copyAll();
                        }
                    }

                    copyAll();
                }

            });
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
