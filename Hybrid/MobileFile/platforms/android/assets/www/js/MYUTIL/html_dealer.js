/**
 * Created by linkang on 18/03/2017.
 */

function HtmlDealer() {
    this.myscrollView = null;
}

var animation = (function () {
    var animiate = {
        blink:function (element) {
            element.addClass('blink');
            setTimeout(function () {
                element.removeClass('blink')
            },2000);
        }
    };
    return animiate;
})();

HtmlDealer.prototype = {

    createFileListItem: function (entry) {
        //笔记 ,用类克隆,又没有移除类,导致clone太多了....超出堆栈了....
        // var listItem = $('.listItem').clone()
        //笔记参数不带 点!!
        var listItem = $('.templete').clone().removeClass('templete').addClass('listItem').addClass('listItemSkin');
        if (entry.isDirectory) {
            listItem.find('.icon').addClass('directory');
        } else {
            listItem.find('.icon').addClass('file');
        }
        listItem.find('.label').text(entry.name);
        $('.list').append(listItem);

        return listItem;
    },
    createFileList: function (entries, rootEntry) {
        //当前目录
        if (rootEntry != undefined && rootEntry != null) {
            $('.currentPath span').text(rootEntry.name)
            $('.currentPath').data("currentEntry", rootEntry);
        }

        //刷新文件列表
        $('.list .listItem').remove();
        var isSim = device.isVirtual;
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var listItem = htmlDealer.createFileListItem(entry);
            listItem.data("entry", entry);
            //为每个元素设置id
            var idName = pinyin.getFullChars(entry.name);
            listItem.attr('id', idName);
            //模拟器添加绑定事件,因为无法获取点击事件
            
            if (isSim) {
                attachMyEvent(listItem, function (event) {
                    var fileItem = $(this);
                   htmlDealer.gotoNextDirectory(fileItem);
                }, false);
            }
        }
        this.myscrollView.refresh();
    },
    createSafeBoxListItem: function (safeBoxData) {
        if (safeBoxData != undefined){
            var listItem = $('.templete').clone().removeClass('templete').addClass('listItem').addClass('listItemSkin');
            if (safeBoxData[keyFileType] == fileDealer.safeBoxFileType.video ) {
                listItem.find('.icon').addClass('video');
            } else if(safeBoxData[keyFileType] == fileDealer.safeBoxFileType.image){
                listItem.find('.icon').addClass('image');
            }else {
                listItem.find('.icon').addClass(safeBoxData[keyFileImage]);
            }
            listItem.find('.label').text(safeBoxData[keyFileName]);
            listItem.data(keySafeData, safeBoxData);
            //为每个元素设置id
            var idName = pinyin.getFullChars(safeBoxData[keyFileName]);
            listItem.attr('id', idName);
            //模拟器添加绑定事件,因为无法获取点击事
            var isSim = device.isVirtual;
            if (isSim) {
                attachMyEvent(listItem,safeApp.app.dataInit.listItemClickFun , false);
            }
            $('.list').append(listItem);

            return listItem;
        }
    },
    createSafeBoxFileList:function (safeBoxDatas) {
        //刷新文件列表
        $('.list .listItem').remove();
        for (var i = 0; i < safeBoxDatas.length; i++) {
            var boxData = safeBoxDatas[i];
            var listItem = htmlDealer.createSafeBoxListItem(boxData);
        }
        this.myscrollView.refresh();
    },
    scrollToCell:function (entry) {
        var idName = "#" + pinyin.getFullChars(entry.name);
        var listItem = document.querySelector(idName);
        animation.blink($(listItem));
        this.myscrollView.scrollToElement(listItem, null, null, false)
    },
    gotoNextDirectory:function (fileItem) {
        var entry = fileItem.data("entry");
        if  (entry.isDirectory){
            fileDealer.openEntry(entry, function (entries) {
                htmlDealer.createFileList(entries, entry)
                indexApp.app.dataInit.addCheckEvent();
            });
        }else {
            //打开文件
            var mimeTypeData = fileDealer.getMiMeType(entry.name);
            var openPath = decodeURIComponent(entry.nativeURL);
            if(mimeTypeData.mimeType != undefined){
                cordova.plugins.fileOpener2.open(
                    openPath, // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
                    mimeTypeData.mimeType,
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
                htmlUtil.showNotifyView('暂不支持查看此文件');
            }
        }
    }
};

var htmlDealer = new HtmlDealer();
