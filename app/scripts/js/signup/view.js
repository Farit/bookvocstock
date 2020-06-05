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
