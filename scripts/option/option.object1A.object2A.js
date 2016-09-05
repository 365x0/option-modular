import _ from 'lodash';

import { optionSetters, stringPathToJson } from '../utils/others.js';
import { objectIsEmpty, jsonOnlyKeys } from '../utils/extendjs.js';
import { getobjectcommon1a, optionByKeyPath as objectCommon1AByKeyPath } from './packages/objectCommon1A.js';

const NextCommonInterface = {
    getobjectcommon1a, objectCommon1AByKeyPath
};

/**
 * =========================================
 * private default-next settings AND export common settings-next API
 * =========================================
 */


/**
 * =========================================
 * private default settings
 * =========================================
 */


const OBJECT2A = {
    normal: {
        objectCommon1A: null
    },
    emphasis: {}
};

/**
 * =========================================
 * export common API
 * =========================================
 */


/**
 * 以当前层级为基准，获取一份完整的 object2A，支持合并用户 object2A 到返回值中；
 * 同事，会自动递归向下层验证、填充以保证整个 object2A 的完整、正确性；
 *
 * @param  {[type]} userItemStyle   个性化的一些 object2A；
 * @return {[type]}                 一份完整的 object2A，包括用户已个性化定制的（且已 check 通过了的）；
 */
export function getobject2a(userObject2A = {}) {
    let object2A = _.cloneDeep(OBJECT2A);

    object2A = _.merge(object2A, userObject2A);

    object2A = optionSetters(object2A, optionByKeyPath, { mustNextAll: true });

    return object2A;
}

/**
 * 更新 option；如果不是当前层级的管辖范围，会向下层传递进行验证，直到找到可处理的层级或被忽略；
 *
 * @param  {[type]} object2A [必须]需要进行验证的当前层级 option；如果需要，会自动向下层进行传递验证；
 * @param  {[type]} keyPath   [必须]键名路径，支持：key.key.key... 模式
 * @param  {[type]} nextPaths 子路径，当需要对 keyPath 的下层路径递归[检查]时，可以精简下级路径的遍历次数，提高性能；
 *                            [检查]意味着需要验证，可以保证 option 的完整性、正确性
 * @return {[type]}           [description]
 */
export function optionByKeyPath(object2A, keyPath, nextPaths) {
    const splitPath = `${keyPath}`.match(/(normal|emphasis)(\..+)*/);
    if (splitPath && splitPath[2]) {
        keyPath = `*${splitPath[2]}`;
    }

    switch (keyPath) {
        case 'normal': case 'emphasis':
            if (objectIsEmpty(nextPaths)) {
                nextPaths = jsonOnlyKeys(OBJECT2A[keyPath]);

                if (objectIsEmpty(nextPaths)) {
                    break;
                }
            }
            const realNextPaths = {};
            // 这里需要在前面拼上 keyPath，这样才能从 optionSetters 顺利的进入到当前这个函数的一些 case 中
            for (const nextPath in nextPaths) {if (nextPaths.hasOwnProperty(nextPath)) {
                realNextPaths[`${keyPath}.${nextPath}`] = nextPaths[nextPath];
            }}
            // 这里直接用 object2A 接收，因为在前面已经将 keyPath 拼到 nextPaths 中了
            object2A = optionSetters(object2A, optionByKeyPath, { mustNextAll: true, keyPaths: realNextPaths });
            break;
        // 下层入口通用定义分发；可以根据 nextPaths 和 value 判断 下层的入口，加速配置的精确验证
        case '*.objectCommon1A':
            const path1 = splitPath[1];
            const path2 = splitPath[2].substring(1);
            const nextOption = object2A[path1][path2];
            object2A[path1][path2] = objectIsEmpty(nextOption) || objectIsEmpty(nextPaths) ?
                // 走下级的 init 入口
                NextCommonInterface[`get${path2.toLowerCase()}`](nextOption) :
                // 走下级的 case 入口
                optionSetters(nextOption, NextCommonInterface[`${path2}ByKeyPath`], { keyPaths: nextPaths });
            break;
        // 下层入口通用跳转、转发
        default:
            if (splitPath) {
                keyPath = splitPath.slice(1).join('');
            }
            nextPaths = stringPathToJson(keyPath, nextPaths);
            if (nextPaths.$depth > 1) {
                // 当前层级中找不到匹配的 case，所以将该多级路径直接缩减为一级路径进行重新验证
                // 直接缩减为一级路径的原因是：在 Modular 中，当前层不处理任何下层对象型配置，只做分发功能
                object2A = optionByKeyPath(object2A, nextPaths.$first, nextPaths[nextPaths.$first]);
            } else {
                // 如果 keyPath 为一级路径，则该键名是用户臆造的，非内部键名，所以直接忽略
            }
    }

    // must return the params: options; good good thinking thinking!!
    return object2A;
}
