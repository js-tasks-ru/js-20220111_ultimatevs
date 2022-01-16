/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const arrCopy = [...arr];
    let res = [];
    res = arrCopy.sort((a, b) => a.localeCompare(b, 'ru-en-u-kf-upper'));
    if (param === 'asc' || param === 'desc') {
        return param === 'asc' ? res : res.reverse();
    }
    else {
        return 'Error: type of sort can be only asc or desc';
    }
}
