import _ from 'lodash';



/**
 * =========================================
 * extend for Object
 * =========================================
 */


export function objectIsEmpty(objectdata) {
    let isEmpty = true;

    if (objectdata && _.isObject(objectdata)) {
        isEmpty = Object.getOwnPropertyNames(objectdata).length === 0;
    }

    return isEmpty;
}


/**
 * =========================================
 * extend for JSON
 * =========================================
 */


export function jsonOnlyKeys(jsondata = {}) {
    let jsonKeys = {};

    if (!_.isPlainObject(jsondata)) { return undefined; }

    for (const jsonKey in jsondata) {if (jsondata.hasOwnProperty(jsonKey)) {
        jsonKeys[jsonKey] = jsonOnlyKeys(jsondata[jsonKey]);
    }}

    if (objectIsEmpty(jsonKeys)) { return undefined; }

    return jsonKeys;
}
