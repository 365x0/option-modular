import _ from 'lodash';

import { optionSetters } from '../../utils/others.js';
import { objectIsEmpty } from '../../utils/extendjs.js';


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


const OBJECTCOMMON1A = {
    'font-size': '12px',
    'font-family': 'sans-serif',
    'font-weight': 'normal',
    'color': '#fff'
};

/**
 * =========================================
 * export common API
 * =========================================
 */


/**
 * 以当前层级为基准，获取一份完整的 objectCommon1A，支持合并用户 objectCommon1A 到返回值中；
 * 同事，会自动递归向下层验证、填充以保证整个 objectCommon1A 的完整、正确性；
 *
 * @param  {[type]} objectCommon1A   个性化的一些 objectCommon1A；
 * @return {[type]}             一份完整的 chart，包括用户已个性化定制的（且已 check 通过了的）；
 */
export function getobjectcommon1a(userObjectCommon1A = {}) {
    let objectCommon1A = _.cloneDeep(OBJECTCOMMON1A);

    objectCommon1A = _.merge(objectCommon1A, userObjectCommon1A);

    objectCommon1A = optionSetters(objectCommon1A, optionByKeyPath, { mustNextAll: true });

    return objectCommon1A;
}

/**
 * 更新 option；如果不是当前层级的管辖范围，会向下层传递进行验证，直到找到可处理的层级或被忽略；
 *
 * @param  {[type]} chart     [必须]需要进行验证的当前层级 option；如果需要，会自动向下层进行传递验证；
 * @param  {[type]} keyPath   [必须]键名路径，支持：key.key.key... 模式
 * @param  {[type]} nextPaths 子路径，当需要对 keyPath 的下层路径递归[检查]时，可以精简下级路径的遍历次数，提高性能；
 *                            [检查]意味着需要验证，可以保证 option 的完整性、正确性
 * @return {[type]}           [description]
 */
export function optionByKeyPath(objectCommon1A, keyPath, nextPaths) {
    switch (keyPath) {
        case 'color': case 'font-size': case 'font-weight': case 'font-family':
            objectCommon1A[keyPath] = objectCommon1A[keyPath] || OBJECTCOMMON1A[keyPath];
            break;
        default:
    }

    // must return the params: options; good good thinking thinking!!
    return objectCommon1A;
}
