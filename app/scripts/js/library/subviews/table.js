var LibraryCatalogueView = Backbone.View.extend({

    initialize: function(options){
        this.main_el_height = options.main_el_height;
        this.collection = options.collection

        this.computePerPage()
        this.pagination = new app.views.LibraryTablePagination({
            el: this.el.querySelector('.library-catalogue-pagination'),
            total_number_of_pages: Math.ceil(this.collection.length / this.per_page)
        })
        this.listenTo(this.pagination, 'pagination:page', this.onPaginationPage)
    },

    computePerPage: function(){
        var library_height = this.el.offsetHeight;
        var max_height = this.main_el_height - library_height;
        // 40 is the margin plus height of the library-catalogue-page-item
        // element
        this.per_page = Math.floor((max_height) / 35) - 1;
    },

    render: function(){
        this.renderPage(1);
        this.pagination.render()
    },

    onPaginationPage: function(page_number){
        this.renderPage(page_number);
    },

    renderPage: function(page_number){
        var self = this;
        var start = (page_number - 1) * this.per_page;
        var end = start + this.per_page;
        var page_items = [];
        _.each(this.collection.slice(start, end), function(model){
            var item = new self.tableRow({
                model: model,
                el: document.importNode(
                    self.library_item_template.content, true).firstElementChild
            });
            page_items.push(item);
        })
        var new_page = new app.views.LibraryTablePage({
            page_items: page_items
        });
        var current_page = this.el.querySelector('.page');
        if (current_page){
            this.el.querySelector('.library-list-body').removeChild(current_page);
        }
        var page_content = new_page.render().el;
        this.el.querySelector('.library-list-body').appendChild(page_content);
    },

    addCatalogueItem: function(model){
        this.collection.add(model, {at: 0});
        var total_number_of_pages = Math.ceil(this.collection.length / this.per_page)
        this.pagination.reset(total_number_of_pages);
        this.renderPage(1);
    },

    reveal: function(){
        this.el.classList.add('reveal');
    },

    hide: function(){
        this.el.classList.remove('reveal');
    }
});
app.views.LibraryCatalogue = LibraryCatalogueView;


var LibraryTablePageView = Backbone.View.extend({
    tagName: 'div',
    className: 'page',

    initialize:function(options){
        this.page_items = options.page_items
    },

    render: function(){
        _.each(this.page_items, function(item){
            this.el.appendChild(item.render())
        }, this);
        return this
    }
});
app.views.LibraryTablePage = LibraryTablePageView;


var BookLibraryView = app.views.LibraryCatalogue.extend({
    el: document.getElementById('book-library'),

    initialize: function(options){
        app.views.LibraryCatalogue.prototype.initialize.call(this, options);
        this.tableRow = app.views.BookLibraryTableRow;
        this.library_item_template = this.el.querySelector('#book-library-item');
    }

});
app.views.BookLibrary = BookLibraryView;


var MovieLibraryView = app.views.LibraryCatalogue.extend({
    el: document.getElementById('movie-library'),

    initialize: function(options){
        app.views.LibraryCatalogue.prototype.initialize.call(this, options);
        this.tableRow = app.views.MovieLibraryTableRow;
        this.library_item_template = this.el.querySelector('#movie-library-item');
    }

});
app.views.MovieLibrary = MovieLibraryView;
