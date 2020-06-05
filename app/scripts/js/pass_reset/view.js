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
