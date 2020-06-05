var TextVisualizationByOccurView = app.views.TextVisualizationBase.extend({
    el: document.getElementById("visualization-by-occur"),

    initialize: function(){
        app.views.TextVisualizationBase.prototype.initialize.call(this);
        this.cell_width = 36;
        this.cell_height = 36;
        this.margin = {'top': 2, 'right': 2, 'bottom': 2, 'left': 2}
        this.svg_width = this.el.offsetWidth;
        this.cell_color = d3.scale.ordinal()
            .domain(['unknown', 'known', 'learning', 'familiar'])
            .range(['red', '#2ECC40', '#FFDC00', 'blue']);
        this.cell_opacity = d3.scale.linear()
            .domain([0, 1]).range([0.2, 1]);
        this.tooltip = null;
        this.data_state = null;
    },

    createSvg: function(){
        this.svg = d3.select(this.el).append("svg")
            .attr('width', this.svg_width)
            .attr('height', this.svg_height);
    },

    percent: function(value, total){
        return (parseInt(value) / parseInt(total)) * 100;
    },

    get_total: function(obj){
        return obj.unknown + obj.known + obj.learning + obj.familiar;
    },

    render: function(){
        var data = this.model.get_occur();
        this.data_state = data;
        var numOfColumns = Math.floor(
            this.svg_width / (this.cell_width + this.margin.right));

        var row_counter = 0;
        var column_counter = 0
        for (var i = 0; i < data.length; i++){
            data[i]['row'] = row_counter;
            data[i]['column'] = column_counter;
            if (column_counter == numOfColumns - 1){
                row_counter += 1;
                column_counter = 0;
            }
            else{
                column_counter += 1;
            }
        }

        this.svg_height = (row_counter + 1) * (this.cell_height + this.margin.bottom);
        this.createSvg();
        this._render(data);
    },

    update: function(){
        var data = this.model.get_occur();
        var change = [];

        for(var i_ind = 0; i_ind < data.length; i_ind++){
            var new_obj = data[i_ind];

            for(var j_ind = 0; j_ind < this.data_state.length; j_ind ++){
                var old_obj = this.data_state[j_ind];
                if(old_obj.occur == new_obj.occur){
                    var is_equal = (old_obj.unknown == new_obj.unknown &&
                                    old_obj.known == new_obj.known &&
                                    old_obj.learning == new_obj.learning &&
                                    old_obj.familiar == new_obj.familiar)
                    if (! is_equal){
                        old_obj.unknown = new_obj.unknown;
                        old_obj.known = new_obj.known;
                        old_obj.learning = new_obj.learning;
                        old_obj.familiar = new_obj.familiar;
                        change.push(old_obj)
                    }
                }
            }
        }

        var active_cell = this.el.querySelector('.cell.active');
        // Remove open tooltip
        this._initiate_click(active_cell);
        this._render(change);
        // Reopen tooltip
        this._initiate_click(active_cell);
    },

    _initiate_click: function(cell){
        if (cell){
            var event = new Event('click');
            cell.dispatchEvent(event);
        }
    },

    _render: function(data){
        var self = this;

        var cells = this.svg.selectAll('g.cell')
            .data(data, function(d, i){
                return d.occur;
            })

        var groups = cells.enter()
            .append('g')
            .attr('class', 'cell');

        groups.append('rect');
        groups.append('text')
        groups.append('polygon')

        cells.selectAll('rect')
            .data(function(d){
                return [d];
            })
            .attr('width', self.cell_width)
            .attr('height', self.cell_height)
            .attr('x', function(d, i){
                var width = self.cell_width + self.margin['left'];
                return width * d['column'];
            })
            .attr('y', function(d, i){
                var height = self.cell_height + self.margin['bottom'];
                return height * d['row'];
            })
            .each(function(d, i){
                var total =  self.get_total(d);
                var known_percent = self.percent(d['known'], total);
                var unknown_percent = self.percent(d['unknown'], total);
                var familiar_percent = self.percent(d['familiar'], total);
                var learning_percent = self.percent(d['learning'], total);

                var rect_selection = d3.select(this);
                if (known_percent == 100){
                    rect_selection.attr('fill', self.cell_color('known'))
                    rect_selection.attr('fill-opacity', 1)
                }
                else if (unknown_percent > 0){
                    rect_selection.attr('fill', self.cell_color('unknown'))
                    rect_selection.attr(
                        'fill-opacity',
                        self.cell_opacity(d3.round(unknown_percent / 100, 1)))
                }
                else if (learning_percent > 0){
                    rect_selection.attr('fill', self.cell_color('learning'))
                    rect_selection.attr(
                        'fill-opacity',
                        self.cell_opacity(d3.round(learning_percent / 100, 1)))
                }
                else{
                    rect_selection.attr('fill', self.cell_color('familiar'))
                    rect_selection.attr(
                        'fill-opacity',
                        self.cell_opacity(d3.round(familiar_percent / 100, 1)))
                }
            })

        cells.selectAll('text')
            .data(function(d){
                return [d];
            })
            .attr('class', 'occur')
            .text(function(d, i){
                return d['occur'];
            })
            .attr('x', function(d, i){
                var width = self.cell_width + self.margin['left'];
                return width * d['column'] + Math.floor(self.cell_width / 2);
            })
            .attr('y', function(d, i){
                var height = self.cell_height + self.margin['bottom'];
                return height * d['row'];
            })
            .attr('text-anchor', 'middle')
            .attr('dy', function(d, i){
                var selfBBox = this.getBBox()
                return Math.floor(self.cell_height / 2 + selfBBox.height / 2);
            })
            .attr('fill', 'black');

        cells.selectAll('polygon')
            .data(function(d){
                return [d];
            })
            .attr('points', function(d, i){
                var width = self.cell_width + self.margin['left']
                var x_offset = width * d['column'];
                var height = self.cell_height + self.margin['bottom']
                var y_offset = height * d['row'];

                var x1 = x_offset;
                var y1 = y_offset;

                var x2 = x_offset + self.cell_width;
                var y2 = y_offset;

                var x3 = x_offset + self.cell_width / 2;
                var y3 = y_offset + (self.cell_height / 4);

                return x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3;
            })
            .attr('fill', 'none');

        cells.on("click", function(d, i){
            var is_active = this.classList.contains('active');
            var active_cell = this.parentNode.querySelector('.cell.active');

            //Remove
            if (active_cell != null ){
                active_cell.classList.remove('active');
                d3.select(active_cell).select('polygon')
                    .attr('fill', 'none');
                d3.select(self.el.querySelector('.tooltip'))
                    .style('opacity', 0)
                    .style('pointer-events', 'none');
            }

            if (!is_active){
                d3.select(this).select('polygon')
                    .attr('fill', 'black')
                this.classList.add('active');
                self.tooltip = self._render_tooltip(d);
            }
        })
    },

    _render_tooltip(data){
        var self = this;
        var total =  self.get_total(data);
        var formatter = d3.format(' <' + total.toString().length + 'd');

        var tooltip =d3.select(this.el.querySelector('.tooltip'))
            .style('pointer-events', 'auto')
            .style('opacity', 1)

        tooltip.select('.desc').html("");
        tooltip.select('.desc')
            .append('span')
            .text(total)
            .style('font-family', 'scala-sans-caps')

        tooltip.select('.desc')
            .append('span')
            .text(function(){
                if(total == 1){
                    return ' word occurs '
                }
                return ' words occur '
            })

        tooltip.select('.desc')
            .append('span')
            .text(data['occur'])
            .style('font-family', 'scala-sans-caps')

        tooltip.select('.desc')
            .append('span')
            .text(function(){
                if(data['occur'] == 1){
                    return ' time'
                }
                return ' times'
            })

        tooltip.select('.number.unknown').text(data['unknown']);
        tooltip.select('.number.known').text(data['known']);
        tooltip.select('.number.familiar').text(data['familiar']);
        tooltip.select('.number.learning').text(data['learning']);

        tooltip
            .transition()
            .duration(200)
            .style('left', function(d, i){
                var selfWidth = this.offsetWidth;
                var cellBBox = d3.event.target.getBBox();
                if (cellBBox.x < selfWidth){
                    var x_offset = cellBBox.x;
                    return x_offset + 'px';
                }
                else if ((cellBBox.x + selfWidth) > self.svg_width){
                    var x_offset = cellBBox.x + cellBBox.width - selfWidth;
                    return x_offset + 'px';
                }
                else{
                    var x_offset = cellBBox.x + cellBBox.width / 2 - selfWidth / 2;
                    return x_offset + 'px';
                }
            })
            .style('top', function(d, i){
                var cellBBox = d3.event.target.getBBox();
                var selfHeight = this.offsetHeight;
                // return -(selfHeight - cellBBox.y - self.margin.top) + 'px';
                return -(selfHeight - cellBBox.y) + 'px';
            })

        tooltip.selectAll('.stage')
           .on('click', function(){
               var stage = this.getAttribute('data-stage');
               var args = {'wordsListName': stage,
                           'occur': parseInt(data.occur)}
               self.showWordsList(args)
           });

    },

});

app.views.TextVisualizationByOccur = TextVisualizationByOccurView;
