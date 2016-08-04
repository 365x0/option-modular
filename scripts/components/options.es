import _ from 'lodash';

import { optionSetters, jsonToStringPaths } from '../utils/others.es';
// import { objectIsEmpty } from '../utils/extendjs.es';
import { getoption, optionByKeyPath } from '../option/option.es';


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


const OPTIONS = {
    autoCenter: true,
    chart: {
        circleR: 5,
        itemStyle: {
            normal: {
                textStyle: {
                    'font-size': '20px'
                }
            }
        }
    }
};

/**
 * =========================================
 * export common API
 * =========================================
 */


/**
 * 以当前层级为基准，获取一份完整的 options，支持合并用户 options 到返回值中；
 * 同事，会自动递归向下层验证、填充以保证整个 options 的完整、正确性；
 *
 * @param  {[type]} userOptions 个性化的一些 options；
 * @return {[type]}             一份完整的 options，包括用户已个性化定制的（且已 check 通过了的）；
 */
export function getoptions(userOptions = {}) {
    let options = _.cloneDeep(OPTIONS);

    options = _.merge(options, userOptions);

    options = optionSetters(options, optionsByKeyPath, { mustNextAll: true });

    // 这里，可以简化 User Interface 的默认参数配置
    return _.merge(getoption(), options);
}

/**
 * 更新 options；如果不是当前层级的管辖范围，会向下层传递进行验证，直到找到可处理的层级或被忽略；
 *
 * @param  {[type]} options   [必须]需要进行验证的当前层级 options；如果需要，会自动向下层进行传递验证；
 * @param  {[type]} keyPath   [必须]键名路径，支持：key.key.key... 模式
 * @param  {[type]} nextPaths 子路径，当需要对 keyPath 的下层路径递归[检查]时，可以精简下级路径的遍历次数，提高性能；
 *                            [检查]意味着需要验证，可以保证 options 的完整性、正确性
 * @return {[type]}           [description]
 */
export function optionsByKeyPath(options, keyPath, nextPaths) {
    switch (keyPath) {
        case 'autoCenter':
            options.autoCenter = !!options.autoCenter;
            break;
        case 'chart.circleR':
            const circleR = options.chart.circleR;
            options.chart.circleR = _.isNumber(circleR) && circleR >= 1 ? circleR : OPTIONS.chart.circleR;
            break;
        case 'chart.itemStyle.normal.textStyle.font-size':
            const fontSize = options.chart.itemStyle.normal.textStyle['font-size'];
            options.chart.itemStyle.normal.textStyle['font-size'] = fontSize || OPTIONS.chart.itemStyle.normal.textStyle['font-size'];
            break;
        default:
            // 先在 Modular 中验证/填充
            options = optionByKeyPath(options, keyPath, nextPaths);

            // 再在 User Interface 中进行验证/填充；User Interface 的优先级大于 Modular
            // 只处理对象类型，因为当前 case 中定义有所有具体的路径
            // 这里是按照默认的 OPTIONS 取 key，这样才能取到一份完整的
            const pathValue = _.get(OPTIONS, keyPath);
            if (_.isPlainObject(pathValue)) {
                // 获取到叶子节点的完整 keyPath，并再次进行 case
                const paths = jsonToStringPaths(pathValue, [keyPath]);
                paths.forEach((path) => {
                    optionsByKeyPath(options, path);
                });
            }

    }

    // must return the params: options; good good thinking thinking!!
    return options;
}
