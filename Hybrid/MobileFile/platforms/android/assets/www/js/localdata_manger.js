/**
 * Created by linkang on 25/03/2017.
 */

var locaDBManager =  (function () {
    var nameTemp = 'tempraryData';
    var me = {};
    var db = new loki('MobileFile.db');
    db.loadDatabase();
    var transferData = db.getCollection('UIdataTransfer');
    if (transferData == null){
        transferData = db.addCollection('UIdataTransfer');
        transferData.insert({'data':{},name:nameTemp});
        db.saveDatabase();
    }
    /***
     * 查找错误原因,是否因为我键值对搞错了
     * 搞了接近2个小时,妈的,find方法返回来的数据是个数组,还要取其中的第一个元素才是我插入的数据.......
     * 直接给数组更新值,数据库又不会保存....!!
     * 最后还是看源代码demo解决了,
     * 可是源代码demo里面没有使用saveDatabase方法,我也是醉了......
     * **/
    me.saveData = function (key,value) {
        transferData.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            obj.data[key] = value;
            return obj;
        });
        db.saveDatabase();
    };

    me.getDataByKey = function (key) {
        var tempraryData = null;
        transferData.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            tempraryData = obj;
            return obj;
        });

        return tempraryData.data[key];
    };
    /**
     * 清空某一项数据
     * **/
    me.emptyDataForKey = function (key) {
        transferData.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            var keyData = obj.data[key];
            if (keyData){
                obj.data[key] = null;
                delete  obj.data[key];
            }
            return obj;
        });
        db.save();
    };

    /**
     * 清空所有数据
     * **/
    me.emptyAllDatas = function () {
        transferData.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            obj.data = {};
            return obj;
        });
        db.saveDatabase();
    };

    return me;
})();