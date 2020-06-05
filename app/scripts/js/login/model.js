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
