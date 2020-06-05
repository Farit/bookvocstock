'use strict';

var app = {};
app.models = {};
app.views = {};
app.collections = {};

app.pubSub = _.extend({}, Backbone.Events);
var BaseView = Backbone.View.extend({

    submission_error_codes: {
        500: 'Server error.',
        504: 'Server temporary unavailable.'
    },

    initialize: function(){
        this.listenTo(this.model, 'request', this._requestStarted);
        // Calls `requestError` if request completes with error
        this.listenTo(this.model, 'sync', this._requestSuccess);
        // Calls `requestError` if request completes with error
        this.listenTo(this.model, 'error', this._requestError);
    },

    _requestStarted: function(event){
        this.requestStarted(event);
    },

    _requestSuccess: function(event){
        this.requestSuccess(event);
    },

    _requestError: function(model, xhr, options){
        var status_code = parseInt(xhr.status, 10);
        if (status_code == 500 && xhr.statusText != 'error'){
            var description = xhr.statusText;
        }
        else {
            var description = this.submission_error_codes[status_code];
        }
        this.requestError(description);
    },

    requestStarted: function(event){},
    requestSuccess: function(event){},
    requestError: function(description){},

})

app.views.Base = BaseView;
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
// Base Model for: LoginModel, SignupModel, PasswordRecoveryModel,
//                 PasswordResetModel

