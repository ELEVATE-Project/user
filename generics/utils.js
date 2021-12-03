/**
 * name : utils.js
 * author : Aman
 * created-date : 04-Nov-2021
 * Description : Utils helper function.
 */

const bcryptJs = require('bcryptjs');

const hash = (str) => {
    const salt = bcryptJs.genSaltSync(10);
    let hashstr = bcryptJs.hashSync(str, salt);
    return hashstr;
}

const elapsedMinutes = (date1,date2) => {
    var difference = (date1 - date2);
    let result = (difference / 60000);
    return result;
}

const getIstDate = () => {
    return new Date(new Date().getTime() + (5*60+30)*60000);
}

const getCurrentMonthRange = () => {
    const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = new Date().getMonth()
    const year = new Date().getFullYear();
    let dayInMonth = monthDays[month];
    if (month === 1 && year % 4 === 0) { // Feb for leap year
        dayInMonth = 29;
    }
    month += 1;
    month = month < 10 ? '0' + month : month;
    return [new Date(`${year}-${month}-01`), new Date(`${year}-${month}-${dayInMonth}`)];
};

const getCurrentWeekRange = () => {
    const currentDate = new Date().getTime(); // in ms
    const currentDay = new Date().getDay() * 24 * 60 * 60 * 1000 // in ms
    const firstDay = currentDate - currentDay;
    const lastDay = firstDay + 6 * 24 * 60 * 60 * 1000;
    return [new Date(firstDay), new Date(lastDay)];
};

const getCurrentQuarterRange = () => {
    const today = new Date();
    const quarter = Math.floor((today.getMonth() / 3));
    const startFullQuarter = new Date(today.getFullYear(), quarter * 3, 1);
    const endFullQuarter = new Date(startFullQuarter.getFullYear(), startFullQuarter.getMonth() + 3, 0);
    return [startFullQuarter, endFullQuarter];
};

module.exports = {
    hash: hash,
    getCurrentMonthRange: getCurrentMonthRange,
    getCurrentWeekRange: getCurrentWeekRange,
    getCurrentQuarterRange: getCurrentQuarterRange,
    elapsedMinutes: elapsedMinutes,
    getIstDate: getIstDate
}
