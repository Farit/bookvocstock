var LibraryTablePaginationView = Backbone.View.extend({

    events: {
        'click .previous': 'onPrevious',
        'click .next': 'onNext',
        'change .pages': 'onPages'
    },
    svg_width: 40,
    svg_height: 30,

    initialize: function(options){
        this.pages_el = this.el.querySelector(".pages");
        this.page_number_el = null;
        this.current_page_number = 1;
        this.total_number_of_pages = options.total_number_of_pages;
        this.setState();
    },

    onPrevious: function(event){
        if (this.current_page_number != 1){
            this.current_page_number -= 1;
            this.trigger('pagination:page', this.current_page_number);
            this.setPageNumber(this.current_page_number);
            this.setState();
        }
    },

    onNext: function(event){
        if (this.current_page_number != this.total_number_of_pages){
            this.current_page_number += 1;
            this.trigger('pagination:page', this.current_page_number);
            this.setPageNumber(this.current_page_number);
            this.setState();
        }
    },

    onPages: function(event){
        var page_number = event.target.value;
        this.current_page_number = parseInt(page_number);
        this.trigger('pagination:page', page_number);
        this.setState();
    },

    setPageNumber: function(page_number){
        this.page_number_el.text(page_number);
    },

    setState: function(){
        this.el.style.visibility = 'visible';
        this.el.querySelector('.previous').classList.remove('disable');
        this.el.querySelector('.next').classList.remove('disable');
        if (this.current_page_number == 1){
            this.el.querySelector('.previous').classList.add('disable');
        }
        if (this.current_page_number == this.total_number_of_pages){
            this.el.querySelector('.next').classList.add('disable');
        }
        if ([0, 1].indexOf(this.total_number_of_pages != -1)){
            this.el.style.visibility = 'hidden';
        }
    },

    render: function(){
        var svg = d3.select(this.pages_el).append('svg')
            .attr('width', this.svg_width)
            .attr('height', this.svg_height);

        svg.append('line')
            .attr('x1', 0)
            .attr('y1', this.svg_height)
            .attr('x2', Math.ceil(this.svg_width / 4))
            .attr('y2', 0);

        svg.append('line')
            .attr('x1', 3 * Math.ceil(this.svg_width / 4))
            .attr('y1', this.svg_height)
            .attr('x2', this.svg_width)
            .attr('y2', 0);

        svg.selectAll('line')
            .attr('stroke', '#DDDDDD')
            .attr('stroke-width', '2px')
            .attr('shape-rendering', 'geometricPrecision');

        this.page_number_el = svg.append('text')
            .attr('x', Math.ceil(this.svg_width / 2))
            .attr('y', Math.ceil(this.svg_height / 2))
            .attr('dy', 5)
            .text(this.current_page_number)
            .attr('stroke', '#85144b')
            .attr('stroke-width', '0.2px')
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('text-rendering', 'geometricPrecision');
    },

    reset: function(total_number_of_pages){
        this.current_page_number = 1;
        this.total_number_of_pages = total_number_of_pages;
        this.setState();
        this.setPageNumber(this.current_page_number);
    }
});

app.views.LibraryTablePagination = LibraryTablePaginationView;
