import _ from 'lodash';

import {
    objectIsEmpty,
    jsonOnlyKeys
} from './extendjs.es';


export function stringPathToJson(keyPaths, lastValue = undefined) {
    let jsonPath = {};

    if (!_.isString(keyPaths)) { return undefined; }

    const keys = keyPaths.split('.');
    for (let i = 0, next = jsonPath; i < keys.length; i++) {
        next[keys[i]] = (i + 1) === keys.length ? lastValue : (next = {});
    }

    jsonPath.$length = keys.length;
    jsonPath.$first = keys[0];
    return jsonPath;
}

export function optionSetters(option, optionByKeyPath, {
    userOption = {},
    keyPaths = {},
    mustNextAll = false
} = {}) {

    if (objectIsEmpty(keyPaths)) {
        keyPaths = jsonOnlyKeys(objectIsEmpty(userOption) ? option : userOption);
    }

    for (const optionKey in keyPaths) {if (keyPaths.hasOwnProperty(optionKey)) {
        option = optionByKeyPath(option, optionKey, mustNextAll ? undefined : keyPaths[optionKey]);
    }}

    return option;
}