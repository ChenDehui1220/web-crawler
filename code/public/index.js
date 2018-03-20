(function() {
    var gData = {};
    var sortPrice = 'low'; // low or high
    var $Slider = $('#slider-range');
    var $Keyword = $('#keyword');
    var rangeMin = 0;
    var rangeMax = 120000;
    var rangeTop = 120000;

    var amountNotice = function(min, max) {
        $('#amount').val('$' + min + ' - $' + max);
    };

    var setSliderRange = function() {
        var data = gData;
        var dataMinPrice = 0,
            dataMaxPrice = 0;

        for (var i in data) {
            if (dataMinPrice === 0) {
                dataMinPrice = parseInt(data[i].price.replace(/,/g, ''));
            }
            dataMaxPrice = parseInt(data[i].price.replace(/,/g, ''));
        }

        $Slider.slider('option', 'min', dataMinPrice);
        $Slider.slider('option', 'max', dataMaxPrice);
        amountNotice(dataMinPrice, dataMaxPrice);
    };

    var parse = function() {
        var data = gData;
        var range = $Slider.slider('values');
        var min = range[0];
        var max = range[1];
        var output =
            '<table class="table table-striped"> <thead> <tr> <th>Product</th> <th class="sortPrice"><font>Price</font><img src="./static/sort.png"/></th> <th>Shop</th> <th>Platform</th> <th>Similar</th></tr></thead> <tbody>';
        var priceAry = [],
            dataprice = 0;

        for (var i in data) {
            priceAry = data[i].price.split('~');
            dataprice = parseInt(priceAry[0].replace(/(\s|,)/g, ''));

            if (min <= dataprice && dataprice <= max) {
                output +=
                    '<tr> <td>' +
                    ((data[i].hyperlink !== '')
                    ? '<a href="' + data[i].hyperlink + '" target="_blank">' + data[i].name + '</a>'
                    : data[i].name) +
                    '</td><td>' +
                    data[i].price +
                    '</td><td>' +
                    data[i].shop +
                    '</td><td>' +
                    data[i].platform +
                    '</td><td>' +
                    data[i].similar +
                    '%</td></tr>';
            }
        }

        output += '</tbody> </table>';
        $('#results').html(output);
    };

    var fetch = function() {
        var ky = $Keyword.val();
        var results = $('#results');

        if (ky === '') {
            results.html('');
            $Keyword.focus();
            return false;
        }

        $.getJSON('/query?keyword=' + ky, function(obj) {
            gData = obj.data;
            setSliderRange();
            parse();

            window.localStorage.setItem('keyword', ky);

            if (obj.msg !== undefined) {
                console.log(obj.msg);
            }
        });
    };

    $(document).ready(function() {

        if (window.localStorage.getItem('keyword')) {
            $Keyword.val(window.localStorage.getItem('keyword'));
        }

        $('button').on('click', function(e) {
            e.preventDefault();
            fetch();
        });
        $(document).on('click', '.sortPrice', function() {
            gData = Object.assign([], gData).reverse();
            parse();
        });

        $Slider.slider({
            range: true,
            min: rangeMin,
            max: rangeTop,
            values: [rangeMin, rangeMax],
            slide: function(event, ui) {
                amountNotice(ui.values[0], ui.values[1]);
            },
            stop: function() {
                parse();
            }
        });
        amountNotice(rangeMin, rangeMax);
    });
})();
