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
var myScroll;

function ready() {
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
                var changeCheckState = function (checkEle) {
                    if (checkEle.hasClass('icon-check-empty')) {
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
                        //操作栏切换动画
                        $('#operatorCreateFile').removeClass('operatorMoveIn').addClass('operatorMoveOut');
                        $('#operatorEdit').removeClass('operatorMoveOut').addClass('operatorMoveIn');
                    } else {
                        if (isSim) {
                            var elems = $('.listItem');
                            elems.each(function (index, elem) {
                                attachMyEvent($(elem), function () {
                                    htmlDealer.gotoNextDirectory($(elem));
                                }, true);
                            });
                        } else {
                            $('.list').on('click', '.listItem', _this.listItemClickFun);
                        }
                        //操作栏切换动画
                        $('#operatorCreateFile').removeClass('operatorMoveOut').addClass('operatorMoveIn');
                        $('#operatorEdit').removeClass('operatorMoveIn').addClass('operatorMoveOut');
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
            }
        },
        setupView: function () {
            myScroll = new IScroll('#listContainerId', {
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
                htmlDealer.createFileList(entries, rootEntry);
                myScroll.refresh();
                _this.dataInit.addCheckEvent();
            });
        },
        bindEvents: function () {
            var _this = this;

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


            /***
             * 底部操作栏
             * */
            $('#createFile').on('click', function () {
                $('#dialogView').show();
            });

            $('#moveFile').on('click',function () {

            });

            $('#duplicateFile').on('click', function () {
            });

            $('#deleteFile').on('click', function () {
               $('#operatorConsult').addClass('operator-consult-up');
            });
            
            $('#operator-confirm').on('click',function () {
                var success = true;

                var removeSuccess = function () {
                };

                var removeFailed = function (error) {
                    success = false;
                    htmlUtil.showNotifyView(error.toLocaleString());
                };

                var checkedItems = $('.icon-ok-squared');
                checkedItems.each(function (index,elem) {
                    var entry = $(elem).parent('.listItem').data('entry');
                    if (entry.isFile){
                        entry.remove(removeSuccess,removeFailed)
                    }else {
                        entry.removeRecursively(removeSuccess,removeFailed);
                    }
                });

                if( success)
                {
                    htmlUtil.showNotifyView('删除成功');
                    //刷新列表
                    var currentEntry = $('.currentPath').data("currentEntry");
                    fileDealer.openEntry(currentEntry,function (entries) {
                        htmlDealer.createFileList(entries,currentEntry);
                    });
                }

                $('#operatorConsult').removeClass('operator-consult-up');
            });

            $('#operator-cancel').on('click',function () {
                $('#operatorConsult').removeClass('operator-consult-up');
            });

            /***
             * 创建文件弹出对话框
             * */
            $('#confirmButton').on('click', function () {
                var currentEntry = $('.currentPath').data("currentEntry");
                var fileName = $('#fileName').val();
                if (fileName.length > 0) {
                    currentEntry.getDirectory(fileName,
                        {create: true}, function (createEntry) {
                            htmlUtil.showNotifyView("创建成功!");
                            //打开文件
                            fileDealer.openEntry(currentEntry, function (entries) {
                                htmlDealer.createFileList(entries, currentEntry);
                                htmlDealer.scrollToCell(createEntry);
                            });
                            $('#dialogView').hide();
                        }, function (error) {
                            errorHandler(error);
                            htmlUtil.showNotifyView("创建失败!");
                        });
                }
            });

            $('#cancelButton').on('click', function () {
                $('#dialogView').hide();
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
