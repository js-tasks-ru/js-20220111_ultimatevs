/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    const symbols = string.split('');
    let subStrings = [];
    let tempStr = '';
    for(let i = 0; i < symbols.length; i ++) {
        if(tempStr.length !== 0 && tempStr[0] !== symbols[i]) {
            subStrings.push(tempStr);
            tempStr = '';
        }
        tempStr += symbols[i];
        if(i === symbols.length - 1) {
            subStrings.push(tempStr);
        }
    }
    let result = [];
    for(let i = 0; i < subStrings.length; i ++) {
        if(subStrings[i].length > size) {
            result[i] = subStrings[i].slice(0, size);
        }
        else {
            result[i] = subStrings[i];
        }
    }
    return result.join('');
}
