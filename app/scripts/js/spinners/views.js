var ButtonSpinnerView = Backbone.View.extend({

    initialize: function(){
        this.on('request:started', this.onRequestStarted);
        this.on('request:ended', this.onRequestEnded);
        this.btn_title = this.el.innerHTML;
    },

    onRequestStarted: function(event){
        this.el.innerHTML = '<div class="spinner">'+
                                '<div class="rect1"></div>' +
                                '<div class="rect2"></div>' +
                                '<div class="rect3"></div>' +
                                '<div class="rect4"></div>' +
                                '<div class="rect5"></div>' +
                            '</div>';
    },

    onRequestEnded: function(){
        this.el.innerHTML = this.btn_title;
    },
})

app.views.ButtonSpinner = ButtonSpinnerView;

