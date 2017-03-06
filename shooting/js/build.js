var ES = ES || {};

ES.build = function(src){
  this.src = src;
  this.buildBabel();
};

ES.build.prototype = {
    buildBabel: function(){
        $.ajax({
            url: this.src,
            type: 'GET',
            dataType: 'text'
        })
        .done(this.appendScript);
    },
    appendScript: function(data){
        var output = Babel.transform(data, { presets: ['es2015'] }).code,
            $script = $('<script />').text(output);

        $('body').append($script);
    }
};

new ES.build('./js/shooting.js');
