/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    if(obj === {}) {
        return {};
    }
    else if (obj === undefined) {
        return undefined;
    }
    const arr = Object.entries(obj);
    let newObj = {};
    for(let i = 0; i < arr.length; i ++) {
        arr[i].reverse();
    }
    newObj = Object.fromEntries(arr);
    return newObj;
}
