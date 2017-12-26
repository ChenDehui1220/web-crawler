(function() {
    var gData = {};
    var sortPrice = 'low'; // low or high

    var parse = function() {
        var data = gData;
        var output = '<table class="table table-striped"> <thead> <tr> <th>Product</th> <th class="sortPrice">Price</th> <th>Shop</th> <th>Platform</th> </tr></thead> <tbody>';

        for(var i in data) {
            output += '<tr> <td>'+data[i].name+'</td><td>'+data[i].price+'</td><td>'+data[i].shop+'</td><td>'+data[i].platform+'</td></tr>';
        }

        output += '</tbody> </table>';
        $('#results').html(output);
    }

    var fetch = function() {
        var ky = $('#keyword').val();
        var results = $('#results');

        if (ky === '') {results.html(''); return false;}

        $.getJSON('/query?keyword=' + ky, function(obj){
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
        // $('#keyword').on('keyup', function(){
        //     var val = $(this).val();
        //     if (val !== '' && val.length > 4) {
        //         fetch();
        //     }
        // });
        $(document).on('click', '.sortPrice', function() {
            gData = Object.assign([], gData).reverse();
            parse();
        });
    });
})();