var AuthRegModel = Backbone.Model.extend({


    validate: function(attrs, options){
        var result = undefined;
        var self = this;

        if (options.validate_field === undefined){

            _.each(this.fields_to_validate, function(field, ind, list){
                var value = this.attributes[field];
                res = this.validate_field(field, value);
                result = result || res;
            }, this);

        }
        else {
            var field = options.validate_field;
            var res = self.validate_field(field, attrs[field]);
            result = res;
        }

        return result
    },

    validate_field: function(field, value){
        var self = this;
        // Is field must go through validation process
        if (this.fields_to_validate.indexOf(field) != -1){

            var result = self['validate_' + field](value);
            if (typeof result != undefined){
                return result
            }
        }
    },

    validate_email: function(email){
        if (email === undefined || email === null || email.trim() == ''){
            return {invalid_field: 'email', desc: 'Enter your email.'};
        }

        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

        if (!re.test(email)){
            return {
                invalid_field: 'email',
                desc: 'Please enter a valid email address.'
            };
        }
    },

    validate_password: function(password){
        if (password === undefined || password === null || password.trim() == ''){
            return {invalid_field: 'password', desc: 'Enter your password.'};
        }

        if (password.length < 8){
            return {
                invalid_field: 'password',
                desc: 'Your password has to be at least 8 characters long.'
            };
        }

        var re = /^[A-Za-z0-9!@#$%&]+$/;

        if (!re.test(password)){
            return {
                invalid_field: 'password',
                desc: 'Your password has the illegal characters.'
            };
        }
    },
});

app.models.AuthReg = AuthRegModel;
// Base View for: LoginView, SignupView, PasswordRecoveryView,
//                PasswordResetView

var AuthRegView = app.views.Base.extend({

    events: {
        'change input[name="email"]': 'onEmailInputChangeHandler',
        'input input[name="email"]': 'onEmailInputChangeHandler',
        'change input[name="password"]': 'onPasswordInputChangeHandler',
        'input input[name="password"]': 'onPasswordInputChangeHandler',
        'click #submit-form-button': 'submitHandler',
        'click input[name="show_password"]': 'onShowPassword'
    },

    error_labels: {
        'email': document.querySelector(
            '.reg-auth-form .error-label[for="email"]'),
        'password': document.querySelector(
            '.reg-auth-form .error-label[for="password"]'),
        'submission': document.querySelector(
            '.reg-auth-form .submission-error-label')
    },

    initialize: function(){
        app.views.Base.prototype.initialize.call(this);
        this.listenTo(this.model, 'change:email', this.onEmailChangeHandler);
        this.listenTo(this.model, 'change:password',
            this.onPasswordChangeHandler);

        this.listenTo(this.model, 'invalid', this.fieldValidationError);

        // wait = 1000 milliseconds
        this._setEmailFieldValueDebounced = _.debounce(
            _.bind(this.setFieldValue, this), 1000);

        // wait = 1000 milliseconds
        this._setPasswordFieldValueDebounced = _.debounce(
            _.bind(this.setFieldValue, this), 1000);

        this.loading_spinner = new app.views.ButtonSpinner(
            {'el': this.el.querySelector('#submit-form-button')});
    },

    onShowPassword: function(event){
       var password_elem = document.querySelector('input[name=password]');
       var show_password = document.querySelector('input[name=show_password]');
       if (show_password.checked){
           password_elem.setAttribute('type', 'text')
       }
       else {
           password_elem.setAttribute('type', 'password')
       }
    },

    onEmailChangeHandler: function (event) {
        // Remove error label
        this.error_labels['email'].innerHTML = '';
    },

    onPasswordChangeHandler: function (event) {
        // Remove error label
        this.error_labels['password'].innerHTML = '';
    },

    onEmailInputChangeHandler: function(event){
        this.onInputChangeHandler(event)
        this._setEmailFieldValueDebounced(event)
    },

    onPasswordInputChangeHandler: function(event){
        this.onInputChangeHandler(event)
        this._setPasswordFieldValueDebounced(event)
    },

    onInputChangeHandler: function(event){
        // Remove submission error label
        this.error_labels['submission'].innerHTML = '';
    },

    setFieldValue: function(event){
        // Clear old field value
        this.model.unset(
            event.target.name,
            {silent: true}
        );

        // Set new field value
        this.model.set(
            event.target.name,
            event.target.value,
            {validate: true, validate_field: event.target.name}
        );
    },

    fieldValidationError: function(event){
        var self = this;
        var invalid_field = this.model.validationError.invalid_field;

        if (typeof invalid_field != 'undefined'){
            var error_desc = self.model.validationError.desc;
            this.error_labels[invalid_field].innerHTML = error_desc
        }
    },

    submitHandler: function(event){
        // Remove submission error label
        this.error_labels['submission'].innerHTML = '';

        var self = this;
        event.preventDefault();

        var input_selectors = '';
        _.each(self.model.fields_to_validate, function(elem, ind, list){
            input_selectors += 'input[name="' + elem + '"]';
            if (ind != (list.length - 1)){
                input_selectors += ', ';
            }
        });

        var input_elems = this.el.querySelectorAll(input_selectors);

        _.each(input_elems, function(element, index, list){
            self.model.set(
                element.name,
                element.value,
                {validate: true, validate_field: element.name});
        }, self);

        this.model.save();
    },

    /**
     * Request sent event
     */
    requestStarted: function(event){
        this.loading_spinner.trigger('request:started');
    },

    /**
     * Request completed successfully
     */
    requestSuccess: function(event){
        this.loading_spinner.trigger('request:ended');
    },

    /**
     * Request completed with error
     */
    requestError: function(description){
        this.loading_spinner.trigger('request:ended');
        this.error_labels['submission'].innerHTML = description;
    }

});

app.views.AuthReg = AuthRegView;
var TextModel = Backbone.Model.extend({
    urlRoot: '/library/text/',

    check_mining: function(){
        var percent_mining = this.get('percent_mining') || 0;
        if (percent_mining != 100){
            this.unset('percent_mining', {silent: true});
            this.fetch();
        }
    }
});

app.models.Text = TextModel;
var TextDataModel = app.models.Text.extend({
    urlRoot: '/library/text/data/',

    parse: function(data, options){
        var words = data['words'];
        data['words'] = JSON.parse(words);
        return data
    },

    change_stage: function(word_index, new_stage){
        this.get('words')[word_index].stage = new_stage;
        this.trigger('update:viz');
    },

    get_words: function(args){
        var data = [];
        var words_array = this.get('words');
        if(args.last_index == null){
            var ind = 0;
        }
        else{
            var ind = args.last_index + 1;
        }

        for (ind; ind < words_array.length; ind++){

            if (words_array[ind]['stage'] == args.stage){
                var include = true;
                if (args.occur){
                    include = true ? words_array[ind].occur == args.occur : false;
                }
                if (include && data.length < args.quantity){
                    var item = _.clone(words_array[ind]);
                    item['index'] = ind;
                    data.push(item)
                }
            }

        }
        return data
    },

    /**
     * Aggregates total value
     * if args == undefined returns total words in text.
     * else returns total words in specified learning stage.
     */
    get_total: function(args){
        var value = 0;
        var words = this.get('words');

        if(args !== undefined){
            for(var ind=0; ind < words.length; ind++){
                if (words[ind].stage == args.stage){
                    if(args.occur == null || args.occur == words[ind].occur){
                        value += 1;
                    }
                }
            }
        }
        else{
            value = words.length;
        }

        return value
    },

    get_total_common_words: function(){
        var value = 0;
        var words = this.get('words');

        for(var ind=0; ind < words.length; ind++){
            if (words[ind].fivet_common_word != undefined){
                value += 1;
            }
        }
        return value
    },

    get_occur: function(){
        // data = [
        //    { occur: 0, unknown: 0, known: 0, learning: 0, familiar: 0 }, ...]
        var data = []
        var words_by_occurrences = _.groupBy(this.get('words'), function(item){
            return item.occur;
        });

        _.each(words_by_occurrences, function(list, occurrence){
            words_by_occurrences[occurrence] = _.groupBy(list, function(item){
                return item.stage;
            });
            var data_item = {'occur': parseInt(occurrence)};
            _.each(words_by_occurrences[occurrence], function(obj, stage){
                if(stage == 'unknown'){
                    data_item['unknown'] = obj.length;
                }
                else if(stage == 'known'){
                    data_item['known'] = obj.length;
                }
                else if(stage == 'learning'){
                    data_item['learning'] = obj.length;
                }
                else if(stage == 'familiar'){
                    data_item['familiar'] = obj.length;
                }
            })
            data.push(_.defaults(
                data_item,
                {unknown: 0, known: 0, learning: 0, familiar: 0 }
            ));
        });
        return data
    }

});

app.models.TextData = TextDataModel;
var TextAnalyticsModel = app.models.Text.extend({
    urlRoot: '/library/text/analytics/',

    get_total_unique: function(){
        if (this.get('percent_mining') != 100){
            return null;
        }
        return this.get('unknown') + this.get('known') +
               this.get('learning') + this.get('familiar');
    }
});

app.models.TextAnalytics = TextAnalyticsModel;

var ButtonSpinnerView = Backbone.View.extend({

    initialize: function(){
        this.on('request:started', this.onRequestStarted);
        this.on('request:ended', this.onRequestEnded);
        this.btn_title = this.el.innerHTML;
    },

    onRequestStarted: function(event){
        this.el.innerHTML = '<div class="spinner">'+
                                '<div class="rect1"></div>' +
                                '<div class="rect2"></div>' +
                                '<div class="rect3"></div>' +
                                '<div class="rect4"></div>' +
                                '<div class="rect5"></div>' +
                            '</div>';
    },

    onRequestEnded: function(){
        this.el.innerHTML = this.btn_title;
    },
})

app.views.ButtonSpinner = ButtonSpinnerView;

var SignupModel = app.models.AuthReg.extend({

    url: '/signup',

    defaults: {
        'email': null,
        'password': null
    },

    // Fields that must go through validation process
    fields_to_validate: ['email', 'password'],
});

app.models.Signup = SignupModel;
var SignupView = app.views.AuthReg.extend({

    el: document.getElementById('signup-form'),

    submission_error_codes: _.extend(
        {409: 'Account with that email address already exists'},
        app.views.AuthReg.prototype.submission_error_codes),

    /**
     * Request completed successfully
     */
    requestSuccess: function(event){
        app.views.AuthReg.prototype.requestSuccess.call(this);
        // User registration was successful, redirect to user library page
        window.location = '/library';
    },

});

app.views.Signup = SignupView;
var LoginModel = app.models.AuthReg.extend({

    url: '/login',

    defaults: {
        'email': null,
        'password': null
    },

    // Fields that must go through validation process
    fields_to_validate: ['email', 'password'],

    validate_password: function(password){
        if (password === undefined || password === null || password.trim() == ''){
            return {invalid_field: 'password', desc: 'Enter your password'};
        }
    },

});

app.models.Login = LoginModel;
var LoginView = app.views.AuthReg.extend({

    el: document.getElementById('login-form'),

    submission_error_codes: _.extend(
        {403: 'Wrong email or password. Please try again!'},
        app.views.AuthReg.prototype.submission_error_codes),

    /**
     * Request completed successfully
     */
    requestSuccess: function(event){
        app.views.AuthReg.prototype.requestSuccess.call(this);
        // User registration was successful, redirect to user library page
        window.location = '/library';
    },

});

app.views.Login = LoginView;
var PasswordRecoveryModel = app.models.AuthReg.extend({

    url: '/password/recovery',

    defaults: {
        'email': null,
    },

    // Fields that must go through validation process
    fields_to_validate: ['email'],
});

app.models.PasswordRecovery = PasswordRecoveryModel;
var PasswordRecoveryView = app.views.AuthReg.extend({

    el: document.getElementById('forgot-password-form'),

    submission_error_codes: _.extend(
        {400: "We couldn't find an account with that email."},
        app.views.AuthReg.prototype.submission_error_codes),

    /**
     * Request completed successfully
     */
    requestSuccess: function(event){
        app.views.AuthReg.prototype.requestSuccess.call(this);
        this.el.innerHTML = '<p><span class="success">Success!</span> Please' +
                            ' check your email for the link to change ' +
                            'your password.</p>'
    },
});

app.views.PasswordRecovery = PasswordRecoveryView;
var PasswordResetModel = app.models.AuthReg.extend({

    url: '/password/reset',

    defaults: {
        'token': window.location.search.substring(1).split('=')[1],
        'password': null,
    },

    // Fields that must go through validation process
    fields_to_validate: ['password'],
});

app.models.PasswordReset = PasswordResetModel;
var PasswordResetView = app.views.AuthReg.extend({

    el: document.getElementById('reset-password-form'),

    submission_error_codes: _.extend(
        {400: 'Invalid token'},
        app.views.AuthReg.prototype.submission_error_codes),

    /**
     * Request completed successfully
     */
    requestSuccess: function(event){
        app.views.AuthReg.prototype.requestSuccess.call(this);
        // User registration was successful, redirect to user library page
        window.location = '/library';
    },

});

app.views.PasswordReset = PasswordResetView;
var LibraryCollection = Backbone.Collection.extend({
    model: app.models.TextAnalytics
});
app.collections.Library = LibraryCollection;

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
var UploadTextView = app.views.Base.extend({
    el: document.getElementById('text-upload-wrapper'),

    events: {
        'click #text-upload-browser': 'openFileBrowserEvent',
        'click #text-upload-browser input[type=file]': 'stopEventPropagation',
        'change #text-upload-browser input[type=file]': 'fileSelectedEvent',
        'click #text-upload-card input[name=text_type]': 'changeTextType',
        'click #text-upload-card input[value=cancel]': 'cancelEvent',
        'click #text-upload-card input[value=submit]': 'submitEvent',
    },

    transitions: {
        'idleState': {'openEvent': 'activeState'},
        'activeState': {
            'closeEvent': 'idleState',
            'fileSelectedEvent': 'textSaveState'
        },
        'textSaveState': {'requestStartedEvent': 'loadingTimerState'},
        'loadingTimerState': {
            'requestErrorEvent': 'errorState',
            'textCreatedEvent': 'textCardState',
            'closeEvent': 'haltState'
        },
        'errorState': {'closeEvent': 'idleState'},
        'textCardState': {
            'cancelEvent': 'activeState',
            'submitEvent': 'submitState',
            'closeEvent': 'haltState'
        },
        'submitState': {'finishEvent': 'idleState'}
    },

    initialize: function(){
        app.views.Base.prototype.initialize.call(this);
        this.event = null;
        this.current_state = null;
        this.selected_file_name = null;
        this.error_description = null;
        this._loading_timer = null;
        this.idleState();
        this._render_close_icon(this.el.querySelector('.header'));
        this._render_choose_file_icon('#text-upload-browser');
        this.listenTo(app.pubSub, 'upload-page:open', this.openEvent);
        this.listenTo(this.model, 'change:id', this.textCreatedEvent);
        this.listenTo(this, 'closeEvent', this.closeEvent);
        this.listenTo(this, 'finishEvent', this.finishEvent);
    },

    triggerTransition: function(eventName){
        if(this.current_state == 'haltState'){
            if(eventName == 'openEvent'){
                this[this.pending_state]();
                this.el.classList.add('reveal');
            }
            else{
                this.pending_state = this.transitions[this.pending_state][eventName];
            }
        }
        else{
            var next_state = this.transitions[this.current_state][eventName];
            this[next_state]();
        }
    },

    openFileBrowserEvent: function(event){
        this.event = event;
        var text_upload_browser = this.el.querySelector('#text-upload-browser');
        text_upload_browser['file-browser'].click();
    },

    stopEventPropagation: function(event){
        this.event = event;
        this.event.stopPropagation();
    },

    fileSelectedEvent: function(event){
        this.event = event;
        this.triggerTransition('fileSelectedEvent');
    },

    cancelEvent: function(event){
        this.event = event;
        this.triggerTransition('cancelEvent');
    },

    submitEvent: function(event){
        this.event = event;
        this.triggerTransition('submitEvent');
    },

    openEvent: function(event){
        this.event = event;
        this.triggerTransition('openEvent');
    },

    closeEvent: function(event){
        this.event = event;
        this.triggerTransition('closeEvent');
    },

    finishEvent: function(event){
        this.event = event;
        this.triggerTransition('finishEvent');
    },

    textCreatedEvent: function(event){
        this.event = event;
        this.triggerTransition('textCreatedEvent');
    },

    requestStarted: function(event){
        if(this.current_state == 'textSaveState'){
            this.event = event;
            this.triggerTransition('requestStartedEvent');
        }
    },

    requestError: function(description){
        if(this.current_state == 'loadingTimerState'){
            this.error_description = description;
            console.log('error description: ' + this.error_description)
            this.triggerTransition('requestErrorEvent');
        }
    },

    idleState: function(){
        this.current_state = 'idleState';
        this.el.classList.remove('reveal');
        this.hide();
        this.reset();
    },

    activeState: function(){
        this.current_state = 'activeState';
        this.hide();
        this.reset();
        this.show('textUploadBrowser');
        this.el.classList.add('reveal');
    },

    textSaveState: function(){
        this.current_state = 'textSaveState';
        var self = this;
        var target = this.el.querySelector('#text-upload-browser')['file-browser'];
        var file = target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            self.selected_file_name = file.name;
            self.model.set('file', event.target.result);
            self.model.save();
        };
        reader.readAsDataURL(file);
    },

    loadingTimerState: function(){
        this.current_state = 'loadingTimerState';
        this.hide();
        this.show('textUploadTimer');
    },

    haltState: function(){
        this.pending_state = this.current_state;
        this.current_state = 'haltState';
        this.el.classList.remove('reveal');
        this.hide();
    },

    errorState: function(){
        this.current_state = 'errorState';
        this.hide()
        this.reset('textUploadTimer');
        this.show('textUploadError');
    },

    textCardState: function(){
        this.current_state = 'textCardState';
        this.hide()
        this.reset('textUploadTimer');
        this.show('textUploadCard');
    },

    submitState: function(){
        this.current_state = 'submitState';
        this.event.preventDefault();

        // Update Text file
        var el = this.el.querySelector('#text-upload-card');

        this.model.set('title', el['title'].value);
        this.model.set(
            'text_type',
            el.querySelector('input[name="text_type"]:checked').value
        );

        var text_attrs = {};
        var NodeList = el.querySelectorAll(
            '.text-attr.' + this.model.get('text_type') + ' input');
        _.each(NodeList, function(node, NodeList){
            text_attrs[node.name] = node.value;
        })
        this.model.set('text_attrs', text_attrs);

        this.model.save(
            {
                'title': this.model.get('title'),
                'text_type': this.model.get('text_type'),
                'text_attrs': this.model.get('text_attrs'),
            },
            {'patch': true}
        );

        // Put Text file to the mining.
        $.ajax({
            url: '/library/text/mining/'+ this.model.get('id'),
            type: 'POST',
        });

        app.pubSub.trigger(
            'upload-page:added',
            new app.models.TextAnalytics(_.clone(this.model.attributes)));
        this.trigger('finishEvent');
    },

    reset: function(entity){
        if(entity === undefined){
            this.event = null;
            this.selected_file_name = null;
            this.error_description = null;
            this.model.clear({silent: true});
        }

        if (entity === undefined || entity == 'textUploadError'){
            this.el.querySelector('#text-upload-error').innerHTML = '';
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').reset()
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            var el = this.el.querySelector('#text-upload-timer');
            el.classList.remove('reveal');

            if (this._loading_timer != undefined){
                this._loading_timer.remove();
                this._loading_timer = null;
            }
            if (this._loading_timer_timeout != null){
                clearTimeout(this._loading_timer_timeout);
            }
        }

        if (entity === undefined || entity == 'textUploadCard'){
            this.el.querySelector('#text-upload-card').reset();
        }
    },

    show: function(entity){
        if (entity === undefined || entity == 'textUploadError'){
            var el = this.el.querySelector('#text-upload-error');
            el.innerHTML = this.error_description;
            el.classList.add('reveal');
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').classList.add('reveal');
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            var el = this.el.querySelector('#text-upload-timer');
            el.classList.add('reveal');

            if (this._loading_timer == null){
                var formatTime = d3.time.format("%S sec.");
                this._loading_timer = d3.select(el).append('div');

                var today = d3.time.day(new Date);
                var deadline = +(new Date()) + 30000;
                this._loading_timer_timeout = null;
                var self = this;
                (function tick(){
                    var now = new Date;
                    self._loading_timer.text(formatTime(new Date(
                        +today + deadline - d3.time.second(now)
                    )));
                    self._loading_timer_timeout = setTimeout(tick, 1000 - now % 1000);
                })();
            }
        }

        if (entity === undefined || entity == 'textUploadCard'){
            var el = this.el.querySelector('#text-upload-card');

            if (!this.model.get('title')){
                el['title'].value = this.selected_file_name;
            }
            else{
                el['title'].value = this.model.get('title');
            }

            var text_type = this.model.get('text_type');
            el[text_type + '-type'].checked = true;

            var attributes = this.model.get('text_attrs');
            _.each(attributes, function(value, key){
                var sel = '.text-attr.' + text_type + ' input[name=' + key + ']'
                el.querySelector(sel).value = value;
            })


            if (el.querySelector('.text-attr.reveal') != null){
                el.querySelector('.text-attr.reveal').classList.remove('reveal');
            }

            el.querySelector('.text-attr.' + text_type).classList.add('reveal');
            el.classList.add('reveal');
        }
    },

    changeTextType: function(event){
        var el = this.el.querySelector('#text-upload-card');
        el.querySelector('.text-attr.reveal').classList.remove('reveal');

        var text_type = event.target.value;
        el.querySelector('.text-attr.' + text_type).classList.add('reveal');
    },

    hide: function(entity){
        if (entity === undefined || entity == 'textUploadError'){
            this.el.querySelector('#text-upload-error').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            this.el.querySelector('#text-upload-timer').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadCard'){
            this.el.querySelector('#text-upload-card').classList.remove('reveal');
        }
    },

    _render_close_icon: function(parent_el){
        var self = this;
        var svg_width = 60;
        var svg_height = 60;
        var margin = {top: 15, right: 15, bottom: 15, left: 15};

        var svg = d3.select(parent_el)
            .append('svg')
                .attr('class', 'close-icon')
                .style('cursor', 'pointer')
                .attr('width', svg_width)
                .attr('height', svg_height);

        var group = svg.append('g')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('transform', function(){
                var x_offset = margin.right - 1;
                return 'translate(' + x_offset + ',0)'
            })

        var l1 = group.append('line')
            .attr('x1', margin.left)
            .attr('y1', margin.top)
            .attr('x2', svg_width - margin.right)
            .attr('y2', svg_height - margin.bottom)

        var l2 = group.append('line')
            .attr('x1', svg_width - margin.right)
            .attr('y1', margin.top)
            .attr('x2', margin.left)
            .attr('y2', svg_height - margin.bottom)

        svg
            .on('mouseover', function(){
                l2.attr('stroke', 'red');
            })
            .on('mouseout', function(){
                l2.attr('stroke', 'auto');
            })
            .on('click', function(){
                self.trigger('closeEvent')
            })
    },

    _render_choose_file_icon: function(parent_el){
        var svg_width = 70;
        var svg_height = 85;
        var margin = {top: 10, right: 10, bottom: 10, left: 10};

        var svg = d3.select(parent_el)
            .append('svg')
                .attr('margin-top', '15px')
                .attr('width', svg_width)
                .attr('height', svg_height)
                .attr('shape-rendering', 'geometricPrecision')

        svg.append('path')
            .attr('d', function(){
                var w_start = Math.floor(
                    (svg_width - margin.left - margin.right) / 3);

                var h_start = Math.floor(
                    (svg_height - margin.top - margin.bottom) / 3);

                return (
                    'M' + (margin.left + w_start) + ',' + margin.top + ' ' +
                    'H' + (svg_width - margin.right) + ' ' +
                    'V' + (svg_height - margin.bottom) + ' ' +
                    'H' + margin.left + ' ' +
                    'V' + h_start + ' ' +
                    'H' + (margin.left + w_start) + ' ' +
                    'Z'
                )
            })
            .attr('fill', 'none')
            .attr('stroke', '#AAAAAA')
            .attr('stroke-width', '1px')
            .attr('stroke-linejoin', 'round')

        svg.append('path')
            .attr('d', function(){
                var w_start = Math.floor(
                    (svg_width - margin.left - margin.right) / 3);

                var h_start = Math.floor(
                    (svg_height - margin.top - margin.bottom) / 3);

                return (
                    'M' + (margin.left + w_start - 3) + ',' + margin.top + ' ' +
                    'V' + (h_start - 3) + ' ' +
                    'H' + margin.left + ' ' +
                    'Z'
                )
            })
            .attr('fill', '#AAAAAA')
            .attr('fill', 'none')
            .attr('stroke', '#AAAAAA')
            .attr('stroke-width', '1px')
            .attr('stroke-linejoin', 'round')

        var box = {top: 10, right: 7, bottom: 1, left: 7};
        var h_start = Math.floor(
            (svg_height - margin.top - margin.bottom) / 3);
        var height = (svg_height - margin.top - margin.bottom -
                      h_start - box.top - box.bottom);

        var linesY = [];
        var linesNumber = 5;
        for(var i = 1; i <= linesNumber; i++){
            var y = i * Math.floor(height / linesNumber);
            linesY.push(y);
        }

        var lines = svg.selectAll('line').data(linesY).enter()
            .append('line')
            .attr('x1', function(){
                return margin.left + box.left;
            })
            .attr('y1', function(d, i){
                return h_start + box.top + d;
            })
            .attr('x2', function(){
                return svg_width - margin.right - box.right;
            })
            .attr('y2', function(d, i){
                return h_start + box.top + d;
            })
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
    }

})

