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
            ready()
        });
    },
    onPause: function () {
        // locaDataManager.emptyDataForKey(keySelectedBox);
    },
    onResume: function () {
        // locaDataManager.emptyDataForKey(keySelectedBox);
    },
    onActivated: function () {
        locaDBManager.emptyDataForKey(keySelectedBox);
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
// var myScroll;
function ready() {
    var loadApp = {
        setScreen: function () {
            // var size = $(window).width() / 41;
            // $('html').css('font-size', size);
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
            recoverSelected: function () {
                var refreshedLabels = $('.label');
                var checkedItemLabels = locaDBManager.getDataByKey(keySelectedBox);
                checkedItemLabels.forEach(function (item, index) {
                    refreshedLabels.each(function (index, label) {
                        if (item == $(label).text()) {
                            $(label).parent('.listItem').children('.icon-check-common')
                                .removeClass('icon-check-empty').addClass('icon-ok-squared');
                        }
                    });
                });
                locaDBManager.emptyDataForKey(keySelectedBox);
                if (checkedItemLabels.length > 0) {
                    //操作栏切换动画
                    $('#operatorCreateFile').removeClass('operatorMoveIn').addClass('operatorMoveOut');
                    $('#operatorEdit').removeClass('operatorMoveOut').addClass('operatorMoveIn');
                }
            },
            getSelectedItemLable: function () {
                var checkedItemLabels = [];
                var checkedItems = $('.icon-ok-squared');
                checkedItems.each(function (inex, item) {
                    var text = $(item).parent('.listItem').children('.label').text();
                    checkedItemLabels.push(text);
                });
                //保存被选则的项,从其他页返回时保持选中
                locaDBManager.saveData(keySelectedBox, checkedItemLabels);

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
                    var checkedItems = $('.icon-ok-squared');
                    if (checkedItems.length > 0) {
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
                                }, false);
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
                htmlDealer.myscrollView = loadApp.myScroll;
                htmlDealer.createFileList(entries, rootEntry);
                loadApp.myScroll.refresh();
                _this.dataInit.addCheckEvent();
                _this.dataInit.recoverSelected();
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

            $('#safeBox').on('click', function () {
                locaDBManager.saveData(keyPassWordFinishPage, 'safeBox.html');
                window.plugins.nativepagetransitions.fade({
                        // the defaults for direction, duration, etc are all fine
                        "href": "password.html"
                    }, function (msg) {
                        console.log("success: " + msg)
                    }, // called when the animation has finished
                    function (msg) {
                        alert("error: " + msg)
                    } // called in case you pass in weird values;
                );
            });

            var gotoFileChosePage = function () {
                window.plugins.nativepagetransitions.slide({
                        // the defaults for direction, duration, etc are all fine
                        "href": "fileList.html"
                    }, function (msg) {
                        console.log("success: " + msg)
                    }, // called when the animation has finished
                    function (msg) {
                        alert("error: " + msg)
                    } // called in case you pass in weird values;
                );
            };

            var getChosedEntries = function () {
                var checkedBoxes = $('.icon-ok-squared');
                var entries = [];
                checkedBoxes.each(function (index, item) {
                    var entry = $(item).parent('.listItem').data('entry');
                    entries.push(entry);
                });
                return entries;
            };

            $('#moveFile').on('click', function () {
                var entries = getChosedEntries();
                var entrypacke = {keyData: entries, keyType: fileDealType.MovingFile};
                locaDBManager.saveData(keyEntries, entrypacke);
                _this.dataInit.getSelectedItemLable();
                gotoFileChosePage();
            });

            $('#duplicateFile').on('click', function () {
                var entries = getChosedEntries();
                var entrypacke = {keyData: entries, keyType: fileDealType.DuplicateFile};
                locaDBManager.saveData(keyEntries, entrypacke);
                _this.dataInit.getSelectedItemLable();
                gotoFileChosePage();
            });

            $('#deleteFile').on('click', function () {
                $('#operatorConsult').addClass('operator-consult-up');
            });

            $('#moveToSafeBox').on('click', function () {
                //检查是否有密码
                fileDealer.getDataFromFile(fileDealer.fileType.userData,
                    keyUserPassword,
                    function (password) {
                        //设置了密码
                        if (password != undefined && password.length == 4) {
                            var entries = getChosedEntries();
                            //移动到宝箱
                            entries.forEach(function (item, index) {
                                var mimeTypeData = fileDealer.getMiMeType(item.name);
                                if (mimeTypeData == undefined) {
                                    htmlUtil.showNotifyView("暂时不支持此类型文件!");
                                    return;
                                }
                                fileDealer.moveToDirectory(item, fileDealer.fileType.safeBox, function (newEntry) {
                                    //压缩文件
                                    var PathToResultZip = cordova.file.dataDirectory + fileDealer.fileType.safeBox +"/";
                                    var PathToFileInString = PathToResultZip + newEntry.name;

                                    JJzip.zip(PathToFileInString, {
                                        target: PathToResultZip,
                                        name: newEntry.name
                                    }, function (data) {
                                        var fileInfoData = {};
                                        fileInfoData[keyFilePath] = newEntry.nativeURL;
                                        fileInfoData[keyFileMIMEType] = mimeTypeData.mimeType;
                                        fileInfoData[keyFileType] = mimeTypeData.type;
                                        fileInfoData[keyFileImage] = mimeTypeData.imageName;
                                        fileInfoData[keyFileName] = newEntry.name;
                                        //写入数据库
                                        locaDBManager.savePermanentData(locaDBManager.tableNames.SafeBoxFileInfo, fileInfoData,keyFileName);
                                        if (newEntry.isFile) {
                                            newEntry.remove(function () {
                                                console.log('压缩后,删除成功');
                                            }, function () {
                                               console.log("压缩后,删除失败");
                                            });
                                        }
                                        //刷新列表
                                        var currentEntry = $('.currentPath').data("currentEntry");
                                        fileDealer.openEntry(currentEntry, function (entries) {
                                            htmlDealer.createFileList(entries, currentEntry);
                                        });
                                        /* Wow everiting goes good, but just in case verify data.success*/
                                    }, function (error) {
                                        /* Wow something goes wrong, check the error.message */
                                        console.log(error);
                                    });
                                });
                            });
                        } else {
                            locaDBManager.saveData(keyPassWordFinishPage, 'index.html');
                            window.plugins.nativepagetransitions.fade({
                                    // the defaults for direction, duration, etc are all fine
                                    "href": "password.html"
                                }, function (msg) {
                                    console.log("success: " + msg)
                                }, // called when the animation has finished
                                function (msg) {
                                    alert("error: " + msg)
                                } // called in case you pass in weird values;
                            );
                        }
                    });
            });

            $('#operator-confirm').on('click', function () {
                var success = true;

                var removeSuccess = function () {
                };

                var removeFailed = function (error) {
                    success = false;
                    htmlUtil.showNotifyView(error.toLocaleString());
                };

                var checkedItems = $('.icon-ok-squared');
                checkedItems.each(function (index, elem) {
                    var entry = $(elem).parent('.listItem').data('entry');
                    if (entry.isFile) {
                        entry.remove(removeSuccess, removeFailed)
                    } else {
                        entry.removeRecursively(removeSuccess, removeFailed);
                    }
                });

                if (success) {
                    htmlUtil.showNotifyView('删除成功');
                    //刷新列表
                    var currentEntry = $('.currentPath').data("currentEntry");
                    fileDealer.openEntry(currentEntry, function (entries) {
                        htmlDealer.createFileList(entries, currentEntry);
                    });
                }

                $('#operatorConsult').removeClass('operator-consult-up');
            });

            $('#operator-cancel').on('click', function () {
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
    // window.indexLoadApp = loadApp;
}

app.initialize();
