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

/**
 * 用到的技术支持文章:
 * https://www.html5rocks.com/en/tutorials/file/filesystem/
 //笔记
 https://code.google.com/archive/p/crypto-js/downloads
 https://www.npmjs.com/package/crypto-js

 https://www.npmjs.com/package/cordova-plugin-zip
 https://github.com/pwlin/cordova-plugin-file-opener2
 文件排序，文件权限自动打开。
 找回密码功能！。
 https://developer.android.com/training/permissions/requesting.html


 http://www.semorn.com/listen/aiqingfm
 *
 * ***/
var indexApp = {
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
        document.addEventListener("backbutton", this.onBackKeyDown, false);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        //笔记
        $(function () {
            ready();
            /***删除保险箱文件,防止程序被杀死进程时没有删除文件**/
            fileDealer.deleteFile(cordova.file.externalDataDirectory + "com.mobileFile.UnzipedFiles");
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
    },
    onBackKeyDown: function () {

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
                    if (entry.isDirectory) {
                        fileDealer.openEntry(entry, function (entries) {
                            htmlDealer.createFileList(entries, entry)
                            loadApp.dataInit.addCheckEvent();
                            loadApp.dataInit.recoverSelected();
                        });
                    } else {
                        //打开文件
                        var mimeTypeData = fileDealer.getMiMeType(entry.name.toLowerCase());
                        var openPath = decodeURIComponent(entry.nativeURL);
                        if (mimeTypeData.mimeType != undefined) {
                            cordova.plugins.fileOpener2.open(
                                openPath, // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
                                mimeTypeData.mimeType,
                                {
                                    error: function (e) {
                                        htmlUtil.showNotifyView("没有能打开此文件的APP!");
                                        console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                                    },
                                    success: function () {
                                        console.log('file opened successfully');
                                    }
                                }
                            );
                        } else {
                            htmlUtil.showNotifyView('暂不支持查看此文件');
                        }
                    }

                }
            },
            recoverSelected: function () {
                var refreshedLabels = $('.label');
                var checkedItemLabels = locaDBManager.getDataByKey(keySelectedBox);
                if (checkedItemLabels != undefined) {
                    checkedItemLabels.forEach(function (item, index) {
                        refreshedLabels.each(function (index, label) {
                            if (item == $(label).text()) {
                                $(label).parent('.listItem').children('.icon-check-common')
                                    .removeClass('icon-check-empty').addClass('icon-ok-squared');
                            }
                        });
                        locaDBManager.emptyDataForKey(keySelectedBox);
                        if (checkedItemLabels.length > 0) {
                            //操作栏切换动画
                            loadApp.dataInit.editFileOperatorMoveIn();
                            $('.list').off('click', '.listItem', loadApp.dataInit.listItemClickFun);
                        }else {
                            loadApp.dataInit.createFileOpertorMoveIn();
                            $('.list').off('click', '.listItem', loadApp.dataInit.listItemClickFun);
                            $('.list').on('click', '.listItem', loadApp.dataInit.listItemClickFun);
                        }
                    });
                }else {
                    loadApp.dataInit.createFileOpertorMoveIn();
                    $('.list').off('click', '.listItem', loadApp.dataInit.listItemClickFun);
                    $('.list').on('click', '.listItem', loadApp.dataInit.listItemClickFun);
                }

            },
            createFileOpertorMoveIn: function () {
                //操作栏切换动画
                $('#operatorCreateFile').removeClass('operatorMoveOut').addClass('operatorMoveIn');
                $('#operatorEdit').removeClass('operatorMoveIn').addClass('operatorMoveOut');
            },
            editFileOperatorMoveIn: function () {
                //操作栏切换动画
                $('#operatorCreateFile').removeClass('operatorMoveIn').addClass('operatorMoveOut');
                $('#operatorEdit').removeClass('operatorMoveOut').addClass('operatorMoveIn');
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
                        _this.editFileOperatorMoveIn();
                    } else {
                        if (isSim) {
                            var elems = $('.listItem');
                            elems.each(function (index, elem) {
                                attachMyEvent($(elem), function () {
                                    htmlDealer.gotoNextDirectory($(elem));
                                }, false);
                            });
                        } else {
                            $('.list').off('click', '.listItem', _this.listItemClickFun);
                            $('.list').on('click', '.listItem', _this.listItemClickFun);
                        }
                        _this.createFileOpertorMoveIn();
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
            getChosedEntries: function () {
                var checkedBoxes = $('.icon-ok-squared');
                var entries = [];
                checkedBoxes.each(function (index, item) {
                    var entry = $(item).parent('.listItem').data('entry');
                    entries.push(entry);
                });
                return entries;
            },
            saveCurrentEntry: function () {
                var currentEntry = $('.currentPath').data("currentEntry");
                if (currentEntry != undefined ) {
                    locaDBManager.saveData(keyChosedSubDirectory, currentEntry);
                }
            },
            movingFilesToSafeBox: function () {
                var entries = loadApp.dataInit.getChosedEntries();

                //移动到宝箱
                var movingAllEntries = function () {
                    if (entries.length == 0){
                        //刷新列表
                        var currentEntry = $('.currentPath').data("currentEntry");
                        fileDealer.openEntry(currentEntry, function (entries) {
                            htmlDealer.createFileList(entries, currentEntry);
                            loadApp.dataInit.addCheckEvent();
                            loadApp.dataInit.recoverSelected();
                            htmlUtil.disMissProcessView();
                            setTimeout(htmlUtil.showNotifyView('已移入保险箱'),400);
                        });
                    }else {
                        var item = entries.pop();
                        htmlUtil.showProcessFileName(item.name);
                        var mimeTypeData = fileDealer.getMiMeType(item.name.toLowerCase());
                        if (mimeTypeData == undefined) {
                            htmlUtil.showNotifyView("暂时不支持"+item.name+"类型文件!");
                            movingAllEntries();
                            return;
                        }
                        fileDealer.moveToSandBoxDataDirectory(item, fileDealer.localFileSystemCreateName.safeBox, function (newEntry) {
                            //压缩文件
                            var PathToResultZip = cordova.file.dataDirectory + fileDealer.localFileSystemCreateName.safeBox + "/";
                            var PathToFileInString = PathToResultZip + newEntry.name;

                            JJzip.zip(PathToFileInString, {
                                target: PathToResultZip,
                                name: newEntry.name
                            }, function (data) {
                                var fileInfoData = {};
                                fileInfoData[keyFilePath] = newEntry.nativeURL + ".zip";
                                fileInfoData[keyFileMIMEType] = mimeTypeData.mimeType;
                                fileInfoData[keyFileType] = mimeTypeData.type;
                                fileInfoData[keyFileImage] = mimeTypeData.imageName;
                                fileInfoData[keyFileName] = newEntry.name;
                                var originpath = stringDealer.stringByRepalce(item.nativeURL, "/" + item.name, "");
                                fileInfoData[keyFileOriginPath] = originpath;
                                //写入数据库
                                locaDBManager.savePermanentData(locaDBManager.tableNames.SafeBoxFileInfo, fileInfoData, keyFileName);
                                if (newEntry.isFile) {
                                    newEntry.remove(function () {
                                        console.log('压缩后,删除成功');
                                    }, function () {
                                        console.log("压缩后,删除失败");
                                    });
                                }
                                movingAllEntries();
                                /* Wow everiting goes good, but just in case verify data.success*/
                            }, function (error) {
                                /* Wow something goes wrong, check the error.message */
                                console.log(error);
                            });

                        });
                    }
                };
                if (entries.length > 0){
                    // htmlUtil.showNotifyView('正在移动文件...');
                    htmlUtil.showProcessView('移动文件中...');
                    movingAllEntries();
                }
            }
        },
        setupView: function () {
            indexApp.app = loadApp;
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
            var movingSafeBox = function () {
                //首次设置好密码返回后
                var didFirstSetPassWord = locaDBManager.getDataByKey(keyDidFinishSettingPathWord);
                if (didFirstSetPassWord) {
                    loadApp.dataInit.movingFilesToSafeBox();
                    locaDBManager.saveData(keyDidFinishSettingPathWord, false);
                }
            };

            var currentEntry = locaDBManager.getDataByKey(keyChosedSubDirectory);

            //有打开过子目录
            if (currentEntry != undefined ) {
                fileDealer.getFileEntryWithPath(currentEntry.nativeURL, function (entry) {
                    fileDealer.openEntry(entry, function (entries) {
                        htmlDealer.myscrollView = loadApp.myScroll;
                        htmlDealer.createFileList(entries, entry);
                        _this.dataInit.addCheckEvent();
                        _this.dataInit.recoverSelected();
                        movingSafeBox();
                        locaDBManager.emptyDataForKey(keyChosedSubDirectory);
                    });
                });

            } else {
                //打开sd卡目录,在回调中创建页面
                fileDealer.openSDCard(function (entries, rootEntry) {
                    htmlDealer.myscrollView = loadApp.myScroll;
                    htmlDealer.createFileList(entries, rootEntry);
                    _this.dataInit.addCheckEvent();
                    _this.dataInit.recoverSelected();
                    movingSafeBox();
                });
            }

        },
        bindEvents: function () {
            var _this = this;

            $('.upper').unbind('click').on("click", function () {
                var currentEntry = $('.currentPath').data("currentEntry");
                currentEntry.getParent(function (parentEntry) {
                    fileDealer.openEntry(parentEntry, function (entries) {
                        htmlDealer.createFileList(entries, parentEntry);
                        _this.dataInit.addCheckEvent();
                        _this.dataInit.recoverSelected();
                        htmlDealer.scrollToCell(currentEntry);
                    });
                }, function (error) {
                    console.log("Error" + error);
                })
            });


            //添加点击事件
            $('.list').unbind('click').on("click", ".listItem", 0, _this.dataInit.listItemClickFun);


            /***
             * 底部操作栏
             * */
            $('#createFile').unbind('click').on('click', function () {
                $('#dialogView').show();
            });

            $('#safeBox').unbind('click').on('click', function () {
                loadApp.dataInit.saveCurrentEntry();
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

            $('#moveFile').unbind('click').on('click', function () {
                var entries = loadApp.dataInit.getChosedEntries();
                var entrypacke = {keyData: entries, keyType: fileDealType.MovingFile};
                locaDBManager.saveData(keyEntries, entrypacke);
                _this.dataInit.getSelectedItemLable();
                //保存当前目录
                loadApp.dataInit.saveCurrentEntry();
                gotoFileChosePage();
            });

            $('#duplicateFile').unbind('click').on('click', function () {
                var entries = loadApp.dataInit.getChosedEntries();
                var entrypacke = {keyData: entries, keyType: fileDealType.DuplicateFile};
                locaDBManager.saveData(keyEntries, entrypacke);
                _this.dataInit.getSelectedItemLable();
                //保存当前目录
                loadApp.dataInit.saveCurrentEntry();
                gotoFileChosePage();
            });

            $('#deleteFile').unbind('click').on('click', function () {
                $('#operatorConsult').addClass('operator-consult-up');
            });

            $('#moveToSafeBox').unbind('click').on('click', function () {
                //保存当前目录
                loadApp.dataInit.saveCurrentEntry();
                //检查是否有密码
                fileDealer.getDataFromFile(fileDealer.localFileSystemCreateName.userData,
                    keyUserPassword,
                    function (password) {
                        //设置了密码
                        if (password != undefined && password.length == 4) {
                            loadApp.dataInit.movingFilesToSafeBox();
                        } else {
                            locaDBManager.saveData(keyPassWordFinishPage, 'index.html');
                            _this.dataInit.getSelectedItemLable();
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

            $('#operator-confirm').unbind('click').on('click', function () {
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
                        _this.dataInit.addCheckEvent();
                        _this.dataInit.recoverSelected();
                    });
                }

                $('#operatorConsult').removeClass('operator-consult-up');
            });

            $('#operator-cancel').unbind('click').on('click', function () {
                $('#operatorConsult').removeClass('operator-consult-up');
            });

            /***
             * 创建文件弹出对话框
             * */
            $('#confirmButton').unbind('click').on('click', function () {
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
                                loadApp.dataInit.addCheckEvent();
                                loadApp.dataInit.recoverSelected();
                            });
                            $('#dialogView').hide();
                        }, function (error) {
                            errorHandler(error);
                            htmlUtil.showNotifyView("创建失败!");
                        });
                }
            });

            $('#cancelButton').unbind('click').on('click', function () {
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

indexApp.initialize();
