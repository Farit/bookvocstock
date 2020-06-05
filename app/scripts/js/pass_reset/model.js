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
