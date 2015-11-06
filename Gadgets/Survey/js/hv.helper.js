if (typeof HVHelper === "undefined") HVHelper = {};

HVHelper.indexOf = function (val, arr) {
    for (var i in arr) {
        if (arr[i] == val) return i;
    }
    return -1;
};

HVHelper.getFormatDate = function (date) {
    var addZero = function (val) {

        if (val < 10) return "0" + val;
        else return val;
    };

    var dayMapping = { 1: 'Thứ hai', 2: 'Thứ ba', 3: 'Thứ tư', 4: 'Thứ năm', 5: 'Thứ sáu', 6: 'Thứ bẩy', 0: 'Chủ nhật' };

    date = new Date(date);
    var hours = addZero(date.getHours());
    var minutes = addZero(date.getMinutes());
    var seconds = addZero(date.getSeconds());
    return dayMapping[date.getDay()] + ', ' + (addZero(date.getDate()) + '/' + addZero(date.getMonth() + 1) + '/' + addZero(date.getFullYear())) + ' - ' + hours + ':' + minutes + ':' + seconds + '  GMT + 7';
};