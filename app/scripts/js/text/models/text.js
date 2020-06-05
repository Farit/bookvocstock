var TextModel = Backbone.Model.extend({
    urlRoot: '/library/text/',

    check_mining: function(){
        var percent_mining = this.get('percent_mining') || 0;
        if (percent_mining != 100){
            this.unset('percent_mining', {silent: true});
            this.fetch();
        }
    }
});

app.models.Text = TextModel;
