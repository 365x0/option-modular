import _ from 'lodash';

import { optionSetters, stringPathToJson } from '../utils/others.es';
import { objectIsEmpty } from '../utils/extendjs.es';
import { getchart, optionByKeyPath as chartByKeyPath } from './option.chart.es';
import { gettextstyle, optionByKeyPath as textStyleByKeyPath } from './packages/textStyle.es';

const NextCommonInterface = {
    getchart, chartByKeyPath,
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


const OPTION = {
    autoRender: true,
    chart: null,
    textStyle: null
};

/**
 * =========================================
 * export common API
 * =========================================
 */


/**
 * 以当前层级为基准，获取一份完整的 option，支持合并用户 option 到返回值中；
 * 同事，会自动递归向下层验证、填充以保证整个 option 的完整、正确性；
 *
 * @param  {[type]} userOption  个性化的一些 option；
 * @return {[type]}             一份完整的 option，包括用户已个性化定制的（且已 check 通过了的）；
 */
export function getoption(userOption = {}) {
    let option = _.cloneDeep(OPTION);

    option = _.merge(option, userOption);

    option = optionSetters(option, optionByKeyPath, { mustNextAll: true });

    return option;
}

/**
 * 更新 option；如果不是当前层级的管辖范围，会向下层传递进行验证，直到找到可处理的层级或被忽略；
 *
 * @param  {[type]} option    [必须]需要进行验证的当前层级 option；如果需要，会自动向下层进行传递验证；
 * @param  {[type]} keyPath   [必须]键名路径，支持：key.key.key... 模式
 * @param  {[type]} nextPaths 子路径，当需要对 keyPath 的下层路径递归[检查]时，可以精简下级路径的遍历次数，提高性能；
 *                            [检查]意味着需要验证，可以保证 option 的完整性、正确性
 * @return {[type]}           [description]
 */
export function optionByKeyPath(option, keyPath, nextPaths) {
    switch (keyPath) {
        case 'autoRender':
            option.autoRender = !!option.autoRender;
            break;
        // 下层入口通用定义
        case 'chart': case 'textStyle':
            option[keyPath] = objectIsEmpty(option[keyPath]) || objectIsEmpty(nextPaths) ?
                NextCommonInterface[`get${keyPath.toLowerCase()}`](option[keyPath]) :
                optionSetters(option[keyPath], NextCommonInterface[`${keyPath}ByKeyPath`], { keyPaths: nextPaths });
            break;
        // 下层入口通用跳转、转发
        default:
            nextPaths = stringPathToJson(keyPath, nextPaths);
            if (nextPaths.$length > 1) {
                // 当前层级中找不到匹配的 case，所以将该多级路径直接缩减为一级路径进行重新验证
                 option = optionByKeyPath(option, nextPaths.$first, nextPaths[nextPaths.$first]);
            } else {
                // 如果 keyPath 为一级路径，则该键名是用户臆造的，非内部键名，所以直接忽略
            }
    }

    // must return the params: options; good good thinking thinking!!
    return option;
}
