/**
 * Created by linkang on 25/03/2017.
 */
function checkData(data) {
    if (data == null || data == undefined || data.length == 0){
        console.log('数据为空');
        return false;
    }

    return true;
}
var locaDBManager =  (function () {
    //临时数据存储地方,用来页面传递数据
    var nameTemp = 'tempraryData';
    var tempCollectionName = "UIdataTransfer";

    var me = {};
    //永久存储性数据库,表名字
    me.tableNames = {
        SafeBoxFileInfo:'SafeBoxFileInfo'
    };
    //永久数据库的collection
    me.tableCollections = {};

    //创建数据库
    var db = new loki('MobileFile.db');
    //加载数据库资源
    db.loadDatabase();

    //创建临时数据集合
    var temproryCollection = db.getCollection(tempCollectionName);
    if (temproryCollection == null){
        temproryCollection = db.addCollection(tempCollectionName);
        temproryCollection.insert({'data':{},name:nameTemp});
        db.saveDatabase();
    }

    me.createTable = function (tableName) {
        if(me.tableCollections[tableName] == null
            || me.tableCollections[tableName] == undefined){
            //创建永久数据集合
            var permanentCollection = db.getCollection(tableName);
            if (permanentCollection == null){
                permanentCollection = db.addCollection(tableName);
                db.saveDatabase();
            }
            me.tableCollections[tableName] = permanentCollection;
        }
    };
    /***
     * 查找错误原因,是否因为我键值对搞错了
     * 搞了接近2个小时,妈的,find方法返回来的数据是个数组,还要取其中的第一个元素才是我插入的数据.......
     * 直接给数组更新值,数据库又不会保存....!!
     * 最后还是看源代码demo解决了,
     * 可是源代码demo里面没有使用saveDatabase方法,我也是醉了......
     * **/

    /**
     * 临时数据操作接口
     * **/
    me.saveData = function (key,value) {
        temproryCollection.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            obj.data[key] = value;
            return obj;
        });
        db.saveDatabase();
    };

    me.getDataByKey = function (key) {
        var tempraryData = null;
        temproryCollection.findAndUpdate(function (obj) {
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
        temproryCollection.findAndUpdate(function (obj) {
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
        temproryCollection.findAndUpdate(function (obj) {
            return obj.name == nameTemp;
        }, function (obj) {
            obj.data = {};
            return obj;
        });
        db.saveDatabase();
    };
/***-------------------------------------------* */

/***---------------永久数据----------------------**/
/**
 * parameter:
 * tableName :数据库表名字
 * data:要插入数据库的数据
 * id:用于查重的列表属性
 * **/
    me.savePermanentData = function (tableName,data,id) {
        if (checkData(tableName)){
            me.createTable(tableName);
        }
        if (checkData(data)){
            var updated = false;
            var  permanentCollection = me.tableCollections[tableName];
            permanentCollection.findAndUpdate(function (obj) {
                return obj[id] == data[id];
            }, function (obj) {
                updated = true;
                return data;
            });
            if (updated == false){
                permanentCollection.insert(data);
            }
            db.save();
        }
    };
    
    me.getPermanentDataByID = function (tableName,id) {
        if (checkData(id)){
            var  permanentCollection = me.tableCollections[tableName];
           return permanentCollection.get(id);
        }
        return "空";
    };

    me.getAllDataFromTable = function (tableName) {
        var allDataArray = [];

        if (checkData(tableName)){
            me.createTable(tableName);
            var  permanentCollection = me.tableCollections[tableName];
            var total = permanentCollection.count();
            for (var i = 1; i <= total;i++){
               var data = permanentCollection.get(i);
                allDataArray.push(data);
            }
        }
        return allDataArray;
    };

    return me;
})();