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
