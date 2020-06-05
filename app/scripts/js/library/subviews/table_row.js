var LibraryTableRowView = Backbone.View.extend({
    events: {
        'click': 'openLibraryText'
    },

    initialize: function(options){
        this.percent = d3.format(' >8.2%');
        this.thousands_format = d3.format(',d')

        this.listenTo(this.model, 'change:unknown', this.setUnknownDataField);
        this.listenTo(this.model, 'change:percent_mining',
                      this.onPercentMiningDataChange);
    },

    openLibraryText: function(event){
        if (this.model.get('percent_mining') == 100){
            window.location = '/library/text/' + this.model.get('id')
        }
    },

    setTitleDataField: function(){
        this.el.querySelector('.title').innerHTML = this.model.get('title');
    },

    setUniqueDataField: function(){
        var total_unique = this.model.get_total_unique();
        var value = total_unique != null ? this.thousands_format(total_unique) : 'n/a';
        this.el.querySelector('.unique').innerHTML = value;
    },

    setUnknownDataField: function(event){
        var unknown_el = this.el.querySelector('.unknown');
        var fragment = document.createDocumentFragment();
        var total_unique = this.model.get_total_unique();

        if (total_unique != null){
            var div = document.createElement('div');
            div.innerHTML = this.thousands_format(this.model.get('unknown'));
            fragment.appendChild(div);

            var div = document.createElement('div');
            div.innerHTML = this.percent(this.model.get('unknown') / total_unique);
            div.classList.add('cell-percent');
            div.classList.add('color-red');
            fragment.appendChild(div);

            while (unknown_el.hasChildNodes()){
                unknown_el.removeChild(unknown_el.lastChild);
            }
            unknown_el.appendChild(fragment);
        }
        else {
            unknown_el.innerHTML = 'n/a';
        }
    },

    onPercentMiningDataChange: function(event){
        if (this.model.get('percent_mining') != 100){
            this.show_percent_mining();
            this.check_percent_mining();
        }
        else {
            this.el.querySelector('.percent-mining').classList.remove('show');
            this.setUniqueDataField()
        }
    },

    render: function(){
        this.setTitleDataField();
        this.setUniqueDataField();
        this.setUnknownDataField();
        if (this.model.get('percent_mining') != 100){
            this.show_percent_mining();
            this.check_percent_mining();
        }
        return this.el
    },

    show_percent_mining: function(){
        var elem = this.el.querySelector('.percent-mining');
        var tag = elem.firstElementChild;

        var percent_mining = this.model.get('percent_mining') || 0;
        tag.innerHTML = 'loading ' + percent_mining + '%';

        var p = parseInt(percent_mining) / 100;
        if (elem.parentNode.offsetWidth * p > parseInt(tag.offsetWidth)){
            elem.style.width = percent_mining + '%';
        }
        elem.classList.add('show');
    },

    check_percent_mining: function(){
        var self = this;
        setTimeout(function(){self.model.check_mining();}, 5000);
    }
});

app.views.LibraryTableRow = LibraryTableRowView;


var BookLibraryTableRowView = app.views.LibraryTableRow.extend({

    initialize: function(options){
        app.views.LibraryTableRow.prototype.initialize.call(this, options);
        this.listenTo(this.model, 'change:title', this.setTitleDataField);
    },

    setAuthorDataField: function(){
        var author = this.model.get('text_attrs').author;
        this.el.querySelector('.author').innerHTML = author;
    },

    render: function(){
        app.views.LibraryTableRow.prototype.render.call(this);
        this.setAuthorDataField();
        return this.el
    }
});

app.views.BookLibraryTableRow = BookLibraryTableRowView;


var MovieLibraryTableRowView = app.views.LibraryTableRow.extend({

    initialize: function(options){
        app.views.LibraryTableRow.prototype.initialize.call(this, options);
        this.listenTo(this.model, 'change:title', this.setTitleDataField);
    },

    setYearDataField: function(){
        var year = this.model.get('text_attrs').year;
        this.el.querySelector('.year').innerHTML = year;
    },

    render: function(){
        app.views.LibraryTableRow.prototype.render.call(this);
        this.setYearDataField();
        return this.el
    }
});

app.views.MovieLibraryTableRow = MovieLibraryTableRowView;