app.views.UploadText = UploadTextView;
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

var WordsListView = Backbone.View.extend({
    el: document.getElementById('words-list-view'),

    events: {
        'click .close': 'remove',
        'click .footer .load-more': 'onloadMoreClick',
        'click .list-item': 'onListItemClick',
    },

    subviews: {},

    initialize: function(){
        this.slice_length = 25;
        this.last_displayed_index = null;
        this.total_displayed = 0;
        this.template = this.el.querySelector('#item');
        this.subviews.word = new app.views.Word({model: this.model});
        this.listenTo(this.subviews.word, 'change:stage',
                      this.onWordStageChange);
        this.onloadMoreClickThrottled = _.throttle(
            this.populateList, 200, {leading: false})
    },

    render: function(wordsListType, occur){
        this.list_type = wordsListType;
        this.occur = occur;
        this.setListTypeElement();
        this.setTotalField();
        this.el.classList.add('reveal');
        setTimeout(_.bind(this.populateList, this), 1000);
    },

    onloadMoreClick: function(event){
        if (!event.target.classList.contains('exhausted')){
            this.onloadMoreClickThrottled();
        }
    },


    remove: function(event){
        this.el.classList.remove('reveal');
        this.clearListTypeElement();
        this.clearTotalField();
        this.clearDisplayedField();
        this.el.querySelector(".load-more").classList.remove('exhausted');
        this.el.querySelector('.main').innerHTML = '';
        this.list_type = null;
        this.last_displayed_index = null;
        this.total_displayed = 0;
    },

    populateList: function(){
        var self = this;
        var fragment = document.createDocumentFragment();

        var iteratee = this.model.get_words(
            {
                'stage': this.list_type,
                'occur': this.occur,
                'last_index': this.last_displayed_index,
                'quantity': this.slice_length
            }
        );

        _.each(iteratee, function(item, ind){
            var temp = document.importNode(self.template.content, true).firstElementChild
            temp.setAttribute('data-stage', self.list_type)
            temp.setAttribute('data-index', item['index'])
            temp.setAttribute('data-word', item['word'])
            temp.querySelector('.word').innerHTML = item['word'];
            temp.querySelector('.freq').innerHTML = item['occur'];
            if (item.fivet_common_word != undefined){
                temp.querySelector('.common-word').innerHTML = '&#9734;';
            }
            fragment.appendChild(temp);
        });
        this.el.querySelector('.main').appendChild(fragment);

        if (iteratee.length > 0){
            this.last_displayed_index = iteratee[iteratee.length - 1].index;
        }

        this.total_displayed += iteratee.length;
        this.setDisplayedField();

        var total_value = this.model.get_total(
            {'stage': this.list_type, 'occur': this.occur})

        if (this.total_displayed == total_value){
            this.el.querySelector(".load-more").classList.add('exhausted');
        }
    },

    setListTypeElement: function(){
        this.el.querySelector(".header .stage").innerHTML = this.list_type;
        this.el.querySelector(".header .stage").classList.add(this.list_type)
    },

    clearListTypeElement: function(){
        this.el.querySelector(".header .stage").innerHTML = '';
        this.el.querySelector(".header .stage").classList.remove(this.list_type);
    },

    setTotalField: function(){
        var total_value = this.model.get_total(
            {'stage': this.list_type, 'occur': this.occur})
        this.el.querySelector(".footer .total .value").innerHTML = total_value;
    },

    clearTotalField: function(){
        this.el.querySelector(".footer .total .value").innerHTML = '';
    },

    setDisplayedField: function(displayed_value){
        this.el.querySelector(".footer .displayed .value").innerHTML = this.total_displayed;
    },

    clearDisplayedField: function(){
        this.el.querySelector(".footer .displayed .value").innerHTML = '';
    },

    onListItemClick: function(event){
        if (!event.target.classList.contains('list-item')){
            var list_item = event.target.parentNode;
        }
        else{
            var list_item = event.target;
        }
        var word = list_item.querySelector('.word').innerHTML;
        var freq = list_item.querySelector('.freq').innerHTML;
        var stage = list_item.getAttribute('data-stage')
        var index = list_item.getAttribute('data-index')
        this.subviews.word.render(word, freq, stage, index);
    },

    onWordStageChange: function(word, new_stage){
        var list_item = this.el.querySelector(
            '.list-item[data-word=' + word + ']');
        if (list_item != undefined){
            var stage = list_item.getAttribute('data-stage');
            if (stage != new_stage){
                if (! list_item.classList.contains('hide')){
                    list_item.classList.add('hide');
                    this.total_displayed -= 1;
                }
            }
            else{
                list_item.classList.remove('hide');
                this.total_displayed += 1;
            }
            this.setTotalField();
            this.setDisplayedField();
        }
    },

});

