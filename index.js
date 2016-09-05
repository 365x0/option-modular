import _ from 'lodash';

import { getoptions, optionsByKeyPath } from './scripts/components/options.js';

let options = getoptions({
    boolean1A: false,
    object1A: {
        number2A: 10,
        number2B: 1,
        object2A: {
            haha: 'haha',
            normal: {
                objectCommon1A: {
                    'font-size': '16px'
                }
            }
        }
    },
    objectCommon1A: {
        'font-size': '10px',
        'font-style': 'normal'
    }
});

console.log(_.cloneDeep(options));







const userOptions = {
    boolean1A: true,
    object1A: {
        number2A: 'abc',
        number2B: 2,
        object2A: {
            hehe: 'hehe'
        }
    },
    objectCommon1A: null
};

options = _.merge(options, userOptions);

for (var key in userOptions) {if (userOptions.hasOwnProperty(key)) {
    options = optionsByKeyPath(options, key);
}}


console.log(options);
