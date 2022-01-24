/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const arr = path.split('.');
    return function(obj) {
        if(arr.length === 1) {
            return obj[path];
        }
        let result = obj;
        for (let key of arr) {
            if(result[key] === undefined) {
                return;
            }
            result = result[key];
        }
        return result;
    }
}
