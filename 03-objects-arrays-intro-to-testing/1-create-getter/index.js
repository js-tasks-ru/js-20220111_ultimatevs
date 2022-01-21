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
        let copyObj = obj;
        let nextValue = {};
        for(let i = 0; i < arr.length; i ++) {
            if(arr[i] in copyObj) {
                if(i === arr.length - 1) {
                    return copyObj[arr[i]];
                }
                nextValue = copyObj[arr[i]];
                copyObj = nextValue;
            }
            else {
                return;
            }
        }
    }
}
