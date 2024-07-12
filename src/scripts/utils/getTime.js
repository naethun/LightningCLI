module.exports = function getTime(dateAndTime) {
    var date = new Date(new Date().toLocaleString('en-US'));
    
    var mt = date.getMonth()
    var dy = date.getDay()
    var yr = date.getFullYear()

    var hr = date.getHours() + '';
    var min = date.getMinutes() + '';
    var sec = date.getSeconds() + '';
    
    if (hr.length == 1) {
        hr = '0' + hr;
    }
    
    if (min.length == 1) {
        min = '0' + min;
    }
    
    if (sec.length == 1) {
        sec = '0' + sec;
    }
    let time = dateAndTime ? `[${mt}:${dy}:${yr} ${hr}:${min}:${sec}]` : `[${hr}:${min}:${sec}]`
    return time
}