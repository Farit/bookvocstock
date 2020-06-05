var TextVisualizationByStageView = app.views.TextVisualizationBase.extend({
    el: document.getElementById("visualization-by-stage"),

    initialize: function(){
        app.views.TextVisualizationBase.prototype.initialize.call(this);
        this.margin = {'top': 50, 'right': 50, 'bottom': 50, 'left': 150}
        this.colorScale = d3.scale.ordinal()
            .domain(['unknown', 'known', 'learning', 'familiar'])
            .range(['#FF4136', '#2ECC40', '#FFDC00', 'blue']);
    },

    _get_data: function(){
        var data = [
          {'name': 'known',
           'value': this.model.get_total({'stage': 'known', 'occur': null})},
          {'name': 'learning',
           'value': this.model.get_total({'stage': 'learning', 'occur': null})},
          {'name': 'familiar',
           'value': this.model.get_total({'stage': 'familiar', 'occur': null})},
          {'name': 'unknown',
           'value': this.model.get_total({'stage': 'unknown', 'occur': null})},
        ];
        data.sort(function(a, b) { return b.value - a.value; });
        return data
    },

    render: function(){
        var data = this._get_data();
        this.createSvg({'height': 300});
        this._render(data);
    },

    update: function(){
        var data = this._get_data();
        this._render(data);
    },

    _render: function(data){
        var args = {
            data: data,
            total_value:
                d3.sum(data, function(item){return item.value}),
            xAxisWidth:
                this.svg_width - this.margin['left'] - this.margin['right'],
            xAxisOrient: 'top',
            yAxisHeight:
                this.svg_height - this.margin['top'] - this.margin['bottom'],
            yAxisOrient: 'left'

        }

        args['xScale'] = d3.scale.linear()
            .domain([0, 100]).range([0, args.xAxisWidth]),
        args['yScale'] = d3.scale.ordinal()
            .domain(data.map(function(item){return item.name}))
            .rangeRoundBands([0, args.yAxisHeight], .2)

        this._render_bars(args)
        this._render_x_axis(args)
        this._render_y_axis(args)
        this._render_grid_lines(args)
    },

    _render_bars: function(args){
        var self = this;
        var bars = this.svg.selectAll("g.bar").data(args.data);

        bars.exit()
            .remove()

        var enter_groups = bars.enter().append("g").attr("class", "bar");
        enter_groups.append("rect");
        enter_groups.append("text");

        bars
            .attr("transform", function(d, i){
                var x_offset = self.margin.left;
                var y_offset = parseInt(args.yScale(d.name)) + self.margin.top;
                return 'translate(' + x_offset + ', ' + y_offset + ')'
            })
            .on('click', function(d){
                var args = {'wordsListName': d.name, 'occur': null}
                _.bind(self.showWordsList, self)(args);
            });

        var bars = this.svg.selectAll("g.bar");

        bars.selectAll("rect")
            .data(function(d){
                return [d];
            })
           .attr("width", function(d){
                var width = parseFloat(self.percent(d.value, args.total_value));
                return args.xScale(width);
           })
           .attr("height", args.yScale.rangeBand())
           .attr("fill", function(d){
               return self.colorScale(d.name);
           })


        bars.selectAll("text")
            .data(function(d){
                return [d];
            })
            .attr("class", "value")
            .attr("x", function(d) {
                var x = parseFloat(self.percent(d.value, args.total_value));
                return args.xScale(x);
            })
            .attr("y", args.yScale.rangeBand() / 2)
            .attr('fill', 'white')
            .attr("dx", function(d){
                var bar_width = this.parentNode.querySelector('rect').getAttribute('width');
                var text_width = parseInt(this.getAttribute('y'));
                if (parseInt(bar_width) < 2.5 * text_width) {
                    this.setAttribute('fill', 'black');
                    return 47;
                }
                return -5;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d){
                return self.percent(d.value, args.total_value);
            });
    },

    _render_x_axis: function(args){
        var self = this;

        var xAxis = d3.svg.axis()
            .scale(args.xScale)
            .tickPadding(5)
            .tickFormat(function(value){
                if (value == 100){
                    return value + '%';
                }
                return value;
            })
            .orient(args.xAxisOrient);

        if(d3.select('g.x-axis').empty()){
            this.svg.append('g')
                .attr('class', 'x-axis axis')
                .attr('transform', function(){
                    var x_offset = self.margin.left;
                    var y_offset = self.margin.top
                    return 'translate(' + x_offset + ', ' + y_offset + ')'
                })
                .call(xAxis);
        }
    },

    _render_y_axis: function(args){
        var self = this;

        var yAxisTickPadding = 5
        var yAxis = d3.svg.axis()
            .scale(args.yScale)
            .tickPadding(yAxisTickPadding)
            .outerTickSize(0)
            .tickFormat(function(value){
                var item = _.find(args.data, function(item){
                    return item.name == value
                });
                var width = d3.max(args.data, function(item){
                    return item.value.toString().length;
                })
                width += 2
                var formatter = d3.format(' >' + width + 'd');
                return formatter(item.value);
            })
            .orient(args.yAxisOrient);

        if(d3.select('g.y-axis').empty()){
            this.svg.append('g')
                .attr('class', 'y-axis axis')
                .attr('transform', function(){
                    var x_offset = self.margin.left;
                    var y_offset = self.margin.top;
                    return 'translate(' + x_offset + ', ' + y_offset + ')';
                })
                .call(yAxis)
                .selectAll('text')
                .attr('xml:space', 'preserve')
        }
        else{
            d3.select('g.y-axis')
                .call(yAxis)
        }


        // Render Y-Label Axis
        var yLabelAxis = d3.svg.axis()
            .scale(args.yScale)
            .tickPadding(yAxisTickPadding)
            .tickFormat(function(value){
                return value
            })
            .orient(args.yAxisOrient);

        if(d3.select('g.y-label-axis').empty()){
            this.svg.append('g')
                .attr('class', 'y-label-axis axis')
                .attr('transform', function(){
                    var w = d3.select('.y-axis').node().getBBox().width;
                    var x_offset = self.margin.left - w;
                    var y_offset = self.margin.top
                    return 'translate(' + x_offset + ', ' + y_offset + ')';
                })
                .call(yLabelAxis)

            d3.selectAll('g.y-label-axis .tick')
                .on('click', function(d){
                    var item = _.find(args.data, function(item){return item.name == d});
                    var a = {'wordsListName': item.name, 'occur': null}
                    _.bind(self.showWordsList, self)(a);
                });
        }
        else{
            d3.select('g.y-label-axis')
                .call(yLabelAxis)
        }

    },

    _render_grid_lines: function(args){
        if(d3.select('g.x-axis .grid-line').empty()){
            d3.selectAll('g.x-axis g.tick')
                .append('line')
                .classed('grid-line', true)
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 0)
                .attr('y2', args.yAxisHeight)
        }
    }
});

app.views.TextVisualizationByStage = TextVisualizationByStageView;
