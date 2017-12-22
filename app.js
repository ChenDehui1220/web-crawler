const jsdom = require('jsdom');
const Crawler = require('crawler');
const express = require('express');
const app = express();
const striptags = require('striptags');
const compression = require('compression');
const Promise = require('promise');

const {
    JSDOM
} = jsdom;

//middleware
app.use(compression());

//static
app.use('/static', express.static(__dirname + '/public'));

const c = new Crawler({
    maxConnections: 10,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
});

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
});

app.get('/query', function (request, response) {
    var obj = {}, nameAry = [], dataAry = [];
    var searchKeyword = request.query.keyword;

    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Content-Type', 'application/json');
    response.set('Cache-Control', 'public, no-store');

    if (typeof searchKeyword === 'string' && searchKeyword.length > 0) {
        //feebee
        const feebee = new Promise((resolve, reject) => {
            c.queue([{
                uri: 'http://m.feebee.com.tw/s/?q=' + encodeURI(searchKeyword),
                jQuery: false,
                callback: function (error, res, done) {
                    if (error) {
                        obj.msg = 'feebee not response!';
                        reject();
                    } else {
                        const {
                            document
                        } = (new JSDOM(res.body)).window;
                        var list = document.querySelector('#list_view');
                        if (list === null) {
                            resolve();
                            return;
                        }
                        var li = list.querySelectorAll('.product_group');
                        var productName = '',
                            price = '',
                            shop = '';
                        for (var i in li) {
                            if (typeof li[i] === 'object') {
                                if (li[i].querySelector('h4')) {
                                    productName = li[i].querySelector('h4').innerHTML;
                                    price = (li[i].querySelector('.price')) ? li[i].querySelector('.price').innerHTML : '';

                                    if (li[i].querySelector('.shop')) {
                                        shop = li[i].querySelector('.shop').innerHTML;
                                    }

                                    if (nameAry.indexOf(productName) === -1) {
                                        dataAry.push({
                                            name: striptags(productName),
                                            price: striptags(price),
                                            shop: striptags(shop),
                                            platform: 'feebee'
                                        });
                                        nameAry.push(productName);
                                    }
                                }
                            }
                        }
                    }
                    done();
                    resolve();
                }
            }]);
        });

        //ezprice
        const ezprice = new Promise((resolve, reject) => {
            c.queue([{
                uri: 'https://m.ezprice.com.tw/s/' + encodeURI(searchKeyword) + '/',
                jQuery: false,
                callback: function (error, res, done) {
                    if (error) {
                        obj.msg = 'feebee not response!';
                        reject();
                    } else {
                        const {
                            document
                        } = (new JSDOM(res.body)).window;
                        var list = document.querySelector('.box-list');
                        if (list === null) {
                            resolve();
                            return;
                        }
                        var li = list.querySelectorAll('.columns');
                        var productName = '',
                            price = '',
                            shop = '';
                        for (var i in li) {
                            if (typeof li[i] === 'object') {
                                if (li[i].querySelector('h4')) {
                                    productName = li[i].querySelector('h4').innerHTML;
                                    price = (li[i].querySelector('.price')) ? li[i].querySelector('.price').innerHTML : '';

                                    if (li[i].querySelector('.shop-name')) {
                                        shop = li[i].querySelector('.shop-name').innerHTML;
                                    }

                                    if (nameAry.indexOf(productName) === -1) {
                                        dataAry.push({
                                            name: striptags(productName),
                                            price: striptags(price),
                                            shop: striptags(shop),
                                            platform: 'ezprice'
                                        });
                                        nameAry.push(productName);
                                    }
                                }
                            }
                        }
                    }
                    done();
                    resolve();
                }
            }]);
        });

        Promise.all([feebee, ezprice]).then(() => {
            var o = {}, i, s, k, z = 0;
            for(i in dataAry) {
                s = dataAry[i].price.split('~');
                k = Number(s[0].replace(/(\$|,|～|\s)/g,'')) + z;
                o[k] = dataAry[i];
                z++
            }
            obj.data = o;
            response.status(200).send(JSON.stringify(obj));
        }).catch(() => {
            response.status(400).send(JSON.stringify(obj));
        });
    } else {
        obj.msg = 'please provide search word. ex: /query?keyword=dyson v6'
        response.status(400).send(JSON.stringify(obj));
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});