app.views.WordsList = WordsListView;
var WordView = Backbone.View.extend({
    el: document.getElementById('word-view'),

    events: {
        'click .close': 'remove',
        'click .stage button': 'changeWordStage',
    },

    word: null,
    freq: null,
    word_index: null,

    render: function(word, freq, stage, word_index){
        this.clear();
        this.word_index = word_index;
        this.word = word;
        this.el.querySelector('.word').innerHTML = word;
        this.freq = freq;
        this.el.querySelector('.freq').innerHTML = freq;

        this.setWordStage(stage);
        this.el.classList.add('reveal');
        var self = this;
        setTimeout(function(){
            self.getWordContext();
        }, 1000)
    },

    getWordStage: function(){
        var selector = '.stage button.current';
        var stage = this.el.querySelector(selector).name;
        return stage;
    },

    setWordStage: function(stage){
        var current = this.el.querySelector('.stage button.current');
        if ( current != undefined){
            current.classList.remove('current');
        }
        var selector = '.stage button[name=' + stage + ']';
        this.el.querySelector(selector).classList.add('current');
    },

    changeWordStage: function(event){
        if (! event.target.classList.contains('current')){
            var self = this;
            var old_stage = this.getWordStage();
            var new_stage = event.target.getAttribute('name');

            $.ajax({
                url: '/vocabulary',
                type: 'POST',
                data: {
                    'word': this.word,
                    'current_stage': old_stage,
                    'to_stage': new_stage
                },
                success: function(data){
                    self.setWordStage(new_stage);
                    self.model.change_stage(self.word_index, new_stage);
                    self.trigger('change:stage', self.word, new_stage);
                },
                error: function(event){
                    self.el.querySelector('.main').innerHTML = 'Server error';
                    console.log('vocabulary updating failure');
                    console.log(event);
                }
            });
        }
    },

    getWordContext: function(){
        var self = this;
        var base_url = '/library/text/'+ this.model.get('id');
        $.ajax({
            url: base_url + '/word/context/' + self.word,
            type: 'GET',
            success: function(data){
                var context = data['context'];
                self.setWordContext(context);
            },
            error: function(event){
                self.el.querySelector('.main').innerHTML = 'Server error';
                console.log('context getting failure');
                console.log(event);
            }
        });
    },

    setWordContext: function(context){
        var rePattern = new RegExp(this.word + '[a-zA-Z]*', 'gi');
        var fragment = document.createDocumentFragment();
        _.each(context, function(item){
            var li = document.createElement('li')
            li.innerHTML = item.replace(rePattern, function(x){
                return '<span class="highlight">' + x + '</span>';
            })
            fragment.appendChild(li);
        });
        this.el.querySelector('.context').appendChild(fragment);
    },

    remove: function(event){
        this.el.classList.remove('reveal');
    },

    clear: function(){
        this.word = null;
        this.freq = null;
        this.el.querySelector('.word').innerHTML = '';
        this.el.querySelector('.freq').innerHTML = '';
        this.el.querySelector('.context').innerHTML = '';
    }

});

