import _ from 'lodash';

import { optionSetters, stringPathToJson } from '../utils/others.es';
import { objectIsEmpty, jsonOnlyKeys } from '../utils/extendjs.es';
import { gettextstyle, optionByKeyPath as textStyleByKeyPath } from './packages/textStyle.es';

const NextCommonInterface = {
    gettextstyle, textStyleByKeyPath
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


const ITEMSTYLE = {
    normal: {
        textStyle: null
    },
    emphasis: {}
};

/**
 * =========================================
 * export common API
 * =========================================
 */


/**
 * 以当前层级为基准，获取一份完整的 itemStyle，支持合并用户 itemStyle 到返回值中；
 * 同事，会自动递归向下层验证、填充以保证整个 itemStyle 的完整、正确性；
 *
 * @param  {[type]} userItemStyle   个性化的一些 itemStyle；
 * @return {[type]}                 一份完整的 itemStyle，包括用户已个性化定制的（且已 check 通过了的）；
 */
export function getitemstyle(userItemStyle = {}) {
    let itemStyle = _.cloneDeep(ITEMSTYLE);

    itemStyle = _.merge(itemStyle, userItemStyle);

    itemStyle = optionSetters(itemStyle, optionByKeyPath, { mustNextAll: true });

    return itemStyle;
}

/**
 * 更新 option；如果不是当前层级的管辖范围，会向下层传递进行验证，直到找到可处理的层级或被忽略；
 *
 * @param  {[type]} itemStyle [必须]需要进行验证的当前层级 option；如果需要，会自动向下层进行传递验证；
 * @param  {[type]} keyPath   [必须]键名路径，支持：key.key.key... 模式
 * @param  {[type]} nextPaths 子路径，当需要对 keyPath 的下层路径递归[检查]时，可以精简下级路径的遍历次数，提高性能；
 *                            [检查]意味着需要验证，可以保证 option 的完整性、正确性
 * @return {[type]}           [description]
 */
export function optionByKeyPath(itemStyle, keyPath, nextPaths) {
    const splitPath = `${keyPath}`.match(/(normal|emphasis)(\..+)*/);
    if (splitPath && splitPath[2]) {
        keyPath = `*${splitPath[2]}`;
    }

    switch (keyPath) {
        case 'normal': case 'emphasis':
            if (objectIsEmpty(nextPaths)) { nextPaths = jsonOnlyKeys(ITEMSTYLE.normal); }
            const realNextPaths = {};
            // 这里需要在前面拼上 keyPath，这样才能从 optionSetters 顺利的进入到当前这个函数的一些 case 中
            for (const nextPath in nextPaths) {if (nextPaths.hasOwnProperty(nextPath)) {
                realNextPaths[`${keyPath}.${nextPath}`] = nextPaths[nextPath];
            }}
            // 这里直接用 itemStyle 接收，因为在前面已经将 keyPath 拼到 nextPaths 中了
            itemStyle = optionSetters(itemStyle, optionByKeyPath, { mustNextAll: true, keyPaths: realNextPaths });
            break;
        // 下层入口通用定义
        case '*.textStyle':
            const path1 = splitPath[1];
            const path2 = splitPath[2].substring(1);
            itemStyle[path1][path2] = objectIsEmpty(itemStyle[path1][path2]) || objectIsEmpty(nextPaths) ?
                NextCommonInterface[`get${path2.toLowerCase()}`](itemStyle[path1][path2]) :
                optionSetters(itemStyle[path1][path2], NextCommonInterface(`${path2}ByKeyPath`), { keyPaths: nextPaths });
            break;
        // 下层入口通用跳转、转发
        default:
            if (splitPath) {
                keyPath = splitPath.slice(1).join('');
            }
            nextPaths = stringPathToJson(keyPath, nextPaths);
            if (nextPaths.$length > 1) {
                // 当前层级中找不到匹配的 case，所以将该多级路径直接缩减为一级路径进行重新验证
                 itemStyle = optionByKeyPath(itemStyle, nextPaths.$first, nextPaths[nextPaths.$first]);
            } else {
                // 如果 keyPath 为一级路径，则该键名是用户臆造的，非内部键名，所以直接忽略
            }
    }

    // must return the params: options; good good thinking thinking!!
    return itemStyle;
}
