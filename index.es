import _ from 'lodash';

import { getoptions, optionsByKeyPath } from './scripts/components/options.es';

let options = getoptions({
    autoRender: false,
    chart: {
        circleR: 10,
        zIndex: 1,
        itemStyle: {
            haha: 'haha',
            normal: {
                color: '#333',
                textStyle: {
                    'font-size': '16px'
                }
            }
        }
    },
    textStyle: {
        'font-size': '10px',
        'font-style': 'normal'
    }
});

console.log(_.cloneDeep(options));







const userOptions = {
    autoRender: true,
    chart: {
        circleR: 'abc',
        zIndex: 2,
        itemStyle: {
            hehe: 'hehe'
        }
    },
    textStyle: null
};

options = _.merge(options, userOptions);

for (var key in userOptions) {if (userOptions.hasOwnProperty(key)) {
    options = optionsByKeyPath(options, key);
}}


console.log(options);