app.views.Word = WordView;
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
var TextView = app.views.Account.extend({
    subviews: {},

    initialize: function(){
        app.views.Account.prototype.initialize.call(this);
        this.thousands_format = d3.format(',');
        this.percent_format = d3.format('%');

        this.subviews.wordsList = new app.views.WordsList({model: this.model});
        this.subviews.vis_by_stage = new app.views.TextVisualizationByStage(
            {model: this.model});
        this.subviews.vis_by_occur = new app.views.TextVisualizationByOccur(
            {model: this.model});

        this.listenTo(this.subviews.vis_by_stage, 'show:wordsList',
                      this.showWordsList);
        this.listenTo(this.subviews.vis_by_occur, 'show:wordsList',
                      this.showWordsList);
        this.listenTo(this.model, 'update:viz', this.updateVisualization);
    },

    render: function(){
        app.views.Account.prototype.render.call(this);
        this.setTextAttrs();
        this.setTextStats();
        this.subviews.vis_by_stage.render();
        this.subviews.vis_by_occur.render();
    },

    setTextAttrs: function(){
        var el = this.el.querySelector('.text-card');
        var fragment = document.createDocumentFragment();
        var text_attrs = this.model.get('text_attrs');
        _.each(text_attrs, function(value, key){
            var input = document.createElement('input');
            input.type = 'text';
            input.name = key;
            input.value = value;
            input.readOnly = true;
            fragment.appendChild(input);
        });
        el.appendChild(fragment);
    },

    setTextStats: function(){
        var total = this.model.get_total();
        var html = this.thousands_format(total)
        this.el.querySelector('.total-words span').innerHTML = html;

        var total_common = this.model.get_total_common_words();
        var percent_common = this.percent_format(
            total_common / total
        )
        var html = this.thousands_format(total_common) + ' / ' + percent_common;
        this.el.querySelector('.total-common-words span').innerHTML = html;
    },

    showWordsList: function(args){
        this.subviews.wordsList.render(args.wordsListName, args.occur);
    },

    updateVisualization: function(event){
        this.subviews.vis_by_stage.update();
        this.subviews.vis_by_occur.update();
    }
});

app.views.Text = TextView;
var VocabularyModel = Backbone.Model.extend({
    urlRoot: '/vocabulary',
});

app.models.Vocabulary = VocabularyModel;
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
var VocabularyView = app.views.Account.extend({
    subviews: {},

    initialize: function(){
        app.views.Account.prototype.initialize.call(this);
        this.subviews.visualization = new app.views.VocabularyVisualization(
            {model: this.model});
    },

    render: function(){
        app.views.Account.prototype.render.call(this);
        this.subviews.visualization.render();
    }
});

app.views.Vocabulary = VocabularyView;
