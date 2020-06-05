var BaseView = Backbone.View.extend({

    submission_error_codes: {
        500: 'Server error.',
        504: 'Server temporary unavailable.'
    },

    initialize: function(){
        this.listenTo(this.model, 'request', this._requestStarted);
        // Calls `requestError` if request completes with error
        this.listenTo(this.model, 'sync', this._requestSuccess);
        // Calls `requestError` if request completes with error
        this.listenTo(this.model, 'error', this._requestError);
    },

    _requestStarted: function(event){
        this.requestStarted(event);
    },

    _requestSuccess: function(event){
        this.requestSuccess(event);
    },

    _requestError: function(model, xhr, options){
        var status_code = parseInt(xhr.status, 10);
        if (status_code == 500 && xhr.statusText != 'error'){
            var description = xhr.statusText;
        }
        else {
            var description = this.submission_error_codes[status_code];
        }
        this.requestError(description);
    },

    requestStarted: function(event){},
    requestSuccess: function(event){},
    requestError: function(description){},

})

app.views.Base = BaseView;
