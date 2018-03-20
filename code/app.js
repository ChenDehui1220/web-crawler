const express = require('express')
const app = express()
const Crawler = require('crawler')
const compression = require('compression')
const Promise = require('promise')
const crawlerParse = require('./lib/crawlerParse')
const levenshtein = require('./lib/levenshtein')



//middleware
app.use(compression())

//static
var staticOptions = {
    maxAge: '1h'
}
app.use('/static', express.static(__dirname + '/public', staticOptions))

const c = new Crawler({
    maxConnections: 10,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
})

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/index.html');
})

app.get('/query', function (request, response) {
    var obj = {}, nameAry = [], dataAry = [];
    var searchKeyword = request.query.keyword;
    var searchKeywordEncode = encodeURI(searchKeyword)

    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Content-Type', 'application/json');
    response.set('Cache-Control', 'public, no-store');

    if (typeof searchKeyword === 'string' && searchKeyword.length > 0) {

        //feebee
        const feebee = new Promise((resolve, reject) => {
            c.queue([{
                uri: 'http://m.feebee.com.tw/s/?q=' + searchKeywordEncode,
                jQuery: false,
                callback: function (error, res, done) {
                    if (error) {
                        obj.msg = 'feebee not response!'
                    } else {
                        const { next, fail, keys, items } = crawlerParse('feebee', res, 'http://m.feebee.com.tw/')
                        if (next === true) {
                            dataAry = dataAry.concat(items)
                        } else {
                            obj.msg = 'feebee parse failed.'
                        }
                    }
                    done()
                    resolve()
                }
            }])
        })

        //ezprice
        const ezprice = new Promise((resolve, reject) => {
            c.queue([{
                uri: 'https://m.ezprice.com.tw/s/' + searchKeywordEncode + '/',
                jQuery: false,
                callback: function (error, res, done) {
                    if (error) {
                        obj.msg = 'ezprice not response!'
                    } else {
                        const { next, fail, keys, items } = crawlerParse('ezprice', res, 'https://m.ezprice.com.tw/')
                        if (next === true) {
                            dataAry = dataAry.concat(items)
                        } else {
                            obj.msg = 'ezprice parse failed.'
                        }
                    }
                    done()
                    resolve()
                }
            }]);
        });

        //findprice
        const findprice = new Promise((resolve, reject) => {
            c.queue([{
                uri: 'https://m.findprice.com.tw/datalist.aspx?q=' + searchKeywordEncode,
                jQuery: false,
                callback: function (error, res, done) {
                    if (error) {
                        obj.msg = 'findprice not response!'
                    } else {
                        const { next, fail, keys, items } = crawlerParse('findprice', res, 'https://m.findprice.com.tw/')
                        if (next === true) {
                            dataAry = dataAry.concat(items)
                        } else {
                            obj.msg = 'findprice parse failed.'
                        }
                    }
                    done()
                    resolve()
                }
            }]);
        });

        let findSimilarRate = function(obj) {
            for(var i in obj) {
                obj[i].similar = levenshtein(searchKeyword, obj[i].name)
            }
            return obj
        }

        //[feebee, ezprice, findprice]
        Promise.all([feebee, ezprice, findprice]).then(() => {
            var o = {}, i, s, k, z = 0
            for(i in dataAry) {
                s = dataAry[i].price.split('~')
                s[0] = s[0].replace(/(\$|,|～|\s)/g,'')
                s[0] = s[0].replace(/(\D)/g,'')
                k = Number(s[0]) + z
                o[k] = dataAry[i]
                z++
            }

            obj.data = findSimilarRate(o)
            response.status(200).send(JSON.stringify(obj))
        }).catch(() => {
            response.status(400).send(JSON.stringify(obj))
        })
    } else {
        obj.msg = 'please provide search word. ex: /query?keyword=dyson v6'
        response.status(400).send(JSON.stringify(obj))
    }
})

app.listen(3000, function () {
    console.log('Starting web crawler service!!!');
})