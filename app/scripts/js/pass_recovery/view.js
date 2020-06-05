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
