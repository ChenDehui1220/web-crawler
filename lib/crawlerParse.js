const jsdom = require('jsdom')
const striptags = require('striptags')
const {
    JSDOM
} = jsdom

function crawlerParse(platform, data) {
    const obj = {
        next: false,
        fail: false,
        keys: [],
        items: []
    }
    const {
        document
    } = (new JSDOM(data.body)).window
    const platDOM = {
        feebee: {
            container: '#list_view',
            items: '.result_items',
            shop: '.shop'
        },
        ezprice: {
            container: '.box-list',
            items: '.columns',
            shop: '.shop-name'
        }
    }
    let list = null
    let lis = null

    list = document.querySelector(platDOM[platform].container)
    if (list === null) {
        obj.fail = true

    } else {
        lis = list.querySelectorAll(platDOM[platform].items);
        let productName = '',
            price = '',
            shop = ''

        for (var i in lis) {
            if (typeof lis[i] === 'object') {
                if (lis[i].querySelector('h4')) {
                    productName = lis[i].querySelector('h4').innerHTML;
                    price = (lis[i].querySelector('.price')) ? lis[i].querySelector('.price').innerHTML : '';

                    if (lis[i].querySelector(platDOM[platform].shop)) {
                        shop = lis[i].querySelector(platDOM[platform].shop).innerHTML;
                    }

                    if (obj.keys.indexOf(productName) === -1) {
                        obj.items.push({
                            name: striptags(productName),
                            price: striptags(price).replace(/(\$)/g,''),
                            shop: striptags(shop),
                            platform: platform
                        });
                        obj.keys.push(productName);
                    }
                }
            }
        }
    }

    if (obj.items.length > 0) {
        obj.next = true
    }
    return obj
}

module.exports = crawlerParse
