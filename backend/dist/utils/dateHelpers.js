"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthsDifference = exports.formatToYYYYMMDD = void 0;
const formatToYYYYMMDD = (date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};
exports.formatToYYYYMMDD = formatToYYYYMMDD;
const getMonthsDifference = (date1, date2) => {
    let months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    return months <= 0 ? 0 : months;
};
exports.getMonthsDifference = getMonthsDifference;
