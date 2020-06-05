var VocabularyVisualizationView = Backbone.View.extend({
    el: document.getElementById("visualization-vocabulary"),

    initialize: function(){
        this.svg = null;
        this.svg_width = null;
        this.svg_height = null;
        this.margin = {'top': 20, 'right': 50, 'bottom': 120, 'left': 150}
        this.cell_color = d3.scale.ordinal()
            .domain(['known', 'learning', 'familiar'])
            .range(['#2ECC40', '#FFDC00', '#0074D9']);
        this.bars = null;
        this.line_level = null;
        this.text_level = null;
        this.xAxisTicks = null;
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

    render: function(){
        var data = this.model.get('voc_by_date');
        data.sort(function(a, b) {
            var aDateTimestamp = Date.parse(a.date);
            var bDateTimestamp = Date.parse(b.date);
            return aDateTimestamp - bDateTimestamp;
        });

        this.createSvg({'height': 500});
        this._render(data);
    },

    _render: function(data){
        var args = {
            xAxisWidth:
                this.svg_width - this.margin['left'] - this.margin['right'],
            xAxisOrient: 'bottom',
            yAxisHeight:
                this.svg_height - this.margin['top'] - this.margin['bottom'],
            yAxisOrient: 'left'

        }

        var barOuterPad = 20;
        var barPad = 10;
        var widthForBars = args.xAxisWidth - (barOuterPad * 2);
        var barWidth = 24;
        var numberOfBars = Math.floor(widthForBars / barWidth);
        if (data.length < numberOfBars){
            var dataSet = data;
        }
        else {
            var dataSet = data.slice(data.length - numberOfBars);
        }

        args['data'] = dataSet;

        args['xScale'] = d3.scale.ordinal()
            .domain(dataSet.map(function(item){return item.date}))
            .rangeRoundBands([0, args.xAxisWidth], .05, 0.2)

        if (dataSet.length > 0){
            var start = dataSet[dataSet.length - 1].total;
            args['yScale'] = d3.scale.linear()
                .domain([start + start * 0.15, 0])
                .range([0, args.yAxisHeight])
        }
        else{
            args['yScale'] = d3.scale.linear()
                .domain([1499, 0])
                .range([0, args.yAxisHeight])
        }

        var defs = this.svg.append('defs');

        defs.append('marker')
            .attr('id', 'arrowHead')
            .attr('refX', 2)
            .attr('refY', 9)
            .attr('markerWidth', 20)
            .attr('markerHeight', 20)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M2,2 L2,18 L18,10 L2,2')
            .attr('fill', 'grey')

        defs.append('marker')
            .attr('id', 'y-arrowHead')
            .attr('refX', 2)
            .attr('refY', 10)
            .attr('markerWidth', 20)
            .attr('markerHeight', 20)
            .attr('orient', '-90')
            .append('path')
            .attr('d', 'M2,2 L2,18 L18,10 L2,2')
            .attr('fill', 'grey')

        this._render_bars(args);
        this._render_x_axis(args);
        this._render_y_axis(args);
        this._render_labels(args);
    },

    _render_bars: function(args){
        var self = this;
        var bars = this.svg.selectAll("g.bar").data(args.data);
        var lastIndex = args.data.length - 1;

        bars.exit()
            .remove()

        var enter_groups = bars.enter().append("g").attr("class", "bar");
        enter_groups.append("rect");
        enter_groups.append("rect");
        enter_groups.append("rect");
        enter_groups.append("text");


        bars
            .attr("transform", function(d, i){
                var x_offset = parseInt(args.xScale(d.date)) + self.margin.left;
                var y_offset = args.yScale(d.total) + self.margin.top;
                return 'translate(' + x_offset + ', ' + y_offset + ')'
            })

        var bars = this.svg.selectAll("g.bar");
        this.bars = bars;

        bars.selectAll("rect")
            .data(function(d){
                return [
                    {'stage': 'known', 'data': d},
                    {'stage': 'learning', 'data': d},
                    {'stage': 'familiar', 'data': d},
                ];
            })
           .attr("height", function(d){
                return args.yAxisHeight - args.yScale(d.data[d.stage]);
           })
           .attr('y', function(d, i){
                if (d.stage == 'known'){
                    return (2 * args.yAxisHeight -
                            args.yScale(d.data['learning']) -
                            args.yScale(d.data['familiar'])
                    )
                }
                else if (d.stage == 'learning'){
                    return args.yAxisHeight - args.yScale(d.data['familiar']);
                }
                else {
                    return 0;
                }

           })
           .attr("width", args.xScale.rangeBand())
           .attr('fill', function(d){
                return self.cell_color(d.stage);
           })

        bars
            .on('mouseover', function(d, i){
                d3.select(this).classed('active', true);
                var voc_info = d3.select('#vocabulary-info')
                    .style('display', 'flex');
                voc_info.select('.value.known').text(d.known);
                voc_info.select('.value.learning').text(d.learning);
                voc_info.select('.value.familiar').text(d.familiar);

                self.line_level = self.svg.append('line')
                    .attr('x1', function(){
                        return self.margin.left - 52;
                    })
                    .attr('y1', function(){
                        return self.margin.top + args.yScale(d.total);
                    })
                    .attr('x2', function(){
                        return (args.xScale(d.date) + self.margin.left +
                                args.xScale.rangeBand()
                        );
                    })
                    .attr('y2', function(){
                        return self.margin.top + args.yScale(d.total);

                    })
                    .attr('stroke', '#DDDDDD')
                    .attr('stroke-width', '1px')

                self.text_level = self.svg.append("text")
                    .attr('x', function(){
                        return self.margin.left - 55;
                    })
                    .attr('y', function(){
                        return self.margin.top + args.yScale(d.total);
                    })
                    .attr("text-anchor", "end")
                    .attr('fill', '#85144b')
                    .attr('font-family', 'scala-sans-caps')
                    .attr('dy', 4)
                    .text(d.total);

                var date = d.date

                self.xAxisTicks
                    .style('fill', function(d, i){
                        if (d == date){
                            return 'black'
                        }
                    })
            })
            .on('mouseout', function(d, i){
                var voc_info = d3.select('#vocabulary-info')
                    .style('display', 'none');
                d3.select(self.el.querySelector('.bar.active'))
                    .classed('active', false);
                self.line_level.remove();
                self.text_level.remove();
                self.xAxisTicks.style('fill', '');
            })
    },

    _render_x_axis: function(args){
        var self = this;

        var xAxisTickPadding = 5
        var xAxis = d3.svg.axis()
            .scale(args.xScale)
            .tickPadding(xAxisTickPadding)
            .outerTickSize(0)
            .orient(args.xAxisOrient);

        var xAxis_selection = this.svg.append('g')
            .attr('class', 'x-axis axis')
            .attr('transform', function(){
                var x_offset = self.margin.left;
                var y_offset = self.svg_height - self.margin.bottom;
                return 'translate(' + x_offset + ', ' + y_offset + ')';
            })
            .call(xAxis)

        this.xAxisTicks = xAxis_selection
            .selectAll('text')
            .attr('fill', '#AAAAAA')
            .attr('transform', function(){
                var selfBBox = this.getBBox();
                var x_offset = - selfBBox.width / 2;
                var y_offset = selfBBox.height + 12;
                return 'translate(' + x_offset + ', ' + y_offset + ')rotate(-45)';

            })

        xAxis_selection
            .select('path')
            .attr('marker-end', 'url(#arrowHead)')

        this.xAxisTicks
            .on('mouseover', function(d, i){
                var event = new Event('mouseover');
                self.bars[0][i].dispatchEvent(event);
            })
            .on('mouseout', function(d, i){
                var event = new Event('mouseout');
                self.bars[0][i].dispatchEvent(event);
            })

    },

    _render_y_axis: function(args){
        var self = this;

        var yAxis = d3.svg.axis()
            .scale(args.yScale)
            .tickPadding(5)
            .outerTickSize(0)
            .ticks(5)
            .orient(args.yAxisOrient);

        var yAxis_selection = this.svg.append('g')
            .attr('class', 'y-axis axis')
            .attr('transform', function(){
                var x_offset = self.margin.left;
                var y_offset = self.margin.top
                return 'translate(' + x_offset + ', ' + y_offset + ')'
            })
            .call(yAxis);

        yAxis_selection
            .select('path')
            .attr('marker-start', 'url(#y-arrowHead)')
    },

    _render_labels: function(args){
        var self = this;

        this.svg.append('text')
            .attr('transform', function(){
                var x_offset = self.margin.left + args.xAxisWidth / 2;
                var y_offset = self.svg_height - 5;
                return 'translate(' + x_offset + ',' + y_offset + ')';
            })
            .attr('text-anchor', 'middle')
            .attr('font-family', 'scala-sans-regular')
            .text('Last modified date')

        this.svg.append('text')
            .attr('transform', function(){
                var x_offset = 50;
                var y_offset = self.margin.top + args.yAxisHeight / 2;
                return 'translate(' + x_offset + ',' + y_offset + ')rotate(180)';
            })
            .attr('text-anchor', 'middle')
            .attr('font-family', 'scala-sans-regular')
            .text('Total words')
    }

});

app.views.VocabularyVisualization = VocabularyVisualizationView;
