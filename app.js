const jsdom = require('jsdom');
const Crawler = require('crawler');
const express = require('express');
const app = express();
const striptags = require('striptags');
const compression = require('compression');

const { JSDOM } = jsdom;

//middleware
app.use(compression());

//static
app.use('/static', express.static(__dirname + '/public'));

const c = new Crawler({
    maxConnections: 10,
    // This will be called for each crawled page
    callback: function(error, res, done) {
      console.log(res.url);
      console.log(res.body.length);

        if (error) {
            console.log(error);
        } else {

        }
        done();
    }
});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get('/query', function(request, response) {
    var obj = {}
    var searchKeyword = request.query.keyword;

    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Content-Type', 'application/json');
    response.set('Cache-Control', 'public, no-store');

    if (typeof searchKeyword === 'string' && searchKeyword.length > 0) {
      c.queue([
          {
              uri: 'http://m.feebee.com.tw/s/?q=' + encodeURI(searchKeyword),
              jQuery: false,

              // The global callback won't be called
              // callback: function(error, res, done) {
              //     if (error) {
              //         console.log(error);
              //     } else {
              //         console.log(res.body.length);

              //         const { document } = (new JSDOM(res.body)).window;
              //         var list = document.querySelector('#list_view');
              //         var li = list.querySelectorAll('.product_group');
              //         var data = [], productName = '', price = '', shop = '';
              //         for(var i in li) {
              //           if (typeof li[i] === 'object') {
              //             if (li[i].querySelector('h4')) {
              //               productName = li[i].querySelector('h4').innerHTML;
              //               price = (li[i].querySelector('.price')) ? li[i].querySelector('.price').innerHTML : '';

              //               if (li[i].querySelector('.shop')) {
              //                 shop = li[i].querySelector('.shop').innerHTML;
              //               }

              //               data.push({name: striptags(productName), price: striptags(price), shop: shop});
              //             }
              //           }
              //         }
              //         obj.data = data;
              //         response.status(200).send(JSON.stringify(obj));
              //     }
              //     done();
              // }
          }
      ]);

      c.queue([
        {
            uri: 'https://m.ezprice.com.tw/s/'+encodeURI(searchKeyword)+'/',
            jQuery: false,

            // The global callback won't be called
            // callback: function(error, res, done) {
            //   console.log(res.body.length);
            // }
          }
      ]);
    } else {
      obj.msg = 'please provide search word. ex: /query?keyword=dyson v6'
      response.status(400).send(JSON.stringify(obj));
    }
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
