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
