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
        },
        findprice: {
            container: '#divGrid',
            items: 'li',
            shop: '.mname'
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
            shop = '',
            h4

        for (var i in lis) {
            if (typeof lis[i] === 'object') {
                h4 = (['feebee', 'ezprice'].indexOf(platform) !== -1)
                    ? lis[i].querySelector('h4')
                    : lis[i].querySelector('.gname')

                if (h4) {
                    productName = striptags(h4.innerHTML);
                    price = (lis[i].querySelector('.price')) ? striptags(lis[i].querySelector('.price').innerHTML) : '';
                    if (price.match(/(\d*?,?\d{3})/g)) {
                        price = price.match(/(\d*?,?\d{3})/g)[0]
                    }

                    if (lis[i].querySelector(platDOM[platform].shop)) {
                        shop = striptags(lis[i].querySelector(platDOM[platform].shop).innerHTML);
                    }

                    if (obj.keys.indexOf(productName) === -1) {
                        obj.items.push({
                            name: productName,
                            price: price,
                            shop: shop,
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
