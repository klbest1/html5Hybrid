/**
 * Created by linkang on 18/03/2017.
 */

function attachMyEvent(sr, cb, bubble) {
    //click事件反应时间为300毫秒,因此取消click采用手动
    //手指按下,若手指移动,则触发取消
    sr.unbind();
    var point_one = {};
    var point_two = {};
    sr.on('touchstart', function (event) {
        var me = $(this)
        me.data('touch', true);
        var touch = event.originalEvent.targetTouches[0];
        point_one.x = touch.pageX;
        point_one.y = touch.pageY;
        me.addClass('touchInside');
        if (bubble) {
            event.stopPropagation();
        }
    });

    sr.on('touchend', function (event) {
        var me = $(this);
        if (me.data('touch') == true) {
            //改变回调函数的this指针为sr
            //触发回调函数
            cb.bind(this)();
        }
        me.removeClass('touchInside')
        me.data('touch', false);
        if (bubble) {
            event.stopPropagation();
        }
    });

    sr.on('touchmove', function (event) {
        var me = $(this);
        var touch = event.originalEvent.targetTouches[0];
        point_two.x = touch.pageX;
        point_two.y = touch.pageY;
        if (me.data('touch')) {
            //华为手机测试,没有滑动也会触发touchmove,所以加测滑动距离,来判断是否滑动
            var distane = getPointsDistance(point_one, point_two);
            console.log(distane);
            $('#log').text(distane);
            if (distane > 4) {
                me.data('touch', false);
                me.removeClass('touchInside')
            }
        }
        if (bubble) {
            event.stopPropagation();
        }
        // alert(2);
    });
}

function removeEvent(sr) {
    sr.off('touchstart');
    sr.off('touchend');
    sr.off('touchmove');
}

//计算两点之间距离
function getPointsDistance(p1, p2) {
    var xDistance = Math.abs(p1.x - p2.x);
    var yDistance = Math.abs(p1.y - p2.y);
    var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    return distance;
}