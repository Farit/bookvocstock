var PasswordRecoveryModel = app.models.AuthReg.extend({

    url: '/password/recovery',

    defaults: {
        'email': null,
    },

    // Fields that must go through validation process
    fields_to_validate: ['email'],
});

app.models.PasswordRecovery = PasswordRecoveryModel;
