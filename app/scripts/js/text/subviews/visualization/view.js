var TextVisualizationBaseView = Backbone.View.extend({

    initialize: function(){
        this.svg = null;
        this.svg_width = null;
        this.svg_height = null;
    },

    createSvg: function(options){
        var self = this;
        this.svg = d3.select(this.el).append("svg")
            .attr("width", function(){
                var vis_container = this.parentNode
                self.svg_width = vis_container.offsetWidth;
                return self.svg_width;
            })
            .attr("height", function(){
                self.svg_height = options.height;
                return options.height
            });
    },

    showWordsList: function(args){
        this.trigger(
            'show:wordsList',
            {'wordsListName': args.wordsListName, 'occur': args.occur}
        );
    },

    percent: function(value, total){
        var percent = d3.format('0.2%');
        return percent(value / total)
    }

});

app.views.TextVisualizationBase = TextVisualizationBaseView;
