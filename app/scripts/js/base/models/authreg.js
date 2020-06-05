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
