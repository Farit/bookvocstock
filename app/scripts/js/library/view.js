var LibraryView = app.views.Account.extend({

    libraryTypes: {},

    initialize: function(options){
        app.views.Account.prototype.initialize.call(this);
        this.upload = new app.views.UploadText(
            {model: new app.models.Text()});

        var book_library_models = []
        var movie_library_models = []
        _.each(options.data, function(data){
            if (data.text_type == 'book'){
                book_library_models.push(new app.models.TextAnalytics(data));
            }
            else if (data.text_type == 'movie'){
                movie_library_models.push(new app.models.TextAnalytics(data));
            }
        });

        this.book_library_collection = new app.collections.Library(
            book_library_models)
        this.movie_library_collection = new app.collections.Library(
            movie_library_models)

        this.libraryTypes.books = new app.views.BookLibrary({
            total_number_of_pages: options.total_number_of_pages,
            collection: this.book_library_collection,
            main_el_height: this.get_height('site_main')
        });

        this.libraryTypes.movies = new app.views.MovieLibrary({
            total_number_of_pages: options.total_number_of_pages,
            collection: this.movie_library_collection,
            main_el_height: this.get_height('site_main')
        });

        this.listenTo(app.pubSub, 'upload-page:added', this.addCatalogueItem)
    },

    onTextUploadButtonClick: function(event){
        app.pubSub.trigger('upload-page:open');
    },

    render: function(){
        app.views.Account.prototype.render.call(this);
        this.render_page_dashboard(
            [
                {'name':'upload text', 'listener': this.onTextUploadButtonClick},
                {
                    'name':'books',
                    'class': 'library-type-btn books active',
                    'listener': _.bind(this.changeLibraryType, this)
                },
                {
                    'name':'movies',
                    'class': 'library-type-btn movies',
                    'listener': _.bind(this.changeLibraryType, this)
                }
            ]
        );
        _.each(this.libraryTypes, function(lib){
            lib.render();
        })
        this.libraryTypes.books.reveal();
    },

    changeLibraryType: function(event){
        this.el.querySelector('.library-type-btn.active').classList.remove(
            'active');
        _.each(this.libraryTypes, function(lib){
            lib.hide();
        })
        var lib = event.target.innerHTML.trim();
        event.target.classList.add('active');
        this.libraryTypes[lib].reveal();

    },

    addCatalogueItem: function(model){
        if (model.get('text_type') == 'book'){
            this.libraryTypes['books'].addCatalogueItem(model);
            this.el.querySelector('.library-type-btn.books').click();
        }
        else if (model.get('text_type') == 'movie'){
            this.libraryTypes['movies'].addCatalogueItem(model);
            this.el.querySelector('.library-type-btn.movies').click();
        }
    }
});

app.views.Library = LibraryView;

