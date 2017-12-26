(function() {
    var gData = {};
    var sortPrice = 'low'; // low or high
    var $Slider = $('#slider-range');
    var rangeMin = 0;
    var rangeMax = 50000;
    var rangeTop = 100000;

    var parse = function() {
        var data = gData;
        var range = $Slider.slider('values');
        var min = range[0];
        var max = range[1];
        var output =
            '<table class="table table-striped"> <thead> <tr> <th>Product</th> <th class="sortPrice">Price</th> <th>Shop</th> <th>Platform</th> </tr></thead> <tbody>';
        var priceAry = [], dataprice = 0;

        for (var i in data) {
            priceAry = data[i].price.split('~');
            dataprice = parseInt(priceAry[0].replace(/(\s|,)/g,''))

            if (min <= dataprice && dataprice <= max) {
                output +=
                    '<tr> <td>' +
                    data[i].name +
                    '</td><td>' +
                    data[i].price +
                    '</td><td>' +
                    data[i].shop +
                    '</td><td>' +
                    data[i].platform +
                    '</td></tr>';
            }
        }

        output += '</tbody> </table>';
        $('#results').html(output);
    };

    var fetch = function() {
        var $dom = $('#keyword');
        var ky = $dom.val();
        var results = $('#results');

        if (ky === '') {
            results.html('');
            $dom.focus();
            return false;
        }

        $.getJSON('/query?keyword=' + ky, function(obj) {
            gData = obj.data;
            parse();

            if (obj.msg !== undefined) {
                console.log(obj.msg);
            }
        });
    };

    $(document).ready(function() {
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
                $('#amount').val('$' + ui.values[0] + ' - $' + ui.values[1]);
            }
        });
        $('#amount').val(
            '$' + $Slider.slider('values', 0) + ' - $' + $Slider.slider('values', 1)
        );
    });
})();
