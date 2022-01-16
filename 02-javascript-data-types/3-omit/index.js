/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    let arr = Object.entries(obj);
    let result = [];
    result = arr.filter(([k, v]) => fields.every(key => key !== k));
    return Object.fromEntries(result);
};
