var AccountView = app.views.Base.extend({
    el: document.getElementsByTagName('body'),
    _subElements: {'site_header': null, 'site_main': null},
    _heights: {'site_header': null, 'site_main': null},

    initialize: function(){
        app.views.Base.prototype.initialize.call(this);
        this._subElements['site_header'] = this.el.querySelector('#site-header');
        this._subElements['site_main'] = this.el.querySelector('#site-main');
    },

    get_height: function(element){
        if (this._heights[element] == null){
            this._heights[element] = this._subElements[element].offsetHeight;
        }
        return this._heights[element]
    },

    get_element: function(element){
        return this._subElements[element]
    },

    render: function(){
        this.render_open_site_navigation_icon();
    },

    render_open_site_navigation_icon: function(){
        var site_nav_el = this.get_element('site_header').querySelector(
            '#site-navigation');
        var page_dashboard_el = this.get_element('site_header').querySelector(
            '#page-dashboard');

        var svg_width = this.get_height('site_header');
        var svg_height = this.get_height('site_header');

        var x = 16;
        var y = 3;
        var z = 5;

        var box_width = x + y + z;
        var box_height = x;

        var padding = {
            top: Math.floor((svg_height - box_height) / 2),
            right: Math.floor((svg_width - box_width) / 2),
            bottom: Math.floor((svg_height - box_height) / 2),
            left: Math.floor((svg_width - box_width) / 2)
        };

        var data = [
            {
                'x1': padding.left,
                'y1': padding.top,
                'x2': x + padding.left,
                'y2': padding.top,
                'x2_translate': x + padding.left,
                'y2_translate': x + padding.top,
                'hover_stroke': '#DDDDDD',
            },
            {
                'x1': x + y + padding.left,
                'y1': padding.top,
                'x2': x + y + z + padding.left,
                'y2': padding.top,
                'x2_translate': x + y + padding.left,
                'y2_translate': padding.top,
                'hover_stroke': 'black',
            },
            {
                'x1': padding.left,
                'y1': Math.floor(padding.top + x /2),
                'x2': z + padding.left,
                'y2': Math.floor(padding.top + x /2),
                'x2_translate':  padding.left,
                'y2_translate': Math.floor(padding.top + x /2),
                'hover_stroke': 'black',
            },
            {
                'x1': z + y + padding.left,
                'y1': Math.floor(padding.top + x /2),
                'x2': x + y + z + padding.left,
                'y2': Math.floor(padding.top + x /2),
                'x2_translate': y + z + padding.left,
                'y2_translate': Math.floor(padding.top + x /2),
                'hover_stroke': '#DDDDDD',
            },
            {
                'x1': padding.left,
                'y1': x + padding.top,
                'x2': x + padding.left,
                'y2': x + padding.top,
                'x2_translate': x + padding.left,
                'y2_translate': padding.top,
                'hover_stroke': '#DDDDDD',
            },
            {
                'x1': x + y + padding.left,
                'y1': x + padding.top,
                'x2': x + y + z + padding.left,
                'y2': x + padding.top,
                'x2_translate': x + y + padding.left,
                'y2_translate': x + padding.top,
                'hover_stroke': 'black',
            },
        ]

        function onClick(){
            if (!site_nav_el.classList.contains('hide')){
                site_nav_el.classList.add('hide');
                page_dashboard_el.classList.remove('hide');
                svg.selectAll('line')
                    .transition()
                    .duration(1000)
                    .attr('x2', function(d, i){return d.x2})
                    .attr('y2', function(d, i){return d.y2})
            }
            else{
                site_nav_el.classList.remove('hide');
                page_dashboard_el.classList.add('hide');
                svg.selectAll('line')
                    .transition()
                    .duration(1000)
                    .attr('x2', function(d, i){return d.x2_translate})
                    .attr('y2', function(d, i){return d.y2_translate})
            }
        }

        var svg = d3.select(this.get_element('site_header')).append('svg')
            .attr('id', 'open-site-navigation-icon')
            .attr('width', svg_width)
            .attr('height', svg_height)
            .on('click', _.bind(onClick, this))

        var group = svg.append('g')


        group.selectAll('line').data(data)
            .enter()
                .append('line')
                .attr('x1', function(d, i){return d.x1})
                .attr('y1', function(d, i){return d.y1})
                .attr('x2', function(d, i){return d.x2})
                .attr('y2', function(d, i){return d.y2})
                .attr('stroke', 'black')
                .attr('stroke-width', '2px')

        svg.on('mouseover', function(){
            svg.selectAll('line')
                .attr('stroke', function(d, i){return d.hover_stroke;})
        })

        svg.on('mouseout', function(){
            svg.selectAll('line').attr('stroke', 'black')
        })

    },

    render_page_dashboard: function(items){
        var fragment = document.createDocumentFragment();
        _.each(items, function(item){
            var li = document.createElement('li');
            li.classList.add('item');
            li.classList.add('color-grey');
            if (item.class != undefined){
                _.each(item.class.split(" "), function(className){
                    li.classList.add(className);
                })
            }
            li.innerHTML = item['name'];
            li.addEventListener('click', item['listener']);
            fragment.appendChild(li);
        });
        this.get_element('site_header').querySelector(
            '#page-dashboard').appendChild(fragment);
    }

})

app.views.Account = AccountView;
