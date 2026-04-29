//#region node_modules/date-fns/toDate.mjs
/**
* @name toDate
* @category Common Helpers
* @summary Convert the given argument to an instance of Date.
*
* @description
* Convert the given argument to an instance of Date.
*
* If the argument is an instance of Date, the function returns its clone.
*
* If the argument is a number, it is treated as a timestamp.
*
* If the argument is none of the above, the function returns Invalid Date.
*
* **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param argument - The value to convert
*
* @returns The parsed date in the local time zone
*
* @example
* // Clone the date:
* const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
* //=> Tue Feb 11 2014 11:30:30
*
* @example
* // Convert the timestamp to date:
* const result = toDate(1392098430000)
* //=> Tue Feb 11 2014 11:30:30
*/
function toDate(argument) {
	const argStr = Object.prototype.toString.call(argument);
	if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") return new argument.constructor(+argument);
	else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") return new Date(argument);
	else return /* @__PURE__ */ new Date(NaN);
}
//#endregion
//#region node_modules/date-fns/constructFrom.mjs
/**
* @name constructFrom
* @category Generic Helpers
* @summary Constructs a date using the reference date and the value
*
* @description
* The function constructs a new date using the constructor from the reference
* date and the given value. It helps to build generic functions that accept
* date extensions.
*
* It defaults to `Date` if the passed reference date is a number or a string.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The reference date to take constructor from
* @param value - The value to create the date
*
* @returns Date initialized using the given date and value
*
* @example
* import { constructFrom } from 'date-fns'
*
* // A function that clones a date preserving the original type
* function cloneDate<DateType extends Date(date: DateType): DateType {
*   return constructFrom(
*     date, // Use contrustor from the given date
*     date.getTime() // Use the date value to create a new date
*   )
* }
*/
function constructFrom(date, value) {
	if (date instanceof Date) return new date.constructor(value);
	else return new Date(value);
}
//#endregion
//#region node_modules/date-fns/addDays.mjs
/**
* @name addDays
* @category Day Helpers
* @summary Add the specified number of days to the given date.
*
* @description
* Add the specified number of days to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of days to be added.
*
* @returns The new date with the days added
*
* @example
* // Add 10 days to 1 September 2014:
* const result = addDays(new Date(2014, 8, 1), 10)
* //=> Thu Sep 11 2014 00:00:00
*/
function addDays(date, amount) {
	const _date = toDate(date);
	if (isNaN(amount)) return constructFrom(date, NaN);
	if (!amount) return _date;
	_date.setDate(_date.getDate() + amount);
	return _date;
}
//#endregion
//#region node_modules/date-fns/addMonths.mjs
/**
* @name addMonths
* @category Month Helpers
* @summary Add the specified number of months to the given date.
*
* @description
* Add the specified number of months to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of months to be added.
*
* @returns The new date with the months added
*
* @example
* // Add 5 months to 1 September 2014:
* const result = addMonths(new Date(2014, 8, 1), 5)
* //=> Sun Feb 01 2015 00:00:00
*
* // Add one month to 30 January 2023:
* const result = addMonths(new Date(2023, 0, 30), 1)
* //=> Tue Feb 28 2023 00:00:00
*/
function addMonths(date, amount) {
	const _date = toDate(date);
	if (isNaN(amount)) return constructFrom(date, NaN);
	if (!amount) return _date;
	const dayOfMonth = _date.getDate();
	const endOfDesiredMonth = constructFrom(date, _date.getTime());
	endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
	if (dayOfMonth >= endOfDesiredMonth.getDate()) return endOfDesiredMonth;
	else {
		_date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
		return _date;
	}
}
//#endregion
//#region node_modules/date-fns/add.mjs
/**
* @name add
* @category Common Helpers
* @summary Add the specified years, months, weeks, days, hours, minutes and seconds to the given date.
*
* @description
* Add the specified years, months, weeks, days, hours, minutes and seconds to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param duration - The object with years, months, weeks, days, hours, minutes and seconds to be added.
*
* | Key            | Description                        |
* |----------------|------------------------------------|
* | years          | Amount of years to be added        |
* | months         | Amount of months to be added       |
* | weeks          | Amount of weeks to be added        |
* | days           | Amount of days to be added         |
* | hours          | Amount of hours to be added        |
* | minutes        | Amount of minutes to be added      |
* | seconds        | Amount of seconds to be added      |
*
* All values default to 0
*
* @returns The new date with the seconds added
*
* @example
* // Add the following duration to 1 September 2014, 10:19:50
* const result = add(new Date(2014, 8, 1, 10, 19, 50), {
*   years: 2,
*   months: 9,
*   weeks: 1,
*   days: 7,
*   hours: 5,\\-7
*   minutes: 9,
*   seconds: 30,
* })
* //=> Thu Jun 15 2017 15:29:20
*/
function add(date, duration) {
	const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
	const _date = toDate(date);
	const dateWithMonths = months || years ? addMonths(_date, months + years * 12) : _date;
	const dateWithDays = days || weeks ? addDays(dateWithMonths, days + weeks * 7) : dateWithMonths;
	const msToAdd = (seconds + (minutes + hours * 60) * 60) * 1e3;
	return constructFrom(date, dateWithDays.getTime() + msToAdd);
}
//#endregion
//#region node_modules/date-fns/isSaturday.mjs
/**
* @name isSaturday
* @category Weekday Helpers
* @summary Is the given date Saturday?
*
* @description
* Is the given date Saturday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Saturday
*
* @example
* // Is 27 September 2014 Saturday?
* const result = isSaturday(new Date(2014, 8, 27))
* //=> true
*/
function isSaturday(date) {
	return toDate(date).getDay() === 6;
}
//#endregion
//#region node_modules/date-fns/isSunday.mjs
/**
* @name isSunday
* @category Weekday Helpers
* @summary Is the given date Sunday?
*
* @description
* Is the given date Sunday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Sunday
*
* @example
* // Is 21 September 2014 Sunday?
* const result = isSunday(new Date(2014, 8, 21))
* //=> true
*/
function isSunday(date) {
	return toDate(date).getDay() === 0;
}
//#endregion
//#region node_modules/date-fns/isWeekend.mjs
/**
* @name isWeekend
* @category Weekday Helpers
* @summary Does the given date fall on a weekend?
*
* @description
* Does the given date fall on a weekend?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date falls on a weekend
*
* @example
* // Does 5 October 2014 fall on a weekend?
* const result = isWeekend(new Date(2014, 9, 5))
* //=> true
*/
function isWeekend(date) {
	const day = toDate(date).getDay();
	return day === 0 || day === 6;
}
//#endregion
//#region node_modules/date-fns/addBusinessDays.mjs
/**
* @name addBusinessDays
* @category Date Extension Helpers
* @summary Add the specified number of business days (mon - fri) to the given date.
*
* @description
* Add the specified number of business days (mon - fri) to the given date, ignoring weekends.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of business days to be added.
*
* @returns The new date with the business days added
*
* @example
* // Add 10 business days to 1 September 2014:
* const result = addBusinessDays(new Date(2014, 8, 1), 10)
* //=> Mon Sep 15 2014 00:00:00 (skipped weekend days)
*/
function addBusinessDays(date, amount) {
	const _date = toDate(date);
	const startedOnWeekend = isWeekend(_date);
	if (isNaN(amount)) return constructFrom(date, NaN);
	const hours = _date.getHours();
	const sign = amount < 0 ? -1 : 1;
	const fullWeeks = Math.trunc(amount / 5);
	_date.setDate(_date.getDate() + fullWeeks * 7);
	let restDays = Math.abs(amount % 5);
	while (restDays > 0) {
		_date.setDate(_date.getDate() + sign);
		if (!isWeekend(_date)) restDays -= 1;
	}
	if (startedOnWeekend && isWeekend(_date) && amount !== 0) {
		if (isSaturday(_date)) _date.setDate(_date.getDate() + (sign < 0 ? 2 : -1));
		if (isSunday(_date)) _date.setDate(_date.getDate() + (sign < 0 ? 1 : -2));
	}
	_date.setHours(hours);
	return _date;
}
//#endregion
//#region node_modules/date-fns/addMilliseconds.mjs
/**
* @name addMilliseconds
* @category Millisecond Helpers
* @summary Add the specified number of milliseconds to the given date.
*
* @description
* Add the specified number of milliseconds to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of milliseconds to be added.
*
* @returns The new date with the milliseconds added
*
* @example
* // Add 750 milliseconds to 10 July 2014 12:45:30.000:
* const result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
* //=> Thu Jul 10 2014 12:45:30.750
*/
function addMilliseconds(date, amount) {
	return constructFrom(date, +toDate(date) + amount);
}
//#endregion
//#region node_modules/date-fns/constants.mjs
/**
* @constant
* @name daysInYear
* @summary Days in 1 year.
*
* @description
* How many days in a year.
*
* One years equals 365.2425 days according to the formula:
*
* > Leap year occures every 4 years, except for years that are divisable by 100 and not divisable by 400.
* > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
*/
var daysInYear = 365.2425;
-(Math.pow(10, 8) * 24 * 60 * 60 * 1e3);
/**
* @constant
* @name millisecondsInWeek
* @summary Milliseconds in 1 week.
*/
var millisecondsInWeek = 6048e5;
/**
* @constant
* @name millisecondsInDay
* @summary Milliseconds in 1 day.
*/
var millisecondsInDay = 864e5;
/**
* @constant
* @name millisecondsInMinute
* @summary Milliseconds in 1 minute
*/
var millisecondsInMinute = 6e4;
/**
* @constant
* @name millisecondsInHour
* @summary Milliseconds in 1 hour
*/
var millisecondsInHour = 36e5;
/**
* @constant
* @name millisecondsInSecond
* @summary Milliseconds in 1 second
*/
var millisecondsInSecond = 1e3;
/**
* @constant
* @name minutesInYear
* @summary Minutes in 1 year.
*/
var minutesInYear = 525600;
/**
* @constant
* @name minutesInMonth
* @summary Minutes in 1 month.
*/
var minutesInMonth = 43200;
/**
* @constant
* @name minutesInDay
* @summary Minutes in 1 day.
*/
var minutesInDay = 1440;
/**
* @constant
* @name secondsInHour
* @summary Seconds in 1 hour.
*/
var secondsInHour = 3600;
/**
* @constant
* @name secondsInDay
* @summary Seconds in 1 day.
*/
var secondsInDay = secondsInHour * 24;
secondsInDay * 7;
secondsInDay * daysInYear / 12 * 3;
//#endregion
//#region node_modules/date-fns/addHours.mjs
/**
* @name addHours
* @category Hour Helpers
* @summary Add the specified number of hours to the given date.
*
* @description
* Add the specified number of hours to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of hours to be added.
*
* @returns The new date with the hours added
*
* @example
* // Add 2 hours to 10 July 2014 23:00:00:
* const result = addHours(new Date(2014, 6, 10, 23, 0), 2)
* //=> Fri Jul 11 2014 01:00:00
*/
function addHours(date, amount) {
	return addMilliseconds(date, amount * millisecondsInHour);
}
//#endregion
//#region node_modules/date-fns/_lib/defaultOptions.mjs
var defaultOptions = {};
function getDefaultOptions$1() {
	return defaultOptions;
}
function setDefaultOptions$1(newOptions) {
	defaultOptions = newOptions;
}
//#endregion
//#region node_modules/date-fns/startOfWeek.mjs
/**
* The {@link startOfWeek} function options.
*/
/**
* @name startOfWeek
* @category Week Helpers
* @summary Return the start of a week for the given date.
*
* @description
* Return the start of a week for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of a week
*
* @example
* // The start of a week for 2 September 2014 11:55:00:
* const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sun Aug 31 2014 00:00:00
*
* @example
* // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
* const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
* //=> Mon Sep 01 2014 00:00:00
*/
function startOfWeek(date, options) {
	const defaultOptions = getDefaultOptions$1();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const _date = toDate(date);
	const day = _date.getDay();
	const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
	_date.setDate(_date.getDate() - diff);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/startOfISOWeek.mjs
/**
* @name startOfISOWeek
* @category ISO Week Helpers
* @summary Return the start of an ISO week for the given date.
*
* @description
* Return the start of an ISO week for the given date.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of an ISO week
*
* @example
* // The start of an ISO week for 2 September 2014 11:55:00:
* const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Mon Sep 01 2014 00:00:00
*/
function startOfISOWeek(date) {
	return startOfWeek(date, { weekStartsOn: 1 });
}
//#endregion
//#region node_modules/date-fns/getISOWeekYear.mjs
/**
* @name getISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Get the ISO week-numbering year of the given date.
*
* @description
* Get the ISO week-numbering year of the given date,
* which always starts 3 days before the year's first Thursday.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The ISO week-numbering year
*
* @example
* // Which ISO-week numbering year is 2 January 2005?
* const result = getISOWeekYear(new Date(2005, 0, 2))
* //=> 2004
*/
function getISOWeekYear(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const fourthOfJanuaryOfNextYear = constructFrom(date, 0);
	fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
	fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
	const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
	const fourthOfJanuaryOfThisYear = constructFrom(date, 0);
	fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
	fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
	const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
	if (_date.getTime() >= startOfNextYear.getTime()) return year + 1;
	else if (_date.getTime() >= startOfThisYear.getTime()) return year;
	else return year - 1;
}
//#endregion
//#region node_modules/date-fns/startOfDay.mjs
/**
* @name startOfDay
* @category Day Helpers
* @summary Return the start of a day for the given date.
*
* @description
* Return the start of a day for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a day
*
* @example
* // The start of a day for 2 September 2014 11:55:00:
* const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 02 2014 00:00:00
*/
function startOfDay(date) {
	const _date = toDate(date);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.mjs
/**
* Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
* They usually appear for dates that denote time before the timezones were introduced
* (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
* and GMT+01:00:00 after that date)
*
* Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
* which would lead to incorrect calculations.
*
* This function returns the timezone offset in milliseconds that takes seconds in account.
*/
function getTimezoneOffsetInMilliseconds(date) {
	const _date = toDate(date);
	const utcDate = new Date(Date.UTC(_date.getFullYear(), _date.getMonth(), _date.getDate(), _date.getHours(), _date.getMinutes(), _date.getSeconds(), _date.getMilliseconds()));
	utcDate.setUTCFullYear(_date.getFullYear());
	return +date - +utcDate;
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarDays.mjs
/**
* @name differenceInCalendarDays
* @category Day Helpers
* @summary Get the number of calendar days between the given dates.
*
* @description
* Get the number of calendar days between the given dates. This means that the times are removed
* from the dates and then the difference in days is calculated.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of calendar days
*
* @example
* // How many calendar days are between
* // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
* const result = differenceInCalendarDays(
*   new Date(2012, 6, 2, 0, 0),
*   new Date(2011, 6, 2, 23, 0)
* )
* //=> 366
* // How many calendar days are between
* // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
* const result = differenceInCalendarDays(
*   new Date(2011, 6, 3, 0, 1),
*   new Date(2011, 6, 2, 23, 59)
* )
* //=> 1
*/
function differenceInCalendarDays(dateLeft, dateRight) {
	const startOfDayLeft = startOfDay(dateLeft);
	const startOfDayRight = startOfDay(dateRight);
	const timestampLeft = +startOfDayLeft - getTimezoneOffsetInMilliseconds(startOfDayLeft);
	const timestampRight = +startOfDayRight - getTimezoneOffsetInMilliseconds(startOfDayRight);
	return Math.round((timestampLeft - timestampRight) / millisecondsInDay);
}
//#endregion
//#region node_modules/date-fns/startOfISOWeekYear.mjs
/**
* @name startOfISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Return the start of an ISO week-numbering year for the given date.
*
* @description
* Return the start of an ISO week-numbering year,
* which always starts 3 days before the year's first Thursday.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of an ISO week-numbering year
*
* @example
* // The start of an ISO week-numbering year for 2 July 2005:
* const result = startOfISOWeekYear(new Date(2005, 6, 2))
* //=> Mon Jan 03 2005 00:00:00
*/
function startOfISOWeekYear(date) {
	const year = getISOWeekYear(date);
	const fourthOfJanuary = constructFrom(date, 0);
	fourthOfJanuary.setFullYear(year, 0, 4);
	fourthOfJanuary.setHours(0, 0, 0, 0);
	return startOfISOWeek(fourthOfJanuary);
}
//#endregion
//#region node_modules/date-fns/setISOWeekYear.mjs
/**
* @name setISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Set the ISO week-numbering year to the given date.
*
* @description
* Set the ISO week-numbering year to the given date,
* saving the week number and the weekday number.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param weekYear - The ISO week-numbering year of the new date
*
* @returns The new date with the ISO week-numbering year set
*
* @example
* // Set ISO week-numbering year 2007 to 29 December 2008:
* const result = setISOWeekYear(new Date(2008, 11, 29), 2007)
* //=> Mon Jan 01 2007 00:00:00
*/
function setISOWeekYear(date, weekYear) {
	let _date = toDate(date);
	const diff = differenceInCalendarDays(_date, startOfISOWeekYear(_date));
	const fourthOfJanuary = constructFrom(date, 0);
	fourthOfJanuary.setFullYear(weekYear, 0, 4);
	fourthOfJanuary.setHours(0, 0, 0, 0);
	_date = startOfISOWeekYear(fourthOfJanuary);
	_date.setDate(_date.getDate() + diff);
	return _date;
}
//#endregion
//#region node_modules/date-fns/addISOWeekYears.mjs
/**
* @name addISOWeekYears
* @category ISO Week-Numbering Year Helpers
* @summary Add the specified number of ISO week-numbering years to the given date.
*
* @description
* Add the specified number of ISO week-numbering years to the given date.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of ISO week-numbering years to be added.
*
* @returns The new date with the ISO week-numbering years added
*
* @example
* // Add 5 ISO week-numbering years to 2 July 2010:
* const result = addISOWeekYears(new Date(2010, 6, 2), 5)
* //=> Fri Jn 26 2015 00:00:00
*/
function addISOWeekYears(date, amount) {
	return setISOWeekYear(date, getISOWeekYear(date) + amount);
}
//#endregion
//#region node_modules/date-fns/addMinutes.mjs
/**
* @name addMinutes
* @category Minute Helpers
* @summary Add the specified number of minutes to the given date.
*
* @description
* Add the specified number of minutes to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of minutes to be added.
*
* @returns The new date with the minutes added
*
* @example
* // Add 30 minutes to 10 July 2014 12:00:00:
* const result = addMinutes(new Date(2014, 6, 10, 12, 0), 30)
* //=> Thu Jul 10 2014 12:30:00
*/
function addMinutes(date, amount) {
	return addMilliseconds(date, amount * millisecondsInMinute);
}
//#endregion
//#region node_modules/date-fns/addQuarters.mjs
/**
* @name addQuarters
* @category Quarter Helpers
* @summary Add the specified number of year quarters to the given date.
*
* @description
* Add the specified number of year quarters to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of quarters to be added.
*
* @returns The new date with the quarters added
*
* @example
* // Add 1 quarter to 1 September 2014:
* const result = addQuarters(new Date(2014, 8, 1), 1)
* //=> Mon Dec 01 2014 00:00:00
*/
function addQuarters(date, amount) {
	return addMonths(date, amount * 3);
}
//#endregion
//#region node_modules/date-fns/addSeconds.mjs
/**
* @name addSeconds
* @category Second Helpers
* @summary Add the specified number of seconds to the given date.
*
* @description
* Add the specified number of seconds to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of seconds to be added.
*
* @returns The new date with the seconds added
*
* @example
* // Add 30 seconds to 10 July 2014 12:45:00:
* const result = addSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
* //=> Thu Jul 10 2014 12:45:30
*/
function addSeconds(date, amount) {
	return addMilliseconds(date, amount * 1e3);
}
//#endregion
//#region node_modules/date-fns/addWeeks.mjs
/**
* @name addWeeks
* @category Week Helpers
* @summary Add the specified number of weeks to the given date.
*
* @description
* Add the specified number of week to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of weeks to be added.
*
* @returns The new date with the weeks added
*
* @example
* // Add 4 weeks to 1 September 2014:
* const result = addWeeks(new Date(2014, 8, 1), 4)
* //=> Mon Sep 29 2014 00:00:00
*/
function addWeeks(date, amount) {
	return addDays(date, amount * 7);
}
//#endregion
//#region node_modules/date-fns/addYears.mjs
/**
* @name addYears
* @category Year Helpers
* @summary Add the specified number of years to the given date.
*
* @description
* Add the specified number of years to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of years to be added.
*
* @returns The new date with the years added
*
* @example
* // Add 5 years to 1 September 2014:
* const result = addYears(new Date(2014, 8, 1), 5)
* //=> Sun Sep 01 2019 00:00:00
*/
function addYears(date, amount) {
	return addMonths(date, amount * 12);
}
//#endregion
//#region node_modules/date-fns/areIntervalsOverlapping.mjs
/**
* The {@link areIntervalsOverlapping} function options.
*/
/**
* @name areIntervalsOverlapping
* @category Interval Helpers
* @summary Is the given time interval overlapping with another time interval?
*
* @description
* Is the given time interval overlapping with another time interval? Adjacent intervals do not count as overlapping unless `inclusive` is set to `true`.
*
* @param intervalLeft - The first interval to compare.
* @param intervalRight - The second interval to compare.
* @param options - The object with options
*
* @returns Whether the time intervals are overlapping
*
* @example
* // For overlapping time intervals:
* areIntervalsOverlapping(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 17), end: new Date(2014, 0, 21) }
* )
* //=> true
*
* @example
* // For non-overlapping time intervals:
* areIntervalsOverlapping(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 21), end: new Date(2014, 0, 22) }
* )
* //=> false
*
* @example
* // For adjacent time intervals:
* areIntervalsOverlapping(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 20), end: new Date(2014, 0, 30) }
* )
* //=> false
*
* @example
* // Using the inclusive option:
* areIntervalsOverlapping(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 20), end: new Date(2014, 0, 24) }
* )
* //=> false
*
* @example
* areIntervalsOverlapping(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 20), end: new Date(2014, 0, 24) },
*   { inclusive: true }
* )
* //=> true
*/
function areIntervalsOverlapping(intervalLeft, intervalRight, options) {
	const [leftStartTime, leftEndTime] = [+toDate(intervalLeft.start), +toDate(intervalLeft.end)].sort((a, b) => a - b);
	const [rightStartTime, rightEndTime] = [+toDate(intervalRight.start), +toDate(intervalRight.end)].sort((a, b) => a - b);
	if (options?.inclusive) return leftStartTime <= rightEndTime && rightStartTime <= leftEndTime;
	return leftStartTime < rightEndTime && rightStartTime < leftEndTime;
}
//#endregion
//#region node_modules/date-fns/max.mjs
/**
* @name max
* @category Common Helpers
* @summary Return the latest of the given dates.
*
* @description
* Return the latest of the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dates - The dates to compare
*
* @returns The latest of the dates
*
* @example
* // Which of these dates is the latest?
* const result = max([
*   new Date(1989, 6, 10),
*   new Date(1987, 1, 11),
*   new Date(1995, 6, 2),
*   new Date(1990, 0, 1)
* ])
* //=> Sun Jul 02 1995 00:00:00
*/
function max(dates) {
	let result;
	dates.forEach(function(dirtyDate) {
		const currentDate = toDate(dirtyDate);
		if (result === void 0 || result < currentDate || isNaN(Number(currentDate))) result = currentDate;
	});
	return result || /* @__PURE__ */ new Date(NaN);
}
//#endregion
//#region node_modules/date-fns/min.mjs
/**
* @name min
* @category Common Helpers
* @summary Returns the earliest of the given dates.
*
* @description
* Returns the earliest of the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dates - The dates to compare
*
* @returns The earliest of the dates
*
* @example
* // Which of these dates is the earliest?
* const result = min([
*   new Date(1989, 6, 10),
*   new Date(1987, 1, 11),
*   new Date(1995, 6, 2),
*   new Date(1990, 0, 1)
* ])
* //=> Wed Feb 11 1987 00:00:00
*/
function min(dates) {
	let result;
	dates.forEach((dirtyDate) => {
		const date = toDate(dirtyDate);
		if (!result || result > date || isNaN(+date)) result = date;
	});
	return result || /* @__PURE__ */ new Date(NaN);
}
//#endregion
//#region node_modules/date-fns/clamp.mjs
/**
* @name clamp
* @category Interval Helpers
* @summary Return a date bounded by the start and the end of the given interval
*
* @description
* Clamps a date to the lower bound with the start of the interval and the upper
* bound with the end of the interval.
*
* - When the date is less than the start of the interval, the start is returned.
* - When the date is greater than the end of the interval, the end is returned.
* - Otherwise the date is returned.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be bounded
* @param interval - The interval to bound to
*
* @returns The date bounded by the start and the end of the interval
*
* @example
* // What is Mar, 21, 2021 bounded to an interval starting at Mar, 22, 2021 and ending at Apr, 01, 2021
* const result = clamp(new Date(2021, 2, 21), {
*   start: new Date(2021, 2, 22),
*   end: new Date(2021, 3, 1),
* })
* //=> Mon Mar 22 2021 00:00:00
*/
function clamp(date, interval) {
	return min([max([date, interval.start]), interval.end]);
}
//#endregion
//#region node_modules/date-fns/closestIndexTo.mjs
/**
* @name closestIndexTo
* @category Common Helpers
* @summary Return an index of the closest date from the array comparing to the given date.
*
* @description
* Return an index of the closest date from the array comparing to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateToCompare - The date to compare with
* @param dates - The array to search
*
* @returns An index of the date closest to the given date or undefined if no valid value is given
*
* @example
* // Which date is closer to 6 September 2015?
* const dateToCompare = new Date(2015, 8, 6)
* const datesArray = [
*   new Date(2015, 0, 1),
*   new Date(2016, 0, 1),
*   new Date(2017, 0, 1)
* ]
* const result = closestIndexTo(dateToCompare, datesArray)
* //=> 1
*/
function closestIndexTo(dateToCompare, dates) {
	const date = toDate(dateToCompare);
	if (isNaN(Number(date))) return NaN;
	const timeToCompare = date.getTime();
	let result;
	let minDistance;
	dates.forEach(function(dirtyDate, index) {
		const currentDate = toDate(dirtyDate);
		if (isNaN(Number(currentDate))) {
			result = NaN;
			minDistance = NaN;
			return;
		}
		const distance = Math.abs(timeToCompare - currentDate.getTime());
		if (result == null || distance < minDistance) {
			result = index;
			minDistance = distance;
		}
	});
	return result;
}
//#endregion
//#region node_modules/date-fns/closestTo.mjs
/**
* @name closestTo
* @category Common Helpers
* @summary Return a date from the array closest to the given date.
*
* @description
* Return a date from the array closest to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateToCompare - The date to compare with
* @param dates - The array to search
*
* @returns The date from the array closest to the given date or undefined if no valid value is given
*
* @example
* // Which date is closer to 6 September 2015: 1 January 2000 or 1 January 2030?
* const dateToCompare = new Date(2015, 8, 6)
* const result = closestTo(dateToCompare, [
*   new Date(2000, 0, 1),
*   new Date(2030, 0, 1)
* ])
* //=> Tue Jan 01 2030 00:00:00
*/
function closestTo(dateToCompare, dates) {
	const date = toDate(dateToCompare);
	if (isNaN(Number(date))) return constructFrom(dateToCompare, NaN);
	const timeToCompare = date.getTime();
	let result;
	let minDistance;
	dates.forEach((dirtyDate) => {
		const currentDate = toDate(dirtyDate);
		if (isNaN(Number(currentDate))) {
			result = constructFrom(dateToCompare, NaN);
			minDistance = NaN;
			return;
		}
		const distance = Math.abs(timeToCompare - currentDate.getTime());
		if (result == null || distance < minDistance) {
			result = currentDate;
			minDistance = distance;
		}
	});
	return result;
}
//#endregion
//#region node_modules/date-fns/compareAsc.mjs
/**
* @name compareAsc
* @category Common Helpers
* @summary Compare the two dates and return -1, 0 or 1.
*
* @description
* Compare the two dates and return 1 if the first date is after the second,
* -1 if the first date is before the second or 0 if dates are equal.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to compare
* @param dateRight - The second date to compare
*
* @returns The result of the comparison
*
* @example
* // Compare 11 February 1987 and 10 July 1989:
* const result = compareAsc(new Date(1987, 1, 11), new Date(1989, 6, 10))
* //=> -1
*
* @example
* // Sort the array of dates:
* const result = [
*   new Date(1995, 6, 2),
*   new Date(1987, 1, 11),
*   new Date(1989, 6, 10)
* ].sort(compareAsc)
* //=> [
* //   Wed Feb 11 1987 00:00:00,
* //   Mon Jul 10 1989 00:00:00,
* //   Sun Jul 02 1995 00:00:00
* // ]
*/
function compareAsc(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const diff = _dateLeft.getTime() - _dateRight.getTime();
	if (diff < 0) return -1;
	else if (diff > 0) return 1;
	else return diff;
}
//#endregion
//#region node_modules/date-fns/compareDesc.mjs
/**
* @name compareDesc
* @category Common Helpers
* @summary Compare the two dates reverse chronologically and return -1, 0 or 1.
*
* @description
* Compare the two dates and return -1 if the first date is after the second,
* 1 if the first date is before the second or 0 if dates are equal.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to compare
* @param dateRight - The second date to compare
*
* @returns The result of the comparison
*
* @example
* // Compare 11 February 1987 and 10 July 1989 reverse chronologically:
* const result = compareDesc(new Date(1987, 1, 11), new Date(1989, 6, 10))
* //=> 1
*
* @example
* // Sort the array of dates in reverse chronological order:
* const result = [
*   new Date(1995, 6, 2),
*   new Date(1987, 1, 11),
*   new Date(1989, 6, 10)
* ].sort(compareDesc)
* //=> [
* //   Sun Jul 02 1995 00:00:00,
* //   Mon Jul 10 1989 00:00:00,
* //   Wed Feb 11 1987 00:00:00
* // ]
*/
function compareDesc(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const diff = _dateLeft.getTime() - _dateRight.getTime();
	if (diff > 0) return -1;
	else if (diff < 0) return 1;
	else return diff;
}
//#endregion
//#region node_modules/date-fns/constructNow.mjs
/**
* @name constructNow
* @category Generic Helpers
* @summary Constructs a new current date using the passed value constructor.
* @pure false
*
* @description
* The function constructs a new current date using the constructor from
* the reference date. It helps to build generic functions that accept date
* extensions and use the current date.
*
* It defaults to `Date` if the passed reference date is a number or a string.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The reference date to take constructor from
*
* @returns Current date initialized using the given date constructor
*
* @example
* import { constructNow, isSameDay } from 'date-fns'
*
* function isToday<DateType extends Date>(
*   date: DateType | number | string,
* ): boolean {
*   // If we were to use `new Date()` directly, the function would  behave
*   // differently in different timezones and return false for the same date.
*   return isSameDay(date, constructNow(date));
* }
*/
function constructNow(date) {
	return constructFrom(date, Date.now());
}
//#endregion
//#region node_modules/date-fns/daysToWeeks.mjs
/**
* @name daysToWeeks
* @category Conversion Helpers
* @summary Convert days to weeks.
*
* @description
* Convert a number of days to a full number of weeks.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param days - The number of days to be converted
*
* @returns The number of days converted in weeks
*
* @example
* // Convert 14 days to weeks:
* const result = daysToWeeks(14)
* //=> 2
*
* @example
* // It uses trunc rounding:
* const result = daysToWeeks(13)
* //=> 1
*/
function daysToWeeks(days) {
	const weeks = days / 7;
	const result = Math.trunc(weeks);
	return result === 0 ? 0 : result;
}
//#endregion
//#region node_modules/date-fns/isSameDay.mjs
/**
* @name isSameDay
* @category Day Helpers
* @summary Are the given dates in the same day (and year and month)?
*
* @description
* Are the given dates in the same day (and year and month)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check

* @returns The dates are in the same day (and year and month)
*
* @example
* // Are 4 September 06:00:00 and 4 September 18:00:00 in the same day?
* const result = isSameDay(new Date(2014, 8, 4, 6, 0), new Date(2014, 8, 4, 18, 0))
* //=> true
*
* @example
* // Are 4 September and 4 October in the same day?
* const result = isSameDay(new Date(2014, 8, 4), new Date(2014, 9, 4))
* //=> false
*
* @example
* // Are 4 September, 2014 and 4 September, 2015 in the same day?
* const result = isSameDay(new Date(2014, 8, 4), new Date(2015, 8, 4))
* //=> false
*/
function isSameDay(dateLeft, dateRight) {
	const dateLeftStartOfDay = startOfDay(dateLeft);
	const dateRightStartOfDay = startOfDay(dateRight);
	return +dateLeftStartOfDay === +dateRightStartOfDay;
}
//#endregion
//#region node_modules/date-fns/isDate.mjs
/**
* @name isDate
* @category Common Helpers
* @summary Is the given value a date?
*
* @description
* Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
*
* @param value - The value to check
*
* @returns True if the given value is a date
*
* @example
* // For a valid date:
* const result = isDate(new Date())
* //=> true
*
* @example
* // For an invalid date:
* const result = isDate(new Date(NaN))
* //=> true
*
* @example
* // For some value:
* const result = isDate('2014-02-31')
* //=> false
*
* @example
* // For an object:
* const result = isDate({})
* //=> false
*/
function isDate(value) {
	return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
}
//#endregion
//#region node_modules/date-fns/isValid.mjs
/**
* @name isValid
* @category Common Helpers
* @summary Is the given date valid?
*
* @description
* Returns false if argument is Invalid Date and true otherwise.
* Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
* Invalid Date is a Date, whose time value is NaN.
*
* Time value of Date: http://es5.github.io/#x15.9.1.1
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is valid
*
* @example
* // For the valid date:
* const result = isValid(new Date(2014, 1, 31))
* //=> true
*
* @example
* // For the value, convertable into a date:
* const result = isValid(1393804800000)
* //=> true
*
* @example
* // For the invalid date:
* const result = isValid(new Date(''))
* //=> false
*/
function isValid(date) {
	if (!isDate(date) && typeof date !== "number") return false;
	const _date = toDate(date);
	return !isNaN(Number(_date));
}
//#endregion
//#region node_modules/date-fns/differenceInBusinessDays.mjs
/**
* @name differenceInBusinessDays
* @category Day Helpers
* @summary Get the number of business days between the given dates.
*
* @description
* Get the number of business day periods between the given dates.
* Business days being days that arent in the weekend.
* Like `differenceInCalendarDays`, the function removes the times from
* the dates before calculating the difference.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of business days
*
* @example
* // How many business days are between
* // 10 January 2014 and 20 July 2014?
* const result = differenceInBusinessDays(
*   new Date(2014, 6, 20),
*   new Date(2014, 0, 10)
* )
* //=> 136
*
* // How many business days are between
* // 30 November 2021 and 1 November 2021?
* const result = differenceInBusinessDays(
*   new Date(2021, 10, 30),
*   new Date(2021, 10, 1)
* )
* //=> 21
*
* // How many business days are between
* // 1 November 2021 and 1 December 2021?
* const result = differenceInBusinessDays(
*   new Date(2021, 10, 1),
*   new Date(2021, 11, 1)
* )
* //=> -22
*
* // How many business days are between
* // 1 November 2021 and 1 November 2021 ?
* const result = differenceInBusinessDays(
*   new Date(2021, 10, 1),
*   new Date(2021, 10, 1)
* )
* //=> 0
*/
function differenceInBusinessDays(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	let _dateRight = toDate(dateRight);
	if (!isValid(_dateLeft) || !isValid(_dateRight)) return NaN;
	const calendarDifference = differenceInCalendarDays(_dateLeft, _dateRight);
	const sign = calendarDifference < 0 ? -1 : 1;
	const weeks = Math.trunc(calendarDifference / 7);
	let result = weeks * 5;
	_dateRight = addDays(_dateRight, weeks * 7);
	while (!isSameDay(_dateLeft, _dateRight)) {
		result += isWeekend(_dateRight) ? 0 : sign;
		_dateRight = addDays(_dateRight, sign);
	}
	return result === 0 ? 0 : result;
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarISOWeekYears.mjs
/**
* @name differenceInCalendarISOWeekYears
* @category ISO Week-Numbering Year Helpers
* @summary Get the number of calendar ISO week-numbering years between the given dates.
*
* @description
* Get the number of calendar ISO week-numbering years between the given dates.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of calendar ISO week-numbering years
*
* @example
* // How many calendar ISO week-numbering years are 1 January 2010 and 1 January 2012?
* const result = differenceInCalendarISOWeekYears(
*   new Date(2012, 0, 1),
*   new Date(2010, 0, 1)
* )
* //=> 2
*/
function differenceInCalendarISOWeekYears(dateLeft, dateRight) {
	return getISOWeekYear(dateLeft) - getISOWeekYear(dateRight);
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarISOWeeks.mjs
/**
* @name differenceInCalendarISOWeeks
* @category ISO Week Helpers
* @summary Get the number of calendar ISO weeks between the given dates.
*
* @description
* Get the number of calendar ISO weeks between the given dates.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of calendar ISO weeks
*
* @example
* // How many calendar ISO weeks are between 6 July 2014 and 21 July 2014?
* const result = differenceInCalendarISOWeeks(
*   new Date(2014, 6, 21),
*   new Date(2014, 6, 6)
* )
* //=> 3
*/
function differenceInCalendarISOWeeks(dateLeft, dateRight) {
	const startOfISOWeekLeft = startOfISOWeek(dateLeft);
	const startOfISOWeekRight = startOfISOWeek(dateRight);
	const timestampLeft = +startOfISOWeekLeft - getTimezoneOffsetInMilliseconds(startOfISOWeekLeft);
	const timestampRight = +startOfISOWeekRight - getTimezoneOffsetInMilliseconds(startOfISOWeekRight);
	return Math.round((timestampLeft - timestampRight) / millisecondsInWeek);
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarMonths.mjs
/**
* @name differenceInCalendarMonths
* @category Month Helpers
* @summary Get the number of calendar months between the given dates.
*
* @description
* Get the number of calendar months between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of calendar months
*
* @example
* // How many calendar months are between 31 January 2014 and 1 September 2014?
* const result = differenceInCalendarMonths(
*   new Date(2014, 8, 1),
*   new Date(2014, 0, 31)
* )
* //=> 8
*/
function differenceInCalendarMonths(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
	const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();
	return yearDiff * 12 + monthDiff;
}
//#endregion
//#region node_modules/date-fns/getQuarter.mjs
/**
* @name getQuarter
* @category Quarter Helpers
* @summary Get the year quarter of the given date.
*
* @description
* Get the year quarter of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The quarter
*
* @example
* // Which quarter is 2 July 2014?
* const result = getQuarter(new Date(2014, 6, 2))
* //=> 3
*/
function getQuarter(date) {
	const _date = toDate(date);
	return Math.trunc(_date.getMonth() / 3) + 1;
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarQuarters.mjs
/**
* @name differenceInCalendarQuarters
* @category Quarter Helpers
* @summary Get the number of calendar quarters between the given dates.
*
* @description
* Get the number of calendar quarters between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date

* @returns The number of calendar quarters
*
* @example
* // How many calendar quarters are between 31 December 2013 and 2 July 2014?
* const result = differenceInCalendarQuarters(
*   new Date(2014, 6, 2),
*   new Date(2013, 11, 31)
* )
* //=> 3
*/
function differenceInCalendarQuarters(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
	const quarterDiff = getQuarter(_dateLeft) - getQuarter(_dateRight);
	return yearDiff * 4 + quarterDiff;
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarWeeks.mjs
/**
* The {@link differenceInCalendarWeeks} function options.
*/
/**
* @name differenceInCalendarWeeks
* @category Week Helpers
* @summary Get the number of calendar weeks between the given dates.
*
* @description
* Get the number of calendar weeks between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options.
*
* @returns The number of calendar weeks
*
* @example
* // How many calendar weeks are between 5 July 2014 and 20 July 2014?
* const result = differenceInCalendarWeeks(
*   new Date(2014, 6, 20),
*   new Date(2014, 6, 5)
* )
* //=> 3
*
* @example
* // If the week starts on Monday,
* // how many calendar weeks are between 5 July 2014 and 20 July 2014?
* const result = differenceInCalendarWeeks(
*   new Date(2014, 6, 20),
*   new Date(2014, 6, 5),
*   { weekStartsOn: 1 }
* )
* //=> 2
*/
function differenceInCalendarWeeks(dateLeft, dateRight, options) {
	const startOfWeekLeft = startOfWeek(dateLeft, options);
	const startOfWeekRight = startOfWeek(dateRight, options);
	const timestampLeft = +startOfWeekLeft - getTimezoneOffsetInMilliseconds(startOfWeekLeft);
	const timestampRight = +startOfWeekRight - getTimezoneOffsetInMilliseconds(startOfWeekRight);
	return Math.round((timestampLeft - timestampRight) / millisecondsInWeek);
}
//#endregion
//#region node_modules/date-fns/differenceInCalendarYears.mjs
/**
* @name differenceInCalendarYears
* @category Year Helpers
* @summary Get the number of calendar years between the given dates.
*
* @description
* Get the number of calendar years between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date

* @returns The number of calendar years
*
* @example
* // How many calendar years are between 31 December 2013 and 11 February 2015?
* const result = differenceInCalendarYears(
*   new Date(2015, 1, 11),
*   new Date(2013, 11, 31)
* )
* //=> 2
*/
function differenceInCalendarYears(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	return _dateLeft.getFullYear() - _dateRight.getFullYear();
}
//#endregion
//#region node_modules/date-fns/differenceInDays.mjs
/**
* @name differenceInDays
* @category Day Helpers
* @summary Get the number of full days between the given dates.
*
* @description
* Get the number of full day periods between two dates. Fractional days are
* truncated towards zero.
*
* One "full day" is the distance between a local time in one day to the same
* local time on the next or previous day. A full day can sometimes be less than
* or more than 24 hours if a daylight savings change happens between two dates.
*
* To ignore DST and only measure exact 24-hour periods, use this instead:
* `Math.trunc(differenceInHours(dateLeft, dateRight)/24)|0`.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of full days according to the local timezone
*
* @example
* // How many full days are between
* // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
* const result = differenceInDays(
*   new Date(2012, 6, 2, 0, 0),
*   new Date(2011, 6, 2, 23, 0)
* )
* //=> 365
*
* @example
* // How many full days are between
* // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
* const result = differenceInDays(
*   new Date(2011, 6, 3, 0, 1),
*   new Date(2011, 6, 2, 23, 59)
* )
* //=> 0
*
* @example
* // How many full days are between
* // 1 March 2020 0:00 and 1 June 2020 0:00 ?
* // Note: because local time is used, the
* // result will always be 92 days, even in
* // time zones where DST starts and the
* // period has only 92*24-1 hours.
* const result = differenceInDays(
*   new Date(2020, 5, 1),
*   new Date(2020, 2, 1)
* )
* //=> 92
*/
function differenceInDays(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const sign = compareLocalAsc(_dateLeft, _dateRight);
	const difference = Math.abs(differenceInCalendarDays(_dateLeft, _dateRight));
	_dateLeft.setDate(_dateLeft.getDate() - sign * difference);
	const result = sign * (difference - Number(compareLocalAsc(_dateLeft, _dateRight) === -sign));
	return result === 0 ? 0 : result;
}
function compareLocalAsc(dateLeft, dateRight) {
	const diff = dateLeft.getFullYear() - dateRight.getFullYear() || dateLeft.getMonth() - dateRight.getMonth() || dateLeft.getDate() - dateRight.getDate() || dateLeft.getHours() - dateRight.getHours() || dateLeft.getMinutes() - dateRight.getMinutes() || dateLeft.getSeconds() - dateRight.getSeconds() || dateLeft.getMilliseconds() - dateRight.getMilliseconds();
	if (diff < 0) return -1;
	else if (diff > 0) return 1;
	else return diff;
}
//#endregion
//#region node_modules/date-fns/_lib/getRoundingMethod.mjs
function getRoundingMethod(method) {
	return (number) => {
		const result = (method ? Math[method] : Math.trunc)(number);
		return result === 0 ? 0 : result;
	};
}
//#endregion
//#region node_modules/date-fns/differenceInMilliseconds.mjs
/**
* @name differenceInMilliseconds
* @category Millisecond Helpers
* @summary Get the number of milliseconds between the given dates.
*
* @description
* Get the number of milliseconds between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of milliseconds
*
* @example
* // How many milliseconds are between
* // 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
* const result = differenceInMilliseconds(
*   new Date(2014, 6, 2, 12, 30, 21, 700),
*   new Date(2014, 6, 2, 12, 30, 20, 600)
* )
* //=> 1100
*/
function differenceInMilliseconds(dateLeft, dateRight) {
	return +toDate(dateLeft) - +toDate(dateRight);
}
//#endregion
//#region node_modules/date-fns/differenceInHours.mjs
/**
* The {@link differenceInHours} function options.
*/
/**
* @name differenceInHours
* @category Hour Helpers
* @summary Get the number of hours between the given dates.
*
* @description
* Get the number of hours between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options.
*
* @returns The number of hours
*
* @example
* // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
* const result = differenceInHours(
*   new Date(2014, 6, 2, 19, 0),
*   new Date(2014, 6, 2, 6, 50)
* )
* //=> 12
*/
function differenceInHours(dateLeft, dateRight, options) {
	const diff = differenceInMilliseconds(dateLeft, dateRight) / millisecondsInHour;
	return getRoundingMethod(options?.roundingMethod)(diff);
}
//#endregion
//#region node_modules/date-fns/subISOWeekYears.mjs
/**
* @name subISOWeekYears
* @category ISO Week-Numbering Year Helpers
* @summary Subtract the specified number of ISO week-numbering years from the given date.
*
* @description
* Subtract the specified number of ISO week-numbering years from the given date.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of ISO week-numbering years to be subtracted.
*
* @returns The new date with the ISO week-numbering years subtracted
*
* @example
* // Subtract 5 ISO week-numbering years from 1 September 2014:
* const result = subISOWeekYears(new Date(2014, 8, 1), 5)
* //=> Mon Aug 31 2009 00:00:00
*/
function subISOWeekYears(date, amount) {
	return addISOWeekYears(date, -amount);
}
//#endregion
//#region node_modules/date-fns/differenceInISOWeekYears.mjs
/**
* @name differenceInISOWeekYears
* @category ISO Week-Numbering Year Helpers
* @summary Get the number of full ISO week-numbering years between the given dates.
*
* @description
* Get the number of full ISO week-numbering years between the given dates.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of full ISO week-numbering years
*
* @example
* // How many full ISO week-numbering years are between 1 January 2010 and 1 January 2012?
* const result = differenceInISOWeekYears(
*   new Date(2012, 0, 1),
*   new Date(2010, 0, 1)
* )
* //=> 1
*/
function differenceInISOWeekYears(dateLeft, dateRight) {
	let _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const sign = compareAsc(_dateLeft, _dateRight);
	const difference = Math.abs(differenceInCalendarISOWeekYears(_dateLeft, _dateRight));
	_dateLeft = subISOWeekYears(_dateLeft, sign * difference);
	const result = sign * (difference - Number(compareAsc(_dateLeft, _dateRight) === -sign));
	return result === 0 ? 0 : result;
}
//#endregion
//#region node_modules/date-fns/differenceInMinutes.mjs
/**
* The {@link differenceInMinutes} function options.
*/
/**
* @name differenceInMinutes
* @category Minute Helpers
* @summary Get the number of minutes between the given dates.
*
* @description
* Get the signed number of full (rounded towards 0) minutes between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options.
*
* @returns The number of minutes
*
* @example
* // How many minutes are between 2 July 2014 12:07:59 and 2 July 2014 12:20:00?
* const result = differenceInMinutes(
*   new Date(2014, 6, 2, 12, 20, 0),
*   new Date(2014, 6, 2, 12, 7, 59)
* )
* //=> 12
*
* @example
* // How many minutes are between 10:01:59 and 10:00:00
* const result = differenceInMinutes(
*   new Date(2000, 0, 1, 10, 0, 0),
*   new Date(2000, 0, 1, 10, 1, 59)
* )
* //=> -1
*/
function differenceInMinutes(dateLeft, dateRight, options) {
	const diff = differenceInMilliseconds(dateLeft, dateRight) / millisecondsInMinute;
	return getRoundingMethod(options?.roundingMethod)(diff);
}
//#endregion
//#region node_modules/date-fns/endOfDay.mjs
/**
* @name endOfDay
* @category Day Helpers
* @summary Return the end of a day for the given date.
*
* @description
* Return the end of a day for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a day
*
* @example
* // The end of a day for 2 September 2014 11:55:00:
* const result = endOfDay(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 02 2014 23:59:59.999
*/
function endOfDay(date) {
	const _date = toDate(date);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfMonth.mjs
/**
* @name endOfMonth
* @category Month Helpers
* @summary Return the end of a month for the given date.
*
* @description
* Return the end of a month for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a month
*
* @example
* // The end of a month for 2 September 2014 11:55:00:
* const result = endOfMonth(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 30 2014 23:59:59.999
*/
function endOfMonth(date) {
	const _date = toDate(date);
	const month = _date.getMonth();
	_date.setFullYear(_date.getFullYear(), month + 1, 0);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/isLastDayOfMonth.mjs
/**
* @name isLastDayOfMonth
* @category Month Helpers
* @summary Is the given date the last day of a month?
*
* @description
* Is the given date the last day of a month?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check

* @returns The date is the last day of a month
*
* @example
* // Is 28 February 2014 the last day of a month?
* const result = isLastDayOfMonth(new Date(2014, 1, 28))
* //=> true
*/
function isLastDayOfMonth(date) {
	const _date = toDate(date);
	return +endOfDay(_date) === +endOfMonth(_date);
}
//#endregion
//#region node_modules/date-fns/differenceInMonths.mjs
/**
* @name differenceInMonths
* @category Month Helpers
* @summary Get the number of full months between the given dates.
*
* @description
* Get the number of full months between the given dates using trunc as a default rounding method.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of full months
*
* @example
* // How many full months are between 31 January 2014 and 1 September 2014?
* const result = differenceInMonths(new Date(2014, 8, 1), new Date(2014, 0, 31))
* //=> 7
*/
function differenceInMonths(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const sign = compareAsc(_dateLeft, _dateRight);
	const difference = Math.abs(differenceInCalendarMonths(_dateLeft, _dateRight));
	let result;
	if (difference < 1) result = 0;
	else {
		if (_dateLeft.getMonth() === 1 && _dateLeft.getDate() > 27) _dateLeft.setDate(30);
		_dateLeft.setMonth(_dateLeft.getMonth() - sign * difference);
		let isLastMonthNotFull = compareAsc(_dateLeft, _dateRight) === -sign;
		if (isLastDayOfMonth(toDate(dateLeft)) && difference === 1 && compareAsc(dateLeft, _dateRight) === 1) isLastMonthNotFull = false;
		result = sign * (difference - Number(isLastMonthNotFull));
	}
	return result === 0 ? 0 : result;
}
//#endregion
//#region node_modules/date-fns/differenceInQuarters.mjs
/**
* The {@link differenceInQuarters} function options.
*/
/**
* @name differenceInQuarters
* @category Quarter Helpers
* @summary Get the number of quarters between the given dates.
*
* @description
* Get the number of quarters between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options.
*
* @returns The number of full quarters
*
* @example
* // How many full quarters are between 31 December 2013 and 2 July 2014?
* const result = differenceInQuarters(new Date(2014, 6, 2), new Date(2013, 11, 31))
* //=> 2
*/
function differenceInQuarters(dateLeft, dateRight, options) {
	const diff = differenceInMonths(dateLeft, dateRight) / 3;
	return getRoundingMethod(options?.roundingMethod)(diff);
}
//#endregion
//#region node_modules/date-fns/differenceInSeconds.mjs
/**
* The {@link differenceInSeconds} function options.
*/
/**
* @name differenceInSeconds
* @category Second Helpers
* @summary Get the number of seconds between the given dates.
*
* @description
* Get the number of seconds between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options.
*
* @returns The number of seconds
*
* @example
* // How many seconds are between
* // 2 July 2014 12:30:07.999 and 2 July 2014 12:30:20.000?
* const result = differenceInSeconds(
*   new Date(2014, 6, 2, 12, 30, 20, 0),
*   new Date(2014, 6, 2, 12, 30, 7, 999)
* )
* //=> 12
*/
function differenceInSeconds(dateLeft, dateRight, options) {
	const diff = differenceInMilliseconds(dateLeft, dateRight) / 1e3;
	return getRoundingMethod(options?.roundingMethod)(diff);
}
//#endregion
//#region node_modules/date-fns/differenceInWeeks.mjs
/**
* The {@link differenceInWeeks} function options.
*/
/**
* @name differenceInWeeks
* @category Week Helpers
* @summary Get the number of full weeks between the given dates.
*
* @description
* Get the number of full weeks between two dates. Fractional weeks are
* truncated towards zero by default.
*
* One "full week" is the distance between a local time in one day to the same
* local time 7 days earlier or later. A full week can sometimes be less than
* or more than 7*24 hours if a daylight savings change happens between two dates.
*
* To ignore DST and only measure exact 7*24-hour periods, use this instead:
* `Math.trunc(differenceInHours(dateLeft, dateRight)/(7*24))|0`.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
* @param options - An object with options
*
* @returns The number of full weeks
*
* @example
* // How many full weeks are between 5 July 2014 and 20 July 2014?
* const result = differenceInWeeks(new Date(2014, 6, 20), new Date(2014, 6, 5))
* //=> 2
*
* @example
* // How many full weeks are between
* // 1 March 2020 0:00 and 6 June 2020 0:00 ?
* // Note: because local time is used, the
* // result will always be 8 weeks (54 days),
* // even if DST starts and the period has
* // only 54*24-1 hours.
* const result = differenceInWeeks(
*   new Date(2020, 5, 1),
*   new Date(2020, 2, 6)
* )
* //=> 8
*/
function differenceInWeeks(dateLeft, dateRight, options) {
	const diff = differenceInDays(dateLeft, dateRight) / 7;
	return getRoundingMethod(options?.roundingMethod)(diff);
}
//#endregion
//#region node_modules/date-fns/differenceInYears.mjs
/**
* @name differenceInYears
* @category Year Helpers
* @summary Get the number of full years between the given dates.
*
* @description
* Get the number of full years between the given dates.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The later date
* @param dateRight - The earlier date
*
* @returns The number of full years
*
* @example
* // How many full years are between 31 December 2013 and 11 February 2015?
* const result = differenceInYears(new Date(2015, 1, 11), new Date(2013, 11, 31))
* //=> 1
*/
function differenceInYears(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	const sign = compareAsc(_dateLeft, _dateRight);
	const difference = Math.abs(differenceInCalendarYears(_dateLeft, _dateRight));
	_dateLeft.setFullYear(1584);
	_dateRight.setFullYear(1584);
	const result = sign * (difference - +(compareAsc(_dateLeft, _dateRight) === -sign));
	return result === 0 ? 0 : result;
}
//#endregion
//#region node_modules/date-fns/eachDayOfInterval.mjs
/**
* The {@link eachDayOfInterval} function options.
*/
/**
* @name eachDayOfInterval
* @category Interval Helpers
* @summary Return the array of dates within the specified time interval.
*
* @description
* Return the array of dates within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval.
* @param options - An object with options.
*
* @returns The array with starts of days from the day of the interval start to the day of the interval end
*
* @example
* // Each day between 6 October 2014 and 10 October 2014:
* const result = eachDayOfInterval({
*   start: new Date(2014, 9, 6),
*   end: new Date(2014, 9, 10)
* })
* //=> [
* //   Mon Oct 06 2014 00:00:00,
* //   Tue Oct 07 2014 00:00:00,
* //   Wed Oct 08 2014 00:00:00,
* //   Thu Oct 09 2014 00:00:00,
* //   Fri Oct 10 2014 00:00:00
* // ]
*/
function eachDayOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startDate : +endDate;
	const currentDate = reversed ? endDate : startDate;
	currentDate.setHours(0, 0, 0, 0);
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate.setDate(currentDate.getDate() + step);
		currentDate.setHours(0, 0, 0, 0);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/eachHourOfInterval.mjs
/**
* The {@link eachHourOfInterval} function options.
*/
/**
* @name eachHourOfInterval
* @category Interval Helpers
* @summary Return the array of hours within the specified time interval.
*
* @description
* Return the array of hours within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval.
* @param options - An object with options.
*
* @returns The array with starts of hours from the hour of the interval start to the hour of the interval end
*
* @example
* // Each hour between 6 October 2014, 12:00 and 6 October 2014, 15:00
* const result = eachHourOfInterval({
*   start: new Date(2014, 9, 6, 12),
*   end: new Date(2014, 9, 6, 15)
* })
* //=> [
* //   Mon Oct 06 2014 12:00:00,
* //   Mon Oct 06 2014 13:00:00,
* //   Mon Oct 06 2014 14:00:00,
* //   Mon Oct 06 2014 15:00:00
* // ]
*/
function eachHourOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startDate : +endDate;
	let currentDate = reversed ? endDate : startDate;
	currentDate.setMinutes(0, 0, 0);
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate = addHours(currentDate, step);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/startOfMinute.mjs
/**
* @name startOfMinute
* @category Minute Helpers
* @summary Return the start of a minute for the given date.
*
* @description
* Return the start of a minute for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a minute
*
* @example
* // The start of a minute for 1 December 2014 22:15:45.400:
* const result = startOfMinute(new Date(2014, 11, 1, 22, 15, 45, 400))
* //=> Mon Dec 01 2014 22:15:00
*/
function startOfMinute(date) {
	const _date = toDate(date);
	_date.setSeconds(0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/eachMinuteOfInterval.mjs
/**
* The {@link eachMinuteOfInterval} function options.
*/
/**
* @name eachMinuteOfInterval
* @category Interval Helpers
* @summary Return the array of minutes within the specified time interval.
*
* @description
* Returns the array of minutes within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval.
* @param options - An object with options.
*
* @returns The array with starts of minutes from the minute of the interval start to the minute of the interval end
*
* @example
* // Each minute between 14 October 2020, 13:00 and 14 October 2020, 13:03
* const result = eachMinuteOfInterval({
*   start: new Date(2014, 9, 14, 13),
*   end: new Date(2014, 9, 14, 13, 3)
* })
* //=> [
* //   Wed Oct 14 2014 13:00:00,
* //   Wed Oct 14 2014 13:01:00,
* //   Wed Oct 14 2014 13:02:00,
* //   Wed Oct 14 2014 13:03:00
* // ]
*/
function eachMinuteOfInterval(interval, options) {
	const startDate = startOfMinute(toDate(interval.start));
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startDate : +endDate;
	let currentDate = reversed ? endDate : startDate;
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate = addMinutes(currentDate, step);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/eachMonthOfInterval.mjs
/**
* The {@link eachMonthOfInterval} function options.
*/
/**
* @name eachMonthOfInterval
* @category Interval Helpers
* @summary Return the array of months within the specified time interval.
*
* @description
* Return the array of months within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval
*
* @returns The array with starts of months from the month of the interval start to the month of the interval end
*
* @example
* // Each month between 6 February 2014 and 10 August 2014:
* const result = eachMonthOfInterval({
*   start: new Date(2014, 1, 6),
*   end: new Date(2014, 7, 10)
* })
* //=> [
* //   Sat Feb 01 2014 00:00:00,
* //   Sat Mar 01 2014 00:00:00,
* //   Tue Apr 01 2014 00:00:00,
* //   Thu May 01 2014 00:00:00,
* //   Sun Jun 01 2014 00:00:00,
* //   Tue Jul 01 2014 00:00:00,
* //   Fri Aug 01 2014 00:00:00
* // ]
*/
function eachMonthOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startDate : +endDate;
	const currentDate = reversed ? endDate : startDate;
	currentDate.setHours(0, 0, 0, 0);
	currentDate.setDate(1);
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate.setMonth(currentDate.getMonth() + step);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/startOfQuarter.mjs
/**
* @name startOfQuarter
* @category Quarter Helpers
* @summary Return the start of a year quarter for the given date.
*
* @description
* Return the start of a year quarter for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a quarter
*
* @example
* // The start of a quarter for 2 September 2014 11:55:00:
* const result = startOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Jul 01 2014 00:00:00
*/
function startOfQuarter(date) {
	const _date = toDate(date);
	const currentMonth = _date.getMonth();
	const month = currentMonth - currentMonth % 3;
	_date.setMonth(month, 1);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/eachQuarterOfInterval.mjs
/**
* The {@link eachQuarterOfInterval} function options.
*/
/**
* @name eachQuarterOfInterval
* @category Interval Helpers
* @summary Return the array of quarters within the specified time interval.
*
* @description
* Return the array of quarters within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval
*
* @returns The array with starts of quarters from the quarter of the interval start to the quarter of the interval end
*
* @example
* // Each quarter within interval 6 February 2014 - 10 August 2014:
* const result = eachQuarterOfInterval({
*   start: new Date(2014, 1, 6),
*   end: new Date(2014, 7, 10)
* })
* //=> [
* //   Wed Jan 01 2014 00:00:00,
* //   Tue Apr 01 2014 00:00:00,
* //   Tue Jul 01 2014 00:00:00,
* // ]
*/
function eachQuarterOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startOfQuarter(startDate) : +startOfQuarter(endDate);
	let currentDate = reversed ? startOfQuarter(endDate) : startOfQuarter(startDate);
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate = addQuarters(currentDate, step);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/eachWeekOfInterval.mjs
/**
* The {@link eachWeekOfInterval} function options.
*/
/**
* @name eachWeekOfInterval
* @category Interval Helpers
* @summary Return the array of weeks within the specified time interval.
*
* @description
* Return the array of weeks within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval.
* @param options - An object with options.
*
* @returns The array with starts of weeks from the week of the interval start to the week of the interval end
*
* @example
* // Each week within interval 6 October 2014 - 23 November 2014:
* const result = eachWeekOfInterval({
*   start: new Date(2014, 9, 6),
*   end: new Date(2014, 10, 23)
* })
* //=> [
* //   Sun Oct 05 2014 00:00:00,
* //   Sun Oct 12 2014 00:00:00,
* //   Sun Oct 19 2014 00:00:00,
* //   Sun Oct 26 2014 00:00:00,
* //   Sun Nov 02 2014 00:00:00,
* //   Sun Nov 09 2014 00:00:00,
* //   Sun Nov 16 2014 00:00:00,
* //   Sun Nov 23 2014 00:00:00
* // ]
*/
function eachWeekOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const startDateWeek = reversed ? startOfWeek(endDate, options) : startOfWeek(startDate, options);
	const endDateWeek = reversed ? startOfWeek(startDate, options) : startOfWeek(endDate, options);
	startDateWeek.setHours(15);
	endDateWeek.setHours(15);
	const endTime = +endDateWeek.getTime();
	let currentDate = startDateWeek;
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		currentDate.setHours(0);
		dates.push(toDate(currentDate));
		currentDate = addWeeks(currentDate, step);
		currentDate.setHours(15);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/eachWeekendOfInterval.mjs
/**
* @name eachWeekendOfInterval
* @category Interval Helpers
* @summary List all the Saturdays and Sundays in the given date interval.
*
* @description
* Get all the Saturdays and Sundays in the given date interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The given interval
*
* @returns An array containing all the Saturdays and Sundays
*
* @example
* // Lists all Saturdays and Sundays in the given date interval
* const result = eachWeekendOfInterval({
*   start: new Date(2018, 8, 17),
*   end: new Date(2018, 8, 30)
* })
* //=> [
* //   Sat Sep 22 2018 00:00:00,
* //   Sun Sep 23 2018 00:00:00,
* //   Sat Sep 29 2018 00:00:00,
* //   Sun Sep 30 2018 00:00:00
* // ]
*/
function eachWeekendOfInterval(interval) {
	const dateInterval = eachDayOfInterval(interval);
	const weekends = [];
	let index = 0;
	while (index < dateInterval.length) {
		const date = dateInterval[index++];
		if (isWeekend(date)) weekends.push(date);
	}
	return weekends;
}
//#endregion
//#region node_modules/date-fns/startOfMonth.mjs
/**
* @name startOfMonth
* @category Month Helpers
* @summary Return the start of a month for the given date.
*
* @description
* Return the start of a month for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a month
*
* @example
* // The start of a month for 2 September 2014 11:55:00:
* const result = startOfMonth(new Date(2014, 8, 2, 11, 55, 0))
* //=> Mon Sep 01 2014 00:00:00
*/
function startOfMonth(date) {
	const _date = toDate(date);
	_date.setDate(1);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/eachWeekendOfMonth.mjs
/**
* @name eachWeekendOfMonth
* @category Month Helpers
* @summary List all the Saturdays and Sundays in the given month.
*
* @description
* Get all the Saturdays and Sundays in the given month.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given month
*
* @returns An array containing all the Saturdays and Sundays
*
* @example
* // Lists all Saturdays and Sundays in the given month
* const result = eachWeekendOfMonth(new Date(2022, 1, 1))
* //=> [
* //   Sat Feb 05 2022 00:00:00,
* //   Sun Feb 06 2022 00:00:00,
* //   Sat Feb 12 2022 00:00:00,
* //   Sun Feb 13 2022 00:00:00,
* //   Sat Feb 19 2022 00:00:00,
* //   Sun Feb 20 2022 00:00:00,
* //   Sat Feb 26 2022 00:00:00,
* //   Sun Feb 27 2022 00:00:00
* // ]
*/
function eachWeekendOfMonth(date) {
	return eachWeekendOfInterval({
		start: startOfMonth(date),
		end: endOfMonth(date)
	});
}
//#endregion
//#region node_modules/date-fns/endOfYear.mjs
/**
* @name endOfYear
* @category Year Helpers
* @summary Return the end of a year for the given date.
*
* @description
* Return the end of a year for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a year
*
* @example
* // The end of a year for 2 September 2014 11:55:00:
* const result = endOfYear(new Date(2014, 8, 2, 11, 55, 00))
* //=> Wed Dec 31 2014 23:59:59.999
*/
function endOfYear(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	_date.setFullYear(year + 1, 0, 0);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/startOfYear.mjs
/**
* @name startOfYear
* @category Year Helpers
* @summary Return the start of a year for the given date.
*
* @description
* Return the start of a year for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a year
*
* @example
* // The start of a year for 2 September 2014 11:55:00:
* const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
* //=> Wed Jan 01 2014 00:00:00
*/
function startOfYear(date) {
	const cleanDate = toDate(date);
	const _date = constructFrom(date, 0);
	_date.setFullYear(cleanDate.getFullYear(), 0, 1);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/eachWeekendOfYear.mjs
/**
* @name eachWeekendOfYear
* @category Year Helpers
* @summary List all the Saturdays and Sundays in the year.
*
* @description
* Get all the Saturdays and Sundays in the year.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given year
*
* @returns An array containing all the Saturdays and Sundays
*
* @example
* // Lists all Saturdays and Sundays in the year
* const result = eachWeekendOfYear(new Date(2020, 1, 1))
* //=> [
* //   Sat Jan 03 2020 00:00:00,
* //   Sun Jan 04 2020 00:00:00,
* //   ...
* //   Sun Dec 27 2020 00:00:00
* // ]
* ]
*/
function eachWeekendOfYear(date) {
	return eachWeekendOfInterval({
		start: startOfYear(date),
		end: endOfYear(date)
	});
}
//#endregion
//#region node_modules/date-fns/eachYearOfInterval.mjs
/**
* The {@link eachYearOfInterval} function options.
*/
/**
* @name eachYearOfInterval
* @category Interval Helpers
* @summary Return the array of yearly timestamps within the specified time interval.
*
* @description
* Return the array of yearly timestamps within the specified time interval.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval.
*
* @returns The array with starts of yearly timestamps from the month of the interval start to the month of the interval end
*
* @example
* // Each year between 6 February 2014 and 10 August 2017:
* const result = eachYearOfInterval({
*   start: new Date(2014, 1, 6),
*   end: new Date(2017, 7, 10)
* })
* //=> [
* //   Wed Jan 01 2014 00:00:00,
* //   Thu Jan 01 2015 00:00:00,
* //   Fri Jan 01 2016 00:00:00,
* //   Sun Jan 01 2017 00:00:00
* // ]
*/
function eachYearOfInterval(interval, options) {
	const startDate = toDate(interval.start);
	const endDate = toDate(interval.end);
	let reversed = +startDate > +endDate;
	const endTime = reversed ? +startDate : +endDate;
	const currentDate = reversed ? endDate : startDate;
	currentDate.setHours(0, 0, 0, 0);
	currentDate.setMonth(0, 1);
	let step = options?.step ?? 1;
	if (!step) return [];
	if (step < 0) {
		step = -step;
		reversed = !reversed;
	}
	const dates = [];
	while (+currentDate <= endTime) {
		dates.push(toDate(currentDate));
		currentDate.setFullYear(currentDate.getFullYear() + step);
	}
	return reversed ? dates.reverse() : dates;
}
//#endregion
//#region node_modules/date-fns/endOfDecade.mjs
/**
* @name endOfDecade
* @category Decade Helpers
* @summary Return the end of a decade for the given date.
*
* @description
* Return the end of a decade for the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a decade
*
* @example
* // The end of a decade for 12 May 1984 00:00:00:
* const result = endOfDecade(new Date(1984, 4, 12, 00, 00, 00))
* //=> Dec 31 1989 23:59:59.999
*/
function endOfDecade(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const decade = 9 + Math.floor(year / 10) * 10;
	_date.setFullYear(decade, 11, 31);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfHour.mjs
/**
* @name endOfHour
* @category Hour Helpers
* @summary Return the end of an hour for the given date.
*
* @description
* Return the end of an hour for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of an hour
*
* @example
* // The end of an hour for 2 September 2014 11:55:00:
* const result = endOfHour(new Date(2014, 8, 2, 11, 55))
* //=> Tue Sep 02 2014 11:59:59.999
*/
function endOfHour(date) {
	const _date = toDate(date);
	_date.setMinutes(59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfWeek.mjs
/**
* The {@link endOfWeek} function options.
*/
/**
* @name endOfWeek
* @category Week Helpers
* @summary Return the end of a week for the given date.
*
* @description
* Return the end of a week for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options
*
* @returns The end of a week
*
* @example
* // The end of a week for 2 September 2014 11:55:00:
* const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sat Sep 06 2014 23:59:59.999
*
* @example
* // If the week starts on Monday, the end of the week for 2 September 2014 11:55:00:
* const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
* //=> Sun Sep 07 2014 23:59:59.999
*/
function endOfWeek(date, options) {
	const defaultOptions = getDefaultOptions$1();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const _date = toDate(date);
	const day = _date.getDay();
	const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
	_date.setDate(_date.getDate() + diff);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfISOWeek.mjs
/**
* @name endOfISOWeek
* @category ISO Week Helpers
* @summary Return the end of an ISO week for the given date.
*
* @description
* Return the end of an ISO week for the given date.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of an ISO week
*
* @example
* // The end of an ISO week for 2 September 2014 11:55:00:
* const result = endOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sun Sep 07 2014 23:59:59.999
*/
function endOfISOWeek(date) {
	return endOfWeek(date, { weekStartsOn: 1 });
}
//#endregion
//#region node_modules/date-fns/endOfISOWeekYear.mjs
/**
* @name endOfISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Return the end of an ISO week-numbering year for the given date.
*
* @description
* Return the end of an ISO week-numbering year,
* which always starts 3 days before the year's first Thursday.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of an ISO week-numbering year
*
* @example
* // The end of an ISO week-numbering year for 2 July 2005:
* const result = endOfISOWeekYear(new Date(2005, 6, 2))
* //=> Sun Jan 01 2006 23:59:59.999
*/
function endOfISOWeekYear(date) {
	const year = getISOWeekYear(date);
	const fourthOfJanuaryOfNextYear = constructFrom(date, 0);
	fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
	fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
	const _date = startOfISOWeek(fourthOfJanuaryOfNextYear);
	_date.setMilliseconds(_date.getMilliseconds() - 1);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfMinute.mjs
/**
* @name endOfMinute
* @category Minute Helpers
* @summary Return the end of a minute for the given date.
*
* @description
* Return the end of a minute for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a minute
*
* @example
* // The end of a minute for 1 December 2014 22:15:45.400:
* const result = endOfMinute(new Date(2014, 11, 1, 22, 15, 45, 400))
* //=> Mon Dec 01 2014 22:15:59.999
*/
function endOfMinute(date) {
	const _date = toDate(date);
	_date.setSeconds(59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfQuarter.mjs
/**
* @name endOfQuarter
* @category Quarter Helpers
* @summary Return the end of a year quarter for the given date.
*
* @description
* Return the end of a year quarter for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a quarter
*
* @example
* // The end of a quarter for 2 September 2014 11:55:00:
* const result = endOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 30 2014 23:59:59.999
*/
function endOfQuarter(date) {
	const _date = toDate(date);
	const currentMonth = _date.getMonth();
	const month = currentMonth - currentMonth % 3 + 3;
	_date.setMonth(month, 0);
	_date.setHours(23, 59, 59, 999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfSecond.mjs
/**
* @name endOfSecond
* @category Second Helpers
* @summary Return the end of a second for the given date.
*
* @description
* Return the end of a second for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of a second
*
* @example
* // The end of a second for 1 December 2014 22:15:45.400:
* const result = endOfSecond(new Date(2014, 11, 1, 22, 15, 45, 400))
* //=> Mon Dec 01 2014 22:15:45.999
*/
function endOfSecond(date) {
	const _date = toDate(date);
	_date.setMilliseconds(999);
	return _date;
}
//#endregion
//#region node_modules/date-fns/endOfToday.mjs
/**
* @name endOfToday
* @category Day Helpers
* @summary Return the end of today.
* @pure false
*
* @description
* Return the end of today.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @returns The end of today
*
* @example
* // If today is 6 October 2014:
* const result = endOfToday()
* //=> Mon Oct 6 2014 23:59:59.999
*/
function endOfToday() {
	return endOfDay(Date.now());
}
//#endregion
//#region node_modules/date-fns/endOfTomorrow.mjs
/**
* @name endOfTomorrow
* @category Day Helpers
* @summary Return the end of tomorrow.
* @pure false
*
* @description
* Return the end of tomorrow.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @returns The end of tomorrow
*
* @example
* // If today is 6 October 2014:
* const result = endOfTomorrow()
* //=> Tue Oct 7 2014 23:59:59.999
*/
function endOfTomorrow() {
	const now = /* @__PURE__ */ new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();
	const date = /* @__PURE__ */ new Date(0);
	date.setFullYear(year, month, day + 1);
	date.setHours(23, 59, 59, 999);
	return date;
}
//#endregion
//#region node_modules/date-fns/endOfYesterday.mjs
/**
* @name endOfYesterday
* @category Day Helpers
* @summary Return the end of yesterday.
* @pure false
*
* @description
* Return the end of yesterday.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @returns The end of yesterday
*
* @example
* // If today is 6 October 2014:
* const result = endOfYesterday()
* //=> Sun Oct 5 2014 23:59:59.999
*/
function endOfYesterday() {
	const now = /* @__PURE__ */ new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();
	const date = /* @__PURE__ */ new Date(0);
	date.setFullYear(year, month, day - 1);
	date.setHours(23, 59, 59, 999);
	return date;
}
//#endregion
//#region node_modules/date-fns/locale/en-US/_lib/formatDistance.mjs
var formatDistanceLocale = {
	lessThanXSeconds: {
		one: "less than a second",
		other: "less than {{count}} seconds"
	},
	xSeconds: {
		one: "1 second",
		other: "{{count}} seconds"
	},
	halfAMinute: "half a minute",
	lessThanXMinutes: {
		one: "less than a minute",
		other: "less than {{count}} minutes"
	},
	xMinutes: {
		one: "1 minute",
		other: "{{count}} minutes"
	},
	aboutXHours: {
		one: "about 1 hour",
		other: "about {{count}} hours"
	},
	xHours: {
		one: "1 hour",
		other: "{{count}} hours"
	},
	xDays: {
		one: "1 day",
		other: "{{count}} days"
	},
	aboutXWeeks: {
		one: "about 1 week",
		other: "about {{count}} weeks"
	},
	xWeeks: {
		one: "1 week",
		other: "{{count}} weeks"
	},
	aboutXMonths: {
		one: "about 1 month",
		other: "about {{count}} months"
	},
	xMonths: {
		one: "1 month",
		other: "{{count}} months"
	},
	aboutXYears: {
		one: "about 1 year",
		other: "about {{count}} years"
	},
	xYears: {
		one: "1 year",
		other: "{{count}} years"
	},
	overXYears: {
		one: "over 1 year",
		other: "over {{count}} years"
	},
	almostXYears: {
		one: "almost 1 year",
		other: "almost {{count}} years"
	}
};
var formatDistance$1 = (token, count, options) => {
	let result;
	const tokenValue = formatDistanceLocale[token];
	if (typeof tokenValue === "string") result = tokenValue;
	else if (count === 1) result = tokenValue.one;
	else result = tokenValue.other.replace("{{count}}", count.toString());
	if (options?.addSuffix) if (options.comparison && options.comparison > 0) return "in " + result;
	else return result + " ago";
	return result;
};
//#endregion
//#region node_modules/date-fns/locale/_lib/buildFormatLongFn.mjs
function buildFormatLongFn(args) {
	return (options = {}) => {
		const width = options.width ? String(options.width) : args.defaultWidth;
		return args.formats[width] || args.formats[args.defaultWidth];
	};
}
var formatLong = {
	date: buildFormatLongFn({
		formats: {
			full: "EEEE, MMMM do, y",
			long: "MMMM do, y",
			medium: "MMM d, y",
			short: "MM/dd/yyyy"
		},
		defaultWidth: "full"
	}),
	time: buildFormatLongFn({
		formats: {
			full: "h:mm:ss a zzzz",
			long: "h:mm:ss a z",
			medium: "h:mm:ss a",
			short: "h:mm a"
		},
		defaultWidth: "full"
	}),
	dateTime: buildFormatLongFn({
		formats: {
			full: "{{date}} 'at' {{time}}",
			long: "{{date}} 'at' {{time}}",
			medium: "{{date}}, {{time}}",
			short: "{{date}}, {{time}}"
		},
		defaultWidth: "full"
	})
};
//#endregion
//#region node_modules/date-fns/locale/en-US/_lib/formatRelative.mjs
var formatRelativeLocale = {
	lastWeek: "'last' eeee 'at' p",
	yesterday: "'yesterday at' p",
	today: "'today at' p",
	tomorrow: "'tomorrow at' p",
	nextWeek: "eeee 'at' p",
	other: "P"
};
var formatRelative$1 = (token, _date, _baseDate, _options) => formatRelativeLocale[token];
//#endregion
//#region node_modules/date-fns/locale/_lib/buildLocalizeFn.mjs
/**
* The localize function argument callback which allows to convert raw value to
* the actual type.
*
* @param value - The value to convert
*
* @returns The converted value
*/
/**
* The map of localized values for each width.
*/
/**
* The index type of the locale unit value. It types conversion of units of
* values that don't start at 0 (i.e. quarters).
*/
/**
* Converts the unit value to the tuple of values.
*/
/**
* The tuple of localized era values. The first element represents BC,
* the second element represents AD.
*/
/**
* The tuple of localized quarter values. The first element represents Q1.
*/
/**
* The tuple of localized day values. The first element represents Sunday.
*/
/**
* The tuple of localized month values. The first element represents January.
*/
function buildLocalizeFn(args) {
	return (value, options) => {
		const context = options?.context ? String(options.context) : "standalone";
		let valuesArray;
		if (context === "formatting" && args.formattingValues) {
			const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
			const width = options?.width ? String(options.width) : defaultWidth;
			valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
		} else {
			const defaultWidth = args.defaultWidth;
			const width = options?.width ? String(options.width) : args.defaultWidth;
			valuesArray = args.values[width] || args.values[defaultWidth];
		}
		const index = args.argumentCallback ? args.argumentCallback(value) : value;
		return valuesArray[index];
	};
}
//#endregion
//#region node_modules/date-fns/locale/en-US/_lib/localize.mjs
var eraValues = {
	narrow: ["B", "A"],
	abbreviated: ["BC", "AD"],
	wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
	narrow: [
		"1",
		"2",
		"3",
		"4"
	],
	abbreviated: [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	wide: [
		"1st quarter",
		"2nd quarter",
		"3rd quarter",
		"4th quarter"
	]
};
var monthValues = {
	narrow: [
		"J",
		"F",
		"M",
		"A",
		"M",
		"J",
		"J",
		"A",
		"S",
		"O",
		"N",
		"D"
	],
	abbreviated: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	],
	wide: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	]
};
var dayValues = {
	narrow: [
		"S",
		"M",
		"T",
		"W",
		"T",
		"F",
		"S"
	],
	short: [
		"Su",
		"Mo",
		"Tu",
		"We",
		"Th",
		"Fr",
		"Sa"
	],
	abbreviated: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	wide: [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	]
};
var dayPeriodValues = {
	narrow: {
		am: "a",
		pm: "p",
		midnight: "mi",
		noon: "n",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	},
	abbreviated: {
		am: "AM",
		pm: "PM",
		midnight: "midnight",
		noon: "noon",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	},
	wide: {
		am: "a.m.",
		pm: "p.m.",
		midnight: "midnight",
		noon: "noon",
		morning: "morning",
		afternoon: "afternoon",
		evening: "evening",
		night: "night"
	}
};
var formattingDayPeriodValues = {
	narrow: {
		am: "a",
		pm: "p",
		midnight: "mi",
		noon: "n",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	},
	abbreviated: {
		am: "AM",
		pm: "PM",
		midnight: "midnight",
		noon: "noon",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	},
	wide: {
		am: "a.m.",
		pm: "p.m.",
		midnight: "midnight",
		noon: "noon",
		morning: "in the morning",
		afternoon: "in the afternoon",
		evening: "in the evening",
		night: "at night"
	}
};
var ordinalNumber = (dirtyNumber, _options) => {
	const number = Number(dirtyNumber);
	const rem100 = number % 100;
	if (rem100 > 20 || rem100 < 10) switch (rem100 % 10) {
		case 1: return number + "st";
		case 2: return number + "nd";
		case 3: return number + "rd";
	}
	return number + "th";
};
var localize = {
	ordinalNumber,
	era: buildLocalizeFn({
		values: eraValues,
		defaultWidth: "wide"
	}),
	quarter: buildLocalizeFn({
		values: quarterValues,
		defaultWidth: "wide",
		argumentCallback: (quarter) => quarter - 1
	}),
	month: buildLocalizeFn({
		values: monthValues,
		defaultWidth: "wide"
	}),
	day: buildLocalizeFn({
		values: dayValues,
		defaultWidth: "wide"
	}),
	dayPeriod: buildLocalizeFn({
		values: dayPeriodValues,
		defaultWidth: "wide",
		formattingValues: formattingDayPeriodValues,
		defaultFormattingWidth: "wide"
	})
};
//#endregion
//#region node_modules/date-fns/locale/_lib/buildMatchFn.mjs
function buildMatchFn(args) {
	return (string, options = {}) => {
		const width = options.width;
		const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
		const matchResult = string.match(matchPattern);
		if (!matchResult) return null;
		const matchedString = matchResult[0];
		const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
		const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : findKey(parsePatterns, (pattern) => pattern.test(matchedString));
		let value;
		value = args.valueCallback ? args.valueCallback(key) : key;
		value = options.valueCallback ? options.valueCallback(value) : value;
		const rest = string.slice(matchedString.length);
		return {
			value,
			rest
		};
	};
}
function findKey(object, predicate) {
	for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) return key;
}
function findIndex(array, predicate) {
	for (let key = 0; key < array.length; key++) if (predicate(array[key])) return key;
}
//#endregion
//#region node_modules/date-fns/locale/_lib/buildMatchPatternFn.mjs
function buildMatchPatternFn(args) {
	return (string, options = {}) => {
		const matchResult = string.match(args.matchPattern);
		if (!matchResult) return null;
		const matchedString = matchResult[0];
		const parseResult = string.match(args.parsePattern);
		if (!parseResult) return null;
		let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
		value = options.valueCallback ? options.valueCallback(value) : value;
		const rest = string.slice(matchedString.length);
		return {
			value,
			rest
		};
	};
}
//#endregion
//#region node_modules/date-fns/locale/en-US.mjs
/**
* @category Locales
* @summary English locale (United States).
* @language English
* @iso-639-2 eng
* @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
* @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
*/
var enUS = {
	code: "en-US",
	formatDistance: formatDistance$1,
	formatLong,
	formatRelative: formatRelative$1,
	localize,
	match: {
		ordinalNumber: buildMatchPatternFn({
			matchPattern: /^(\d+)(th|st|nd|rd)?/i,
			parsePattern: /\d+/i,
			valueCallback: (value) => parseInt(value, 10)
		}),
		era: buildMatchFn({
			matchPatterns: {
				narrow: /^(b|a)/i,
				abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
				wide: /^(before christ|before common era|anno domini|common era)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [/^b/i, /^(a|c)/i] },
			defaultParseWidth: "any"
		}),
		quarter: buildMatchFn({
			matchPatterns: {
				narrow: /^[1234]/i,
				abbreviated: /^q[1234]/i,
				wide: /^[1234](th|st|nd|rd)? quarter/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: { any: [
				/1/i,
				/2/i,
				/3/i,
				/4/i
			] },
			defaultParseWidth: "any",
			valueCallback: (index) => index + 1
		}),
		month: buildMatchFn({
			matchPatterns: {
				narrow: /^[jfmasond]/i,
				abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
				wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^j/i,
					/^f/i,
					/^m/i,
					/^a/i,
					/^m/i,
					/^j/i,
					/^j/i,
					/^a/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				],
				any: [
					/^ja/i,
					/^f/i,
					/^mar/i,
					/^ap/i,
					/^may/i,
					/^jun/i,
					/^jul/i,
					/^au/i,
					/^s/i,
					/^o/i,
					/^n/i,
					/^d/i
				]
			},
			defaultParseWidth: "any"
		}),
		day: buildMatchFn({
			matchPatterns: {
				narrow: /^[smtwf]/i,
				short: /^(su|mo|tu|we|th|fr|sa)/i,
				abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
				wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
			},
			defaultMatchWidth: "wide",
			parsePatterns: {
				narrow: [
					/^s/i,
					/^m/i,
					/^t/i,
					/^w/i,
					/^t/i,
					/^f/i,
					/^s/i
				],
				any: [
					/^su/i,
					/^m/i,
					/^tu/i,
					/^w/i,
					/^th/i,
					/^f/i,
					/^sa/i
				]
			},
			defaultParseWidth: "any"
		}),
		dayPeriod: buildMatchFn({
			matchPatterns: {
				narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
				any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
			},
			defaultMatchWidth: "any",
			parsePatterns: { any: {
				am: /^a/i,
				pm: /^p/i,
				midnight: /^mi/i,
				noon: /^no/i,
				morning: /morning/i,
				afternoon: /afternoon/i,
				evening: /evening/i,
				night: /night/i
			} },
			defaultParseWidth: "any"
		})
	},
	options: {
		weekStartsOn: 0,
		firstWeekContainsDate: 1
	}
};
//#endregion
//#region node_modules/date-fns/getDayOfYear.mjs
/**
* @name getDayOfYear
* @category Day Helpers
* @summary Get the day of the year of the given date.
*
* @description
* Get the day of the year of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The day of year
*
* @example
* // Which day of the year is 2 July 2014?
* const result = getDayOfYear(new Date(2014, 6, 2))
* //=> 183
*/
function getDayOfYear(date) {
	const _date = toDate(date);
	return differenceInCalendarDays(_date, startOfYear(_date)) + 1;
}
//#endregion
//#region node_modules/date-fns/getISOWeek.mjs
/**
* @name getISOWeek
* @category ISO Week Helpers
* @summary Get the ISO week of the given date.
*
* @description
* Get the ISO week of the given date.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The ISO week
*
* @example
* // Which week of the ISO-week numbering year is 2 January 2005?
* const result = getISOWeek(new Date(2005, 0, 2))
* //=> 53
*/
function getISOWeek(date) {
	const _date = toDate(date);
	const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
	return Math.round(diff / millisecondsInWeek) + 1;
}
//#endregion
//#region node_modules/date-fns/getWeekYear.mjs
/**
* The {@link getWeekYear} function options.
*/
/**
* @name getWeekYear
* @category Week-Numbering Year Helpers
* @summary Get the local week-numbering year of the given date.
*
* @description
* Get the local week-numbering year of the given date.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - An object with options.
*
* @returns The local week-numbering year
*
* @example
* // Which week numbering year is 26 December 2004 with the default settings?
* const result = getWeekYear(new Date(2004, 11, 26))
* //=> 2005
*
* @example
* // Which week numbering year is 26 December 2004 if week starts on Saturday?
* const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
* //=> 2004
*
* @example
* // Which week numbering year is 26 December 2004 if the first week contains 4 January?
* const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
* //=> 2004
*/
function getWeekYear(date, options) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const defaultOptions = getDefaultOptions$1();
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const firstWeekOfNextYear = constructFrom(date, 0);
	firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
	firstWeekOfNextYear.setHours(0, 0, 0, 0);
	const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
	const firstWeekOfThisYear = constructFrom(date, 0);
	firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
	firstWeekOfThisYear.setHours(0, 0, 0, 0);
	const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
	if (_date.getTime() >= startOfNextYear.getTime()) return year + 1;
	else if (_date.getTime() >= startOfThisYear.getTime()) return year;
	else return year - 1;
}
//#endregion
//#region node_modules/date-fns/startOfWeekYear.mjs
/**
* The {@link startOfWeekYear} function options.
*/
/**
* @name startOfWeekYear
* @category Week-Numbering Year Helpers
* @summary Return the start of a local week-numbering year for the given date.
*
* @description
* Return the start of a local week-numbering year.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options
*
* @returns The start of a week-numbering year
*
* @example
* // The start of an a week-numbering year for 2 July 2005 with default settings:
* const result = startOfWeekYear(new Date(2005, 6, 2))
* //=> Sun Dec 26 2004 00:00:00
*
* @example
* // The start of a week-numbering year for 2 July 2005
* // if Monday is the first day of week
* // and 4 January is always in the first week of the year:
* const result = startOfWeekYear(new Date(2005, 6, 2), {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> Mon Jan 03 2005 00:00:00
*/
function startOfWeekYear(date, options) {
	const defaultOptions = getDefaultOptions$1();
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const year = getWeekYear(date, options);
	const firstWeek = constructFrom(date, 0);
	firstWeek.setFullYear(year, 0, firstWeekContainsDate);
	firstWeek.setHours(0, 0, 0, 0);
	return startOfWeek(firstWeek, options);
}
//#endregion
//#region node_modules/date-fns/getWeek.mjs
/**
* The {@link getWeek} function options.
*/
/**
* @name getWeek
* @category Week Helpers
* @summary Get the local week index of the given date.
*
* @description
* Get the local week index of the given date.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - An object with options
*
* @returns The week
*
* @example
* // Which week of the local week numbering year is 2 January 2005 with default options?
* const result = getWeek(new Date(2005, 0, 2))
* //=> 2
*
* @example
* // Which week of the local week numbering year is 2 January 2005,
* // if Monday is the first day of the week,
* // and the first week of the year always contains 4 January?
* const result = getWeek(new Date(2005, 0, 2), {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> 53
*/
function getWeek(date, options) {
	const _date = toDate(date);
	const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
	return Math.round(diff / millisecondsInWeek) + 1;
}
//#endregion
//#region node_modules/date-fns/_lib/addLeadingZeros.mjs
function addLeadingZeros(number, targetLength) {
	return (number < 0 ? "-" : "") + Math.abs(number).toString().padStart(targetLength, "0");
}
//#endregion
//#region node_modules/date-fns/_lib/format/lightFormatters.mjs
var lightFormatters = {
	y(date, token) {
		const signedYear = date.getFullYear();
		const year = signedYear > 0 ? signedYear : 1 - signedYear;
		return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
	},
	M(date, token) {
		const month = date.getMonth();
		return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
	},
	d(date, token) {
		return addLeadingZeros(date.getDate(), token.length);
	},
	a(date, token) {
		const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "a":
			case "aa": return dayPeriodEnumValue.toUpperCase();
			case "aaa": return dayPeriodEnumValue;
			case "aaaaa": return dayPeriodEnumValue[0];
			default: return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
		}
	},
	h(date, token) {
		return addLeadingZeros(date.getHours() % 12 || 12, token.length);
	},
	H(date, token) {
		return addLeadingZeros(date.getHours(), token.length);
	},
	m(date, token) {
		return addLeadingZeros(date.getMinutes(), token.length);
	},
	s(date, token) {
		return addLeadingZeros(date.getSeconds(), token.length);
	},
	S(date, token) {
		const numberOfDigits = token.length;
		const milliseconds = date.getMilliseconds();
		return addLeadingZeros(Math.trunc(milliseconds * Math.pow(10, numberOfDigits - 3)), token.length);
	}
};
//#endregion
//#region node_modules/date-fns/_lib/format/formatters.mjs
var dayPeriodEnum = {
	am: "am",
	pm: "pm",
	midnight: "midnight",
	noon: "noon",
	morning: "morning",
	afternoon: "afternoon",
	evening: "evening",
	night: "night"
};
var formatters = {
	G: function(date, token, localize) {
		const era = date.getFullYear() > 0 ? 1 : 0;
		switch (token) {
			case "G":
			case "GG":
			case "GGG": return localize.era(era, { width: "abbreviated" });
			case "GGGGG": return localize.era(era, { width: "narrow" });
			default: return localize.era(era, { width: "wide" });
		}
	},
	y: function(date, token, localize) {
		if (token === "yo") {
			const signedYear = date.getFullYear();
			const year = signedYear > 0 ? signedYear : 1 - signedYear;
			return localize.ordinalNumber(year, { unit: "year" });
		}
		return lightFormatters.y(date, token);
	},
	Y: function(date, token, localize, options) {
		const signedWeekYear = getWeekYear(date, options);
		const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
		if (token === "YY") return addLeadingZeros(weekYear % 100, 2);
		if (token === "Yo") return localize.ordinalNumber(weekYear, { unit: "year" });
		return addLeadingZeros(weekYear, token.length);
	},
	R: function(date, token) {
		return addLeadingZeros(getISOWeekYear(date), token.length);
	},
	u: function(date, token) {
		return addLeadingZeros(date.getFullYear(), token.length);
	},
	Q: function(date, token, localize) {
		const quarter = Math.ceil((date.getMonth() + 1) / 3);
		switch (token) {
			case "Q": return String(quarter);
			case "QQ": return addLeadingZeros(quarter, 2);
			case "Qo": return localize.ordinalNumber(quarter, { unit: "quarter" });
			case "QQQ": return localize.quarter(quarter, {
				width: "abbreviated",
				context: "formatting"
			});
			case "QQQQQ": return localize.quarter(quarter, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.quarter(quarter, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	q: function(date, token, localize) {
		const quarter = Math.ceil((date.getMonth() + 1) / 3);
		switch (token) {
			case "q": return String(quarter);
			case "qq": return addLeadingZeros(quarter, 2);
			case "qo": return localize.ordinalNumber(quarter, { unit: "quarter" });
			case "qqq": return localize.quarter(quarter, {
				width: "abbreviated",
				context: "standalone"
			});
			case "qqqqq": return localize.quarter(quarter, {
				width: "narrow",
				context: "standalone"
			});
			default: return localize.quarter(quarter, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	M: function(date, token, localize) {
		const month = date.getMonth();
		switch (token) {
			case "M":
			case "MM": return lightFormatters.M(date, token);
			case "Mo": return localize.ordinalNumber(month + 1, { unit: "month" });
			case "MMM": return localize.month(month, {
				width: "abbreviated",
				context: "formatting"
			});
			case "MMMMM": return localize.month(month, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.month(month, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	L: function(date, token, localize) {
		const month = date.getMonth();
		switch (token) {
			case "L": return String(month + 1);
			case "LL": return addLeadingZeros(month + 1, 2);
			case "Lo": return localize.ordinalNumber(month + 1, { unit: "month" });
			case "LLL": return localize.month(month, {
				width: "abbreviated",
				context: "standalone"
			});
			case "LLLLL": return localize.month(month, {
				width: "narrow",
				context: "standalone"
			});
			default: return localize.month(month, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	w: function(date, token, localize, options) {
		const week = getWeek(date, options);
		if (token === "wo") return localize.ordinalNumber(week, { unit: "week" });
		return addLeadingZeros(week, token.length);
	},
	I: function(date, token, localize) {
		const isoWeek = getISOWeek(date);
		if (token === "Io") return localize.ordinalNumber(isoWeek, { unit: "week" });
		return addLeadingZeros(isoWeek, token.length);
	},
	d: function(date, token, localize) {
		if (token === "do") return localize.ordinalNumber(date.getDate(), { unit: "date" });
		return lightFormatters.d(date, token);
	},
	D: function(date, token, localize) {
		const dayOfYear = getDayOfYear(date);
		if (token === "Do") return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
		return addLeadingZeros(dayOfYear, token.length);
	},
	E: function(date, token, localize) {
		const dayOfWeek = date.getDay();
		switch (token) {
			case "E":
			case "EE":
			case "EEE": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "EEEEE": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "EEEEEE": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	e: function(date, token, localize, options) {
		const dayOfWeek = date.getDay();
		const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
		switch (token) {
			case "e": return String(localDayOfWeek);
			case "ee": return addLeadingZeros(localDayOfWeek, 2);
			case "eo": return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
			case "eee": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "eeeee": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "eeeeee": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	c: function(date, token, localize, options) {
		const dayOfWeek = date.getDay();
		const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
		switch (token) {
			case "c": return String(localDayOfWeek);
			case "cc": return addLeadingZeros(localDayOfWeek, token.length);
			case "co": return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
			case "ccc": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "standalone"
			});
			case "ccccc": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "standalone"
			});
			case "cccccc": return localize.day(dayOfWeek, {
				width: "short",
				context: "standalone"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "standalone"
			});
		}
	},
	i: function(date, token, localize) {
		const dayOfWeek = date.getDay();
		const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
		switch (token) {
			case "i": return String(isoDayOfWeek);
			case "ii": return addLeadingZeros(isoDayOfWeek, token.length);
			case "io": return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
			case "iii": return localize.day(dayOfWeek, {
				width: "abbreviated",
				context: "formatting"
			});
			case "iiiii": return localize.day(dayOfWeek, {
				width: "narrow",
				context: "formatting"
			});
			case "iiiiii": return localize.day(dayOfWeek, {
				width: "short",
				context: "formatting"
			});
			default: return localize.day(dayOfWeek, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	a: function(date, token, localize) {
		const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "a":
			case "aa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "aaa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "aaaaa": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	b: function(date, token, localize) {
		const hours = date.getHours();
		let dayPeriodEnumValue;
		if (hours === 12) dayPeriodEnumValue = dayPeriodEnum.noon;
		else if (hours === 0) dayPeriodEnumValue = dayPeriodEnum.midnight;
		else dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
		switch (token) {
			case "b":
			case "bb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "bbb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			}).toLowerCase();
			case "bbbbb": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	B: function(date, token, localize) {
		const hours = date.getHours();
		let dayPeriodEnumValue;
		if (hours >= 17) dayPeriodEnumValue = dayPeriodEnum.evening;
		else if (hours >= 12) dayPeriodEnumValue = dayPeriodEnum.afternoon;
		else if (hours >= 4) dayPeriodEnumValue = dayPeriodEnum.morning;
		else dayPeriodEnumValue = dayPeriodEnum.night;
		switch (token) {
			case "B":
			case "BB":
			case "BBB": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "abbreviated",
				context: "formatting"
			});
			case "BBBBB": return localize.dayPeriod(dayPeriodEnumValue, {
				width: "narrow",
				context: "formatting"
			});
			default: return localize.dayPeriod(dayPeriodEnumValue, {
				width: "wide",
				context: "formatting"
			});
		}
	},
	h: function(date, token, localize) {
		if (token === "ho") {
			let hours = date.getHours() % 12;
			if (hours === 0) hours = 12;
			return localize.ordinalNumber(hours, { unit: "hour" });
		}
		return lightFormatters.h(date, token);
	},
	H: function(date, token, localize) {
		if (token === "Ho") return localize.ordinalNumber(date.getHours(), { unit: "hour" });
		return lightFormatters.H(date, token);
	},
	K: function(date, token, localize) {
		const hours = date.getHours() % 12;
		if (token === "Ko") return localize.ordinalNumber(hours, { unit: "hour" });
		return addLeadingZeros(hours, token.length);
	},
	k: function(date, token, localize) {
		let hours = date.getHours();
		if (hours === 0) hours = 24;
		if (token === "ko") return localize.ordinalNumber(hours, { unit: "hour" });
		return addLeadingZeros(hours, token.length);
	},
	m: function(date, token, localize) {
		if (token === "mo") return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
		return lightFormatters.m(date, token);
	},
	s: function(date, token, localize) {
		if (token === "so") return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
		return lightFormatters.s(date, token);
	},
	S: function(date, token) {
		return lightFormatters.S(date, token);
	},
	X: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		if (timezoneOffset === 0) return "Z";
		switch (token) {
			case "X": return formatTimezoneWithOptionalMinutes(timezoneOffset);
			case "XXXX":
			case "XX": return formatTimezone(timezoneOffset);
			default: return formatTimezone(timezoneOffset, ":");
		}
	},
	x: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "x": return formatTimezoneWithOptionalMinutes(timezoneOffset);
			case "xxxx":
			case "xx": return formatTimezone(timezoneOffset);
			default: return formatTimezone(timezoneOffset, ":");
		}
	},
	O: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "O":
			case "OO":
			case "OOO": return "GMT" + formatTimezoneShort(timezoneOffset, ":");
			default: return "GMT" + formatTimezone(timezoneOffset, ":");
		}
	},
	z: function(date, token, _localize) {
		const timezoneOffset = date.getTimezoneOffset();
		switch (token) {
			case "z":
			case "zz":
			case "zzz": return "GMT" + formatTimezoneShort(timezoneOffset, ":");
			default: return "GMT" + formatTimezone(timezoneOffset, ":");
		}
	},
	t: function(date, token, _localize) {
		return addLeadingZeros(Math.trunc(date.getTime() / 1e3), token.length);
	},
	T: function(date, token, _localize) {
		return addLeadingZeros(date.getTime(), token.length);
	}
};
function formatTimezoneShort(offset, delimiter = "") {
	const sign = offset > 0 ? "-" : "+";
	const absOffset = Math.abs(offset);
	const hours = Math.trunc(absOffset / 60);
	const minutes = absOffset % 60;
	if (minutes === 0) return sign + String(hours);
	return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, delimiter) {
	if (offset % 60 === 0) return (offset > 0 ? "-" : "+") + addLeadingZeros(Math.abs(offset) / 60, 2);
	return formatTimezone(offset, delimiter);
}
function formatTimezone(offset, delimiter = "") {
	const sign = offset > 0 ? "-" : "+";
	const absOffset = Math.abs(offset);
	const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
	const minutes = addLeadingZeros(absOffset % 60, 2);
	return sign + hours + delimiter + minutes;
}
//#endregion
//#region node_modules/date-fns/_lib/format/longFormatters.mjs
var dateLongFormatter = (pattern, formatLong) => {
	switch (pattern) {
		case "P": return formatLong.date({ width: "short" });
		case "PP": return formatLong.date({ width: "medium" });
		case "PPP": return formatLong.date({ width: "long" });
		default: return formatLong.date({ width: "full" });
	}
};
var timeLongFormatter = (pattern, formatLong) => {
	switch (pattern) {
		case "p": return formatLong.time({ width: "short" });
		case "pp": return formatLong.time({ width: "medium" });
		case "ppp": return formatLong.time({ width: "long" });
		default: return formatLong.time({ width: "full" });
	}
};
var dateTimeLongFormatter = (pattern, formatLong) => {
	const matchResult = pattern.match(/(P+)(p+)?/) || [];
	const datePattern = matchResult[1];
	const timePattern = matchResult[2];
	if (!timePattern) return dateLongFormatter(pattern, formatLong);
	let dateTimeFormat;
	switch (datePattern) {
		case "P":
			dateTimeFormat = formatLong.dateTime({ width: "short" });
			break;
		case "PP":
			dateTimeFormat = formatLong.dateTime({ width: "medium" });
			break;
		case "PPP":
			dateTimeFormat = formatLong.dateTime({ width: "long" });
			break;
		default:
			dateTimeFormat = formatLong.dateTime({ width: "full" });
			break;
	}
	return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong)).replace("{{time}}", timeLongFormatter(timePattern, formatLong));
};
var longFormatters = {
	p: timeLongFormatter,
	P: dateTimeLongFormatter
};
//#endregion
//#region node_modules/date-fns/_lib/protectedTokens.mjs
var dayOfYearTokenRE = /^D+$/;
var weekYearTokenRE = /^Y+$/;
var throwTokens = [
	"D",
	"DD",
	"YY",
	"YYYY"
];
function isProtectedDayOfYearToken(token) {
	return dayOfYearTokenRE.test(token);
}
function isProtectedWeekYearToken(token) {
	return weekYearTokenRE.test(token);
}
function warnOrThrowProtectedError(token, format, input) {
	const _message = message(token, format, input);
	console.warn(_message);
	if (throwTokens.includes(token)) throw new RangeError(_message);
}
function message(token, format, input) {
	const subject = token[0] === "Y" ? "years" : "days of the month";
	return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
//#endregion
//#region node_modules/date-fns/format.mjs
var formattingTokensRegExp$2 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp$1 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp$2 = /^'([^]*?)'?$/;
var doubleQuoteRegExp$2 = /''/g;
var unescapedLatinCharacterRegExp$2 = /[a-zA-Z]/;
/**
* The {@link format} function options.
*/
/**
* @name format
* @alias formatDate
* @category Common Helpers
* @summary Format the date.
*
* @description
* Return the formatted date string in the given format. The result may vary by locale.
*
* > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
* > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* The characters wrapped between two single quotes characters (') are escaped.
* Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
* (see the last example)
*
* Format of the string is based on Unicode Technical Standard #35:
* https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
* with a few additions (see note 7 below the table).
*
* Accepted patterns:
* | Unit                            | Pattern | Result examples                   | Notes |
* |---------------------------------|---------|-----------------------------------|-------|
* | Era                             | G..GGG  | AD, BC                            |       |
* |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
* |                                 | GGGGG   | A, B                              |       |
* | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
* |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
* |                                 | yy      | 44, 01, 00, 17                    | 5     |
* |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
* |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
* |                                 | yyyyy   | ...                               | 3,5   |
* | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
* |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
* |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
* |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
* |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
* |                                 | YYYYY   | ...                               | 3,5   |
* | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
* |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
* |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
* |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
* |                                 | RRRRR   | ...                               | 3,5,7 |
* | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
* |                                 | uu      | -43, 01, 1900, 2017               | 5     |
* |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
* |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
* |                                 | uuuuu   | ...                               | 3,5   |
* | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
* |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
* |                                 | QQ      | 01, 02, 03, 04                    |       |
* |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
* |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
* | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
* |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
* |                                 | qq      | 01, 02, 03, 04                    |       |
* |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
* |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
* | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
* |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
* |                                 | MM      | 01, 02, ..., 12                   |       |
* |                                 | MMM     | Jan, Feb, ..., Dec                |       |
* |                                 | MMMM    | January, February, ..., December  | 2     |
* |                                 | MMMMM   | J, F, ..., D                      |       |
* | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
* |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
* |                                 | LL      | 01, 02, ..., 12                   |       |
* |                                 | LLL     | Jan, Feb, ..., Dec                |       |
* |                                 | LLLL    | January, February, ..., December  | 2     |
* |                                 | LLLLL   | J, F, ..., D                      |       |
* | Local week of year              | w       | 1, 2, ..., 53                     |       |
* |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
* |                                 | ww      | 01, 02, ..., 53                   |       |
* | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
* |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
* |                                 | II      | 01, 02, ..., 53                   | 7     |
* | Day of month                    | d       | 1, 2, ..., 31                     |       |
* |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
* |                                 | dd      | 01, 02, ..., 31                   |       |
* | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
* |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
* |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
* |                                 | DDD     | 001, 002, ..., 365, 366           |       |
* |                                 | DDDD    | ...                               | 3     |
* | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
* |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
* |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
* |                                 | ii      | 01, 02, ..., 07                   | 7     |
* |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
* |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
* |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
* |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
* | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
* |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
* |                                 | ee      | 02, 03, ..., 01                   |       |
* |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | eeeee   | M, T, W, T, F, S, S               |       |
* |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
* |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
* |                                 | cc      | 02, 03, ..., 01                   |       |
* |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 | ccccc   | M, T, W, T, F, S, S               |       |
* |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | AM, PM                          | a..aa   | AM, PM                            |       |
* |                                 | aaa     | am, pm                            |       |
* |                                 | aaaa    | a.m., p.m.                        | 2     |
* |                                 | aaaaa   | a, p                              |       |
* | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
* |                                 | bbb     | am, pm, noon, midnight            |       |
* |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
* |                                 | bbbbb   | a, p, n, mi                       |       |
* | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
* |                                 | BBBB    | at night, in the morning, ...     | 2     |
* |                                 | BBBBB   | at night, in the morning, ...     |       |
* | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
* |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
* |                                 | hh      | 01, 02, ..., 11, 12               |       |
* | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
* |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
* |                                 | HH      | 00, 01, 02, ..., 23               |       |
* | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
* |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
* |                                 | KK      | 01, 02, ..., 11, 00               |       |
* | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
* |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
* |                                 | kk      | 24, 01, 02, ..., 23               |       |
* | Minute                          | m       | 0, 1, ..., 59                     |       |
* |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
* |                                 | mm      | 00, 01, ..., 59                   |       |
* | Second                          | s       | 0, 1, ..., 59                     |       |
* |                                 | so      | 0th, 1st, ..., 59th               | 7     |
* |                                 | ss      | 00, 01, ..., 59                   |       |
* | Fraction of second              | S       | 0, 1, ..., 9                      |       |
* |                                 | SS      | 00, 01, ..., 99                   |       |
* |                                 | SSS     | 000, 001, ..., 999                |       |
* |                                 | SSSS    | ...                               | 3     |
* | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
* |                                 | XX      | -0800, +0530, Z                   |       |
* |                                 | XXX     | -08:00, +05:30, Z                 |       |
* |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
* |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
* | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
* |                                 | xx      | -0800, +0530, +0000               |       |
* |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
* |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
* |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
* | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
* |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
* | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
* |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
* | Seconds timestamp               | t       | 512969520                         | 7     |
* |                                 | tt      | ...                               | 3,7   |
* | Milliseconds timestamp          | T       | 512969520900                      | 7     |
* |                                 | TT      | ...                               | 3,7   |
* | Long localized date             | P       | 04/29/1453                        | 7     |
* |                                 | PP      | Apr 29, 1453                      | 7     |
* |                                 | PPP     | April 29th, 1453                  | 7     |
* |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
* | Long localized time             | p       | 12:00 AM                          | 7     |
* |                                 | pp      | 12:00:00 AM                       | 7     |
* |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
* |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
* | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
* |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
* |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
* |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
* Notes:
* 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
*    are the same as "stand-alone" units, but are different in some languages.
*    "Formatting" units are declined according to the rules of the language
*    in the context of a date. "Stand-alone" units are always nominative singular:
*
*    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
*
*    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
*
* 2. Any sequence of the identical letters is a pattern, unless it is escaped by
*    the single quote characters (see below).
*    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
*    the output will be the same as default pattern for this unit, usually
*    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
*    are marked with "2" in the last column of the table.
*
*    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
*
*    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
*
*    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
*
*    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
*
*    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
*
* 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
*    The output will be padded with zeros to match the length of the pattern.
*
*    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
*
* 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
*    These tokens represent the shortest form of the quarter.
*
* 5. The main difference between `y` and `u` patterns are B.C. years:
*
*    | Year | `y` | `u` |
*    |------|-----|-----|
*    | AC 1 |   1 |   1 |
*    | BC 1 |   1 |   0 |
*    | BC 2 |   2 |  -1 |
*
*    Also `yy` always returns the last two digits of a year,
*    while `uu` pads single digit years to 2 characters and returns other years unchanged:
*
*    | Year | `yy` | `uu` |
*    |------|------|------|
*    | 1    |   01 |   01 |
*    | 14   |   14 |   14 |
*    | 376  |   76 |  376 |
*    | 1453 |   53 | 1453 |
*
*    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
*    except local week-numbering years are dependent on `options.weekStartsOn`
*    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
*    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
*
* 6. Specific non-location timezones are currently unavailable in `date-fns`,
*    so right now these tokens fall back to GMT timezones.
*
* 7. These patterns are not in the Unicode Technical Standard #35:
*    - `i`: ISO day of week
*    - `I`: ISO week of year
*    - `R`: ISO week-numbering year
*    - `t`: seconds timestamp
*    - `T`: milliseconds timestamp
*    - `o`: ordinal number modifier
*    - `P`: long localized date
*    - `p`: long localized time
*
* 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
*    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
*    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param format - The string of tokens
* @param options - An object with options
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
* @throws `options.locale` must contain `localize` property
* @throws `options.locale` must contain `formatLong` property
* @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws format string contains an unescaped latin alphabet character
*
* @example
* // Represent 11 February 2014 in middle-endian format:
* const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
* //=> '02/11/2014'
*
* @example
* // Represent 2 July 2014 in Esperanto:
* import { eoLocale } from 'date-fns/locale/eo'
* const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
*   locale: eoLocale
* })
* //=> '2-a de julio 2014'
*
* @example
* // Escape string by single quote characters:
* const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
* //=> "3 o'clock"
*/
function format(date, formatStr, options) {
	const defaultOptions = getDefaultOptions$1();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const originalDate = toDate(date);
	if (!isValid(originalDate)) throw new RangeError("Invalid time value");
	let parts = formatStr.match(longFormattingTokensRegExp$1).map((substring) => {
		const firstCharacter = substring[0];
		if (firstCharacter === "p" || firstCharacter === "P") {
			const longFormatter = longFormatters[firstCharacter];
			return longFormatter(substring, locale.formatLong);
		}
		return substring;
	}).join("").match(formattingTokensRegExp$2).map((substring) => {
		if (substring === "''") return {
			isToken: false,
			value: "'"
		};
		const firstCharacter = substring[0];
		if (firstCharacter === "'") return {
			isToken: false,
			value: cleanEscapedString$2(substring)
		};
		if (formatters[firstCharacter]) return {
			isToken: true,
			value: substring
		};
		if (firstCharacter.match(unescapedLatinCharacterRegExp$2)) throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
		return {
			isToken: false,
			value: substring
		};
	});
	if (locale.localize.preprocessor) parts = locale.localize.preprocessor(originalDate, parts);
	const formatterOptions = {
		firstWeekContainsDate,
		weekStartsOn,
		locale
	};
	return parts.map((part) => {
		if (!part.isToken) return part.value;
		const token = part.value;
		if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) warnOrThrowProtectedError(token, formatStr, String(date));
		const formatter = formatters[token[0]];
		return formatter(originalDate, token, locale.localize, formatterOptions);
	}).join("");
}
function cleanEscapedString$2(input) {
	const matched = input.match(escapedStringRegExp$2);
	if (!matched) return input;
	return matched[1].replace(doubleQuoteRegExp$2, "'");
}
//#endregion
//#region node_modules/date-fns/formatDistance.mjs
/**
* The {@link formatDistance} function options.
*/
/**
* @name formatDistance
* @category Common Helpers
* @summary Return the distance between the given dates in words.
*
* @description
* Return the distance between the given dates in words.
*
* | Distance between dates                                            | Result              |
* |-------------------------------------------------------------------|---------------------|
* | 0 ... 30 secs                                                     | less than a minute  |
* | 30 secs ... 1 min 30 secs                                         | 1 minute            |
* | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
* | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
* | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
* | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
* | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
* | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
* | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
* | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
* | 1 yr ... 1 yr 3 months                                            | about 1 year        |
* | 1 yr 3 months ... 1 yr 9 month s                                  | over 1 year         |
* | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
* | N yrs ... N yrs 3 months                                          | about N years       |
* | N yrs 3 months ... N yrs 9 months                                 | over N years        |
* | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
*
* With `options.includeSeconds == true`:
* | Distance between dates | Result               |
* |------------------------|----------------------|
* | 0 secs ... 5 secs      | less than 5 seconds  |
* | 5 secs ... 10 secs     | less than 10 seconds |
* | 10 secs ... 20 secs    | less than 20 seconds |
* | 20 secs ... 40 secs    | half a minute        |
* | 40 secs ... 60 secs    | less than a minute   |
* | 60 secs ... 90 secs    | 1 minute             |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date
* @param baseDate - The date to compare with
* @param options - An object with options
*
* @returns The distance in words
*
* @throws `date` must not be Invalid Date
* @throws `baseDate` must not be Invalid Date
* @throws `options.locale` must contain `formatDistance` property
*
* @example
* // What is the distance between 2 July 2014 and 1 January 2015?
* const result = formatDistance(new Date(2014, 6, 2), new Date(2015, 0, 1))
* //=> '6 months'
*
* @example
* // What is the distance between 1 January 2015 00:00:15
* // and 1 January 2015 00:00:00, including seconds?
* const result = formatDistance(
*   new Date(2015, 0, 1, 0, 0, 15),
*   new Date(2015, 0, 1, 0, 0, 0),
*   { includeSeconds: true }
* )
* //=> 'less than 20 seconds'
*
* @example
* // What is the distance from 1 January 2016
* // to 1 January 2015, with a suffix?
* const result = formatDistance(new Date(2015, 0, 1), new Date(2016, 0, 1), {
*   addSuffix: true
* })
* //=> 'about 1 year ago'
*
* @example
* // What is the distance between 1 August 2016 and 1 January 2015 in Esperanto?
* import { eoLocale } from 'date-fns/locale/eo'
* const result = formatDistance(new Date(2016, 7, 1), new Date(2015, 0, 1), {
*   locale: eoLocale
* })
* //=> 'pli ol 1 jaro'
*/
function formatDistance(date, baseDate, options) {
	const defaultOptions = getDefaultOptions$1();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const minutesInAlmostTwoDays = 2520;
	const comparison = compareAsc(date, baseDate);
	if (isNaN(comparison)) throw new RangeError("Invalid time value");
	const localizeOptions = Object.assign({}, options, {
		addSuffix: options?.addSuffix,
		comparison
	});
	let dateLeft;
	let dateRight;
	if (comparison > 0) {
		dateLeft = toDate(baseDate);
		dateRight = toDate(date);
	} else {
		dateLeft = toDate(date);
		dateRight = toDate(baseDate);
	}
	const seconds = differenceInSeconds(dateRight, dateLeft);
	const offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1e3;
	const minutes = Math.round((seconds - offsetInSeconds) / 60);
	let months;
	if (minutes < 2) if (options?.includeSeconds) if (seconds < 5) return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
	else if (seconds < 10) return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
	else if (seconds < 20) return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
	else if (seconds < 40) return locale.formatDistance("halfAMinute", 0, localizeOptions);
	else if (seconds < 60) return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
	else return locale.formatDistance("xMinutes", 1, localizeOptions);
	else if (minutes === 0) return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
	else return locale.formatDistance("xMinutes", minutes, localizeOptions);
	else if (minutes < 45) return locale.formatDistance("xMinutes", minutes, localizeOptions);
	else if (minutes < 90) return locale.formatDistance("aboutXHours", 1, localizeOptions);
	else if (minutes < 1440) {
		const hours = Math.round(minutes / 60);
		return locale.formatDistance("aboutXHours", hours, localizeOptions);
	} else if (minutes < minutesInAlmostTwoDays) return locale.formatDistance("xDays", 1, localizeOptions);
	else if (minutes < 43200) {
		const days = Math.round(minutes / minutesInDay);
		return locale.formatDistance("xDays", days, localizeOptions);
	} else if (minutes < 43200 * 2) {
		months = Math.round(minutes / minutesInMonth);
		return locale.formatDistance("aboutXMonths", months, localizeOptions);
	}
	months = differenceInMonths(dateRight, dateLeft);
	if (months < 12) {
		const nearestMonth = Math.round(minutes / minutesInMonth);
		return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
	} else {
		const monthsSinceStartOfYear = months % 12;
		const years = Math.trunc(months / 12);
		if (monthsSinceStartOfYear < 3) return locale.formatDistance("aboutXYears", years, localizeOptions);
		else if (monthsSinceStartOfYear < 9) return locale.formatDistance("overXYears", years, localizeOptions);
		else return locale.formatDistance("almostXYears", years + 1, localizeOptions);
	}
}
//#endregion
//#region node_modules/date-fns/formatDistanceStrict.mjs
/**
* The {@link formatDistanceStrict} function options.
*/
/**
* The unit used to format the distance in {@link formatDistanceStrict}.
*/
/**
* @name formatDistanceStrict
* @category Common Helpers
* @summary Return the distance between the given dates in words.
*
* @description
* Return the distance between the given dates in words, using strict units.
* This is like `formatDistance`, but does not use helpers like 'almost', 'over',
* 'less than' and the like.
*
* | Distance between dates | Result              |
* |------------------------|---------------------|
* | 0 ... 59 secs          | [0..59] seconds     |
* | 1 ... 59 mins          | [1..59] minutes     |
* | 1 ... 23 hrs           | [1..23] hours       |
* | 1 ... 29 days          | [1..29] days        |
* | 1 ... 11 months        | [1..11] months      |
* | 1 ... N years          | [1..N]  years       |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date
* @param baseDate - The date to compare with
* @param options - An object with options
*
* @returns The distance in words
*
* @throws `date` must not be Invalid Date
* @throws `baseDate` must not be Invalid Date
* @throws `options.unit` must be 'second', 'minute', 'hour', 'day', 'month' or 'year'
* @throws `options.locale` must contain `formatDistance` property
*
* @example
* // What is the distance between 2 July 2014 and 1 January 2015?
* const result = formatDistanceStrict(new Date(2014, 6, 2), new Date(2015, 0, 2))
* //=> '6 months'
*
* @example
* // What is the distance between 1 January 2015 00:00:15
* // and 1 January 2015 00:00:00?
* const result = formatDistanceStrict(
*   new Date(2015, 0, 1, 0, 0, 15),
*   new Date(2015, 0, 1, 0, 0, 0)
* )
* //=> '15 seconds'
*
* @example
* // What is the distance from 1 January 2016
* // to 1 January 2015, with a suffix?
* const result = formatDistanceStrict(new Date(2015, 0, 1), new Date(2016, 0, 1), {
*   addSuffix: true
* })
* //=> '1 year ago'
*
* @example
* // What is the distance from 1 January 2016
* // to 1 January 2015, in minutes?
* const result = formatDistanceStrict(new Date(2016, 0, 1), new Date(2015, 0, 1), {
*   unit: 'minute'
* })
* //=> '525600 minutes'
*
* @example
* // What is the distance from 1 January 2015
* // to 28 January 2015, in months, rounded up?
* const result = formatDistanceStrict(new Date(2015, 0, 28), new Date(2015, 0, 1), {
*   unit: 'month',
*   roundingMethod: 'ceil'
* })
* //=> '1 month'
*
* @example
* // What is the distance between 1 August 2016 and 1 January 2015 in Esperanto?
* import { eoLocale } from 'date-fns/locale/eo'
* const result = formatDistanceStrict(new Date(2016, 7, 1), new Date(2015, 0, 1), {
*   locale: eoLocale
* })
* //=> '1 jaro'
*/
function formatDistanceStrict(date, baseDate, options) {
	const defaultOptions = getDefaultOptions$1();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const comparison = compareAsc(date, baseDate);
	if (isNaN(comparison)) throw new RangeError("Invalid time value");
	const localizeOptions = Object.assign({}, options, {
		addSuffix: options?.addSuffix,
		comparison
	});
	let dateLeft;
	let dateRight;
	if (comparison > 0) {
		dateLeft = toDate(baseDate);
		dateRight = toDate(date);
	} else {
		dateLeft = toDate(date);
		dateRight = toDate(baseDate);
	}
	const roundingMethod = getRoundingMethod(options?.roundingMethod ?? "round");
	const milliseconds = dateRight.getTime() - dateLeft.getTime();
	const minutes = milliseconds / millisecondsInMinute;
	const dstNormalizedMinutes = (milliseconds - (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft))) / millisecondsInMinute;
	const defaultUnit = options?.unit;
	let unit;
	if (!defaultUnit) if (minutes < 1) unit = "second";
	else if (minutes < 60) unit = "minute";
	else if (minutes < 1440) unit = "hour";
	else if (dstNormalizedMinutes < 43200) unit = "day";
	else if (dstNormalizedMinutes < 525600) unit = "month";
	else unit = "year";
	else unit = defaultUnit;
	if (unit === "second") {
		const seconds = roundingMethod(milliseconds / 1e3);
		return locale.formatDistance("xSeconds", seconds, localizeOptions);
	} else if (unit === "minute") {
		const roundedMinutes = roundingMethod(minutes);
		return locale.formatDistance("xMinutes", roundedMinutes, localizeOptions);
	} else if (unit === "hour") {
		const hours = roundingMethod(minutes / 60);
		return locale.formatDistance("xHours", hours, localizeOptions);
	} else if (unit === "day") {
		const days = roundingMethod(dstNormalizedMinutes / minutesInDay);
		return locale.formatDistance("xDays", days, localizeOptions);
	} else if (unit === "month") {
		const months = roundingMethod(dstNormalizedMinutes / minutesInMonth);
		return months === 12 && defaultUnit !== "month" ? locale.formatDistance("xYears", 1, localizeOptions) : locale.formatDistance("xMonths", months, localizeOptions);
	} else {
		const years = roundingMethod(dstNormalizedMinutes / minutesInYear);
		return locale.formatDistance("xYears", years, localizeOptions);
	}
}
//#endregion
//#region node_modules/date-fns/formatDistanceToNow.mjs
/**
* The {@link formatDistanceToNow} function options.
*/
/**
* @name formatDistanceToNow
* @category Common Helpers
* @summary Return the distance between the given date and now in words.
* @pure false
*
* @description
* Return the distance between the given date and now in words.
*
* | Distance to now                                                   | Result              |
* |-------------------------------------------------------------------|---------------------|
* | 0 ... 30 secs                                                     | less than a minute  |
* | 30 secs ... 1 min 30 secs                                         | 1 minute            |
* | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
* | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
* | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
* | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
* | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
* | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
* | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
* | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
* | 1 yr ... 1 yr 3 months                                            | about 1 year        |
* | 1 yr 3 months ... 1 yr 9 month s                                  | over 1 year         |
* | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
* | N yrs ... N yrs 3 months                                          | about N years       |
* | N yrs 3 months ... N yrs 9 months                                 | over N years        |
* | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
*
* With `options.includeSeconds == true`:
* | Distance to now     | Result               |
* |---------------------|----------------------|
* | 0 secs ... 5 secs   | less than 5 seconds  |
* | 5 secs ... 10 secs  | less than 10 seconds |
* | 10 secs ... 20 secs | less than 20 seconds |
* | 20 secs ... 40 secs | half a minute        |
* | 40 secs ... 60 secs | less than a minute   |
* | 60 secs ... 90 secs | 1 minute             |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - The object with options
*
* @returns The distance in words
*
* @throws `date` must not be Invalid Date
* @throws `options.locale` must contain `formatDistance` property
*
* @example
* // If today is 1 January 2015, what is the distance to 2 July 2014?
* const result = formatDistanceToNow(
*   new Date(2014, 6, 2)
* )
* //=> '6 months'
*
* @example
* // If now is 1 January 2015 00:00:00,
* // what is the distance to 1 January 2015 00:00:15, including seconds?
* const result = formatDistanceToNow(
*   new Date(2015, 0, 1, 0, 0, 15),
*   {includeSeconds: true}
* )
* //=> 'less than 20 seconds'
*
* @example
* // If today is 1 January 2015,
* // what is the distance to 1 January 2016, with a suffix?
* const result = formatDistanceToNow(
*   new Date(2016, 0, 1),
*   {addSuffix: true}
* )
* //=> 'in about 1 year'
*
* @example
* // If today is 1 January 2015,
* // what is the distance to 1 August 2016 in Esperanto?
* const eoLocale = require('date-fns/locale/eo')
* const result = formatDistanceToNow(
*   new Date(2016, 7, 1),
*   {locale: eoLocale}
* )
* //=> 'pli ol 1 jaro'
*/
function formatDistanceToNow(date, options) {
	return formatDistance(date, constructNow(date), options);
}
//#endregion
//#region node_modules/date-fns/formatDistanceToNowStrict.mjs
/**
* The {@link formatDistanceToNowStrict} function options.
*/
/**
* @name formatDistanceToNowStrict
* @category Common Helpers
* @summary Return the distance between the given date and now in words.
* @pure false
*
* @description
* Return the distance between the given dates in words, using strict units.
* This is like `formatDistance`, but does not use helpers like 'almost', 'over',
* 'less than' and the like.
*
* | Distance between dates | Result              |
* |------------------------|---------------------|
* | 0 ... 59 secs          | [0..59] seconds     |
* | 1 ... 59 mins          | [1..59] minutes     |
* | 1 ... 23 hrs           | [1..23] hours       |
* | 1 ... 29 days          | [1..29] days        |
* | 1 ... 11 months        | [1..11] months      |
* | 1 ... N years          | [1..N]  years       |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - An object with options.
*
* @returns The distance in words
*
* @throws `date` must not be Invalid Date
* @throws `options.locale` must contain `formatDistance` property
*
* @example
* // If today is 1 January 2015, what is the distance to 2 July 2014?
* const result = formatDistanceToNowStrict(
*   new Date(2014, 6, 2)
* )
* //=> '6 months'
*
* @example
* // If now is 1 January 2015 00:00:00,
* // what is the distance to 1 January 2015 00:00:15, including seconds?
* const result = formatDistanceToNowStrict(
*   new Date(2015, 0, 1, 0, 0, 15)
* )
* //=> '15 seconds'
*
* @example
* // If today is 1 January 2015,
* // what is the distance to 1 January 2016, with a suffix?
* const result = formatDistanceToNowStrict(
*   new Date(2016, 0, 1),
*   {addSuffix: true}
* )
* //=> 'in 1 year'
*
* @example
* // If today is 28 January 2015,
* // what is the distance to 1 January 2015, in months, rounded up??
* const result = formatDistanceToNowStrict(new Date(2015, 0, 1), {
*   unit: 'month',
*   roundingMethod: 'ceil'
* })
* //=> '1 month'
*
* @example
* // If today is 1 January 2015,
* // what is the distance to 1 January 2016 in Esperanto?
* const eoLocale = require('date-fns/locale/eo')
* const result = formatDistanceToNowStrict(
*   new Date(2016, 0, 1),
*   {locale: eoLocale}
* )
* //=> '1 jaro'
*/
function formatDistanceToNowStrict(date, options) {
	return formatDistanceStrict(date, constructNow(date), options);
}
//#endregion
//#region node_modules/date-fns/formatDuration.mjs
/**
* The {@link formatDuration} function options.
*/
var defaultFormat = [
	"years",
	"months",
	"weeks",
	"days",
	"hours",
	"minutes",
	"seconds"
];
/**
* @name formatDuration
* @category Common Helpers
* @summary Formats a duration in human-readable format
*
* @description
* Return human-readable duration string i.e. "9 months 2 days"
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param duration - The duration to format
* @param options - An object with options.
*
* @returns The formatted date string
*
* @example
* // Format full duration
* formatDuration({
*   years: 2,
*   months: 9,
*   weeks: 1,
*   days: 7,
*   hours: 5,
*   minutes: 9,
*   seconds: 30
* })
* //=> '2 years 9 months 1 week 7 days 5 hours 9 minutes 30 seconds'
*
* @example
* // Format partial duration
* formatDuration({ months: 9, days: 2 })
* //=> '9 months 2 days'
*
* @example
* // Customize the format
* formatDuration(
*   {
*     years: 2,
*     months: 9,
*     weeks: 1,
*     days: 7,
*     hours: 5,
*     minutes: 9,
*     seconds: 30
*   },
*   { format: ['months', 'weeks'] }
* ) === '9 months 1 week'
*
* @example
* // Customize the zeros presence
* formatDuration({ years: 0, months: 9 })
* //=> '9 months'
* formatDuration({ years: 0, months: 9 }, { zero: true })
* //=> '0 years 9 months'
*
* @example
* // Customize the delimiter
* formatDuration({ years: 2, months: 9, weeks: 3 }, { delimiter: ', ' })
* //=> '2 years, 9 months, 3 weeks'
*/
function formatDuration(duration, options) {
	const defaultOptions = getDefaultOptions$1();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const format = options?.format ?? defaultFormat;
	const zero = options?.zero ?? false;
	const delimiter = options?.delimiter ?? " ";
	if (!locale.formatDistance) return "";
	return format.reduce((acc, unit) => {
		const token = `x${unit.replace(/(^.)/, (m) => m.toUpperCase())}`;
		const value = duration[unit];
		if (value !== void 0 && (zero || duration[unit])) return acc.concat(locale.formatDistance(token, value));
		return acc;
	}, []).join(delimiter);
}
//#endregion
//#region node_modules/date-fns/formatISO.mjs
/**
* The {@link formatISO} function options.
*/
/**
* @name formatISO
* @category Common Helpers
* @summary Format the date according to the ISO 8601 standard (https://support.sas.com/documentation/cdl/en/lrdict/64316/HTML/default/viewer.htm#a003169814.htm).
*
* @description
* Return the formatted date string in ISO 8601 format. Options may be passed to control the parts and notations of the date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options.
*
* @returns The formatted date string (in loca.l time zone)
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 18 September 2019 in ISO 8601 format (local time zone is UTC):
* const result = formatISO(new Date(2019, 8, 18, 19, 0, 52))
* //=> '2019-09-18T19:00:52Z'
*
* @example
* // Represent 18 September 2019 in ISO 8601, short format (local time zone is UTC):
* const result = formatISO(new Date(2019, 8, 18, 19, 0, 52), { format: 'basic' })
* //=> '20190918T190052'
*
* @example
* // Represent 18 September 2019 in ISO 8601 format, date only:
* const result = formatISO(new Date(2019, 8, 18, 19, 0, 52), { representation: 'date' })
* //=> '2019-09-18'
*
* @example
* // Represent 18 September 2019 in ISO 8601 format, time only (local time zone is UTC):
* const result = formatISO(new Date(2019, 8, 18, 19, 0, 52), { representation: 'time' })
* //=> '19:00:52Z'
*/
function formatISO(date, options) {
	const _date = toDate(date);
	if (isNaN(_date.getTime())) throw new RangeError("Invalid time value");
	const format = options?.format ?? "extended";
	const representation = options?.representation ?? "complete";
	let result = "";
	let tzOffset = "";
	const dateDelimiter = format === "extended" ? "-" : "";
	const timeDelimiter = format === "extended" ? ":" : "";
	if (representation !== "time") {
		const day = addLeadingZeros(_date.getDate(), 2);
		const month = addLeadingZeros(_date.getMonth() + 1, 2);
		result = `${addLeadingZeros(_date.getFullYear(), 4)}${dateDelimiter}${month}${dateDelimiter}${day}`;
	}
	if (representation !== "date") {
		const offset = _date.getTimezoneOffset();
		if (offset !== 0) {
			const absoluteOffset = Math.abs(offset);
			const hourOffset = addLeadingZeros(Math.trunc(absoluteOffset / 60), 2);
			const minuteOffset = addLeadingZeros(absoluteOffset % 60, 2);
			tzOffset = `${offset < 0 ? "+" : "-"}${hourOffset}:${minuteOffset}`;
		} else tzOffset = "Z";
		const hour = addLeadingZeros(_date.getHours(), 2);
		const minute = addLeadingZeros(_date.getMinutes(), 2);
		const second = addLeadingZeros(_date.getSeconds(), 2);
		const separator = result === "" ? "" : "T";
		const time = [
			hour,
			minute,
			second
		].join(timeDelimiter);
		result = `${result}${separator}${time}${tzOffset}`;
	}
	return result;
}
//#endregion
//#region node_modules/date-fns/formatISO9075.mjs
/**
* The {@link formatISO9075} function options.
*/
/**
* @name formatISO9075
* @category Common Helpers
* @summary Format the date according to the ISO 9075 standard (https://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_get-format).
*
* @description
* Return the formatted date string in ISO 9075 format. Options may be passed to control the parts and notations of the date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options.
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 18 September 2019 in ISO 9075 format:
* const result = formatISO9075(new Date(2019, 8, 18, 19, 0, 52))
* //=> '2019-09-18 19:00:52'
*
* @example
* // Represent 18 September 2019 in ISO 9075, short format:
* const result = formatISO9075(new Date(2019, 8, 18, 19, 0, 52), { format: 'basic' })
* //=> '20190918 190052'
*
* @example
* // Represent 18 September 2019 in ISO 9075 format, date only:
* const result = formatISO9075(new Date(2019, 8, 18, 19, 0, 52), { representation: 'date' })
* //=> '2019-09-18'
*
* @example
* // Represent 18 September 2019 in ISO 9075 format, time only:
* const result = formatISO9075(new Date(2019, 8, 18, 19, 0, 52), { representation: 'time' })
* //=> '19:00:52'
*/
function formatISO9075(date, options) {
	const _date = toDate(date);
	if (!isValid(_date)) throw new RangeError("Invalid time value");
	const format = options?.format ?? "extended";
	const representation = options?.representation ?? "complete";
	let result = "";
	const dateDelimiter = format === "extended" ? "-" : "";
	const timeDelimiter = format === "extended" ? ":" : "";
	if (representation !== "time") {
		const day = addLeadingZeros(_date.getDate(), 2);
		const month = addLeadingZeros(_date.getMonth() + 1, 2);
		result = `${addLeadingZeros(_date.getFullYear(), 4)}${dateDelimiter}${month}${dateDelimiter}${day}`;
	}
	if (representation !== "date") {
		const hour = addLeadingZeros(_date.getHours(), 2);
		const minute = addLeadingZeros(_date.getMinutes(), 2);
		const second = addLeadingZeros(_date.getSeconds(), 2);
		result = `${result}${result === "" ? "" : " "}${hour}${timeDelimiter}${minute}${timeDelimiter}${second}`;
	}
	return result;
}
//#endregion
//#region node_modules/date-fns/formatISODuration.mjs
/**
* @name formatISODuration
* @category Common Helpers
* @summary Format a duration object according as ISO 8601 duration string
*
* @description
* Format a duration object according to the ISO 8601 duration standard (https://www.digi.com/resources/documentation/digidocs//90001488-13/reference/r_iso_8601_duration_format.htm)
*
* @param duration - The duration to format
*
* @returns The ISO 8601 duration string
*
* @example
* // Format the given duration as ISO 8601 string
* const result = formatISODuration({
*   years: 39,
*   months: 2,
*   days: 20,
*   hours: 7,
*   minutes: 5,
*   seconds: 0
* })
* //=> 'P39Y2M20DT0H0M0S'
*/
function formatISODuration(duration) {
	const { years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
	return `P${years}Y${months}M${days}DT${hours}H${minutes}M${seconds}S`;
}
//#endregion
//#region node_modules/date-fns/formatRFC3339.mjs
/**
* The {@link formatRFC3339} function options.
*/
/**
* @name formatRFC3339
* @category Common Helpers
* @summary Format the date according to the RFC 3339 standard (https://tools.ietf.org/html/rfc3339#section-5.6).
*
* @description
* Return the formatted date string in RFC 3339 format. Options may be passed to control the parts and notations of the date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options.
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 18 September 2019 in RFC 3339 format:
* formatRFC3339(new Date(2019, 8, 18, 19, 0, 52))
* //=> '2019-09-18T19:00:52Z'
*
* @example
* // Represent 18 September 2019 in RFC 3339 format, 3 digits of second fraction
* formatRFC3339(new Date(2019, 8, 18, 19, 0, 52, 234), {
*   fractionDigits: 3
* })
* //=> '2019-09-18T19:00:52.234Z'
*/
function formatRFC3339(date, options) {
	const _date = toDate(date);
	if (!isValid(_date)) throw new RangeError("Invalid time value");
	const fractionDigits = options?.fractionDigits ?? 0;
	const day = addLeadingZeros(_date.getDate(), 2);
	const month = addLeadingZeros(_date.getMonth() + 1, 2);
	const year = _date.getFullYear();
	const hour = addLeadingZeros(_date.getHours(), 2);
	const minute = addLeadingZeros(_date.getMinutes(), 2);
	const second = addLeadingZeros(_date.getSeconds(), 2);
	let fractionalSecond = "";
	if (fractionDigits > 0) {
		const milliseconds = _date.getMilliseconds();
		fractionalSecond = "." + addLeadingZeros(Math.trunc(milliseconds * Math.pow(10, fractionDigits - 3)), fractionDigits);
	}
	let offset = "";
	const tzOffset = _date.getTimezoneOffset();
	if (tzOffset !== 0) {
		const absoluteOffset = Math.abs(tzOffset);
		const hourOffset = addLeadingZeros(Math.trunc(absoluteOffset / 60), 2);
		const minuteOffset = addLeadingZeros(absoluteOffset % 60, 2);
		offset = `${tzOffset < 0 ? "+" : "-"}${hourOffset}:${minuteOffset}`;
	} else offset = "Z";
	return `${year}-${month}-${day}T${hour}:${minute}:${second}${fractionalSecond}${offset}`;
}
//#endregion
//#region node_modules/date-fns/formatRFC7231.mjs
var days = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
/**
* @name formatRFC7231
* @category Common Helpers
* @summary Format the date according to the RFC 7231 standard (https://tools.ietf.org/html/rfc7231#section-7.1.1.1).
*
* @description
* Return the formatted date string in RFC 7231 format.
* The result will always be in UTC timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 18 September 2019 in RFC 7231 format:
* const result = formatRFC7231(new Date(2019, 8, 18, 19, 0, 52))
* //=> 'Wed, 18 Sep 2019 19:00:52 GMT'
*/
function formatRFC7231(date) {
	const _date = toDate(date);
	if (!isValid(_date)) throw new RangeError("Invalid time value");
	return `${days[_date.getUTCDay()]}, ${addLeadingZeros(_date.getUTCDate(), 2)} ${months[_date.getUTCMonth()]} ${_date.getUTCFullYear()} ${addLeadingZeros(_date.getUTCHours(), 2)}:${addLeadingZeros(_date.getUTCMinutes(), 2)}:${addLeadingZeros(_date.getUTCSeconds(), 2)} GMT`;
}
//#endregion
//#region node_modules/date-fns/formatRelative.mjs
/**
* The {@link formatRelative} function options.
*/
/**
* @name formatRelative
* @category Common Helpers
* @summary Represent the date in words relative to the given base date.
*
* @description
* Represent the date in words relative to the given base date.
*
* | Distance to the base date | Result                    |
* |---------------------------|---------------------------|
* | Previous 6 days           | last Sunday at 04:30 AM   |
* | Last day                  | yesterday at 04:30 AM     |
* | Same day                  | today at 04:30 AM         |
* | Next day                  | tomorrow at 04:30 AM      |
* | Next 6 days               | Sunday at 04:30 AM        |
* | Other                     | 12/31/2017                |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to format
* @param baseDate - The date to compare with
* @param options - An object with options
*
* @returns The date in words
*
* @throws `date` must not be Invalid Date
* @throws `baseDate` must not be Invalid Date
* @throws `options.locale` must contain `localize` property
* @throws `options.locale` must contain `formatLong` property
* @throws `options.locale` must contain `formatRelative` property
*
* @example
* // Represent the date of 6 days ago in words relative to the given base date. In this example, today is Wednesday
* const result = formatRelative(subDays(new Date(), 6), new Date())
* //=> "last Thursday at 12:45 AM"
*/
function formatRelative(date, baseDate, options) {
	const _date = toDate(date);
	const _baseDate = toDate(baseDate);
	const defaultOptions = getDefaultOptions$1();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const diff = differenceInCalendarDays(_date, _baseDate);
	if (isNaN(diff)) throw new RangeError("Invalid time value");
	let token;
	if (diff < -6) token = "other";
	else if (diff < -1) token = "lastWeek";
	else if (diff < 0) token = "yesterday";
	else if (diff < 1) token = "today";
	else if (diff < 2) token = "tomorrow";
	else if (diff < 7) token = "nextWeek";
	else token = "other";
	return format(_date, locale.formatRelative(token, _date, _baseDate, {
		locale,
		weekStartsOn
	}), {
		locale,
		weekStartsOn
	});
}
//#endregion
//#region node_modules/date-fns/fromUnixTime.mjs
/**
* @name fromUnixTime
* @category Timestamp Helpers
* @summary Create a date from a Unix timestamp.
*
* @description
* Create a date from a Unix timestamp (in seconds). Decimal values will be discarded.
*
* @param unixTime - The given Unix timestamp (in seconds)
*
* @returns The date
*
* @example
* // Create the date 29 February 2012 11:45:05:
* const result = fromUnixTime(1330515905)
* //=> Wed Feb 29 2012 11:45:05
*/
function fromUnixTime(unixTime) {
	return toDate(unixTime * 1e3);
}
//#endregion
//#region node_modules/date-fns/getDate.mjs
/**
* @name getDate
* @category Day Helpers
* @summary Get the day of the month of the given date.
*
* @description
* Get the day of the month of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The day of month
*
* @example
* // Which day of the month is 29 February 2012?
* const result = getDate(new Date(2012, 1, 29))
* //=> 29
*/
function getDate(date) {
	return toDate(date).getDate();
}
//#endregion
//#region node_modules/date-fns/getDay.mjs
/**
* @name getDay
* @category Weekday Helpers
* @summary Get the day of the week of the given date.
*
* @description
* Get the day of the week of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The day of week, 0 represents Sunday
*
* @example
* // Which day of the week is 29 February 2012?
* const result = getDay(new Date(2012, 1, 29))
* //=> 3
*/
function getDay(date) {
	return toDate(date).getDay();
}
//#endregion
//#region node_modules/date-fns/getDaysInMonth.mjs
/**
* @name getDaysInMonth
* @category Month Helpers
* @summary Get the number of days in a month of the given date.
*
* @description
* Get the number of days in a month of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The number of days in a month
*
* @example
* // How many days are in February 2000?
* const result = getDaysInMonth(new Date(2000, 1))
* //=> 29
*/
function getDaysInMonth(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const monthIndex = _date.getMonth();
	const lastDayOfMonth = constructFrom(date, 0);
	lastDayOfMonth.setFullYear(year, monthIndex + 1, 0);
	lastDayOfMonth.setHours(0, 0, 0, 0);
	return lastDayOfMonth.getDate();
}
//#endregion
//#region node_modules/date-fns/isLeapYear.mjs
/**
* @name isLeapYear
* @category Year Helpers
* @summary Is the given date in the leap year?
*
* @description
* Is the given date in the leap year?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in the leap year
*
* @example
* // Is 1 September 2012 in the leap year?
* const result = isLeapYear(new Date(2012, 8, 1))
* //=> true
*/
function isLeapYear(date) {
	const year = toDate(date).getFullYear();
	return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
//#endregion
//#region node_modules/date-fns/getDaysInYear.mjs
/**
* @name getDaysInYear
* @category Year Helpers
* @summary Get the number of days in a year of the given date.
*
* @description
* Get the number of days in a year of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The number of days in a year
*
* @example
* // How many days are in 2012?
* const result = getDaysInYear(new Date(2012, 0, 1))
* //=> 366
*/
function getDaysInYear(date) {
	const _date = toDate(date);
	if (String(new Date(_date)) === "Invalid Date") return NaN;
	return isLeapYear(_date) ? 366 : 365;
}
//#endregion
//#region node_modules/date-fns/getDecade.mjs
/**
* @name getDecade
* @category Decade Helpers
* @summary Get the decade of the given date.
*
* @description
* Get the decade of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The year of decade
*
* @example
* // Which decade belongs 27 November 1942?
* const result = getDecade(new Date(1942, 10, 27))
* //=> 1940
*/
function getDecade(date) {
	const year = toDate(date).getFullYear();
	return Math.floor(year / 10) * 10;
}
//#endregion
//#region node_modules/date-fns/getDefaultOptions.mjs
/**
* @name getDefaultOptions
* @category Common Helpers
* @summary Get default options.
* @pure false
*
* @description
* Returns an object that contains defaults for
* `options.locale`, `options.weekStartsOn` and `options.firstWeekContainsDate`
* arguments for all functions.
*
* You can change these with [setDefaultOptions](https://date-fns.org/docs/setDefaultOptions).
*
* @returns The default options
*
* @example
* const result = getDefaultOptions()
* //=> {}
*
* @example
* setDefaultOptions({ weekStarsOn: 1, firstWeekContainsDate: 4 })
* const result = getDefaultOptions()
* //=> { weekStarsOn: 1, firstWeekContainsDate: 4 }
*/
function getDefaultOptions() {
	return Object.assign({}, getDefaultOptions$1());
}
//#endregion
//#region node_modules/date-fns/getHours.mjs
/**
* @name getHours
* @category Hour Helpers
* @summary Get the hours of the given date.
*
* @description
* Get the hours of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The hours
*
* @example
* // Get the hours of 29 February 2012 11:45:00:
* const result = getHours(new Date(2012, 1, 29, 11, 45))
* //=> 11
*/
function getHours(date) {
	return toDate(date).getHours();
}
//#endregion
//#region node_modules/date-fns/getISODay.mjs
/**
* @name getISODay
* @category Weekday Helpers
* @summary Get the day of the ISO week of the given date.
*
* @description
* Get the day of the ISO week of the given date,
* which is 7 for Sunday, 1 for Monday etc.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The day of ISO week
*
* @example
* // Which day of the ISO week is 26 February 2012?
* const result = getISODay(new Date(2012, 1, 26))
* //=> 7
*/
function getISODay(date) {
	let day = toDate(date).getDay();
	if (day === 0) day = 7;
	return day;
}
//#endregion
//#region node_modules/date-fns/getISOWeeksInYear.mjs
/**
* @name getISOWeeksInYear
* @category ISO Week-Numbering Year Helpers
* @summary Get the number of weeks in an ISO week-numbering year of the given date.
*
* @description
* Get the number of weeks in an ISO week-numbering year of the given date.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The number of ISO weeks in a year
*
* @example
* // How many weeks are in ISO week-numbering year 2015?
* const result = getISOWeeksInYear(new Date(2015, 1, 11))
* //=> 53
*/
function getISOWeeksInYear(date) {
	const thisYear = startOfISOWeekYear(date);
	const diff = +startOfISOWeekYear(addWeeks(thisYear, 60)) - +thisYear;
	return Math.round(diff / millisecondsInWeek);
}
//#endregion
//#region node_modules/date-fns/getMilliseconds.mjs
/**
* @name getMilliseconds
* @category Millisecond Helpers
* @summary Get the milliseconds of the given date.
*
* @description
* Get the milliseconds of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The milliseconds
*
* @example
* // Get the milliseconds of 29 February 2012 11:45:05.123:
* const result = getMilliseconds(new Date(2012, 1, 29, 11, 45, 5, 123))
* //=> 123
*/
function getMilliseconds(date) {
	return toDate(date).getMilliseconds();
}
//#endregion
//#region node_modules/date-fns/getMinutes.mjs
/**
* @name getMinutes
* @category Minute Helpers
* @summary Get the minutes of the given date.
*
* @description
* Get the minutes of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The minutes
*
* @example
* // Get the minutes of 29 February 2012 11:45:05:
* const result = getMinutes(new Date(2012, 1, 29, 11, 45, 5))
* //=> 45
*/
function getMinutes(date) {
	return toDate(date).getMinutes();
}
//#endregion
//#region node_modules/date-fns/getMonth.mjs
/**
* @name getMonth
* @category Month Helpers
* @summary Get the month of the given date.
*
* @description
* Get the month of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The month index (0-11)
*
* @example
* // Which month is 29 February 2012?
* const result = getMonth(new Date(2012, 1, 29))
* //=> 1
*/
function getMonth(date) {
	return toDate(date).getMonth();
}
//#endregion
//#region node_modules/date-fns/getOverlappingDaysInIntervals.mjs
/**
* @name getOverlappingDaysInIntervals
* @category Interval Helpers
* @summary Get the number of days that overlap in two time intervals
*
* @description
* Get the number of days that overlap in two time intervals. It uses the time
* between dates to calculate the number of days, rounding it up to include
* partial days.
*
* Two equal 0-length intervals will result in 0. Two equal 1ms intervals will
* result in 1.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param intervalLeft - The first interval to compare.
* @param intervalRight - The second interval to compare.
*
* @returns The number of days that overlap in two time intervals
*
* @example
* // For overlapping time intervals adds 1 for each started overlapping day:
* getOverlappingDaysInIntervals(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 17), end: new Date(2014, 0, 21) }
* )
* //=> 3
*
* @example
* // For non-overlapping time intervals returns 0:
* getOverlappingDaysInIntervals(
*   { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) },
*   { start: new Date(2014, 0, 21), end: new Date(2014, 0, 22) }
* )
* //=> 0
*/
function getOverlappingDaysInIntervals(intervalLeft, intervalRight) {
	const [leftStart, leftEnd] = [+toDate(intervalLeft.start), +toDate(intervalLeft.end)].sort((a, b) => a - b);
	const [rightStart, rightEnd] = [+toDate(intervalRight.start), +toDate(intervalRight.end)].sort((a, b) => a - b);
	if (!(leftStart < rightEnd && rightStart < leftEnd)) return 0;
	const overlapLeft = rightStart < leftStart ? leftStart : rightStart;
	const left = overlapLeft - getTimezoneOffsetInMilliseconds(overlapLeft);
	const overlapRight = rightEnd > leftEnd ? leftEnd : rightEnd;
	const right = overlapRight - getTimezoneOffsetInMilliseconds(overlapRight);
	return Math.ceil((right - left) / millisecondsInDay);
}
//#endregion
//#region node_modules/date-fns/getSeconds.mjs
/**
* @name getSeconds
* @category Second Helpers
* @summary Get the seconds of the given date.
*
* @description
* Get the seconds of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The seconds
*
* @example
* // Get the seconds of 29 February 2012 11:45:05.123:
* const result = getSeconds(new Date(2012, 1, 29, 11, 45, 5, 123))
* //=> 5
*/
function getSeconds(date) {
	return toDate(date).getSeconds();
}
//#endregion
//#region node_modules/date-fns/getTime.mjs
/**
* @name getTime
* @category Timestamp Helpers
* @summary Get the milliseconds timestamp of the given date.
*
* @description
* Get the milliseconds timestamp of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The timestamp
*
* @example
* // Get the timestamp of 29 February 2012 11:45:05.123:
* const result = getTime(new Date(2012, 1, 29, 11, 45, 5, 123))
* //=> 1330515905123
*/
function getTime(date) {
	return toDate(date).getTime();
}
//#endregion
//#region node_modules/date-fns/getUnixTime.mjs
/**
* @name getUnixTime
* @category Timestamp Helpers
* @summary Get the seconds timestamp of the given date.
*
* @description
* Get the seconds timestamp of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The timestamp
*
* @example
* // Get the timestamp of 29 February 2012 11:45:05 CET:
* const result = getUnixTime(new Date(2012, 1, 29, 11, 45, 5))
* //=> 1330512305
*/
function getUnixTime(date) {
	return Math.trunc(+toDate(date) / 1e3);
}
//#endregion
//#region node_modules/date-fns/getWeekOfMonth.mjs
/**
* The {@link getWeekOfMonth} function options.
*/
/**
* @name getWeekOfMonth
* @category Week Helpers
* @summary Get the week of the month of the given date.
*
* @description
* Get the week of the month of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - An object with options.
*
* @returns The week of month
*
* @example
* // Which week of the month is 9 November 2017?
* const result = getWeekOfMonth(new Date(2017, 10, 9))
* //=> 2
*/
function getWeekOfMonth(date, options) {
	const defaultOptions = getDefaultOptions$1();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const currentDayOfMonth = getDate(date);
	if (isNaN(currentDayOfMonth)) return NaN;
	let lastDayOfFirstWeek = weekStartsOn - getDay(startOfMonth(date));
	if (lastDayOfFirstWeek <= 0) lastDayOfFirstWeek += 7;
	const remainingDaysAfterFirstWeek = currentDayOfMonth - lastDayOfFirstWeek;
	return Math.ceil(remainingDaysAfterFirstWeek / 7) + 1;
}
//#endregion
//#region node_modules/date-fns/lastDayOfMonth.mjs
/**
* @name lastDayOfMonth
* @category Month Helpers
* @summary Return the last day of a month for the given date.
*
* @description
* Return the last day of a month for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The last day of a month
*
* @example
* // The last day of a month for 2 September 2014 11:55:00:
* const result = lastDayOfMonth(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 30 2014 00:00:00
*/
function lastDayOfMonth(date) {
	const _date = toDate(date);
	const month = _date.getMonth();
	_date.setFullYear(_date.getFullYear(), month + 1, 0);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/getWeeksInMonth.mjs
/**
* The {@link getWeeksInMonth} function options.
*/
/**
* @name getWeeksInMonth
* @category Week Helpers
* @summary Get the number of calendar weeks a month spans.
*
* @description
* Get the number of calendar weeks the month in the given date spans.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
* @param options - An object with options.
*
* @returns The number of calendar weeks
*
* @example
* // How many calendar weeks does February 2015 span?
* const result = getWeeksInMonth(new Date(2015, 1, 8))
* //=> 4
*
* @example
* // If the week starts on Monday,
* // how many calendar weeks does July 2017 span?
* const result = getWeeksInMonth(new Date(2017, 6, 5), { weekStartsOn: 1 })
* //=> 6
*/
function getWeeksInMonth(date, options) {
	return differenceInCalendarWeeks(lastDayOfMonth(date), startOfMonth(date), options) + 1;
}
//#endregion
//#region node_modules/date-fns/getYear.mjs
/**
* @name getYear
* @category Year Helpers
* @summary Get the year of the given date.
*
* @description
* Get the year of the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The given date
*
* @returns The year
*
* @example
* // Which year is 2 July 2014?
* const result = getYear(new Date(2014, 6, 2))
* //=> 2014
*/
function getYear(date) {
	return toDate(date).getFullYear();
}
//#endregion
//#region node_modules/date-fns/hoursToMilliseconds.mjs
/**
* @name hoursToMilliseconds
* @category  Conversion Helpers
* @summary Convert hours to milliseconds.
*
* @description
* Convert a number of hours to a full number of milliseconds.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param hours - number of hours to be converted
*
* @returns The number of hours converted to milliseconds
*
* @example
* // Convert 2 hours to milliseconds:
* const result = hoursToMilliseconds(2)
* //=> 7200000
*/
function hoursToMilliseconds(hours) {
	return Math.trunc(hours * millisecondsInHour);
}
//#endregion
//#region node_modules/date-fns/hoursToMinutes.mjs
/**
* @name hoursToMinutes
* @category Conversion Helpers
* @summary Convert hours to minutes.
*
* @description
* Convert a number of hours to a full number of minutes.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param hours - number of hours to be converted
*
* @returns The number of hours converted in minutes
*
* @example
* // Convert 2 hours to minutes:
* const result = hoursToMinutes(2)
* //=> 120
*/
function hoursToMinutes(hours) {
	return Math.trunc(hours * 60);
}
//#endregion
//#region node_modules/date-fns/hoursToSeconds.mjs
/**
* @name hoursToSeconds
* @category Conversion Helpers
* @summary Convert hours to seconds.
*
* @description
* Convert a number of hours to a full number of seconds.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param hours - The number of hours to be converted
*
* @returns The number of hours converted in seconds
*
* @example
* // Convert 2 hours to seconds:
* const result = hoursToSeconds(2)
* //=> 7200
*/
function hoursToSeconds(hours) {
	return Math.trunc(hours * secondsInHour);
}
//#endregion
//#region node_modules/date-fns/interval.mjs
/**
* The {@link interval} function options.
*/
/**
* @name interval
* @category Interval Helpers
* @summary Creates an interval object and validates its values.
*
* @description
* Creates a normalized interval object and validates its values. If the interval is invalid, an exception is thrown.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param start - The start of the interval.
* @param end - The end of the interval.
* @param options - The options object.
*
* @throws `Start date is invalid` when `start` is invalid.
* @throws `End date is invalid` when `end` is invalid.
* @throws `End date must be after start date` when end is before `start` and `options.assertPositive` is true.
*
* @returns The normalized and validated interval object.
*/
function interval(start, end, options) {
	const _start = toDate(start);
	if (isNaN(+_start)) throw new TypeError("Start date is invalid");
	const _end = toDate(end);
	if (isNaN(+_end)) throw new TypeError("End date is invalid");
	if (options?.assertPositive && +_start > +_end) throw new TypeError("End date must be after start date");
	return {
		start: _start,
		end: _end
	};
}
//#endregion
//#region node_modules/date-fns/intervalToDuration.mjs
/**
* @name intervalToDuration
* @category Common Helpers
* @summary Convert interval to duration
*
* @description
* Convert a interval object to a duration object.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param interval - The interval to convert to duration
*
* @returns The duration object
*
* @example
* // Get the duration between January 15, 1929 and April 4, 1968.
* intervalToDuration({
*   start: new Date(1929, 0, 15, 12, 0, 0),
*   end: new Date(1968, 3, 4, 19, 5, 0)
* })
* // => { years: 39, months: 2, days: 20, hours: 7, minutes: 5, seconds: 0 }
*/
function intervalToDuration(interval) {
	const start = toDate(interval.start);
	const end = toDate(interval.end);
	const duration = {};
	const years = differenceInYears(end, start);
	if (years) duration.years = years;
	const remainingMonths = add(start, { years: duration.years });
	const months = differenceInMonths(end, remainingMonths);
	if (months) duration.months = months;
	const remainingDays = add(remainingMonths, { months: duration.months });
	const days = differenceInDays(end, remainingDays);
	if (days) duration.days = days;
	const remainingHours = add(remainingDays, { days: duration.days });
	const hours = differenceInHours(end, remainingHours);
	if (hours) duration.hours = hours;
	const remainingMinutes = add(remainingHours, { hours: duration.hours });
	const minutes = differenceInMinutes(end, remainingMinutes);
	if (minutes) duration.minutes = minutes;
	const seconds = differenceInSeconds(end, add(remainingMinutes, { minutes: duration.minutes }));
	if (seconds) duration.seconds = seconds;
	return duration;
}
//#endregion
//#region node_modules/date-fns/intlFormat.mjs
/**
* The locale string (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
*/
/**
* The format options (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options)
*/
/**
* The locale options.
*/
/**
* @name intlFormat
* @category Common Helpers
* @summary Format the date with Intl.DateTimeFormat (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
*
* @description
* Return the formatted date string in the given format.
* The method uses [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) inside.
* formatOptions are the same as [`Intl.DateTimeFormat` options](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#using_options)
*
* > ⚠️ Please note that before Node version 13.0.0, only the locale data for en-US is available by default.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to format
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 4 October 2019 in middle-endian format:
* const result = intlFormat(new Date(2019, 9, 4, 12, 30, 13, 456))
* //=> 10/4/2019
*/
/**
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to format
* @param localeOptions - An object with locale
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 4 October 2019 in Korean.
* // Convert the date with locale's options.
* const result = intlFormat(new Date(2019, 9, 4, 12, 30, 13, 456), {
*   locale: 'ko-KR',
* })
* //=> 2019. 10. 4.
*/
/**
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to format
* @param formatOptions - The format options
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 4 October 2019.
* // Convert the date with format's options.
* const result = intlFormat.default(new Date(2019, 9, 4, 12, 30, 13, 456), {
*   year: 'numeric',
*   month: 'numeric',
*   day: 'numeric',
*   hour: 'numeric',
* })
* //=> 10/4/2019, 12 PM
*/
/**
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to format
* @param formatOptions - The format options
* @param localeOptions - An object with locale
*
* @returns The formatted date string
*
* @throws `date` must not be Invalid Date
*
* @example
* // Represent 4 October 2019 in German.
* // Convert the date with format's options and locale's options.
* const result = intlFormat(new Date(2019, 9, 4, 12, 30, 13, 456), {
*   weekday: 'long',
*   year: 'numeric',
*   month: 'long',
*   day: 'numeric',
* }, {
*   locale: 'de-DE',
* })
* //=> Freitag, 4. Oktober 2019
*/
function intlFormat(date, formatOrLocale, localeOptions) {
	let formatOptions;
	if (isFormatOptions(formatOrLocale)) formatOptions = formatOrLocale;
	else localeOptions = formatOrLocale;
	return new Intl.DateTimeFormat(localeOptions?.locale, formatOptions).format(toDate(date));
}
function isFormatOptions(opts) {
	return opts !== void 0 && !("locale" in opts);
}
//#endregion
//#region node_modules/date-fns/intlFormatDistance.mjs
/**
* The {@link intlFormatDistance} function options.
*/
/**
* The unit used to format the distance in {@link intlFormatDistance}.
*/
/**
* @name intlFormatDistance
* @category Common Helpers
* @summary Formats distance between two dates in a human-readable format
* @description
* The function calculates the difference between two dates and formats it as a human-readable string.
*
* The function will pick the most appropriate unit depending on the distance between dates. For example, if the distance is a few hours, it might return `x hours`. If the distance is a few months, it might return `x months`.
*
* You can also specify a unit to force using it regardless of the distance to get a result like `123456 hours`.
*
* See the table below for the unit picking logic:
*
* | Distance between dates | Result (past)  | Result (future) |
* | ---------------------- | -------------- | --------------- |
* | 0 seconds              | now            | now             |
* | 1-59 seconds           | X seconds ago  | in X seconds    |
* | 1-59 minutes           | X minutes ago  | in X minutes    |
* | 1-23 hours             | X hours ago    | in X hours      |
* | 1 day                  | yesterday      | tomorrow        |
* | 2-6 days               | X days ago     | in X days       |
* | 7 days                 | last week      | next week       |
* | 8 days-1 month         | X weeks ago    | in X weeks      |
* | 1 month                | last month     | next month      |
* | 2-3 months             | X months ago   | in X months     |
* | 1 quarter              | last quarter   | next quarter    |
* | 2-3 quarters           | X quarters ago | in X quarters   |
* | 1 year                 | last year      | next year       |
* | 2+ years               | X years ago    | in X years      |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date
* @param baseDate - The date to compare with.
* @param options - An object with options.
* See MDN for details [Locale identification and negotiation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation)
* The narrow one could be similar to the short one for some locales.
*
* @returns The distance in words according to language-sensitive relative time formatting.
*
* @throws `date` must not be Invalid Date
* @throws `baseDate` must not be Invalid Date
* @throws `options.unit` must not be invalid Unit
* @throws `options.locale` must not be invalid locale
* @throws `options.localeMatcher` must not be invalid localeMatcher
* @throws `options.numeric` must not be invalid numeric
* @throws `options.style` must not be invalid style
*
* @example
* // What is the distance between the dates when the fist date is after the second?
* intlFormatDistance(
*   new Date(1986, 3, 4, 11, 30, 0),
*   new Date(1986, 3, 4, 10, 30, 0)
* )
* //=> 'in 1 hour'
*
* // What is the distance between the dates when the fist date is before the second?
* intlFormatDistance(
*   new Date(1986, 3, 4, 10, 30, 0),
*   new Date(1986, 3, 4, 11, 30, 0)
* )
* //=> '1 hour ago'
*
* @example
* // Use the unit option to force the function to output the result in quarters. Without setting it, the example would return "next year"
* intlFormatDistance(
*   new Date(1987, 6, 4, 10, 30, 0),
*   new Date(1986, 3, 4, 10, 30, 0),
*   { unit: 'quarter' }
* )
* //=> 'in 5 quarters'
*
* @example
* // Use the locale option to get the result in Spanish. Without setting it, the example would return "in 1 hour".
* intlFormatDistance(
*   new Date(1986, 3, 4, 11, 30, 0),
*   new Date(1986, 3, 4, 10, 30, 0),
*   { locale: 'es' }
* )
* //=> 'dentro de 1 hora'
*
* @example
* // Use the numeric option to force the function to use numeric values. Without setting it, the example would return "tomorrow".
* intlFormatDistance(
*   new Date(1986, 3, 5, 11, 30, 0),
*   new Date(1986, 3, 4, 11, 30, 0),
*   { numeric: 'always' }
* )
* //=> 'in 1 day'
*
* @example
* // Use the style option to force the function to use short values. Without setting it, the example would return "in 2 years".
* intlFormatDistance(
*   new Date(1988, 3, 4, 11, 30, 0),
*   new Date(1986, 3, 4, 11, 30, 0),
*   { style: 'short' }
* )
* //=> 'in 2 yr'
*/
function intlFormatDistance(date, baseDate, options) {
	let value = 0;
	let unit;
	const dateLeft = toDate(date);
	const dateRight = toDate(baseDate);
	if (!options?.unit) {
		const diffInSeconds = differenceInSeconds(dateLeft, dateRight);
		if (Math.abs(diffInSeconds) < 60) {
			value = differenceInSeconds(dateLeft, dateRight);
			unit = "second";
		} else if (Math.abs(diffInSeconds) < 3600) {
			value = differenceInMinutes(dateLeft, dateRight);
			unit = "minute";
		} else if (Math.abs(diffInSeconds) < 86400 && Math.abs(differenceInCalendarDays(dateLeft, dateRight)) < 1) {
			value = differenceInHours(dateLeft, dateRight);
			unit = "hour";
		} else if (Math.abs(diffInSeconds) < 604800 && (value = differenceInCalendarDays(dateLeft, dateRight)) && Math.abs(value) < 7) unit = "day";
		else if (Math.abs(diffInSeconds) < 2629746) {
			value = differenceInCalendarWeeks(dateLeft, dateRight);
			unit = "week";
		} else if (Math.abs(diffInSeconds) < 7889238) {
			value = differenceInCalendarMonths(dateLeft, dateRight);
			unit = "month";
		} else if (Math.abs(diffInSeconds) < 31556952) if (differenceInCalendarQuarters(dateLeft, dateRight) < 4) {
			value = differenceInCalendarQuarters(dateLeft, dateRight);
			unit = "quarter";
		} else {
			value = differenceInCalendarYears(dateLeft, dateRight);
			unit = "year";
		}
		else {
			value = differenceInCalendarYears(dateLeft, dateRight);
			unit = "year";
		}
	} else {
		unit = options?.unit;
		if (unit === "second") value = differenceInSeconds(dateLeft, dateRight);
		else if (unit === "minute") value = differenceInMinutes(dateLeft, dateRight);
		else if (unit === "hour") value = differenceInHours(dateLeft, dateRight);
		else if (unit === "day") value = differenceInCalendarDays(dateLeft, dateRight);
		else if (unit === "week") value = differenceInCalendarWeeks(dateLeft, dateRight);
		else if (unit === "month") value = differenceInCalendarMonths(dateLeft, dateRight);
		else if (unit === "quarter") value = differenceInCalendarQuarters(dateLeft, dateRight);
		else if (unit === "year") value = differenceInCalendarYears(dateLeft, dateRight);
	}
	return new Intl.RelativeTimeFormat(options?.locale, {
		localeMatcher: options?.localeMatcher,
		numeric: options?.numeric || "auto",
		style: options?.style
	}).format(value, unit);
}
//#endregion
//#region node_modules/date-fns/isAfter.mjs
/**
* @name isAfter
* @category Common Helpers
* @summary Is the first date after the second one?
*
* @description
* Is the first date after the second one?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date that should be after the other one to return true
* @param dateToCompare - The date to compare with
*
* @returns The first date is after the second date
*
* @example
* // Is 10 July 1989 after 11 February 1987?
* const result = isAfter(new Date(1989, 6, 10), new Date(1987, 1, 11))
* //=> true
*/
function isAfter(date, dateToCompare) {
	const _date = toDate(date);
	const _dateToCompare = toDate(dateToCompare);
	return _date.getTime() > _dateToCompare.getTime();
}
//#endregion
//#region node_modules/date-fns/isBefore.mjs
/**
* @name isBefore
* @category Common Helpers
* @summary Is the first date before the second one?
*
* @description
* Is the first date before the second one?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date that should be before the other one to return true
* @param dateToCompare - The date to compare with
*
* @returns The first date is before the second date
*
* @example
* // Is 10 July 1989 before 11 February 1987?
* const result = isBefore(new Date(1989, 6, 10), new Date(1987, 1, 11))
* //=> false
*/
function isBefore(date, dateToCompare) {
	const _date = toDate(date);
	const _dateToCompare = toDate(dateToCompare);
	return +_date < +_dateToCompare;
}
//#endregion
//#region node_modules/date-fns/isEqual.mjs
/**
* @name isEqual
* @category Common Helpers
* @summary Are the given dates equal?
*
* @description
* Are the given dates equal?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to compare
* @param dateRight - The second date to compare
*
* @returns The dates are equal
*
* @example
* // Are 2 July 2014 06:30:45.000 and 2 July 2014 06:30:45.500 equal?
* const result = isEqual(
*   new Date(2014, 6, 2, 6, 30, 45, 0),
*   new Date(2014, 6, 2, 6, 30, 45, 500)
* )
* //=> false
*/
function isEqual(leftDate, rightDate) {
	const _dateLeft = toDate(leftDate);
	const _dateRight = toDate(rightDate);
	return +_dateLeft === +_dateRight;
}
//#endregion
//#region node_modules/date-fns/isExists.mjs
/**
* @name isExists
* @category Common Helpers
* @summary Is the given date exists?
*
* @description
* Checks if the given arguments convert to an existing date.
*
* @param year - The year of the date to check
* @param month - The month of the date to check
* @param day - The day of the date to check
*
* @returns `true` if the date exists
*
* @example
* // For the valid date:
* const result = isExists(2018, 0, 31)
* //=> true
*
* @example
* // For the invalid date:
* const result = isExists(2018, 1, 31)
* //=> false
*/
function isExists(year, month, day) {
	const date = new Date(year, month, day);
	return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}
//#endregion
//#region node_modules/date-fns/isFirstDayOfMonth.mjs
/**
* @name isFirstDayOfMonth
* @category Month Helpers
* @summary Is the given date the first day of a month?
*
* @description
* Is the given date the first day of a month?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check

* @returns The date is the first day of a month
*
* @example
* // Is 1 September 2014 the first day of a month?
* const result = isFirstDayOfMonth(new Date(2014, 8, 1))
* //=> true
*/
function isFirstDayOfMonth(date) {
	return toDate(date).getDate() === 1;
}
//#endregion
//#region node_modules/date-fns/isFriday.mjs
/**
* @name isFriday
* @category Weekday Helpers
* @summary Is the given date Friday?
*
* @description
* Is the given date Friday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Friday
*
* @example
* // Is 26 September 2014 Friday?
* const result = isFriday(new Date(2014, 8, 26))
* //=> true
*/
function isFriday(date) {
	return toDate(date).getDay() === 5;
}
//#endregion
//#region node_modules/date-fns/isFuture.mjs
/**
* @name isFuture
* @category Common Helpers
* @summary Is the given date in the future?
* @pure false
*
* @description
* Is the given date in the future?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in the future
*
* @example
* // If today is 6 October 2014, is 31 December 2014 in the future?
* const result = isFuture(new Date(2014, 11, 31))
* //=> true
*/
function isFuture(date) {
	return +toDate(date) > Date.now();
}
//#endregion
//#region node_modules/date-fns/transpose.mjs
/**
* @name transpose
* @category Generic Helpers
* @summary Transpose the date to the given constructor.
*
* @description
* The function transposes the date to the given constructor. It helps you
* to transpose the date in the system time zone to say `UTCDate` or any other
* date extension.
*
* @typeParam DateInputType - The input `Date` type derived from the passed argument.
* @typeParam DateOutputType - The output `Date` type derived from the passed constructor.
*
* @param fromDate - The date to use values from
* @param constructor - The date constructor to use
*
* @returns Date transposed to the given constructor
*
* @example
* // Create July 10, 2022 00:00 in locale time zone
* const date = new Date(2022, 6, 10)
* //=> 'Sun Jul 10 2022 00:00:00 GMT+0800 (Singapore Standard Time)'
*
* @example
* // Transpose the date to July 10, 2022 00:00 in UTC
* transpose(date, UTCDate)
* //=> 'Sun Jul 10 2022 00:00:00 GMT+0000 (Coordinated Universal Time)'
*/
function transpose(fromDate, constructor) {
	const date = constructor instanceof Date ? constructFrom(constructor, 0) : new constructor(0);
	date.setFullYear(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
	date.setHours(fromDate.getHours(), fromDate.getMinutes(), fromDate.getSeconds(), fromDate.getMilliseconds());
	return date;
}
//#endregion
//#region node_modules/date-fns/parse/_lib/Setter.mjs
var TIMEZONE_UNIT_PRIORITY = 10;
var Setter = class {
	subPriority = 0;
	validate(_utcDate, _options) {
		return true;
	}
};
var ValueSetter = class extends Setter {
	constructor(value, validateValue, setValue, priority, subPriority) {
		super();
		this.value = value;
		this.validateValue = validateValue;
		this.setValue = setValue;
		this.priority = priority;
		if (subPriority) this.subPriority = subPriority;
	}
	validate(date, options) {
		return this.validateValue(date, this.value, options);
	}
	set(date, flags, options) {
		return this.setValue(date, flags, this.value, options);
	}
};
var DateToSystemTimezoneSetter = class extends Setter {
	priority = TIMEZONE_UNIT_PRIORITY;
	subPriority = -1;
	set(date, flags) {
		if (flags.timestampIsSet) return date;
		return constructFrom(date, transpose(date, Date));
	}
};
//#endregion
//#region node_modules/date-fns/parse/_lib/Parser.mjs
var Parser = class {
	run(dateString, token, match, options) {
		const result = this.parse(dateString, token, match, options);
		if (!result) return null;
		return {
			setter: new ValueSetter(result.value, this.validate, this.set, this.priority, this.subPriority),
			rest: result.rest
		};
	}
	validate(_utcDate, _value, _options) {
		return true;
	}
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/EraParser.mjs
var EraParser = class extends Parser {
	priority = 140;
	parse(dateString, token, match) {
		switch (token) {
			case "G":
			case "GG":
			case "GGG": return match.era(dateString, { width: "abbreviated" }) || match.era(dateString, { width: "narrow" });
			case "GGGGG": return match.era(dateString, { width: "narrow" });
			default: return match.era(dateString, { width: "wide" }) || match.era(dateString, { width: "abbreviated" }) || match.era(dateString, { width: "narrow" });
		}
	}
	set(date, flags, value) {
		flags.era = value;
		date.setFullYear(value, 0, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"R",
		"u",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/constants.mjs
var numericPatterns = {
	month: /^(1[0-2]|0?\d)/,
	date: /^(3[0-1]|[0-2]?\d)/,
	dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
	week: /^(5[0-3]|[0-4]?\d)/,
	hour23h: /^(2[0-3]|[0-1]?\d)/,
	hour24h: /^(2[0-4]|[0-1]?\d)/,
	hour11h: /^(1[0-1]|0?\d)/,
	hour12h: /^(1[0-2]|0?\d)/,
	minute: /^[0-5]?\d/,
	second: /^[0-5]?\d/,
	singleDigit: /^\d/,
	twoDigits: /^\d{1,2}/,
	threeDigits: /^\d{1,3}/,
	fourDigits: /^\d{1,4}/,
	anyDigitsSigned: /^-?\d+/,
	singleDigitSigned: /^-?\d/,
	twoDigitsSigned: /^-?\d{1,2}/,
	threeDigitsSigned: /^-?\d{1,3}/,
	fourDigitsSigned: /^-?\d{1,4}/
};
var timezonePatterns = {
	basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
	basic: /^([+-])(\d{2})(\d{2})|Z/,
	basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
	extended: /^([+-])(\d{2}):(\d{2})|Z/,
	extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
};
//#endregion
//#region node_modules/date-fns/parse/_lib/utils.mjs
function mapValue(parseFnResult, mapFn) {
	if (!parseFnResult) return parseFnResult;
	return {
		value: mapFn(parseFnResult.value),
		rest: parseFnResult.rest
	};
}
function parseNumericPattern(pattern, dateString) {
	const matchResult = dateString.match(pattern);
	if (!matchResult) return null;
	return {
		value: parseInt(matchResult[0], 10),
		rest: dateString.slice(matchResult[0].length)
	};
}
function parseTimezonePattern(pattern, dateString) {
	const matchResult = dateString.match(pattern);
	if (!matchResult) return null;
	if (matchResult[0] === "Z") return {
		value: 0,
		rest: dateString.slice(1)
	};
	const sign = matchResult[1] === "+" ? 1 : -1;
	const hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
	const minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
	const seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
	return {
		value: sign * (hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond),
		rest: dateString.slice(matchResult[0].length)
	};
}
function parseAnyDigitsSigned(dateString) {
	return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
}
function parseNDigits(n, dateString) {
	switch (n) {
		case 1: return parseNumericPattern(numericPatterns.singleDigit, dateString);
		case 2: return parseNumericPattern(numericPatterns.twoDigits, dateString);
		case 3: return parseNumericPattern(numericPatterns.threeDigits, dateString);
		case 4: return parseNumericPattern(numericPatterns.fourDigits, dateString);
		default: return parseNumericPattern(new RegExp("^\\d{1," + n + "}"), dateString);
	}
}
function parseNDigitsSigned(n, dateString) {
	switch (n) {
		case 1: return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
		case 2: return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
		case 3: return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
		case 4: return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
		default: return parseNumericPattern(new RegExp("^-?\\d{1," + n + "}"), dateString);
	}
}
function dayPeriodEnumToHours(dayPeriod) {
	switch (dayPeriod) {
		case "morning": return 4;
		case "evening": return 17;
		case "pm":
		case "noon":
		case "afternoon": return 12;
		default: return 0;
	}
}
function normalizeTwoDigitYear(twoDigitYear, currentYear) {
	const isCommonEra = currentYear > 0;
	const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
	let result;
	if (absCurrentYear <= 50) result = twoDigitYear || 100;
	else {
		const rangeEnd = absCurrentYear + 50;
		const rangeEndCentury = Math.trunc(rangeEnd / 100) * 100;
		const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
		result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
	}
	return isCommonEra ? result : 1 - result;
}
function isLeapYearIndex$1(year) {
	return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/YearParser.mjs
var YearParser = class extends Parser {
	priority = 130;
	incompatibleTokens = [
		"Y",
		"R",
		"u",
		"w",
		"I",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
	parse(dateString, token, match) {
		const valueCallback = (year) => ({
			year,
			isTwoDigitYear: token === "yy"
		});
		switch (token) {
			case "y": return mapValue(parseNDigits(4, dateString), valueCallback);
			case "yo": return mapValue(match.ordinalNumber(dateString, { unit: "year" }), valueCallback);
			default: return mapValue(parseNDigits(token.length, dateString), valueCallback);
		}
	}
	validate(_date, value) {
		return value.isTwoDigitYear || value.year > 0;
	}
	set(date, flags, value) {
		const currentYear = date.getFullYear();
		if (value.isTwoDigitYear) {
			const normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
			date.setFullYear(normalizedTwoDigitYear, 0, 1);
			date.setHours(0, 0, 0, 0);
			return date;
		}
		const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
		date.setFullYear(year, 0, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/LocalWeekYearParser.mjs
var LocalWeekYearParser = class extends Parser {
	priority = 130;
	parse(dateString, token, match) {
		const valueCallback = (year) => ({
			year,
			isTwoDigitYear: token === "YY"
		});
		switch (token) {
			case "Y": return mapValue(parseNDigits(4, dateString), valueCallback);
			case "Yo": return mapValue(match.ordinalNumber(dateString, { unit: "year" }), valueCallback);
			default: return mapValue(parseNDigits(token.length, dateString), valueCallback);
		}
	}
	validate(_date, value) {
		return value.isTwoDigitYear || value.year > 0;
	}
	set(date, flags, value, options) {
		const currentYear = getWeekYear(date, options);
		if (value.isTwoDigitYear) {
			const normalizedTwoDigitYear = normalizeTwoDigitYear(value.year, currentYear);
			date.setFullYear(normalizedTwoDigitYear, 0, options.firstWeekContainsDate);
			date.setHours(0, 0, 0, 0);
			return startOfWeek(date, options);
		}
		const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
		date.setFullYear(year, 0, options.firstWeekContainsDate);
		date.setHours(0, 0, 0, 0);
		return startOfWeek(date, options);
	}
	incompatibleTokens = [
		"y",
		"R",
		"u",
		"Q",
		"q",
		"M",
		"L",
		"I",
		"d",
		"D",
		"i",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ISOWeekYearParser.mjs
var ISOWeekYearParser = class extends Parser {
	priority = 130;
	parse(dateString, token) {
		if (token === "R") return parseNDigitsSigned(4, dateString);
		return parseNDigitsSigned(token.length, dateString);
	}
	set(date, _flags, value) {
		const firstWeekOfYear = constructFrom(date, 0);
		firstWeekOfYear.setFullYear(value, 0, 4);
		firstWeekOfYear.setHours(0, 0, 0, 0);
		return startOfISOWeek(firstWeekOfYear);
	}
	incompatibleTokens = [
		"G",
		"y",
		"Y",
		"u",
		"Q",
		"q",
		"M",
		"L",
		"w",
		"d",
		"D",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ExtendedYearParser.mjs
var ExtendedYearParser = class extends Parser {
	priority = 130;
	parse(dateString, token) {
		if (token === "u") return parseNDigitsSigned(4, dateString);
		return parseNDigitsSigned(token.length, dateString);
	}
	set(date, _flags, value) {
		date.setFullYear(value, 0, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"G",
		"y",
		"Y",
		"R",
		"w",
		"I",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/QuarterParser.mjs
var QuarterParser = class extends Parser {
	priority = 120;
	parse(dateString, token, match) {
		switch (token) {
			case "Q":
			case "QQ": return parseNDigits(token.length, dateString);
			case "Qo": return match.ordinalNumber(dateString, { unit: "quarter" });
			case "QQQ": return match.quarter(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.quarter(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "QQQQQ": return match.quarter(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.quarter(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.quarter(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.quarter(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 4;
	}
	set(date, _flags, value) {
		date.setMonth((value - 1) * 3, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"Y",
		"R",
		"q",
		"M",
		"L",
		"w",
		"I",
		"d",
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/StandAloneQuarterParser.mjs
var StandAloneQuarterParser = class extends Parser {
	priority = 120;
	parse(dateString, token, match) {
		switch (token) {
			case "q":
			case "qq": return parseNDigits(token.length, dateString);
			case "qo": return match.ordinalNumber(dateString, { unit: "quarter" });
			case "qqq": return match.quarter(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.quarter(dateString, {
				width: "narrow",
				context: "standalone"
			});
			case "qqqqq": return match.quarter(dateString, {
				width: "narrow",
				context: "standalone"
			});
			default: return match.quarter(dateString, {
				width: "wide",
				context: "standalone"
			}) || match.quarter(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.quarter(dateString, {
				width: "narrow",
				context: "standalone"
			});
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 4;
	}
	set(date, _flags, value) {
		date.setMonth((value - 1) * 3, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"Y",
		"R",
		"Q",
		"M",
		"L",
		"w",
		"I",
		"d",
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/MonthParser.mjs
var MonthParser = class extends Parser {
	incompatibleTokens = [
		"Y",
		"R",
		"q",
		"Q",
		"L",
		"w",
		"I",
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
	priority = 110;
	parse(dateString, token, match) {
		const valueCallback = (value) => value - 1;
		switch (token) {
			case "M": return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback);
			case "MM": return mapValue(parseNDigits(2, dateString), valueCallback);
			case "Mo": return mapValue(match.ordinalNumber(dateString, { unit: "month" }), valueCallback);
			case "MMM": return match.month(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.month(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "MMMMM": return match.month(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.month(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.month(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.month(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 11;
	}
	set(date, _flags, value) {
		date.setMonth(value, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/StandAloneMonthParser.mjs
var StandAloneMonthParser = class extends Parser {
	priority = 110;
	parse(dateString, token, match) {
		const valueCallback = (value) => value - 1;
		switch (token) {
			case "L": return mapValue(parseNumericPattern(numericPatterns.month, dateString), valueCallback);
			case "LL": return mapValue(parseNDigits(2, dateString), valueCallback);
			case "Lo": return mapValue(match.ordinalNumber(dateString, { unit: "month" }), valueCallback);
			case "LLL": return match.month(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.month(dateString, {
				width: "narrow",
				context: "standalone"
			});
			case "LLLLL": return match.month(dateString, {
				width: "narrow",
				context: "standalone"
			});
			default: return match.month(dateString, {
				width: "wide",
				context: "standalone"
			}) || match.month(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.month(dateString, {
				width: "narrow",
				context: "standalone"
			});
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 11;
	}
	set(date, _flags, value) {
		date.setMonth(value, 1);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"Y",
		"R",
		"q",
		"Q",
		"M",
		"w",
		"I",
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/setWeek.mjs
/**
* The {@link setWeek} function options.
*/
/**
* @name setWeek
* @category Week Helpers
* @summary Set the local week to the given date.
*
* @description
* Set the local week to the given date, saving the weekday number.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param week - The week of the new date
* @param options - An object with options
*
* @returns The new date with the local week set
*
* @example
* // Set the 1st week to 2 January 2005 with default options:
* const result = setWeek(new Date(2005, 0, 2), 1)
* //=> Sun Dec 26 2004 00:00:00
*
* @example
* // Set the 1st week to 2 January 2005,
* // if Monday is the first day of the week,
* // and the first week of the year always contains 4 January:
* const result = setWeek(new Date(2005, 0, 2), 1, {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> Sun Jan 4 2004 00:00:00
*/
function setWeek(date, week, options) {
	const _date = toDate(date);
	const diff = getWeek(_date, options) - week;
	_date.setDate(_date.getDate() - diff * 7);
	return _date;
}
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/LocalWeekParser.mjs
var LocalWeekParser = class extends Parser {
	priority = 100;
	parse(dateString, token, match) {
		switch (token) {
			case "w": return parseNumericPattern(numericPatterns.week, dateString);
			case "wo": return match.ordinalNumber(dateString, { unit: "week" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 53;
	}
	set(date, _flags, value, options) {
		return startOfWeek(setWeek(date, value, options), options);
	}
	incompatibleTokens = [
		"y",
		"R",
		"u",
		"q",
		"Q",
		"M",
		"L",
		"I",
		"d",
		"D",
		"i",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/setISOWeek.mjs
/**
* @name setISOWeek
* @category ISO Week Helpers
* @summary Set the ISO week to the given date.
*
* @description
* Set the ISO week to the given date, saving the weekday number.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param week - The ISO week of the new date
*
* @returns The new date with the ISO week set
*
* @example
* // Set the 53rd ISO week to 7 August 2004:
* const result = setISOWeek(new Date(2004, 7, 7), 53)
* //=> Sat Jan 01 2005 00:00:00
*/
function setISOWeek(date, week) {
	const _date = toDate(date);
	const diff = getISOWeek(_date) - week;
	_date.setDate(_date.getDate() - diff * 7);
	return _date;
}
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ISOWeekParser.mjs
var ISOWeekParser = class extends Parser {
	priority = 100;
	parse(dateString, token, match) {
		switch (token) {
			case "I": return parseNumericPattern(numericPatterns.week, dateString);
			case "Io": return match.ordinalNumber(dateString, { unit: "week" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 53;
	}
	set(date, _flags, value) {
		return startOfISOWeek(setISOWeek(date, value));
	}
	incompatibleTokens = [
		"y",
		"Y",
		"u",
		"q",
		"Q",
		"M",
		"L",
		"w",
		"d",
		"D",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/DateParser.mjs
var DAYS_IN_MONTH = [
	31,
	28,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
var DAYS_IN_MONTH_LEAP_YEAR = [
	31,
	29,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
var DateParser = class extends Parser {
	priority = 90;
	subPriority = 1;
	parse(dateString, token, match) {
		switch (token) {
			case "d": return parseNumericPattern(numericPatterns.date, dateString);
			case "do": return match.ordinalNumber(dateString, { unit: "date" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(date, value) {
		const isLeapYear = isLeapYearIndex$1(date.getFullYear());
		const month = date.getMonth();
		if (isLeapYear) return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
		else return value >= 1 && value <= DAYS_IN_MONTH[month];
	}
	set(date, _flags, value) {
		date.setDate(value);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"Y",
		"R",
		"q",
		"Q",
		"w",
		"I",
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/DayOfYearParser.mjs
var DayOfYearParser = class extends Parser {
	priority = 90;
	subpriority = 1;
	parse(dateString, token, match) {
		switch (token) {
			case "D":
			case "DD": return parseNumericPattern(numericPatterns.dayOfYear, dateString);
			case "Do": return match.ordinalNumber(dateString, { unit: "date" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(date, value) {
		if (isLeapYearIndex$1(date.getFullYear())) return value >= 1 && value <= 366;
		else return value >= 1 && value <= 365;
	}
	set(date, _flags, value) {
		date.setMonth(0, value);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"Y",
		"R",
		"q",
		"Q",
		"M",
		"L",
		"w",
		"I",
		"d",
		"E",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/setDay.mjs
/**
* The {@link setDay} function options.
*/
/**
* @name setDay
* @category Weekday Helpers
* @summary Set the day of the week to the given date.
*
* @description
* Set the day of the week to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param day - The day of the week of the new date
* @param options - An object with options.
*
* @returns The new date with the day of the week set
*
* @example
* // Set week day to Sunday, with the default weekStartsOn of Sunday:
* const result = setDay(new Date(2014, 8, 1), 0)
* //=> Sun Aug 31 2014 00:00:00
*
* @example
* // Set week day to Sunday, with a weekStartsOn of Monday:
* const result = setDay(new Date(2014, 8, 1), 0, { weekStartsOn: 1 })
* //=> Sun Sep 07 2014 00:00:00
*/
function setDay(date, day, options) {
	const defaultOptions = getDefaultOptions$1();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const _date = toDate(date);
	const currentDay = _date.getDay();
	const dayIndex = (day % 7 + 7) % 7;
	const delta = 7 - weekStartsOn;
	return addDays(_date, day < 0 || day > 6 ? day - (currentDay + delta) % 7 : (dayIndex + delta) % 7 - (currentDay + delta) % 7);
}
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/DayParser.mjs
var DayParser = class extends Parser {
	priority = 90;
	parse(dateString, token, match) {
		switch (token) {
			case "E":
			case "EE":
			case "EEE": return match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "EEEEE": return match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "EEEEEE": return match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.day(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 6;
	}
	set(date, _flags, value, options) {
		date = setDay(date, value, options);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"D",
		"i",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/LocalDayParser.mjs
var LocalDayParser = class extends Parser {
	priority = 90;
	parse(dateString, token, match, options) {
		const valueCallback = (value) => {
			const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
			return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
		};
		switch (token) {
			case "e":
			case "ee": return mapValue(parseNDigits(token.length, dateString), valueCallback);
			case "eo": return mapValue(match.ordinalNumber(dateString, { unit: "day" }), valueCallback);
			case "eee": return match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "eeeee": return match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "eeeeee": return match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.day(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 6;
	}
	set(date, _flags, value, options) {
		date = setDay(date, value, options);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"y",
		"R",
		"u",
		"q",
		"Q",
		"M",
		"L",
		"I",
		"d",
		"D",
		"E",
		"i",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/StandAloneLocalDayParser.mjs
var StandAloneLocalDayParser = class extends Parser {
	priority = 90;
	parse(dateString, token, match, options) {
		const valueCallback = (value) => {
			const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
			return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
		};
		switch (token) {
			case "c":
			case "cc": return mapValue(parseNDigits(token.length, dateString), valueCallback);
			case "co": return mapValue(match.ordinalNumber(dateString, { unit: "day" }), valueCallback);
			case "ccc": return match.day(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.day(dateString, {
				width: "short",
				context: "standalone"
			}) || match.day(dateString, {
				width: "narrow",
				context: "standalone"
			});
			case "ccccc": return match.day(dateString, {
				width: "narrow",
				context: "standalone"
			});
			case "cccccc": return match.day(dateString, {
				width: "short",
				context: "standalone"
			}) || match.day(dateString, {
				width: "narrow",
				context: "standalone"
			});
			default: return match.day(dateString, {
				width: "wide",
				context: "standalone"
			}) || match.day(dateString, {
				width: "abbreviated",
				context: "standalone"
			}) || match.day(dateString, {
				width: "short",
				context: "standalone"
			}) || match.day(dateString, {
				width: "narrow",
				context: "standalone"
			});
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 6;
	}
	set(date, _flags, value, options) {
		date = setDay(date, value, options);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"y",
		"R",
		"u",
		"q",
		"Q",
		"M",
		"L",
		"I",
		"d",
		"D",
		"E",
		"i",
		"e",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/setISODay.mjs
/**
* @name setISODay
* @category Weekday Helpers
* @summary Set the day of the ISO week to the given date.
*
* @description
* Set the day of the ISO week to the given date.
* ISO week starts with Monday.
* 7 is the index of Sunday, 1 is the index of Monday etc.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param day - The day of the ISO week of the new date
*
* @returns The new date with the day of the ISO week set
*
* @example
* // Set Sunday to 1 September 2014:
* const result = setISODay(new Date(2014, 8, 1), 7)
* //=> Sun Sep 07 2014 00:00:00
*/
function setISODay(date, day) {
	const _date = toDate(date);
	return addDays(_date, day - getISODay(_date));
}
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ISODayParser.mjs
var ISODayParser = class extends Parser {
	priority = 90;
	parse(dateString, token, match) {
		const valueCallback = (value) => {
			if (value === 0) return 7;
			return value;
		};
		switch (token) {
			case "i":
			case "ii": return parseNDigits(token.length, dateString);
			case "io": return match.ordinalNumber(dateString, { unit: "day" });
			case "iii": return mapValue(match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			}), valueCallback);
			case "iiiii": return mapValue(match.day(dateString, {
				width: "narrow",
				context: "formatting"
			}), valueCallback);
			case "iiiiii": return mapValue(match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			}), valueCallback);
			default: return mapValue(match.day(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.day(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.day(dateString, {
				width: "short",
				context: "formatting"
			}) || match.day(dateString, {
				width: "narrow",
				context: "formatting"
			}), valueCallback);
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 7;
	}
	set(date, _flags, value) {
		date = setISODay(date, value);
		date.setHours(0, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"y",
		"Y",
		"u",
		"q",
		"Q",
		"M",
		"L",
		"w",
		"d",
		"D",
		"E",
		"e",
		"c",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/AMPMParser.mjs
var AMPMParser = class extends Parser {
	priority = 80;
	parse(dateString, token, match) {
		switch (token) {
			case "a":
			case "aa":
			case "aaa": return match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "aaaaa": return match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.dayPeriod(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	set(date, _flags, value) {
		date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"b",
		"B",
		"H",
		"k",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/AMPMMidnightParser.mjs
var AMPMMidnightParser = class extends Parser {
	priority = 80;
	parse(dateString, token, match) {
		switch (token) {
			case "b":
			case "bb":
			case "bbb": return match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "bbbbb": return match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.dayPeriod(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	set(date, _flags, value) {
		date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"a",
		"B",
		"H",
		"k",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/DayPeriodParser.mjs
var DayPeriodParser = class extends Parser {
	priority = 80;
	parse(dateString, token, match) {
		switch (token) {
			case "B":
			case "BB":
			case "BBB": return match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			case "BBBBB": return match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
			default: return match.dayPeriod(dateString, {
				width: "wide",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "abbreviated",
				context: "formatting"
			}) || match.dayPeriod(dateString, {
				width: "narrow",
				context: "formatting"
			});
		}
	}
	set(date, _flags, value) {
		date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"a",
		"b",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/Hour1to12Parser.mjs
var Hour1to12Parser = class extends Parser {
	priority = 70;
	parse(dateString, token, match) {
		switch (token) {
			case "h": return parseNumericPattern(numericPatterns.hour12h, dateString);
			case "ho": return match.ordinalNumber(dateString, { unit: "hour" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 12;
	}
	set(date, _flags, value) {
		const isPM = date.getHours() >= 12;
		if (isPM && value < 12) date.setHours(value + 12, 0, 0, 0);
		else if (!isPM && value === 12) date.setHours(0, 0, 0, 0);
		else date.setHours(value, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"H",
		"K",
		"k",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/Hour0to23Parser.mjs
var Hour0to23Parser = class extends Parser {
	priority = 70;
	parse(dateString, token, match) {
		switch (token) {
			case "H": return parseNumericPattern(numericPatterns.hour23h, dateString);
			case "Ho": return match.ordinalNumber(dateString, { unit: "hour" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 23;
	}
	set(date, _flags, value) {
		date.setHours(value, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"a",
		"b",
		"h",
		"K",
		"k",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/Hour0To11Parser.mjs
var Hour0To11Parser = class extends Parser {
	priority = 70;
	parse(dateString, token, match) {
		switch (token) {
			case "K": return parseNumericPattern(numericPatterns.hour11h, dateString);
			case "Ko": return match.ordinalNumber(dateString, { unit: "hour" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 11;
	}
	set(date, _flags, value) {
		if (date.getHours() >= 12 && value < 12) date.setHours(value + 12, 0, 0, 0);
		else date.setHours(value, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"h",
		"H",
		"k",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/Hour1To24Parser.mjs
var Hour1To24Parser = class extends Parser {
	priority = 70;
	parse(dateString, token, match) {
		switch (token) {
			case "k": return parseNumericPattern(numericPatterns.hour24h, dateString);
			case "ko": return match.ordinalNumber(dateString, { unit: "hour" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 1 && value <= 24;
	}
	set(date, _flags, value) {
		const hours = value <= 24 ? value % 24 : value;
		date.setHours(hours, 0, 0, 0);
		return date;
	}
	incompatibleTokens = [
		"a",
		"b",
		"h",
		"H",
		"K",
		"t",
		"T"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/MinuteParser.mjs
var MinuteParser = class extends Parser {
	priority = 60;
	parse(dateString, token, match) {
		switch (token) {
			case "m": return parseNumericPattern(numericPatterns.minute, dateString);
			case "mo": return match.ordinalNumber(dateString, { unit: "minute" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 59;
	}
	set(date, _flags, value) {
		date.setMinutes(value, 0, 0);
		return date;
	}
	incompatibleTokens = ["t", "T"];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/SecondParser.mjs
var SecondParser = class extends Parser {
	priority = 50;
	parse(dateString, token, match) {
		switch (token) {
			case "s": return parseNumericPattern(numericPatterns.second, dateString);
			case "so": return match.ordinalNumber(dateString, { unit: "second" });
			default: return parseNDigits(token.length, dateString);
		}
	}
	validate(_date, value) {
		return value >= 0 && value <= 59;
	}
	set(date, _flags, value) {
		date.setSeconds(value, 0);
		return date;
	}
	incompatibleTokens = ["t", "T"];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/FractionOfSecondParser.mjs
var FractionOfSecondParser = class extends Parser {
	priority = 30;
	parse(dateString, token) {
		const valueCallback = (value) => Math.trunc(value * Math.pow(10, -token.length + 3));
		return mapValue(parseNDigits(token.length, dateString), valueCallback);
	}
	set(date, _flags, value) {
		date.setMilliseconds(value);
		return date;
	}
	incompatibleTokens = ["t", "T"];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ISOTimezoneWithZParser.mjs
var ISOTimezoneWithZParser = class extends Parser {
	priority = 10;
	parse(dateString, token) {
		switch (token) {
			case "X": return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
			case "XX": return parseTimezonePattern(timezonePatterns.basic, dateString);
			case "XXXX": return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
			case "XXXXX": return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
			default: return parseTimezonePattern(timezonePatterns.extended, dateString);
		}
	}
	set(date, flags, value) {
		if (flags.timestampIsSet) return date;
		return constructFrom(date, date.getTime() - getTimezoneOffsetInMilliseconds(date) - value);
	}
	incompatibleTokens = [
		"t",
		"T",
		"x"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/ISOTimezoneParser.mjs
var ISOTimezoneParser = class extends Parser {
	priority = 10;
	parse(dateString, token) {
		switch (token) {
			case "x": return parseTimezonePattern(timezonePatterns.basicOptionalMinutes, dateString);
			case "xx": return parseTimezonePattern(timezonePatterns.basic, dateString);
			case "xxxx": return parseTimezonePattern(timezonePatterns.basicOptionalSeconds, dateString);
			case "xxxxx": return parseTimezonePattern(timezonePatterns.extendedOptionalSeconds, dateString);
			default: return parseTimezonePattern(timezonePatterns.extended, dateString);
		}
	}
	set(date, flags, value) {
		if (flags.timestampIsSet) return date;
		return constructFrom(date, date.getTime() - getTimezoneOffsetInMilliseconds(date) - value);
	}
	incompatibleTokens = [
		"t",
		"T",
		"X"
	];
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/TimestampSecondsParser.mjs
var TimestampSecondsParser = class extends Parser {
	priority = 40;
	parse(dateString) {
		return parseAnyDigitsSigned(dateString);
	}
	set(date, _flags, value) {
		return [constructFrom(date, value * 1e3), { timestampIsSet: true }];
	}
	incompatibleTokens = "*";
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers/TimestampMillisecondsParser.mjs
var TimestampMillisecondsParser = class extends Parser {
	priority = 20;
	parse(dateString) {
		return parseAnyDigitsSigned(dateString);
	}
	set(date, _flags, value) {
		return [constructFrom(date, value), { timestampIsSet: true }];
	}
	incompatibleTokens = "*";
};
//#endregion
//#region node_modules/date-fns/parse/_lib/parsers.mjs
var parsers = {
	G: new EraParser(),
	y: new YearParser(),
	Y: new LocalWeekYearParser(),
	R: new ISOWeekYearParser(),
	u: new ExtendedYearParser(),
	Q: new QuarterParser(),
	q: new StandAloneQuarterParser(),
	M: new MonthParser(),
	L: new StandAloneMonthParser(),
	w: new LocalWeekParser(),
	I: new ISOWeekParser(),
	d: new DateParser(),
	D: new DayOfYearParser(),
	E: new DayParser(),
	e: new LocalDayParser(),
	c: new StandAloneLocalDayParser(),
	i: new ISODayParser(),
	a: new AMPMParser(),
	b: new AMPMMidnightParser(),
	B: new DayPeriodParser(),
	h: new Hour1to12Parser(),
	H: new Hour0to23Parser(),
	K: new Hour0To11Parser(),
	k: new Hour1To24Parser(),
	m: new MinuteParser(),
	s: new SecondParser(),
	S: new FractionOfSecondParser(),
	X: new ISOTimezoneWithZParser(),
	x: new ISOTimezoneParser(),
	t: new TimestampSecondsParser(),
	T: new TimestampMillisecondsParser()
};
//#endregion
//#region node_modules/date-fns/parse.mjs
/**
* The {@link parse} function options.
*/
var formattingTokensRegExp$1 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp$1 = /^'([^]*?)'?$/;
var doubleQuoteRegExp$1 = /''/g;
var notWhitespaceRegExp = /\S/;
var unescapedLatinCharacterRegExp$1 = /[a-zA-Z]/;
/**
* @name parse
* @category Common Helpers
* @summary Parse the date.
*
* @description
* Return the date parsed from string using the given format string.
*
* > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
* > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* The characters in the format string wrapped between two single quotes characters (') are escaped.
* Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
*
* Format of the format string is based on Unicode Technical Standard #35:
* https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
* with a few additions (see note 5 below the table).
*
* Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
* and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
*
* ```javascript
* parse('23 AM', 'HH a', new Date())
* //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
* ```
*
* See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
*
* Accepted format string patterns:
* | Unit                            |Prior| Pattern | Result examples                   | Notes |
* |---------------------------------|-----|---------|-----------------------------------|-------|
* | Era                             | 140 | G..GGG  | AD, BC                            |       |
* |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
* |                                 |     | GGGGG   | A, B                              |       |
* | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
* |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
* |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
* |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
* |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
* |                                 |     | yyyyy   | ...                               | 2,4   |
* | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
* |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
* |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
* |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
* |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
* |                                 |     | YYYYY   | ...                               | 2,4   |
* | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
* |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
* |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
* |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
* |                                 |     | RRRRR   | ...                               | 2,4,5 |
* | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
* |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
* |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
* |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
* |                                 |     | uuuuu   | ...                               | 2,4   |
* | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
* |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
* |                                 |     | QQ      | 01, 02, 03, 04                    |       |
* |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
* |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
* | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
* |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
* |                                 |     | qq      | 01, 02, 03, 04                    |       |
* |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
* |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
* | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
* |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
* |                                 |     | MM      | 01, 02, ..., 12                   |       |
* |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
* |                                 |     | MMMM    | January, February, ..., December  | 2     |
* |                                 |     | MMMMM   | J, F, ..., D                      |       |
* | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
* |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
* |                                 |     | LL      | 01, 02, ..., 12                   |       |
* |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
* |                                 |     | LLLL    | January, February, ..., December  | 2     |
* |                                 |     | LLLLL   | J, F, ..., D                      |       |
* | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
* |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
* |                                 |     | ww      | 01, 02, ..., 53                   |       |
* | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
* |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
* |                                 |     | II      | 01, 02, ..., 53                   | 5     |
* | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
* |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
* |                                 |     | dd      | 01, 02, ..., 31                   |       |
* | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
* |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
* |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
* |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
* |                                 |     | DDDD    | ...                               | 2     |
* | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
* |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
* |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
* |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
* |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
* |                                 |     | iii     | Mon, Tue, Wed, ..., Sun           | 5     |
* |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
* |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
* |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 5     |
* | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
* |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
* |                                 |     | ee      | 02, 03, ..., 01                   |       |
* |                                 |     | eee     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
* |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
* |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
* |                                 |     | cc      | 02, 03, ..., 01                   |       |
* |                                 |     | ccc     | Mon, Tue, Wed, ..., Sun           |       |
* |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
* |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
* |                                 |     | aaaa    | a.m., p.m.                        | 2     |
* |                                 |     | aaaaa   | a, p                              |       |
* | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
* |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
* |                                 |     | bbbbb   | a, p, n, mi                       |       |
* | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
* |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
* |                                 |     | BBBBB   | at night, in the morning, ...     |       |
* | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
* |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
* |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
* | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
* |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
* |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
* | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
* |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
* |                                 |     | KK      | 01, 02, ..., 11, 00               |       |
* | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
* |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
* |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
* | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
* |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
* |                                 |     | mm      | 00, 01, ..., 59                   |       |
* | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
* |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
* |                                 |     | ss      | 00, 01, ..., 59                   |       |
* | Seconds timestamp               |  40 | t       | 512969520                         |       |
* |                                 |     | tt      | ...                               | 2     |
* | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
* |                                 |     | SS      | 00, 01, ..., 99                   |       |
* |                                 |     | SSS     | 000, 001, ..., 999                |       |
* |                                 |     | SSSS    | ...                               | 2     |
* | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
* |                                 |     | TT      | ...                               | 2     |
* | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
* |                                 |     | XX      | -0800, +0530, Z                   |       |
* |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
* |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
* |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
* | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
* |                                 |     | xx      | -0800, +0530, +0000               |       |
* |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
* |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
* |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
* | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
* |                                 |     | PP      | May 29, 1453                      |       |
* |                                 |     | PPP     | May 29th, 1453                    |       |
* |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
* | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
* |                                 |     | pp      | 12:00:00 AM                       |       |
* | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
* |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
* |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
* |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
* Notes:
* 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
*    are the same as "stand-alone" units, but are different in some languages.
*    "Formatting" units are declined according to the rules of the language
*    in the context of a date. "Stand-alone" units are always nominative singular.
*    In `format` function, they will produce different result:
*
*    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
*
*    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
*
*    `parse` will try to match both formatting and stand-alone units interchangably.
*
* 2. Any sequence of the identical letters is a pattern, unless it is escaped by
*    the single quote characters (see below).
*    If the sequence is longer than listed in table:
*    - for numerical units (`yyyyyyyy`) `parse` will try to match a number
*      as wide as the sequence
*    - for text units (`MMMMMMMM`) `parse` will try to match the widest variation of the unit.
*      These variations are marked with "2" in the last column of the table.
*
* 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
*    These tokens represent the shortest form of the quarter.
*
* 4. The main difference between `y` and `u` patterns are B.C. years:
*
*    | Year | `y` | `u` |
*    |------|-----|-----|
*    | AC 1 |   1 |   1 |
*    | BC 1 |   1 |   0 |
*    | BC 2 |   2 |  -1 |
*
*    Also `yy` will try to guess the century of two digit year by proximity with `referenceDate`:
*
*    `parse('50', 'yy', new Date(2018, 0, 1)) //=> Sat Jan 01 2050 00:00:00`
*
*    `parse('75', 'yy', new Date(2018, 0, 1)) //=> Wed Jan 01 1975 00:00:00`
*
*    while `uu` will just assign the year as is:
*
*    `parse('50', 'uu', new Date(2018, 0, 1)) //=> Sat Jan 01 0050 00:00:00`
*
*    `parse('75', 'uu', new Date(2018, 0, 1)) //=> Tue Jan 01 0075 00:00:00`
*
*    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
*    except local week-numbering years are dependent on `options.weekStartsOn`
*    and `options.firstWeekContainsDate` (compare [setISOWeekYear](https://date-fns.org/docs/setISOWeekYear)
*    and [setWeekYear](https://date-fns.org/docs/setWeekYear)).
*
* 5. These patterns are not in the Unicode Technical Standard #35:
*    - `i`: ISO day of week
*    - `I`: ISO week of year
*    - `R`: ISO week-numbering year
*    - `o`: ordinal number modifier
*    - `P`: long localized date
*    - `p`: long localized time
*
* 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
*    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 7. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
*    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
*    on the given locale.
*
*    using `en-US` locale: `P` => `MM/dd/yyyy`
*    using `en-US` locale: `p` => `hh:mm a`
*    using `pt-BR` locale: `P` => `dd/MM/yyyy`
*    using `pt-BR` locale: `p` => `HH:mm`
*
* Values will be assigned to the date in the descending order of its unit's priority.
* Units of an equal priority overwrite each other in the order of appearance.
*
* If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
* the values will be taken from 3rd argument `referenceDate` which works as a context of parsing.
*
* `referenceDate` must be passed for correct work of the function.
* If you're not sure which `referenceDate` to supply, create a new instance of Date:
* `parse('02/11/2014', 'MM/dd/yyyy', new Date())`
* In this case parsing will be done in the context of the current date.
* If `referenceDate` is `Invalid Date` or a value not convertible to valid `Date`,
* then `Invalid Date` will be returned.
*
* The result may vary by locale.
*
* If `formatString` matches with `dateString` but does not provides tokens, `referenceDate` will be returned.
*
* If parsing failed, `Invalid Date` will be returned.
* Invalid Date is a Date, whose time value is NaN.
* Time value of Date: http://es5.github.io/#x15.9.1.1
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateStr - The string to parse
* @param formatStr - The string of tokens
* @param referenceDate - defines values missing from the parsed dateString
* @param options - An object with options.
*   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* @returns The parsed date
*
* @throws `options.locale` must contain `match` property
* @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws format string contains an unescaped latin alphabet character
*
* @example
* // Parse 11 February 2014 from middle-endian format:
* var result = parse('02/11/2014', 'MM/dd/yyyy', new Date())
* //=> Tue Feb 11 2014 00:00:00
*
* @example
* // Parse 28th of February in Esperanto locale in the context of 2010 year:
* import eo from 'date-fns/locale/eo'
* var result = parse('28-a de februaro', "do 'de' MMMM", new Date(2010, 0, 1), {
*   locale: eo
* })
* //=> Sun Feb 28 2010 00:00:00
*/
function parse(dateStr, formatStr, referenceDate, options) {
	const defaultOptions = getDefaultOptions();
	const locale = options?.locale ?? defaultOptions.locale ?? enUS;
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	if (formatStr === "") if (dateStr === "") return toDate(referenceDate);
	else return constructFrom(referenceDate, NaN);
	const subFnOptions = {
		firstWeekContainsDate,
		weekStartsOn,
		locale
	};
	const setters = [new DateToSystemTimezoneSetter()];
	const tokens = formatStr.match(longFormattingTokensRegExp).map((substring) => {
		const firstCharacter = substring[0];
		if (firstCharacter in longFormatters) {
			const longFormatter = longFormatters[firstCharacter];
			return longFormatter(substring, locale.formatLong);
		}
		return substring;
	}).join("").match(formattingTokensRegExp$1);
	const usedTokens = [];
	for (let token of tokens) {
		if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token)) warnOrThrowProtectedError(token, formatStr, dateStr);
		if (!options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) warnOrThrowProtectedError(token, formatStr, dateStr);
		const firstCharacter = token[0];
		const parser = parsers[firstCharacter];
		if (parser) {
			const { incompatibleTokens } = parser;
			if (Array.isArray(incompatibleTokens)) {
				const incompatibleToken = usedTokens.find((usedToken) => incompatibleTokens.includes(usedToken.token) || usedToken.token === firstCharacter);
				if (incompatibleToken) throw new RangeError(`The format string mustn't contain \`${incompatibleToken.fullToken}\` and \`${token}\` at the same time`);
			} else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) throw new RangeError(`The format string mustn't contain \`${token}\` and any other token at the same time`);
			usedTokens.push({
				token: firstCharacter,
				fullToken: token
			});
			const parseResult = parser.run(dateStr, token, locale.match, subFnOptions);
			if (!parseResult) return constructFrom(referenceDate, NaN);
			setters.push(parseResult.setter);
			dateStr = parseResult.rest;
		} else {
			if (firstCharacter.match(unescapedLatinCharacterRegExp$1)) throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
			if (token === "''") token = "'";
			else if (firstCharacter === "'") token = cleanEscapedString$1(token);
			if (dateStr.indexOf(token) === 0) dateStr = dateStr.slice(token.length);
			else return constructFrom(referenceDate, NaN);
		}
	}
	if (dateStr.length > 0 && notWhitespaceRegExp.test(dateStr)) return constructFrom(referenceDate, NaN);
	const uniquePrioritySetters = setters.map((setter) => setter.priority).sort((a, b) => b - a).filter((priority, index, array) => array.indexOf(priority) === index).map((priority) => setters.filter((setter) => setter.priority === priority).sort((a, b) => b.subPriority - a.subPriority)).map((setterArray) => setterArray[0]);
	let date = toDate(referenceDate);
	if (isNaN(date.getTime())) return constructFrom(referenceDate, NaN);
	const flags = {};
	for (const setter of uniquePrioritySetters) {
		if (!setter.validate(date, subFnOptions)) return constructFrom(referenceDate, NaN);
		const result = setter.set(date, flags, subFnOptions);
		if (Array.isArray(result)) {
			date = result[0];
			Object.assign(flags, result[1]);
		} else date = result;
	}
	return constructFrom(referenceDate, date);
}
function cleanEscapedString$1(input) {
	return input.match(escapedStringRegExp$1)[1].replace(doubleQuoteRegExp$1, "'");
}
//#endregion
//#region node_modules/date-fns/isMatch.mjs
/**
* The {@link isMatch} function options.
*/
/**
* @name isMatch
* @category Common Helpers
* @summary validates the date string against given formats
*
* @description
* Return the true if given date is string correct against the given format else
* will return false.
*
* > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
* > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* The characters in the format string wrapped between two single quotes characters (') are escaped.
* Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
*
* Format of the format string is based on Unicode Technical Standard #35:
* https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
* with a few additions (see note 5 below the table).
*
* Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
* and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
*
* ```javascript
* isMatch('23 AM', 'HH a')
* //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
* ```
*
* See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
*
* Accepted format string patterns:
* | Unit                            |Prior| Pattern | Result examples                   | Notes |
* |---------------------------------|-----|---------|-----------------------------------|-------|
* | Era                             | 140 | G..GGG  | AD, BC                            |       |
* |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
* |                                 |     | GGGGG   | A, B                              |       |
* | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
* |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
* |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
* |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
* |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
* |                                 |     | yyyyy   | ...                               | 2,4   |
* | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
* |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
* |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
* |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
* |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
* |                                 |     | YYYYY   | ...                               | 2,4   |
* | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
* |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
* |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
* |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
* |                                 |     | RRRRR   | ...                               | 2,4,5 |
* | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
* |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
* |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
* |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
* |                                 |     | uuuuu   | ...                               | 2,4   |
* | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
* |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
* |                                 |     | QQ      | 01, 02, 03, 04                    |       |
* |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
* |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
* | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
* |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
* |                                 |     | qq      | 01, 02, 03, 04                    |       |
* |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
* |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
* |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
* | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
* |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
* |                                 |     | MM      | 01, 02, ..., 12                   |       |
* |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
* |                                 |     | MMMM    | January, February, ..., December  | 2     |
* |                                 |     | MMMMM   | J, F, ..., D                      |       |
* | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
* |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
* |                                 |     | LL      | 01, 02, ..., 12                   |       |
* |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
* |                                 |     | LLLL    | January, February, ..., December  | 2     |
* |                                 |     | LLLLL   | J, F, ..., D                      |       |
* | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
* |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
* |                                 |     | ww      | 01, 02, ..., 53                   |       |
* | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
* |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
* |                                 |     | II      | 01, 02, ..., 53                   | 5     |
* | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
* |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
* |                                 |     | dd      | 01, 02, ..., 31                   |       |
* | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
* |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
* |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
* |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
* |                                 |     | DDDD    | ...                               | 2     |
* | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
* |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
* |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
* |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
* |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
* |                                 |     | iii     | Mon, Tue, Wed, ..., Su            | 5     |
* |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
* |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
* |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 5     |
* | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
* |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
* |                                 |     | ee      | 02, 03, ..., 01                   |       |
* |                                 |     | eee     | Mon, Tue, Wed, ..., Su            |       |
* |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
* |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
* |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
* |                                 |     | cc      | 02, 03, ..., 01                   |       |
* |                                 |     | ccc     | Mon, Tue, Wed, ..., Su            |       |
* |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
* |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
* |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
* | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
* |                                 |     | aaaa    | a.m., p.m.                        | 2     |
* |                                 |     | aaaaa   | a, p                              |       |
* | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
* |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
* |                                 |     | bbbbb   | a, p, n, mi                       |       |
* | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
* |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
* |                                 |     | BBBBB   | at night, in the morning, ...     |       |
* | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
* |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
* |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
* | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
* |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
* |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
* | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
* |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
* |                                 |     | KK      | 01, 02, ..., 11, 00               |       |
* | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
* |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
* |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
* | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
* |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
* |                                 |     | mm      | 00, 01, ..., 59                   |       |
* | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
* |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
* |                                 |     | ss      | 00, 01, ..., 59                   |       |
* | Seconds timestamp               |  40 | t       | 512969520                         |       |
* |                                 |     | tt      | ...                               | 2     |
* | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
* |                                 |     | SS      | 00, 01, ..., 99                   |       |
* |                                 |     | SSS     | 000, 001, ..., 999                |       |
* |                                 |     | SSSS    | ...                               | 2     |
* | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
* |                                 |     | TT      | ...                               | 2     |
* | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
* |                                 |     | XX      | -0800, +0530, Z                   |       |
* |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
* |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
* |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
* | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
* |                                 |     | xx      | -0800, +0530, +0000               |       |
* |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
* |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
* |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
* | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
* |                                 |     | PP      | May 29, 1453                      |       |
* |                                 |     | PPP     | May 29th, 1453                    |       |
* |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
* | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
* |                                 |     | pp      | 12:00:00 AM                       |       |
* | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
* |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
* |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
* |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
* Notes:
* 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
*    are the same as "stand-alone" units, but are different in some languages.
*    "Formatting" units are declined according to the rules of the language
*    in the context of a date. "Stand-alone" units are always nominative singular.
*    In `format` function, they will produce different result:
*
*    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
*
*    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
*
*    `isMatch` will try to match both formatting and stand-alone units interchangably.
*
* 2. Any sequence of the identical letters is a pattern, unless it is escaped by
*    the single quote characters (see below).
*    If the sequence is longer than listed in table:
*    - for numerical units (`yyyyyyyy`) `isMatch` will try to match a number
*      as wide as the sequence
*    - for text units (`MMMMMMMM`) `isMatch` will try to match the widest variation of the unit.
*      These variations are marked with "2" in the last column of the table.
*
* 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
*    These tokens represent the shortest form of the quarter.
*
* 4. The main difference between `y` and `u` patterns are B.C. years:
*
*    | Year | `y` | `u` |
*    |------|-----|-----|
*    | AC 1 |   1 |   1 |
*    | BC 1 |   1 |   0 |
*    | BC 2 |   2 |  -1 |
*
*    Also `yy` will try to guess the century of two digit year by proximity with `referenceDate`:
*
*    `isMatch('50', 'yy') //=> true`
*
*    `isMatch('75', 'yy') //=> true`
*
*    while `uu` will use the year as is:
*
*    `isMatch('50', 'uu') //=> true`
*
*    `isMatch('75', 'uu') //=> true`
*
*    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
*    except local week-numbering years are dependent on `options.weekStartsOn`
*    and `options.firstWeekContainsDate` (compare [setISOWeekYear](https://date-fns.org/docs/setISOWeekYear)
*    and [setWeekYear](https://date-fns.org/docs/setWeekYear)).
*
* 5. These patterns are not in the Unicode Technical Standard #35:
*    - `i`: ISO day of week
*    - `I`: ISO week of year
*    - `R`: ISO week-numbering year
*    - `o`: ordinal number modifier
*    - `P`: long localized date
*    - `p`: long localized time
*
* 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
*    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 7. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
*    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
*    on the given locale.
*
*    using `en-US` locale: `P` => `MM/dd/yyyy`
*    using `en-US` locale: `p` => `hh:mm a`
*    using `pt-BR` locale: `P` => `dd/MM/yyyy`
*    using `pt-BR` locale: `p` => `HH:mm`
*
* Values will be checked in the descending order of its unit's priority.
* Units of an equal priority overwrite each other in the order of appearance.
*
* If no values of higher priority are matched (e.g. when matching string 'January 1st' without a year),
* the values will be taken from today's using `new Date()` date which works as a context of parsing.
*
* The result may vary by locale.
*
* If `formatString` matches with `dateString` but does not provides tokens, `referenceDate` will be returned.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateStr - The date string to verify
* @param format - The string of tokens
* @param options - An object with options.
*   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* @returns Is format string a match for date string?
*
* @throws `options.locale` must contain `match` property
* @throws use `yyyy` instead of `YYYY` for formatting years; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `yy` instead of `YY` for formatting years; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `d` instead of `D` for formatting days of the month; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws use `dd` instead of `DD` for formatting days of the month; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
* @throws format string contains an unescaped latin alphabet character
*
* @example
* // Match 11 February 2014 from middle-endian format:
* const result = isMatch('02/11/2014', 'MM/dd/yyyy')
* //=> true
*
* @example
* // Match 28th of February in Esperanto locale in the context of 2010 year:
* import eo from 'date-fns/locale/eo'
* const result = isMatch('28-a de februaro', "do 'de' MMMM", {
*   locale: eo
* })
* //=> true
*/
function isMatch(dateStr, formatStr, options) {
	return isValid(parse(dateStr, formatStr, /* @__PURE__ */ new Date(), options));
}
//#endregion
//#region node_modules/date-fns/isMonday.mjs
/**
* @name isMonday
* @category Weekday Helpers
* @summary Is the given date Monday?
*
* @description
* Is the given date Monday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Monday
*
* @example
* // Is 22 September 2014 Monday?
* const result = isMonday(new Date(2014, 8, 22))
* //=> true
*/
function isMonday(date) {
	return toDate(date).getDay() === 1;
}
//#endregion
//#region node_modules/date-fns/isPast.mjs
/**
* @name isPast
* @category Common Helpers
* @summary Is the given date in the past?
* @pure false
*
* @description
* Is the given date in the past?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in the past
*
* @example
* // If today is 6 October 2014, is 2 July 2014 in the past?
* const result = isPast(new Date(2014, 6, 2))
* //=> true
*/
function isPast(date) {
	return +toDate(date) < Date.now();
}
//#endregion
//#region node_modules/date-fns/startOfHour.mjs
/**
* @name startOfHour
* @category Hour Helpers
* @summary Return the start of an hour for the given date.
*
* @description
* Return the start of an hour for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of an hour
*
* @example
* // The start of an hour for 2 September 2014 11:55:00:
* const result = startOfHour(new Date(2014, 8, 2, 11, 55))
* //=> Tue Sep 02 2014 11:00:00
*/
function startOfHour(date) {
	const _date = toDate(date);
	_date.setMinutes(0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/isSameHour.mjs
/**
* @name isSameHour
* @category Hour Helpers
* @summary Are the given dates in the same hour (and same day)?
*
* @description
* Are the given dates in the same hour (and same day)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same hour (and same day)
*
* @example
* // Are 4 September 2014 06:00:00 and 4 September 06:30:00 in the same hour?
* const result = isSameHour(new Date(2014, 8, 4, 6, 0), new Date(2014, 8, 4, 6, 30))
* //=> true
*
* @example
* // Are 4 September 2014 06:00:00 and 5 September 06:00:00 in the same hour?
* const result = isSameHour(new Date(2014, 8, 4, 6, 0), new Date(2014, 8, 5, 6, 0))
* //=> false
*/
function isSameHour(dateLeft, dateRight) {
	const dateLeftStartOfHour = startOfHour(dateLeft);
	const dateRightStartOfHour = startOfHour(dateRight);
	return +dateLeftStartOfHour === +dateRightStartOfHour;
}
//#endregion
//#region node_modules/date-fns/isSameWeek.mjs
/**
* The {@link isSameWeek} function options.
*/
/**
* @name isSameWeek
* @category Week Helpers
* @summary Are the given dates in the same week (and month and year)?
*
* @description
* Are the given dates in the same week (and month and year)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
* @param options - An object with options
*
* @returns The dates are in the same week (and month and year)
*
* @example
* // Are 31 August 2014 and 4 September 2014 in the same week?
* const result = isSameWeek(new Date(2014, 7, 31), new Date(2014, 8, 4))
* //=> true
*
* @example
* // If week starts with Monday,
* // are 31 August 2014 and 4 September 2014 in the same week?
* const result = isSameWeek(new Date(2014, 7, 31), new Date(2014, 8, 4), {
*   weekStartsOn: 1
* })
* //=> false
*
* @example
* // Are 1 January 2014 and 1 January 2015 in the same week?
* const result = isSameWeek(new Date(2014, 0, 1), new Date(2015, 0, 1))
* //=> false
*/
function isSameWeek(dateLeft, dateRight, options) {
	const dateLeftStartOfWeek = startOfWeek(dateLeft, options);
	const dateRightStartOfWeek = startOfWeek(dateRight, options);
	return +dateLeftStartOfWeek === +dateRightStartOfWeek;
}
//#endregion
//#region node_modules/date-fns/isSameISOWeek.mjs
/**
* @name isSameISOWeek
* @category ISO Week Helpers
* @summary Are the given dates in the same ISO week (and year)?
*
* @description
* Are the given dates in the same ISO week (and year)?
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same ISO week (and year)
*
* @example
* // Are 1 September 2014 and 7 September 2014 in the same ISO week?
* const result = isSameISOWeek(new Date(2014, 8, 1), new Date(2014, 8, 7))
* //=> true
*
* @example
* // Are 1 September 2014 and 1 September 2015 in the same ISO week?
* const result = isSameISOWeek(new Date(2014, 8, 1), new Date(2015, 8, 1))
* //=> false
*/
function isSameISOWeek(dateLeft, dateRight) {
	return isSameWeek(dateLeft, dateRight, { weekStartsOn: 1 });
}
//#endregion
//#region node_modules/date-fns/isSameISOWeekYear.mjs
/**
* @name isSameISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Are the given dates in the same ISO week-numbering year?
*
* @description
* Are the given dates in the same ISO week-numbering year?
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same ISO week-numbering year
*
* @example
* // Are 29 December 2003 and 2 January 2005 in the same ISO week-numbering year?
* const result = isSameISOWeekYear(new Date(2003, 11, 29), new Date(2005, 0, 2))
* //=> true
*/
function isSameISOWeekYear(dateLeft, dateRight) {
	const dateLeftStartOfYear = startOfISOWeekYear(dateLeft);
	const dateRightStartOfYear = startOfISOWeekYear(dateRight);
	return +dateLeftStartOfYear === +dateRightStartOfYear;
}
//#endregion
//#region node_modules/date-fns/isSameMinute.mjs
/**
* @name isSameMinute
* @category Minute Helpers
* @summary Are the given dates in the same minute (and hour and day)?
*
* @description
* Are the given dates in the same minute (and hour and day)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same minute (and hour and day)
*
* @example
* // Are 4 September 2014 06:30:00 and 4 September 2014 06:30:15 in the same minute?
* const result = isSameMinute(
*   new Date(2014, 8, 4, 6, 30),
*   new Date(2014, 8, 4, 6, 30, 15)
* )
* //=> true
*
* @example
* // Are 4 September 2014 06:30:00 and 5 September 2014 06:30:00 in the same minute?
* const result = isSameMinute(
*   new Date(2014, 8, 4, 6, 30),
*   new Date(2014, 8, 5, 6, 30)
* )
* //=> false
*/
function isSameMinute(dateLeft, dateRight) {
	const dateLeftStartOfMinute = startOfMinute(dateLeft);
	const dateRightStartOfMinute = startOfMinute(dateRight);
	return +dateLeftStartOfMinute === +dateRightStartOfMinute;
}
//#endregion
//#region node_modules/date-fns/isSameMonth.mjs
/**
* @name isSameMonth
* @category Month Helpers
* @summary Are the given dates in the same month (and year)?
*
* @description
* Are the given dates in the same month (and year)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same month (and year)
*
* @example
* // Are 2 September 2014 and 25 September 2014 in the same month?
* const result = isSameMonth(new Date(2014, 8, 2), new Date(2014, 8, 25))
* //=> true
*
* @example
* // Are 2 September 2014 and 25 September 2015 in the same month?
* const result = isSameMonth(new Date(2014, 8, 2), new Date(2015, 8, 25))
* //=> false
*/
function isSameMonth(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	return _dateLeft.getFullYear() === _dateRight.getFullYear() && _dateLeft.getMonth() === _dateRight.getMonth();
}
//#endregion
//#region node_modules/date-fns/isSameQuarter.mjs
/**
* @name isSameQuarter
* @category Quarter Helpers
* @summary Are the given dates in the same quarter (and year)?
*
* @description
* Are the given dates in the same quarter (and year)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check

* @returns The dates are in the same quarter (and year)
*
* @example
* // Are 1 January 2014 and 8 March 2014 in the same quarter?
* const result = isSameQuarter(new Date(2014, 0, 1), new Date(2014, 2, 8))
* //=> true
*
* @example
* // Are 1 January 2014 and 1 January 2015 in the same quarter?
* const result = isSameQuarter(new Date(2014, 0, 1), new Date(2015, 0, 1))
* //=> false
*/
function isSameQuarter(dateLeft, dateRight) {
	const dateLeftStartOfQuarter = startOfQuarter(dateLeft);
	const dateRightStartOfQuarter = startOfQuarter(dateRight);
	return +dateLeftStartOfQuarter === +dateRightStartOfQuarter;
}
//#endregion
//#region node_modules/date-fns/startOfSecond.mjs
/**
* @name startOfSecond
* @category Second Helpers
* @summary Return the start of a second for the given date.
*
* @description
* Return the start of a second for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a second
*
* @example
* // The start of a second for 1 December 2014 22:15:45.400:
* const result = startOfSecond(new Date(2014, 11, 1, 22, 15, 45, 400))
* //=> Mon Dec 01 2014 22:15:45.000
*/
function startOfSecond(date) {
	const _date = toDate(date);
	_date.setMilliseconds(0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/isSameSecond.mjs
/**
* @name isSameSecond
* @category Second Helpers
* @summary Are the given dates in the same second (and hour and day)?
*
* @description
* Are the given dates in the same second (and hour and day)?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same second (and hour and day)
*
* @example
* // Are 4 September 2014 06:30:15.000 and 4 September 2014 06:30.15.500 in the same second?
* const result = isSameSecond(
*   new Date(2014, 8, 4, 6, 30, 15),
*   new Date(2014, 8, 4, 6, 30, 15, 500)
* )
* //=> true
*
* @example
* // Are 4 September 2014 06:00:15.000 and 4 September 2014 06:01.15.000 in the same second?
* const result = isSameSecond(
*   new Date(2014, 8, 4, 6, 0, 15),
*   new Date(2014, 8, 4, 6, 1, 15)
* )
* //=> false
*
* @example
* // Are 4 September 2014 06:00:15.000 and 5 September 2014 06:00.15.000 in the same second?
* const result = isSameSecond(
*   new Date(2014, 8, 4, 6, 0, 15),
*   new Date(2014, 8, 5, 6, 0, 15)
* )
* //=> false
*/
function isSameSecond(dateLeft, dateRight) {
	const dateLeftStartOfSecond = startOfSecond(dateLeft);
	const dateRightStartOfSecond = startOfSecond(dateRight);
	return +dateLeftStartOfSecond === +dateRightStartOfSecond;
}
//#endregion
//#region node_modules/date-fns/isSameYear.mjs
/**
* @name isSameYear
* @category Year Helpers
* @summary Are the given dates in the same year?
*
* @description
* Are the given dates in the same year?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param dateLeft - The first date to check
* @param dateRight - The second date to check
*
* @returns The dates are in the same year
*
* @example
* // Are 2 September 2014 and 25 September 2014 in the same year?
* const result = isSameYear(new Date(2014, 8, 2), new Date(2014, 8, 25))
* //=> true
*/
function isSameYear(dateLeft, dateRight) {
	const _dateLeft = toDate(dateLeft);
	const _dateRight = toDate(dateRight);
	return _dateLeft.getFullYear() === _dateRight.getFullYear();
}
//#endregion
//#region node_modules/date-fns/isThisHour.mjs
/**
* @name isThisHour
* @category Hour Helpers
* @summary Is the given date in the same hour as the current date?
* @pure false
*
* @description
* Is the given date in the same hour as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this hour
*
* @example
* // If now is 25 September 2014 18:30:15.500,
* // is 25 September 2014 18:00:00 in this hour?
* const result = isThisHour(new Date(2014, 8, 25, 18))
* //=> true
*/
function isThisHour(date) {
	return isSameHour(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisISOWeek.mjs
/**
* @name isThisISOWeek
* @category ISO Week Helpers
* @summary Is the given date in the same ISO week as the current date?
* @pure false
*
* @description
* Is the given date in the same ISO week as the current date?
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this ISO week
*
* @example
* // If today is 25 September 2014, is 22 September 2014 in this ISO week?
* const result = isThisISOWeek(new Date(2014, 8, 22))
* //=> true
*/
function isThisISOWeek(date) {
	return isSameISOWeek(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisMinute.mjs
/**
* @name isThisMinute
* @category Minute Helpers
* @summary Is the given date in the same minute as the current date?
* @pure false
*
* @description
* Is the given date in the same minute as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this minute
*
* @example
* // If now is 25 September 2014 18:30:15.500,
* // is 25 September 2014 18:30:00 in this minute?
* const result = isThisMinute(new Date(2014, 8, 25, 18, 30))
* //=> true
*/
function isThisMinute(date) {
	return isSameMinute(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisMonth.mjs
/**
* @name isThisMonth
* @category Month Helpers
* @summary Is the given date in the same month as the current date?
* @pure false
*
* @description
* Is the given date in the same month as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this month
*
* @example
* // If today is 25 September 2014, is 15 September 2014 in this month?
* const result = isThisMonth(new Date(2014, 8, 15))
* //=> true
*/
function isThisMonth(date) {
	return isSameMonth(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisQuarter.mjs
/**
* @name isThisQuarter
* @category Quarter Helpers
* @summary Is the given date in the same quarter as the current date?
* @pure false
*
* @description
* Is the given date in the same quarter as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this quarter
*
* @example
* // If today is 25 September 2014, is 2 July 2014 in this quarter?
* const result = isThisQuarter(new Date(2014, 6, 2))
* //=> true
*/
function isThisQuarter(date) {
	return isSameQuarter(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisSecond.mjs
/**
* @name isThisSecond
* @category Second Helpers
* @summary Is the given date in the same second as the current date?
* @pure false
*
* @description
* Is the given date in the same second as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this second
*
* @example
* // If now is 25 September 2014 18:30:15.500,
* // is 25 September 2014 18:30:15.000 in this second?
* const result = isThisSecond(new Date(2014, 8, 25, 18, 30, 15))
* //=> true
*/
function isThisSecond(date) {
	return isSameSecond(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThisWeek.mjs
/**
* The {@link isThisWeek} function options.
*/
/**
* @name isThisWeek
* @category Week Helpers
* @summary Is the given date in the same week as the current date?
* @pure false
*
* @description
* Is the given date in the same week as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
* @param options - The object with options
*
* @returns The date is in this week
*
* @example
* // If today is 25 September 2014, is 21 September 2014 in this week?
* const result = isThisWeek(new Date(2014, 8, 21))
* //=> true
*
* @example
* // If today is 25 September 2014 and week starts with Monday
* // is 21 September 2014 in this week?
* const result = isThisWeek(new Date(2014, 8, 21), { weekStartsOn: 1 })
* //=> false
*/
function isThisWeek(date, options) {
	return isSameWeek(date, constructNow(date), options);
}
//#endregion
//#region node_modules/date-fns/isThisYear.mjs
/**
* @name isThisYear
* @category Year Helpers
* @summary Is the given date in the same year as the current date?
* @pure false
*
* @description
* Is the given date in the same year as the current date?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is in this year
*
* @example
* // If today is 25 September 2014, is 2 July 2014 in this year?
* const result = isThisYear(new Date(2014, 6, 2))
* //=> true
*/
function isThisYear(date) {
	return isSameYear(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isThursday.mjs
/**
* @name isThursday
* @category Weekday Helpers
* @summary Is the given date Thursday?
*
* @description
* Is the given date Thursday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Thursday
*
* @example
* // Is 25 September 2014 Thursday?
* const result = isThursday(new Date(2014, 8, 25))
* //=> true
*/
function isThursday(date) {
	return toDate(date).getDay() === 4;
}
//#endregion
//#region node_modules/date-fns/isToday.mjs
/**
* @name isToday
* @category Day Helpers
* @summary Is the given date today?
* @pure false
*
* @description
* Is the given date today?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is today
*
* @example
* // If today is 6 October 2014, is 6 October 14:00:00 today?
* const result = isToday(new Date(2014, 9, 6, 14, 0))
* //=> true
*/
function isToday(date) {
	return isSameDay(date, constructNow(date));
}
//#endregion
//#region node_modules/date-fns/isTomorrow.mjs
/**
* @name isTomorrow
* @category Day Helpers
* @summary Is the given date tomorrow?
* @pure false
*
* @description
* Is the given date tomorrow?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is tomorrow
*
* @example
* // If today is 6 October 2014, is 7 October 14:00:00 tomorrow?
* const result = isTomorrow(new Date(2014, 9, 7, 14, 0))
* //=> true
*/
function isTomorrow(date) {
	return isSameDay(date, addDays(constructNow(date), 1));
}
//#endregion
//#region node_modules/date-fns/isTuesday.mjs
/**
* @name isTuesday
* @category Weekday Helpers
* @summary Is the given date Tuesday?
*
* @description
* Is the given date Tuesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Tuesday
*
* @example
* // Is 23 September 2014 Tuesday?
* const result = isTuesday(new Date(2014, 8, 23))
* //=> true
*/
function isTuesday(date) {
	return toDate(date).getDay() === 2;
}
//#endregion
//#region node_modules/date-fns/isWednesday.mjs
/**
* @name isWednesday
* @category Weekday Helpers
* @summary Is the given date Wednesday?
*
* @description
* Is the given date Wednesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is Wednesday
*
* @example
* // Is 24 September 2014 Wednesday?
* const result = isWednesday(new Date(2014, 8, 24))
* //=> true
*/
function isWednesday(date) {
	return toDate(date).getDay() === 3;
}
//#endregion
//#region node_modules/date-fns/isWithinInterval.mjs
/**
* @name isWithinInterval
* @category Interval Helpers
* @summary Is the given date within the interval?
*
* @description
* Is the given date within the interval? (Including start and end.)
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
* @param interval - The interval to check
*
* @returns The date is within the interval
*
* @example
* // For the date within the interval:
* isWithinInterval(new Date(2014, 0, 3), {
*   start: new Date(2014, 0, 1),
*   end: new Date(2014, 0, 7)
* })
* //=> true
*
* @example
* // For the date outside of the interval:
* isWithinInterval(new Date(2014, 0, 10), {
*   start: new Date(2014, 0, 1),
*   end: new Date(2014, 0, 7)
* })
* //=> false
*
* @example
* // For date equal to interval start:
* isWithinInterval(date, { start, end: date })
* // => true
*
* @example
* // For date equal to interval end:
* isWithinInterval(date, { start: date, end })
* // => true
*/
function isWithinInterval(date, interval) {
	const time = +toDate(date);
	const [startTime, endTime] = [+toDate(interval.start), +toDate(interval.end)].sort((a, b) => a - b);
	return time >= startTime && time <= endTime;
}
//#endregion
//#region node_modules/date-fns/subDays.mjs
/**
* @name subDays
* @category Day Helpers
* @summary Subtract the specified number of days from the given date.
*
* @description
* Subtract the specified number of days from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of days to be subtracted.
*
* @returns The new date with the days subtracted
*
* @example
* // Subtract 10 days from 1 September 2014:
* const result = subDays(new Date(2014, 8, 1), 10)
* //=> Fri Aug 22 2014 00:00:00
*/
function subDays(date, amount) {
	return addDays(date, -amount);
}
//#endregion
//#region node_modules/date-fns/isYesterday.mjs
/**
* @name isYesterday
* @category Day Helpers
* @summary Is the given date yesterday?
* @pure false
*
* @description
* Is the given date yesterday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
*
* @returns The date is yesterday
*
* @example
* // If today is 6 October 2014, is 5 October 14:00:00 yesterday?
* const result = isYesterday(new Date(2014, 9, 5, 14, 0))
* //=> true
*/
function isYesterday(date) {
	return isSameDay(date, subDays(constructNow(date), 1));
}
//#endregion
//#region node_modules/date-fns/lastDayOfDecade.mjs
/**
* @name lastDayOfDecade
* @category Decade Helpers
* @summary Return the last day of a decade for the given date.
*
* @description
* Return the last day of a decade for the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The last day of a decade
*
* @example
* // The last day of a decade for 21 December 2012 21:12:00:
* const result = lastDayOfDecade(new Date(2012, 11, 21, 21, 12, 00))
* //=> Wed Dec 31 2019 00:00:00
*/
function lastDayOfDecade(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const decade = 9 + Math.floor(year / 10) * 10;
	_date.setFullYear(decade + 1, 0, 0);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/lastDayOfWeek.mjs
/**
* The {@link lastDayOfWeek} function options.
*/
/**
* @name lastDayOfWeek
* @category Week Helpers
* @summary Return the last day of a week for the given date.
*
* @description
* Return the last day of a week for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param options - An object with options
*
* @returns The last day of a week
*
* @example
* // The last day of a week for 2 September 2014 11:55:00:
* const result = lastDayOfWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sat Sep 06 2014 00:00:00
*
* @example
* // If the week starts on Monday, the last day of the week for 2 September 2014 11:55:00:
* const result = lastDayOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
* //=> Sun Sep 07 2014 00:00:00
*/
function lastDayOfWeek(date, options) {
	const defaultOptions = getDefaultOptions$1();
	const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions.weekStartsOn ?? defaultOptions.locale?.options?.weekStartsOn ?? 0;
	const _date = toDate(date);
	const day = _date.getDay();
	const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
	_date.setHours(0, 0, 0, 0);
	_date.setDate(_date.getDate() + diff);
	return _date;
}
//#endregion
//#region node_modules/date-fns/lastDayOfISOWeek.mjs
/**
* @name lastDayOfISOWeek
* @category ISO Week Helpers
* @summary Return the last day of an ISO week for the given date.
*
* @description
* Return the last day of an ISO week for the given date.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The last day of an ISO week
*
* @example
* // The last day of an ISO week for 2 September 2014 11:55:00:
* const result = lastDayOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
* //=> Sun Sep 07 2014 00:00:00
*/
function lastDayOfISOWeek(date) {
	return lastDayOfWeek(date, { weekStartsOn: 1 });
}
//#endregion
//#region node_modules/date-fns/lastDayOfISOWeekYear.mjs
/**
* @name lastDayOfISOWeekYear
* @category ISO Week-Numbering Year Helpers
* @summary Return the last day of an ISO week-numbering year for the given date.
*
* @description
* Return the last day of an ISO week-numbering year,
* which always starts 3 days before the year's first Thursday.
* The result will be in the local timezone.
*
* ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The end of an ISO week-numbering year
*
* @example
* // The last day of an ISO week-numbering year for 2 July 2005:
* const result = lastDayOfISOWeekYear(new Date(2005, 6, 2))
* //=> Sun Jan 01 2006 00:00:00
*/
function lastDayOfISOWeekYear(date) {
	const year = getISOWeekYear(date);
	const fourthOfJanuary = constructFrom(date, 0);
	fourthOfJanuary.setFullYear(year + 1, 0, 4);
	fourthOfJanuary.setHours(0, 0, 0, 0);
	const _date = startOfISOWeek(fourthOfJanuary);
	_date.setDate(_date.getDate() - 1);
	return _date;
}
//#endregion
//#region node_modules/date-fns/lastDayOfQuarter.mjs
/**
* @name lastDayOfQuarter
* @category Quarter Helpers
* @summary Return the last day of a year quarter for the given date.
*
* @description
* Return the last day of a year quarter for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The last day of a quarter
*
* @example
* // The last day of a quarter for 2 September 2014 11:55:00:
* const result = lastDayOfQuarter(new Date(2014, 8, 2, 11, 55, 0))
* //=> Tue Sep 30 2014 00:00:00
*/
function lastDayOfQuarter(date) {
	const _date = toDate(date);
	const currentMonth = _date.getMonth();
	const month = currentMonth - currentMonth % 3 + 3;
	_date.setMonth(month, 0);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/lastDayOfYear.mjs
/**
* @name lastDayOfYear
* @category Year Helpers
* @summary Return the last day of a year for the given date.
*
* @description
* Return the last day of a year for the given date.
* The result will be in the local timezone.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The last day of a year
*
* @example
* // The last day of a year for 2 September 2014 11:55:00:
* const result = lastDayOfYear(new Date(2014, 8, 2, 11, 55, 00))
* //=> Wed Dec 31 2014 00:00:00
*/
function lastDayOfYear(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	_date.setFullYear(year + 1, 0, 0);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/lightFormat.mjs
var formattingTokensRegExp = /(\w)\1*|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
/**
* @private
*/
/**
* @name lightFormat
* @category Common Helpers
* @summary Format the date.
*
* @description
* Return the formatted date string in the given format. Unlike `format`,
* `lightFormat` doesn't use locales and outputs date using the most popular tokens.
*
* > ⚠️ Please note that the `lightFormat` tokens differ from Moment.js and other libraries.
* > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
*
* The characters wrapped between two single quotes characters (') are escaped.
* Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
*
* Format of the string is based on Unicode Technical Standard #35:
* https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
*
* Accepted patterns:
* | Unit                            | Pattern | Result examples                   |
* |---------------------------------|---------|-----------------------------------|
* | AM, PM                          | a..aaa  | AM, PM                            |
* |                                 | aaaa    | a.m., p.m.                        |
* |                                 | aaaaa   | a, p                              |
* | Calendar year                   | y       | 44, 1, 1900, 2017                 |
* |                                 | yy      | 44, 01, 00, 17                    |
* |                                 | yyy     | 044, 001, 000, 017                |
* |                                 | yyyy    | 0044, 0001, 1900, 2017            |
* | Month (formatting)              | M       | 1, 2, ..., 12                     |
* |                                 | MM      | 01, 02, ..., 12                   |
* | Day of month                    | d       | 1, 2, ..., 31                     |
* |                                 | dd      | 01, 02, ..., 31                   |
* | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |
* |                                 | hh      | 01, 02, ..., 11, 12               |
* | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |
* |                                 | HH      | 00, 01, 02, ..., 23               |
* | Minute                          | m       | 0, 1, ..., 59                     |
* |                                 | mm      | 00, 01, ..., 59                   |
* | Second                          | s       | 0, 1, ..., 59                     |
* |                                 | ss      | 00, 01, ..., 59                   |
* | Fraction of second              | S       | 0, 1, ..., 9                      |
* |                                 | SS      | 00, 01, ..., 99                   |
* |                                 | SSS     | 000, 001, ..., 999                |
* |                                 | SSSS    | ...                               |
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
* @param format - The string of tokens
*
* @returns The formatted date string
*
* @throws `Invalid time value` if the date is invalid
* @throws format string contains an unescaped latin alphabet character
*
* @example
* const result = lightFormat(new Date(2014, 1, 11), 'yyyy-MM-dd')
* //=> '2014-02-11'
*/
function lightFormat(date, formatStr) {
	const _date = toDate(date);
	if (!isValid(_date)) throw new RangeError("Invalid time value");
	const tokens = formatStr.match(formattingTokensRegExp);
	if (!tokens) return "";
	return tokens.map((substring) => {
		if (substring === "''") return "'";
		const firstCharacter = substring[0];
		if (firstCharacter === "'") return cleanEscapedString(substring);
		const formatter = lightFormatters[firstCharacter];
		if (formatter) return formatter(_date, substring);
		if (firstCharacter.match(unescapedLatinCharacterRegExp)) throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
		return substring;
	}).join("");
}
function cleanEscapedString(input) {
	const matches = input.match(escapedStringRegExp);
	if (!matches) return input;
	return matches[1].replace(doubleQuoteRegExp, "'");
}
//#endregion
//#region node_modules/date-fns/milliseconds.mjs
/**
* @name milliseconds
* @category Millisecond Helpers
* @summary
* Returns the number of milliseconds in the specified, years, months, weeks, days, hours, minutes and seconds.
*
* @description
* Returns the number of milliseconds in the specified, years, months, weeks, days, hours, minutes and seconds.
*
* One years equals 365.2425 days according to the formula:
*
* > Leap year occures every 4 years, except for years that are divisable by 100 and not divisable by 400.
* > 1 mean year = (365+1/4-1/100+1/400) days = 365.2425 days
*
* One month is a year divided by 12.
*
* @param duration - The object with years, months, weeks, days, hours, minutes and seconds to be added.
*
* @returns The milliseconds
*
* @example
* // 1 year in milliseconds
* milliseconds({ years: 1 })
* //=> 31556952000
*
* // 3 months in milliseconds
* milliseconds({ months: 3 })
* //=> 7889238000
*/
function milliseconds({ years, months, weeks, days, hours, minutes, seconds }) {
	let totalDays = 0;
	if (years) totalDays += years * daysInYear;
	if (months) totalDays += months * (daysInYear / 12);
	if (weeks) totalDays += weeks * 7;
	if (days) totalDays += days;
	let totalSeconds = totalDays * 24 * 60 * 60;
	if (hours) totalSeconds += hours * 60 * 60;
	if (minutes) totalSeconds += minutes * 60;
	if (seconds) totalSeconds += seconds;
	return Math.trunc(totalSeconds * 1e3);
}
//#endregion
//#region node_modules/date-fns/millisecondsToHours.mjs
/**
* @name millisecondsToHours
* @category Conversion Helpers
* @summary Convert milliseconds to hours.
*
* @description
* Convert a number of milliseconds to a full number of hours.
*
* @param milliseconds - The number of milliseconds to be converted
*
* @returns The number of milliseconds converted in hours
*
* @example
* // Convert 7200000 milliseconds to hours:
* const result = millisecondsToHours(7200000)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = millisecondsToHours(7199999)
* //=> 1
*/
function millisecondsToHours(milliseconds) {
	const hours = milliseconds / millisecondsInHour;
	return Math.trunc(hours);
}
//#endregion
//#region node_modules/date-fns/millisecondsToMinutes.mjs
/**
* @name millisecondsToMinutes
* @category Conversion Helpers
* @summary Convert milliseconds to minutes.
*
* @description
* Convert a number of milliseconds to a full number of minutes.
*
* @param milliseconds - The number of milliseconds to be converted
*
* @returns The number of milliseconds converted in minutes
*
* @example
* // Convert 60000 milliseconds to minutes:
* const result = millisecondsToMinutes(60000)
* //=> 1
*
* @example
* // It uses floor rounding:
* const result = millisecondsToMinutes(119999)
* //=> 1
*/
function millisecondsToMinutes(milliseconds) {
	const minutes = milliseconds / millisecondsInMinute;
	return Math.trunc(minutes);
}
//#endregion
//#region node_modules/date-fns/millisecondsToSeconds.mjs
/**
* @name millisecondsToSeconds
* @category Conversion Helpers
* @summary Convert milliseconds to seconds.
*
* @description
* Convert a number of milliseconds to a full number of seconds.
*
* @param milliseconds - The number of milliseconds to be converted
*
* @returns The number of milliseconds converted in seconds
*
* @example
* // Convert 1000 miliseconds to seconds:
* const result = millisecondsToSeconds(1000)
* //=> 1
*
* @example
* // It uses floor rounding:
* const result = millisecondsToSeconds(1999)
* //=> 1
*/
function millisecondsToSeconds(milliseconds) {
	const seconds = milliseconds / millisecondsInSecond;
	return Math.trunc(seconds);
}
//#endregion
//#region node_modules/date-fns/minutesToHours.mjs
/**
* @name minutesToHours
* @category Conversion Helpers
* @summary Convert minutes to hours.
*
* @description
* Convert a number of minutes to a full number of hours.
*
* @param minutes - The number of minutes to be converted
*
* @returns The number of minutes converted in hours
*
* @example
* // Convert 140 minutes to hours:
* const result = minutesToHours(120)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = minutesToHours(179)
* //=> 2
*/
function minutesToHours(minutes) {
	const hours = minutes / 60;
	return Math.trunc(hours);
}
//#endregion
//#region node_modules/date-fns/minutesToMilliseconds.mjs
/**
* @name minutesToMilliseconds
* @category Conversion Helpers
* @summary Convert minutes to milliseconds.
*
* @description
* Convert a number of minutes to a full number of milliseconds.
*
* @param minutes - The number of minutes to be converted
*
* @returns The number of minutes converted in milliseconds
*
* @example
* // Convert 2 minutes to milliseconds
* const result = minutesToMilliseconds(2)
* //=> 120000
*/
function minutesToMilliseconds(minutes) {
	return Math.trunc(minutes * millisecondsInMinute);
}
//#endregion
//#region node_modules/date-fns/minutesToSeconds.mjs
/**
* @name minutesToSeconds
* @category Conversion Helpers
* @summary Convert minutes to seconds.
*
* @description
* Convert a number of minutes to a full number of seconds.
*
* @param minutes - The number of minutes to be converted
*
* @returns The number of minutes converted in seconds
*
* @example
* // Convert 2 minutes to seconds
* const result = minutesToSeconds(2)
* //=> 120
*/
function minutesToSeconds(minutes) {
	return Math.trunc(minutes * 60);
}
//#endregion
//#region node_modules/date-fns/monthsToQuarters.mjs
/**
* @name monthsToQuarters
* @category Conversion Helpers
* @summary Convert number of months to quarters.
*
* @description
* Convert a number of months to a full number of quarters.
*
* @param months - The number of months to be converted.
*
* @returns The number of months converted in quarters
*
* @example
* // Convert 6 months to quarters:
* const result = monthsToQuarters(6)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = monthsToQuarters(7)
* //=> 2
*/
function monthsToQuarters(months) {
	const quarters = months / 3;
	return Math.trunc(quarters);
}
//#endregion
//#region node_modules/date-fns/monthsToYears.mjs
/**
* @name monthsToYears
* @category Conversion Helpers
* @summary Convert number of months to years.
*
* @description
* Convert a number of months to a full number of years.
*
* @param months - The number of months to be converted
*
* @returns The number of months converted in years
*
* @example
* // Convert 36 months to years:
* const result = monthsToYears(36)
* //=> 3
*
* // It uses floor rounding:
* const result = monthsToYears(40)
* //=> 3
*/
function monthsToYears(months) {
	const years = months / 12;
	return Math.trunc(years);
}
//#endregion
//#region node_modules/date-fns/nextDay.mjs
/**
* @name nextDay
* @category Weekday Helpers
* @summary When is the next day of the week?
*
* @description
* When is the next day of the week? 0-6 the day of the week, 0 represents Sunday.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
* @param day - day of the week
*
* @returns The date is the next day of week
*
* @example
* // When is the next Monday after Mar, 20, 2020?
* const result = nextDay(new Date(2020, 2, 20), 1)
* //=> Mon Mar 23 2020 00:00:00
*
* @example
* // When is the next Tuesday after Mar, 21, 2020?
* const result = nextDay(new Date(2020, 2, 21), 2)
* //=> Tue Mar 24 2020 00:00:00
*/
function nextDay(date, day) {
	let delta = day - getDay(date);
	if (delta <= 0) delta += 7;
	return addDays(date, delta);
}
//#endregion
//#region node_modules/date-fns/nextFriday.mjs
/**
* @name nextFriday
* @category Weekday Helpers
* @summary When is the next Friday?
*
* @description
* When is the next Friday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Friday
*
* @example
* // When is the next Friday after Mar, 22, 2020?
* const result = nextFriday(new Date(2020, 2, 22))
* //=> Fri Mar 27 2020 00:00:00
*/
function nextFriday(date) {
	return nextDay(date, 5);
}
//#endregion
//#region node_modules/date-fns/nextMonday.mjs
/**
* @name nextMonday
* @category Weekday Helpers
* @summary When is the next Monday?
*
* @description
* When is the next Monday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Monday
*
* @example
* // When is the next Monday after Mar, 22, 2020?
* const result = nextMonday(new Date(2020, 2, 22))
* //=> Mon Mar 23 2020 00:00:00
*/
function nextMonday(date) {
	return nextDay(date, 1);
}
//#endregion
//#region node_modules/date-fns/nextSaturday.mjs
/**
* @name nextSaturday
* @category Weekday Helpers
* @summary When is the next Saturday?
*
* @description
* When is the next Saturday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Saturday
*
* @example
* // When is the next Saturday after Mar, 22, 2020?
* const result = nextSaturday(new Date(2020, 2, 22))
* //=> Sat Mar 28 2020 00:00:00
*/
function nextSaturday(date) {
	return nextDay(date, 6);
}
//#endregion
//#region node_modules/date-fns/nextSunday.mjs
/**
* @name nextSunday
* @category Weekday Helpers
* @summary When is the next Sunday?
*
* @description
* When is the next Sunday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Sunday
*
* @example
* // When is the next Sunday after Mar, 22, 2020?
* const result = nextSunday(new Date(2020, 2, 22))
* //=> Sun Mar 29 2020 00:00:00
*/
function nextSunday(date) {
	return nextDay(date, 0);
}
//#endregion
//#region node_modules/date-fns/nextThursday.mjs
/**
* @name nextThursday
* @category Weekday Helpers
* @summary When is the next Thursday?
*
* @description
* When is the next Thursday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Thursday
*
* @example
* // When is the next Thursday after Mar, 22, 2020?
* const result = nextThursday(new Date(2020, 2, 22))
* //=> Thur Mar 26 2020 00:00:00
*/
function nextThursday(date) {
	return nextDay(date, 4);
}
//#endregion
//#region node_modules/date-fns/nextTuesday.mjs
/**
* @name nextTuesday
* @category Weekday Helpers
* @summary When is the next Tuesday?
*
* @description
* When is the next Tuesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Tuesday
*
* @example
* // When is the next Tuesday after Mar, 22, 2020?
* const result = nextTuesday(new Date(2020, 2, 22))
* //=> Tue Mar 24 2020 00:00:00
*/
function nextTuesday(date) {
	return nextDay(date, 2);
}
//#endregion
//#region node_modules/date-fns/nextWednesday.mjs
/**
* @name nextWednesday
* @category Weekday Helpers
* @summary When is the next Wednesday?
*
* @description
* When is the next Wednesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The next Wednesday
*
* @example
* // When is the next Wednesday after Mar, 22, 2020?
* const result = nextWednesday(new Date(2020, 2, 22))
* //=> Wed Mar 25 2020 00:00:00
*/
function nextWednesday(date) {
	return nextDay(date, 3);
}
//#endregion
//#region node_modules/date-fns/parseISO.mjs
/**
* The {@link parseISO} function options.
*/
/**
* @name parseISO
* @category Common Helpers
* @summary Parse ISO string
*
* @description
* Parse the given string in ISO 8601 format and return an instance of Date.
*
* Function accepts complete ISO 8601 formats as well as partial implementations.
* ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
*
* If the argument isn't a string, the function cannot parse the string or
* the values are invalid, it returns Invalid Date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param argument - The value to convert
* @param options - An object with options
*
* @returns The parsed date in the local time zone
*
* @example
* // Convert string '2014-02-11T11:30:30' to date:
* const result = parseISO('2014-02-11T11:30:30')
* //=> Tue Feb 11 2014 11:30:30
*
* @example
* // Convert string '+02014101' to date,
* // if the additional number of digits in the extended year format is 1:
* const result = parseISO('+02014101', { additionalDigits: 1 })
* //=> Fri Apr 11 2014 00:00:00
*/
function parseISO(argument, options) {
	const additionalDigits = options?.additionalDigits ?? 2;
	const dateStrings = splitDateString(argument);
	let date;
	if (dateStrings.date) {
		const parseYearResult = parseYear(dateStrings.date, additionalDigits);
		date = parseDate(parseYearResult.restDateString, parseYearResult.year);
	}
	if (!date || isNaN(date.getTime())) return /* @__PURE__ */ new Date(NaN);
	const timestamp = date.getTime();
	let time = 0;
	let offset;
	if (dateStrings.time) {
		time = parseTime(dateStrings.time);
		if (isNaN(time)) return /* @__PURE__ */ new Date(NaN);
	}
	if (dateStrings.timezone) {
		offset = parseTimezone(dateStrings.timezone);
		if (isNaN(offset)) return /* @__PURE__ */ new Date(NaN);
	} else {
		const dirtyDate = new Date(timestamp + time);
		const result = /* @__PURE__ */ new Date(0);
		result.setFullYear(dirtyDate.getUTCFullYear(), dirtyDate.getUTCMonth(), dirtyDate.getUTCDate());
		result.setHours(dirtyDate.getUTCHours(), dirtyDate.getUTCMinutes(), dirtyDate.getUTCSeconds(), dirtyDate.getUTCMilliseconds());
		return result;
	}
	return new Date(timestamp + time + offset);
}
var patterns = {
	dateTimeDelimiter: /[T ]/,
	timeZoneDelimiter: /[Z ]/i,
	timezone: /([Z+-].*)$/
};
var dateRegex = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/;
var timeRegex = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/;
var timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function splitDateString(dateString) {
	const dateStrings = {};
	const array = dateString.split(patterns.dateTimeDelimiter);
	let timeString;
	if (array.length > 2) return dateStrings;
	if (/:/.test(array[0])) timeString = array[0];
	else {
		dateStrings.date = array[0];
		timeString = array[1];
		if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
			dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0];
			timeString = dateString.substr(dateStrings.date.length, dateString.length);
		}
	}
	if (timeString) {
		const token = patterns.timezone.exec(timeString);
		if (token) {
			dateStrings.time = timeString.replace(token[1], "");
			dateStrings.timezone = token[1];
		} else dateStrings.time = timeString;
	}
	return dateStrings;
}
function parseYear(dateString, additionalDigits) {
	const regex = new RegExp("^(?:(\\d{4}|[+-]\\d{" + (4 + additionalDigits) + "})|(\\d{2}|[+-]\\d{" + (2 + additionalDigits) + "})$)");
	const captures = dateString.match(regex);
	if (!captures) return {
		year: NaN,
		restDateString: ""
	};
	const year = captures[1] ? parseInt(captures[1]) : null;
	const century = captures[2] ? parseInt(captures[2]) : null;
	return {
		year: century === null ? year : century * 100,
		restDateString: dateString.slice((captures[1] || captures[2]).length)
	};
}
function parseDate(dateString, year) {
	if (year === null) return /* @__PURE__ */ new Date(NaN);
	const captures = dateString.match(dateRegex);
	if (!captures) return /* @__PURE__ */ new Date(NaN);
	const isWeekDate = !!captures[4];
	const dayOfYear = parseDateUnit(captures[1]);
	const month = parseDateUnit(captures[2]) - 1;
	const day = parseDateUnit(captures[3]);
	const week = parseDateUnit(captures[4]);
	const dayOfWeek = parseDateUnit(captures[5]) - 1;
	if (isWeekDate) {
		if (!validateWeekDate(year, week, dayOfWeek)) return /* @__PURE__ */ new Date(NaN);
		return dayOfISOWeekYear(year, week, dayOfWeek);
	} else {
		const date = /* @__PURE__ */ new Date(0);
		if (!validateDate(year, month, day) || !validateDayOfYearDate(year, dayOfYear)) return /* @__PURE__ */ new Date(NaN);
		date.setUTCFullYear(year, month, Math.max(dayOfYear, day));
		return date;
	}
}
function parseDateUnit(value) {
	return value ? parseInt(value) : 1;
}
function parseTime(timeString) {
	const captures = timeString.match(timeRegex);
	if (!captures) return NaN;
	const hours = parseTimeUnit(captures[1]);
	const minutes = parseTimeUnit(captures[2]);
	const seconds = parseTimeUnit(captures[3]);
	if (!validateTime(hours, minutes, seconds)) return NaN;
	return hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * 1e3;
}
function parseTimeUnit(value) {
	return value && parseFloat(value.replace(",", ".")) || 0;
}
function parseTimezone(timezoneString) {
	if (timezoneString === "Z") return 0;
	const captures = timezoneString.match(timezoneRegex);
	if (!captures) return 0;
	const sign = captures[1] === "+" ? -1 : 1;
	const hours = parseInt(captures[2]);
	const minutes = captures[3] && parseInt(captures[3]) || 0;
	if (!validateTimezone(hours, minutes)) return NaN;
	return sign * (hours * millisecondsInHour + minutes * millisecondsInMinute);
}
function dayOfISOWeekYear(isoWeekYear, week, day) {
	const date = /* @__PURE__ */ new Date(0);
	date.setUTCFullYear(isoWeekYear, 0, 4);
	const fourthOfJanuaryDay = date.getUTCDay() || 7;
	const diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay;
	date.setUTCDate(date.getUTCDate() + diff);
	return date;
}
var daysInMonths = [
	31,
	null,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
];
function isLeapYearIndex(year) {
	return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}
function validateDate(year, month, date) {
	return month >= 0 && month <= 11 && date >= 1 && date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28));
}
function validateDayOfYearDate(year, dayOfYear) {
	return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365);
}
function validateWeekDate(_year, week, day) {
	return week >= 1 && week <= 53 && day >= 0 && day <= 6;
}
function validateTime(hours, minutes, seconds) {
	if (hours === 24) return minutes === 0 && seconds === 0;
	return seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 25;
}
function validateTimezone(_hours, minutes) {
	return minutes >= 0 && minutes <= 59;
}
//#endregion
//#region node_modules/date-fns/parseJSON.mjs
/**
* @name parseJSON
* @category Common Helpers
* @summary Parse a JSON date string
*
* @description
* Converts a complete ISO date string in UTC time, the typical format for transmitting
* a date in JSON, to a JavaScript `Date` instance.
*
* This is a minimal implementation for converting dates retrieved from a JSON API to
* a `Date` instance which can be used with other functions in the `date-fns` library.
* The following formats are supported:
*
* - `2000-03-15T05:20:10.123Z`: The output of `.toISOString()` and `JSON.stringify(new Date())`
* - `2000-03-15T05:20:10Z`: Without milliseconds
* - `2000-03-15T05:20:10+00:00`: With a zero offset, the default JSON encoded format in some other languages
* - `2000-03-15T05:20:10+05:45`: With a positive or negative offset, the default JSON encoded format in some other languages
* - `2000-03-15T05:20:10+0000`: With a zero offset without a colon
* - `2000-03-15T05:20:10`: Without a trailing 'Z' symbol
* - `2000-03-15T05:20:10.1234567`: Up to 7 digits in milliseconds field. Only first 3 are taken into account since JS does not allow fractional milliseconds
* - `2000-03-15 05:20:10`: With a space instead of a 'T' separator for APIs returning a SQL date without reformatting
*
* For convenience and ease of use these other input types are also supported
* via [toDate](https://date-fns.org/docs/toDate):
*
* - A `Date` instance will be cloned
* - A `number` will be treated as a timestamp
*
* Any other input type or invalid date strings will return an `Invalid Date`.
*
* @param dateStr - A fully formed ISO8601 date string to convert
*
* @returns The parsed date in the local time zone
*/
function parseJSON(dateStr) {
	const parts = dateStr.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{0,7}))?(?:Z|(.)(\d{2}):?(\d{2})?)?/);
	if (parts) return new Date(Date.UTC(+parts[1], +parts[2] - 1, +parts[3], +parts[4] - (+parts[9] || 0) * (parts[8] == "-" ? -1 : 1), +parts[5] - (+parts[10] || 0) * (parts[8] == "-" ? -1 : 1), +parts[6], +((parts[7] || "0") + "00").substring(0, 3)));
	return /* @__PURE__ */ new Date(NaN);
}
//#endregion
//#region node_modules/date-fns/previousDay.mjs
/**
* @name previousDay
* @category Weekday Helpers
* @summary When is the previous day of the week?
*
* @description
* When is the previous day of the week? 0-6 the day of the week, 0 represents Sunday.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to check
* @param day - The day of the week
*
* @returns The date is the previous day of week
*
* @example
* // When is the previous Monday before Mar, 20, 2020?
* const result = previousDay(new Date(2020, 2, 20), 1)
* //=> Mon Mar 16 2020 00:00:00
*
* @example
* // When is the previous Tuesday before Mar, 21, 2020?
* const result = previousDay(new Date(2020, 2, 21), 2)
* //=> Tue Mar 17 2020 00:00:00
*/
function previousDay(date, day) {
	let delta = getDay(date) - day;
	if (delta <= 0) delta += 7;
	return subDays(date, delta);
}
//#endregion
//#region node_modules/date-fns/previousFriday.mjs
/**
* @name previousFriday
* @category Weekday Helpers
* @summary When is the previous Friday?
*
* @description
* When is the previous Friday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Friday
*
* @example
* // When is the previous Friday before Jun, 19, 2021?
* const result = previousFriday(new Date(2021, 5, 19))
* //=> Fri June 18 2021 00:00:00
*/
function previousFriday(date) {
	return previousDay(date, 5);
}
//#endregion
//#region node_modules/date-fns/previousMonday.mjs
/**
* @name previousMonday
* @category Weekday Helpers
* @summary When is the previous Monday?
*
* @description
* When is the previous Monday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Monday
*
* @example
* // When is the previous Monday before Jun, 18, 2021?
* const result = previousMonday(new Date(2021, 5, 18))
* //=> Mon June 14 2021 00:00:00
*/
function previousMonday(date) {
	return previousDay(date, 1);
}
//#endregion
//#region node_modules/date-fns/previousSaturday.mjs
/**
* @name previousSaturday
* @category Weekday Helpers
* @summary When is the previous Saturday?
*
* @description
* When is the previous Saturday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Saturday
*
* @example
* // When is the previous Saturday before Jun, 20, 2021?
* const result = previousSaturday(new Date(2021, 5, 20))
* //=> Sat June 19 2021 00:00:00
*/
function previousSaturday(date) {
	return previousDay(date, 6);
}
//#endregion
//#region node_modules/date-fns/previousSunday.mjs
/**
* @name previousSunday
* @category Weekday Helpers
* @summary When is the previous Sunday?
*
* @description
* When is the previous Sunday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Sunday
*
* @example
* // When is the previous Sunday before Jun, 21, 2021?
* const result = previousSunday(new Date(2021, 5, 21))
* //=> Sun June 20 2021 00:00:00
*/
function previousSunday(date) {
	return previousDay(date, 0);
}
//#endregion
//#region node_modules/date-fns/previousThursday.mjs
/**
* @name previousThursday
* @category Weekday Helpers
* @summary When is the previous Thursday?
*
* @description
* When is the previous Thursday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Thursday
*
* @example
* // When is the previous Thursday before Jun, 18, 2021?
* const result = previousThursday(new Date(2021, 5, 18))
* //=> Thu June 17 2021 00:00:00
*/
function previousThursday(date) {
	return previousDay(date, 4);
}
//#endregion
//#region node_modules/date-fns/previousTuesday.mjs
/**
* @name previousTuesday
* @category Weekday Helpers
* @summary When is the previous Tuesday?
*
* @description
* When is the previous Tuesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Tuesday
*
* @example
* // When is the previous Tuesday before Jun, 18, 2021?
* const result = previousTuesday(new Date(2021, 5, 18))
* //=> Tue June 15 2021 00:00:00
*/
function previousTuesday(date) {
	return previousDay(date, 2);
}
//#endregion
//#region node_modules/date-fns/previousWednesday.mjs
/**
* @name previousWednesday
* @category Weekday Helpers
* @summary When is the previous Wednesday?
*
* @description
* When is the previous Wednesday?
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to start counting from
*
* @returns The previous Wednesday
*
* @example
* // When is the previous Wednesday before Jun, 18, 2021?
* const result = previousWednesday(new Date(2021, 5, 18))
* //=> Wed June 16 2021 00:00:00
*/
function previousWednesday(date) {
	return previousDay(date, 3);
}
//#endregion
//#region node_modules/date-fns/quartersToMonths.mjs
/**
* @name quartersToMonths
* @category Conversion Helpers
* @summary Convert number of quarters to months.
*
* @description
* Convert a number of quarters to a full number of months.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param quarters - The number of quarters to be converted
*
* @returns The number of quarters converted in months
*
* @example
* // Convert 2 quarters to months
* const result = quartersToMonths(2)
* //=> 6
*/
function quartersToMonths(quarters) {
	return Math.trunc(quarters * 3);
}
//#endregion
//#region node_modules/date-fns/quartersToYears.mjs
/**
* @name quartersToYears
* @category Conversion Helpers
* @summary Convert number of quarters to years.
*
* @description
* Convert a number of quarters to a full number of years.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param quarters - The number of quarters to be converted
*
* @returns The number of quarters converted in years
*
* @example
* // Convert 8 quarters to years
* const result = quartersToYears(8)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = quartersToYears(11)
* //=> 2
*/
function quartersToYears(quarters) {
	const years = quarters / 4;
	return Math.trunc(years);
}
//#endregion
//#region node_modules/date-fns/roundToNearestHours.mjs
/**
* The {@link roundToNearestHours} function options.
*/
/**
* @name roundToNearestHours
* @category Hour Helpers
* @summary Rounds the given date to the nearest hour
*
* @description
* Rounds the given date to the nearest hour (or number of hours).
* Rounds up when the given date is exactly between the nearest round hours.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to round
* @param options - An object with options.
*
* @returns The new date rounded to the closest hour
*
* @example
* // Round 10 July 2014 12:34:56 to nearest hour:
* const result = roundToNearestHours(new Date(2014, 6, 10, 12, 34, 56))
* //=> Thu Jul 10 2014 13:00:00
*
* @example
* // Round 10 July 2014 12:34:56 to nearest half hour:
* const result = roundToNearestHours(new Date(2014, 6, 10, 12, 34, 56), { nearestTo: 6 })
* //=> Thu Jul 10 2014 12:00:00

* @example
* // Round 10 July 2014 12:34:56 to nearest half hour:
* const result = roundToNearestHours(new Date(2014, 6, 10, 12, 34, 56), { nearestTo: 8 })
* //=> Thu Jul 10 2014 16:00:00

* @example
* // Floor (rounds down) 10 July 2014 12:34:56 to nearest hour:
* const result = roundToNearestHours(new Date(2014, 6, 10, 1, 23, 45), { roundingMethod: 'ceil' })
* //=> Thu Jul 10 2014 02:00:00
*
* @example
* // Ceil (rounds up) 10 July 2014 12:34:56 to nearest quarter hour:
* const result = roundToNearestHours(new Date(2014, 6, 10, 12, 34, 56), { roundingMethod: 'floor', nearestTo: 8 })
* //=> Thu Jul 10 2014 08:00:00
*/
function roundToNearestHours(date, options) {
	const nearestTo = options?.nearestTo ?? 1;
	if (nearestTo < 1 || nearestTo > 12) return constructFrom(date, NaN);
	const _date = toDate(date);
	const fractionalMinutes = _date.getMinutes() / 60;
	const fractionalSeconds = _date.getSeconds() / 60 / 60;
	const fractionalMilliseconds = _date.getMilliseconds() / 1e3 / 60 / 60;
	const hours = _date.getHours() + fractionalMinutes + fractionalSeconds + fractionalMilliseconds;
	const roundedHours = getRoundingMethod(options?.roundingMethod ?? "round")(hours / nearestTo) * nearestTo;
	const result = constructFrom(date, _date);
	result.setHours(roundedHours, 0, 0, 0);
	return result;
}
//#endregion
//#region node_modules/date-fns/roundToNearestMinutes.mjs
/**
* The {@link roundToNearestMinutes} function options.
*/
/**
* @name roundToNearestMinutes
* @category Minute Helpers
* @summary Rounds the given date to the nearest minute
*
* @description
* Rounds the given date to the nearest minute (or number of minutes).
* Rounds up when the given date is exactly between the nearest round minutes.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to round
* @param options - An object with options.
*
* @returns The new date rounded to the closest minute
*
* @example
* // Round 10 July 2014 12:12:34 to nearest minute:
* const result = roundToNearestMinutes(new Date(2014, 6, 10, 12, 12, 34))
* //=> Thu Jul 10 2014 12:13:00
*
* @example
* // Round 10 July 2014 12:12:34 to nearest quarter hour:
* const result = roundToNearestMinutes(new Date(2014, 6, 10, 12, 12, 34), { nearestTo: 15 })
* //=> Thu Jul 10 2014 12:15:00
*
* @example
* // Floor (rounds down) 10 July 2014 12:12:34 to nearest minute:
* const result = roundToNearestMinutes(new Date(2014, 6, 10, 12, 12, 34), { roundingMethod: 'floor' })
* //=> Thu Jul 10 2014 12:12:00
*
* @example
* // Ceil (rounds up) 10 July 2014 12:12:34 to nearest half hour:
* const result = roundToNearestMinutes(new Date(2014, 6, 10, 12, 12, 34), { roundingMethod: 'ceil', nearestTo: 30 })
* //=> Thu Jul 10 2014 12:30:00
*/
function roundToNearestMinutes(date, options) {
	const nearestTo = options?.nearestTo ?? 1;
	if (nearestTo < 1 || nearestTo > 30) return constructFrom(date, NaN);
	const _date = toDate(date);
	const fractionalSeconds = _date.getSeconds() / 60;
	const fractionalMilliseconds = _date.getMilliseconds() / 1e3 / 60;
	const minutes = _date.getMinutes() + fractionalSeconds + fractionalMilliseconds;
	const roundedMinutes = getRoundingMethod(options?.roundingMethod ?? "round")(minutes / nearestTo) * nearestTo;
	const result = constructFrom(date, _date);
	result.setMinutes(roundedMinutes, 0, 0);
	return result;
}
//#endregion
//#region node_modules/date-fns/secondsToHours.mjs
/**
* @name secondsToHours
* @category Conversion Helpers
* @summary Convert seconds to hours.
*
* @description
* Convert a number of seconds to a full number of hours.
*
* @param seconds - The number of seconds to be converted
*
* @returns The number of seconds converted in hours
*
* @example
* // Convert 7200 seconds into hours
* const result = secondsToHours(7200)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = secondsToHours(7199)
* //=> 1
*/
function secondsToHours(seconds) {
	const hours = seconds / secondsInHour;
	return Math.trunc(hours);
}
//#endregion
//#region node_modules/date-fns/secondsToMilliseconds.mjs
/**
* @name secondsToMilliseconds
* @category Conversion Helpers
* @summary Convert seconds to milliseconds.
*
* @description
* Convert a number of seconds to a full number of milliseconds.
*
* @param seconds - The number of seconds to be converted
*
* @returns The number of seconds converted in milliseconds
*
* @example
* // Convert 2 seconds into milliseconds
* const result = secondsToMilliseconds(2)
* //=> 2000
*/
function secondsToMilliseconds(seconds) {
	return seconds * millisecondsInSecond;
}
//#endregion
//#region node_modules/date-fns/secondsToMinutes.mjs
/**
* @name secondsToMinutes
* @category Conversion Helpers
* @summary Convert seconds to minutes.
*
* @description
* Convert a number of seconds to a full number of minutes.
*
* @param seconds - The number of seconds to be converted
*
* @returns The number of seconds converted in minutes
*
* @example
* // Convert 120 seconds into minutes
* const result = secondsToMinutes(120)
* //=> 2
*
* @example
* // It uses floor rounding:
* const result = secondsToMinutes(119)
* //=> 1
*/
function secondsToMinutes(seconds) {
	const minutes = seconds / 60;
	return Math.trunc(minutes);
}
//#endregion
//#region node_modules/date-fns/setMonth.mjs
/**
* @name setMonth
* @category Month Helpers
* @summary Set the month to the given date.
*
* @description
* Set the month to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param month - The month index to set (0-11)
*
* @returns The new date with the month set
*
* @example
* // Set February to 1 September 2014:
* const result = setMonth(new Date(2014, 8, 1), 1)
* //=> Sat Feb 01 2014 00:00:00
*/
function setMonth(date, month) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const day = _date.getDate();
	const dateWithDesiredMonth = constructFrom(date, 0);
	dateWithDesiredMonth.setFullYear(year, month, 15);
	dateWithDesiredMonth.setHours(0, 0, 0, 0);
	const daysInMonth = getDaysInMonth(dateWithDesiredMonth);
	_date.setMonth(month, Math.min(day, daysInMonth));
	return _date;
}
//#endregion
//#region node_modules/date-fns/set.mjs
/**
* @name set
* @category Common Helpers
* @summary Set date values to a given date.
*
* @description
* Set date values to a given date.
*
* Sets time values to date from object `values`.
* A value is not set if it is undefined or null or doesn't exist in `values`.
*
* Note about bundle size: `set` does not internally use `setX` functions from date-fns but instead opts
* to use native `Date#setX` methods. If you use this function, you may not want to include the
* other `setX` functions that date-fns provides if you are concerned about the bundle size.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param values - The date values to be set
*
* @returns The new date with options set
*
* @example
* // Transform 1 September 2014 into 20 October 2015 in a single line:
* const result = set(new Date(2014, 8, 20), { year: 2015, month: 9, date: 20 })
* //=> Tue Oct 20 2015 00:00:00
*
* @example
* // Set 12 PM to 1 September 2014 01:23:45 to 1 September 2014 12:00:00:
* const result = set(new Date(2014, 8, 1, 1, 23, 45), { hours: 12 })
* //=> Mon Sep 01 2014 12:23:45
*/
function set(date, values) {
	let _date = toDate(date);
	if (isNaN(+_date)) return constructFrom(date, NaN);
	if (values.year != null) _date.setFullYear(values.year);
	if (values.month != null) _date = setMonth(_date, values.month);
	if (values.date != null) _date.setDate(values.date);
	if (values.hours != null) _date.setHours(values.hours);
	if (values.minutes != null) _date.setMinutes(values.minutes);
	if (values.seconds != null) _date.setSeconds(values.seconds);
	if (values.milliseconds != null) _date.setMilliseconds(values.milliseconds);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setDate.mjs
/**
* @name setDate
* @category Day Helpers
* @summary Set the day of the month to the given date.
*
* @description
* Set the day of the month to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param dayOfMonth - The day of the month of the new date
*
* @returns The new date with the day of the month set
*
* @example
* // Set the 30th day of the month to 1 September 2014:
* const result = setDate(new Date(2014, 8, 1), 30)
* //=> Tue Sep 30 2014 00:00:00
*/
function setDate(date, dayOfMonth) {
	const _date = toDate(date);
	_date.setDate(dayOfMonth);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setDayOfYear.mjs
/**
* @name setDayOfYear
* @category Day Helpers
* @summary Set the day of the year to the given date.
*
* @description
* Set the day of the year to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param dayOfYear - The day of the year of the new date
*
* @returns The new date with the day of the year set
*
* @example
* // Set the 2nd day of the year to 2 July 2014:
* const result = setDayOfYear(new Date(2014, 6, 2), 2)
* //=> Thu Jan 02 2014 00:00:00
*/
function setDayOfYear(date, dayOfYear) {
	const _date = toDate(date);
	_date.setMonth(0);
	_date.setDate(dayOfYear);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setDefaultOptions.mjs
/**
* @name setDefaultOptions
* @category Common Helpers
* @summary Set default options including locale.
* @pure false
*
* @description
* Sets the defaults for
* `options.locale`, `options.weekStartsOn` and `options.firstWeekContainsDate`
* arguments for all functions.
*
* @param options - An object with options
*
* @example
* // Set global locale:
* import { es } from 'date-fns/locale'
* setDefaultOptions({ locale: es })
* const result = format(new Date(2014, 8, 2), 'PPPP')
* //=> 'martes, 2 de septiembre de 2014'
*
* @example
* // Start of the week for 2 September 2014:
* const result = startOfWeek(new Date(2014, 8, 2))
* //=> Sun Aug 31 2014 00:00:00
*
* @example
* // Start of the week for 2 September 2014,
* // when we set that week starts on Monday by default:
* setDefaultOptions({ weekStartsOn: 1 })
* const result = startOfWeek(new Date(2014, 8, 2))
* //=> Mon Sep 01 2014 00:00:00
*
* @example
* // Manually set options take priority over default options:
* setDefaultOptions({ weekStartsOn: 1 })
* const result = startOfWeek(new Date(2014, 8, 2), { weekStartsOn: 0 })
* //=> Sun Aug 31 2014 00:00:00
*
* @example
* // Remove the option by setting it to `undefined`:
* setDefaultOptions({ weekStartsOn: 1 })
* setDefaultOptions({ weekStartsOn: undefined })
* const result = startOfWeek(new Date(2014, 8, 2))
* //=> Sun Aug 31 2014 00:00:00
*/
function setDefaultOptions(options) {
	const result = {};
	const defaultOptions = getDefaultOptions$1();
	for (const property in defaultOptions) if (Object.prototype.hasOwnProperty.call(defaultOptions, property)) result[property] = defaultOptions[property];
	for (const property in options) if (Object.prototype.hasOwnProperty.call(options, property)) if (options[property] === void 0) delete result[property];
	else result[property] = options[property];
	setDefaultOptions$1(result);
}
//#endregion
//#region node_modules/date-fns/setHours.mjs
/**
* @name setHours
* @category Hour Helpers
* @summary Set the hours to the given date.
*
* @description
* Set the hours to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param hours - The hours of the new date
*
* @returns The new date with the hours set
*
* @example
* // Set 4 hours to 1 September 2014 11:30:00:
* const result = setHours(new Date(2014, 8, 1, 11, 30), 4)
* //=> Mon Sep 01 2014 04:30:00
*/
function setHours(date, hours) {
	const _date = toDate(date);
	_date.setHours(hours);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setMilliseconds.mjs
/**
* @name setMilliseconds
* @category Millisecond Helpers
* @summary Set the milliseconds to the given date.
*
* @description
* Set the milliseconds to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param milliseconds - The milliseconds of the new date
*
* @returns The new date with the milliseconds set
*
* @example
* // Set 300 milliseconds to 1 September 2014 11:30:40.500:
* const result = setMilliseconds(new Date(2014, 8, 1, 11, 30, 40, 500), 300)
* //=> Mon Sep 01 2014 11:30:40.300
*/
function setMilliseconds(date, milliseconds) {
	const _date = toDate(date);
	_date.setMilliseconds(milliseconds);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setMinutes.mjs
/**
* @name setMinutes
* @category Minute Helpers
* @summary Set the minutes to the given date.
*
* @description
* Set the minutes to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param minutes - The minutes of the new date
*
* @returns The new date with the minutes set
*
* @example
* // Set 45 minutes to 1 September 2014 11:30:40:
* const result = setMinutes(new Date(2014, 8, 1, 11, 30, 40), 45)
* //=> Mon Sep 01 2014 11:45:40
*/
function setMinutes(date, minutes) {
	const _date = toDate(date);
	_date.setMinutes(minutes);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setQuarter.mjs
/**
* @name setQuarter
* @category Quarter Helpers
* @summary Set the year quarter to the given date.
*
* @description
* Set the year quarter to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param quarter - The quarter of the new date
*
* @returns The new date with the quarter set
*
* @example
* // Set the 2nd quarter to 2 July 2014:
* const result = setQuarter(new Date(2014, 6, 2), 2)
* //=> Wed Apr 02 2014 00:00:00
*/
function setQuarter(date, quarter) {
	const _date = toDate(date);
	const diff = quarter - (Math.trunc(_date.getMonth() / 3) + 1);
	return setMonth(_date, _date.getMonth() + diff * 3);
}
//#endregion
//#region node_modules/date-fns/setSeconds.mjs
/**
* @name setSeconds
* @category Second Helpers
* @summary Set the seconds to the given date.
*
* @description
* Set the seconds to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param seconds - The seconds of the new date
*
* @returns The new date with the seconds set
*
* @example
* // Set 45 seconds to 1 September 2014 11:30:40:
* const result = setSeconds(new Date(2014, 8, 1, 11, 30, 40), 45)
* //=> Mon Sep 01 2014 11:30:45
*/
function setSeconds(date, seconds) {
	const _date = toDate(date);
	_date.setSeconds(seconds);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setWeekYear.mjs
/**
* The {@link setWeekYear} function options.
*/
/**
* @name setWeekYear
* @category Week-Numbering Year Helpers
* @summary Set the local week-numbering year to the given date.
*
* @description
* Set the local week-numbering year to the given date,
* saving the week number and the weekday number.
* The exact calculation depends on the values of
* `options.weekStartsOn` (which is the index of the first day of the week)
* and `options.firstWeekContainsDate` (which is the day of January, which is always in
* the first week of the week-numbering year)
*
* Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param weekYear - The local week-numbering year of the new date
* @param options - An object with options
*
* @returns The new date with the local week-numbering year set
*
* @example
* // Set the local week-numbering year 2004 to 2 January 2010 with default options:
* const result = setWeekYear(new Date(2010, 0, 2), 2004)
* //=> Sat Jan 03 2004 00:00:00
*
* @example
* // Set the local week-numbering year 2004 to 2 January 2010,
* // if Monday is the first day of week
* // and 4 January is always in the first week of the year:
* const result = setWeekYear(new Date(2010, 0, 2), 2004, {
*   weekStartsOn: 1,
*   firstWeekContainsDate: 4
* })
* //=> Sat Jan 01 2005 00:00:00
*/
function setWeekYear(date, weekYear, options) {
	const defaultOptions = getDefaultOptions$1();
	const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions.firstWeekContainsDate ?? defaultOptions.locale?.options?.firstWeekContainsDate ?? 1;
	let _date = toDate(date);
	const diff = differenceInCalendarDays(_date, startOfWeekYear(_date, options));
	const firstWeek = constructFrom(date, 0);
	firstWeek.setFullYear(weekYear, 0, firstWeekContainsDate);
	firstWeek.setHours(0, 0, 0, 0);
	_date = startOfWeekYear(firstWeek, options);
	_date.setDate(_date.getDate() + diff);
	return _date;
}
//#endregion
//#region node_modules/date-fns/setYear.mjs
/**
* @name setYear
* @category Year Helpers
* @summary Set the year to the given date.
*
* @description
* Set the year to the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param year - The year of the new date
*
* @returns The new date with the year set
*
* @example
* // Set year 2013 to 1 September 2014:
* const result = setYear(new Date(2014, 8, 1), 2013)
* //=> Sun Sep 01 2013 00:00:00
*/
function setYear(date, year) {
	const _date = toDate(date);
	if (isNaN(+_date)) return constructFrom(date, NaN);
	_date.setFullYear(year);
	return _date;
}
//#endregion
//#region node_modules/date-fns/startOfDecade.mjs
/**
* @name startOfDecade
* @category Decade Helpers
* @summary Return the start of a decade for the given date.
*
* @description
* Return the start of a decade for the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The original date
*
* @returns The start of a decade
*
* @example
* // The start of a decade for 21 October 2015 00:00:00:
* const result = startOfDecade(new Date(2015, 9, 21, 00, 00, 00))
* //=> Jan 01 2010 00:00:00
*/
function startOfDecade(date) {
	const _date = toDate(date);
	const year = _date.getFullYear();
	const decade = Math.floor(year / 10) * 10;
	_date.setFullYear(decade, 0, 1);
	_date.setHours(0, 0, 0, 0);
	return _date;
}
//#endregion
//#region node_modules/date-fns/startOfToday.mjs
/**
* @name startOfToday
* @category Day Helpers
* @summary Return the start of today.
* @pure false
*
* @description
* Return the start of today.
*
* @returns The start of today
*
* @example
* // If today is 6 October 2014:
* const result = startOfToday()
* //=> Mon Oct 6 2014 00:00:00
*/
function startOfToday() {
	return startOfDay(Date.now());
}
//#endregion
//#region node_modules/date-fns/startOfTomorrow.mjs
/**
* @name startOfTomorrow
* @category Day Helpers
* @summary Return the start of tomorrow.
* @pure false
*
* @description
* Return the start of tomorrow.
*
* @returns The start of tomorrow
*
* @example
* // If today is 6 October 2014:
* const result = startOfTomorrow()
* //=> Tue Oct 7 2014 00:00:00
*/
function startOfTomorrow() {
	const now = /* @__PURE__ */ new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();
	const date = /* @__PURE__ */ new Date(0);
	date.setFullYear(year, month, day + 1);
	date.setHours(0, 0, 0, 0);
	return date;
}
//#endregion
//#region node_modules/date-fns/startOfYesterday.mjs
/**
* @name startOfYesterday
* @category Day Helpers
* @summary Return the start of yesterday.
* @pure false
*
* @description
* Return the start of yesterday.
*
* @returns The start of yesterday
*
* @example
* // If today is 6 October 2014:
* const result = startOfYesterday()
* //=> Sun Oct 5 2014 00:00:00
*/
function startOfYesterday() {
	const now = /* @__PURE__ */ new Date();
	const year = now.getFullYear();
	const month = now.getMonth();
	const day = now.getDate();
	const date = /* @__PURE__ */ new Date(0);
	date.setFullYear(year, month, day - 1);
	date.setHours(0, 0, 0, 0);
	return date;
}
//#endregion
//#region node_modules/date-fns/subMonths.mjs
/**
* @name subMonths
* @category Month Helpers
* @summary Subtract the specified number of months from the given date.
*
* @description
* Subtract the specified number of months from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of months to be subtracted.
*
* @returns The new date with the months subtracted
*
* @example
* // Subtract 5 months from 1 February 2015:
* const result = subMonths(new Date(2015, 1, 1), 5)
* //=> Mon Sep 01 2014 00:00:00
*/
function subMonths(date, amount) {
	return addMonths(date, -amount);
}
//#endregion
//#region node_modules/date-fns/sub.mjs
/**
* @name sub
* @category Common Helpers
* @summary Subtract the specified years, months, weeks, days, hours, minutes and seconds from the given date.
*
* @description
* Subtract the specified years, months, weeks, days, hours, minutes and seconds from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param duration - The object with years, months, weeks, days, hours, minutes and seconds to be subtracted
*
* | Key     | Description                        |
* |---------|------------------------------------|
* | years   | Amount of years to be subtracted   |
* | months  | Amount of months to be subtracted  |
* | weeks   | Amount of weeks to be subtracted   |
* | days    | Amount of days to be subtracted    |
* | hours   | Amount of hours to be subtracted   |
* | minutes | Amount of minutes to be subtracted |
* | seconds | Amount of seconds to be subtracted |
*
* All values default to 0
*
* @returns The new date with the seconds subtracted
*
* @example
* // Subtract the following duration from 15 June 2017 15:29:20
* const result = sub(new Date(2017, 5, 15, 15, 29, 20), {
*   years: 2,
*   months: 9,
*   weeks: 1,
*   days: 7,
*   hours: 5,
*   minutes: 9,
*   seconds: 30
* })
* //=> Mon Sep 1 2014 10:19:50
*/
function sub(date, duration) {
	const { years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
	const dateWithoutDays = subDays(subMonths(date, months + years * 12), days + weeks * 7);
	const mstoSub = (seconds + (minutes + hours * 60) * 60) * 1e3;
	return constructFrom(date, dateWithoutDays.getTime() - mstoSub);
}
//#endregion
//#region node_modules/date-fns/subBusinessDays.mjs
/**
* @name subBusinessDays
* @category Day Helpers
* @summary Substract the specified number of business days (mon - fri) to the given date.
*
* @description
* Substract the specified number of business days (mon - fri) to the given date, ignoring weekends.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of business days to be subtracted.
*
* @returns The new date with the business days subtracted
*
* @example
* // Substract 10 business days from 1 September 2014:
* const result = subBusinessDays(new Date(2014, 8, 1), 10)
* //=> Mon Aug 18 2014 00:00:00 (skipped weekend days)
*/
function subBusinessDays(date, amount) {
	return addBusinessDays(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subHours.mjs
/**
* @name subHours
* @category Hour Helpers
* @summary Subtract the specified number of hours from the given date.
*
* @description
* Subtract the specified number of hours from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of hours to be subtracted.
*
* @returns The new date with the hours subtracted
*
* @example
* // Subtract 2 hours from 11 July 2014 01:00:00:
* const result = subHours(new Date(2014, 6, 11, 1, 0), 2)
* //=> Thu Jul 10 2014 23:00:00
*/
function subHours(date, amount) {
	return addHours(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subMilliseconds.mjs
/**
* @name subMilliseconds
* @category Millisecond Helpers
* @summary Subtract the specified number of milliseconds from the given date.
*
* @description
* Subtract the specified number of milliseconds from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of milliseconds to be subtracted.
*
* @returns The new date with the milliseconds subtracted
*
* @example
* // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
* const result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
* //=> Thu Jul 10 2014 12:45:29.250
*/
function subMilliseconds(date, amount) {
	return addMilliseconds(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subMinutes.mjs
/**
* @name subMinutes
* @category Minute Helpers
* @summary Subtract the specified number of minutes from the given date.
*
* @description
* Subtract the specified number of minutes from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of minutes to be subtracted.
*
* @returns The new date with the minutes subtracted
*
* @example
* // Subtract 30 minutes from 10 July 2014 12:00:00:
* const result = subMinutes(new Date(2014, 6, 10, 12, 0), 30)
* //=> Thu Jul 10 2014 11:30:00
*/
function subMinutes(date, amount) {
	return addMinutes(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subQuarters.mjs
/**
* @name subQuarters
* @category Quarter Helpers
* @summary Subtract the specified number of year quarters from the given date.
*
* @description
* Subtract the specified number of year quarters from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of quarters to be subtracted.
*
* @returns The new date with the quarters subtracted
*
* @example
* // Subtract 3 quarters from 1 September 2014:
* const result = subQuarters(new Date(2014, 8, 1), 3)
* //=> Sun Dec 01 2013 00:00:00
*/
function subQuarters(date, amount) {
	return addQuarters(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subSeconds.mjs
/**
* @name subSeconds
* @category Second Helpers
* @summary Subtract the specified number of seconds from the given date.
*
* @description
* Subtract the specified number of seconds from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of seconds to be subtracted.
*
* @returns The new date with the seconds subtracted
*
* @example
* // Subtract 30 seconds from 10 July 2014 12:45:00:
* const result = subSeconds(new Date(2014, 6, 10, 12, 45, 0), 30)
* //=> Thu Jul 10 2014 12:44:30
*/
function subSeconds(date, amount) {
	return addSeconds(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subWeeks.mjs
/**
* @name subWeeks
* @category Week Helpers
* @summary Subtract the specified number of weeks from the given date.
*
* @description
* Subtract the specified number of weeks from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of weeks to be subtracted.
*
* @returns The new date with the weeks subtracted
*
* @example
* // Subtract 4 weeks from 1 September 2014:
* const result = subWeeks(new Date(2014, 8, 1), 4)
* //=> Mon Aug 04 2014 00:00:00
*/
function subWeeks(date, amount) {
	return addWeeks(date, -amount);
}
//#endregion
//#region node_modules/date-fns/subYears.mjs
/**
* @name subYears
* @category Year Helpers
* @summary Subtract the specified number of years from the given date.
*
* @description
* Subtract the specified number of years from the given date.
*
* @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
*
* @param date - The date to be changed
* @param amount - The amount of years to be subtracted.
*
* @returns The new date with the years subtracted
*
* @example
* // Subtract 5 years from 1 September 2014:
* const result = subYears(new Date(2014, 8, 1), 5)
* //=> Tue Sep 01 2009 00:00:00
*/
function subYears(date, amount) {
	return addYears(date, -amount);
}
//#endregion
//#region node_modules/date-fns/weeksToDays.mjs
/**
* @name weeksToDays
* @category Conversion Helpers
* @summary Convert weeks to days.
*
* @description
* Convert a number of weeks to a full number of days.
*
* @param weeks - The number of weeks to be converted
*
* @returns The number of weeks converted in days
*
* @example
* // Convert 2 weeks into days
* const result = weeksToDays(2)
* //=> 14
*/
function weeksToDays(weeks) {
	return Math.trunc(weeks * 7);
}
//#endregion
//#region node_modules/date-fns/yearsToDays.mjs
/**
* @name yearsToDays
* @category Conversion Helpers
* @summary Convert years to days.
*
* @description
* Convert a number of years to a full number of days.
*
* @param years - The number of years to be converted
*
* @returns The number of years converted in days
*
* @example
* // Convert 2 years into days
* const result = yearsToDays(2)
* //=> 730
*/
function yearsToDays(years) {
	return Math.trunc(years * daysInYear);
}
//#endregion
//#region node_modules/date-fns/yearsToMonths.mjs
/**
* @name yearsToMonths
* @category Conversion Helpers
* @summary Convert years to months.
*
* @description
* Convert a number of years to a full number of months.
*
* @param years - The number of years to be converted
*
* @returns The number of years converted in months
*
* @example
* // Convert 2 years into months
* const result = yearsToMonths(2)
* //=> 24
*/
function yearsToMonths(years) {
	return Math.trunc(years * 12);
}
//#endregion
//#region node_modules/date-fns/yearsToQuarters.mjs
/**
* @name yearsToQuarters
* @category Conversion Helpers
* @summary Convert years to quarters.
*
* @description
* Convert a number of years to a full number of quarters.
*
* @param years - The number of years to be converted
*
* @returns The number of years converted in quarters
*
* @example
* // Convert 2 years to quarters
* const result = yearsToQuarters(2)
* //=> 8
*/
function yearsToQuarters(years) {
	return Math.trunc(years * 4);
}
//#endregion
export { add, addBusinessDays, addDays, addHours, addISOWeekYears, addMilliseconds, addMinutes, addMonths, addQuarters, addSeconds, addWeeks, addYears, areIntervalsOverlapping, clamp, closestIndexTo, closestTo, compareAsc, compareDesc, constructFrom, constructNow, daysToWeeks, differenceInBusinessDays, differenceInCalendarDays, differenceInCalendarISOWeekYears, differenceInCalendarISOWeeks, differenceInCalendarMonths, differenceInCalendarQuarters, differenceInCalendarWeeks, differenceInCalendarYears, differenceInDays, differenceInHours, differenceInISOWeekYears, differenceInMilliseconds, differenceInMinutes, differenceInMonths, differenceInQuarters, differenceInSeconds, differenceInWeeks, differenceInYears, eachDayOfInterval, eachHourOfInterval, eachMinuteOfInterval, eachMonthOfInterval, eachQuarterOfInterval, eachWeekOfInterval, eachWeekendOfInterval, eachWeekendOfMonth, eachWeekendOfYear, eachYearOfInterval, endOfDay, endOfDecade, endOfHour, endOfISOWeek, endOfISOWeekYear, endOfMinute, endOfMonth, endOfQuarter, endOfSecond, endOfToday, endOfTomorrow, endOfWeek, endOfYear, endOfYesterday, format, format as formatDate, formatDistance, formatDistanceStrict, formatDistanceToNow, formatDistanceToNowStrict, formatDuration, formatISO, formatISO9075, formatISODuration, formatRFC3339, formatRFC7231, formatRelative, formatters, fromUnixTime, getDate, getDay, getDayOfYear, getDaysInMonth, getDaysInYear, getDecade, getDefaultOptions, getHours, getISODay, getISOWeek, getISOWeekYear, getISOWeeksInYear, getMilliseconds, getMinutes, getMonth, getOverlappingDaysInIntervals, getQuarter, getSeconds, getTime, getUnixTime, getWeek, getWeekOfMonth, getWeekYear, getWeeksInMonth, getYear, hoursToMilliseconds, hoursToMinutes, hoursToSeconds, interval, intervalToDuration, intlFormat, intlFormatDistance, isAfter, isBefore, isDate, isEqual, isExists, isFirstDayOfMonth, isFriday, isFuture, isLastDayOfMonth, isLeapYear, isMatch, isMonday, isPast, isSameDay, isSameHour, isSameISOWeek, isSameISOWeekYear, isSameMinute, isSameMonth, isSameQuarter, isSameSecond, isSameWeek, isSameYear, isSaturday, isSunday, isThisHour, isThisISOWeek, isThisMinute, isThisMonth, isThisQuarter, isThisSecond, isThisWeek, isThisYear, isThursday, isToday, isTomorrow, isTuesday, isValid, isWednesday, isWeekend, isWithinInterval, isYesterday, lastDayOfDecade, lastDayOfISOWeek, lastDayOfISOWeekYear, lastDayOfMonth, lastDayOfQuarter, lastDayOfWeek, lastDayOfYear, lightFormat, lightFormatters, longFormatters, max, milliseconds, millisecondsToHours, millisecondsToMinutes, millisecondsToSeconds, min, minutesToHours, minutesToMilliseconds, minutesToSeconds, monthsToQuarters, monthsToYears, nextDay, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday, parse, parseISO, parseJSON, parsers, previousDay, previousFriday, previousMonday, previousSaturday, previousSunday, previousThursday, previousTuesday, previousWednesday, quartersToMonths, quartersToYears, roundToNearestHours, roundToNearestMinutes, secondsToHours, secondsToMilliseconds, secondsToMinutes, set, setDate, setDay, setDayOfYear, setDefaultOptions, setHours, setISODay, setISOWeek, setISOWeekYear, setMilliseconds, setMinutes, setMonth, setQuarter, setSeconds, setWeek, setWeekYear, setYear, startOfDay, startOfDecade, startOfHour, startOfISOWeek, startOfISOWeekYear, startOfMinute, startOfMonth, startOfQuarter, startOfSecond, startOfToday, startOfTomorrow, startOfWeek, startOfWeekYear, startOfYear, startOfYesterday, sub, subBusinessDays, subDays, subHours, subISOWeekYears, subMilliseconds, subMinutes, subMonths, subQuarters, subSeconds, subWeeks, subYears, toDate, transpose, weeksToDays, yearsToDays, yearsToMonths, yearsToQuarters };

//# sourceMappingURL=date-fns.js.map