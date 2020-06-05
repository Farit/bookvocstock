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
