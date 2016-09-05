import _ from 'lodash';

import { optionSetters, jsonToStringPaths } from '../utils/others.js';
// import { objectIsEmpty } from '../utils/extendjs.js';
import { getoption, optionByKeyPath } from '../option/option.js';


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
    boolean1A: false,
    // 业务层独有配置集
    objectPrivate1A: {
        string2A: "",
        number2A: 0,
        object2A: {
            string3A: "",
            string3B: ""
        }
    },
    object1A: {
        // 业务层独有配置项
        number2A: 5,
        array2A: [0, 1],
        object2A: {
            'font-size': '20px'
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

    // 这里，可以简化 User Interface 的默认参数配置
    options = _.merge(getoption(), options);

    options = optionSetters(options, optionsByKeyPath, { mustNextAll: true });

    return options;
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
        case 'boolean1A':
            options.boolean1A = !!options.boolean1A;
            break;
        // 针对私有配置集的 case
        case "objectPrivate1A":
            const objectPrivate1A = options.objectPrivate1A;
            if (!_.isPlainObject(objectPrivate1A)) {
                options.objectPrivate1A = _.cloneDeep(OPTIONS.objectPrivate1A);
            } else {
                const paths = jsonToStringPaths(OPTIONS.objectPrivate1A, [keyPath]);
                paths.forEach((path) => { optionsByKeyPath(options, path); });
            }
            break;
        case "objectPrivate1A.string2A":
            const string2A = options.objectPrivate1A.string2A;
            options.objectPrivate1A.string2A = _.isString(string2A) ? string2A : OPTIONS.objectPrivate1A.string2A;
            break;
        case "objectPrivate1A.number2A":
            const number2A = options.objectPrivate1A.number2A;
            options.objectPrivate1A.number2A = _.isNumber(number2A) ? number2A : OPTIONS.objectPrivate1A.number2A;
            break;
        case "objectPrivate1A.object2A":
            const object2A = options.objectPrivate1A.object2A;
            if (!_.isPlainObject(object2A)) {
                options.objectPrivate1A.object2A = _.cloneDeep(OPTIONS.objectPrivate1A.object2A);
            } else {
                const paths = jsonToStringPaths(OPTIONS.objectPrivate1A.object2A, [keyPath]);
                paths.forEach((path) => { optionsByKeyPath(options, path); });
            }
            break;
        // 统一验证机制，如果可以的话
        case "objectPrivate1A.object2A.string3A": case "objectPrivate1A.object2A.string3B":
            const str = _.get(options, keyPath);
            _.set(options, keyPath, _.isString(str) ? str : _.get(OPTIONS, keyPath));
            break;
        case 'object1A.number2A':
            const number2A1 = options.object1A.number2A;
            options.object1A.number2A = _.isNumber(number2A1) && number2A1 >= 1 ? number2A1 : OPTIONS.object1A.number2A;
            break;
        case "object1A.array2A":
            const array2A = options.object1A.array2A;
            const object1A = options.object1A;
            if (!_.isArray(array2A) || array2A.length < 2) {
                object1A.array2A = [...OPTIONS.object1A.array2A];
            } else {
                array2A[0] = _.isNumber(array2A[0]) ? array2A[0] : OPTIONS.object1A.array2A[0];
                array2A[1] = _.isNumber(array2A[1]) ? array2A[1] : OPTIONS.object1A.array2A[1];
            }
            break;
        case 'object1A.object2A.font-size':
            const fontSize = options.object1A.object2A['font-size'];
            options.object1A.object2A['font-size'] = fontSize || OPTIONS.object1A.object2A['font-size'];
            break;
        default:
            // 先在 Modular 中验证/填充
            options = optionByKeyPath(options, keyPath, nextPaths);

            // 再在 User Interface 中进行验证/填充；User Interface 的优先级大于 Modular
            // 只处理对象类型，因为当前 case 中定义有所有具体的路径
            // 这里是按照默认的 OPTIONS 取 key，这样才能取到一份完整的
            const pathValue = _.get(OPTIONS, keyPath);
            if (_.isPlainObject(pathValue)) {
                // 获取到叶子节点的完整 keyPath，并再次进行 case，保证业务层中的配置优先于通用配置中的
                const paths = jsonToStringPaths(pathValue, [keyPath]);
                paths.forEach((path) => {
                    optionsByKeyPath(options, path);
                });
            }

    }

    // must return the params: options; good good thinking thinking!!
    return options;
}
