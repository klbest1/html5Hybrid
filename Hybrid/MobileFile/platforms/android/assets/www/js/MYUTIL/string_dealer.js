/**
 * Created by linkang on 3/04/2017.
 */
var stringDealer = (function () {
    var me = {};
    me.stringByRepalce = function (orginStr, stringNeedRepalce, repalceWithString) {
        orginStr = decodeURIComponent(orginStr);
        stringNeedRepalce = decodeURIComponent(stringNeedRepalce);
        repalceWithString = decodeURIComponent(repalceWithString);
        var re = new RegExp(stringNeedRepalce, "g");
        var newstr = orginStr.replace(re, repalceWithString);
        return newstr;
    };
    return me;
})();
