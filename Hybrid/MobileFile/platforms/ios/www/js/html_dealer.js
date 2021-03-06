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

    scrollToCell:function (entry) {
        var idName = "#" + pinyin.getFullChars(entry.name);
        var listItem = document.querySelector(idName);
        animation.blink($(listItem));
        this.myscrollView.scrollToElement(listItem, null, null, true)
    },
    gotoNextDirectory:function (fileItem) {
        var entry = fileItem.data("entry");
        fileDealer.openEntry(entry, function (entries) {
            htmlDealer.createFileList(entries, entry);
        });
    }
};

var htmlDealer = new HtmlDealer();
