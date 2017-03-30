/**
 * Created by linkang on 30/03/2017.
 */
var passWordDealer = (function () {
        var me = {};
        me.foucuInput = function () {
            $('#password-input').focus() ;
        };

        me.setupPassword =function () {
            me.foucuInput();
        };
        
        return me;
    }

)();