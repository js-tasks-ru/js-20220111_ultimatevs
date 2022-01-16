/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    let arr = Object.entries(obj);
    let result = [];
    let newElement = [];
    for(let key of fields) {
        newElement = arr.filter(el => el[0] === key);
        if(newElement.length !== 0) {
            result.push(...newElement);
        }
    }
    return Object.fromEntries(result);
};
