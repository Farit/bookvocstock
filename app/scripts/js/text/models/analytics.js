var TextAnalyticsModel = app.models.Text.extend({
    urlRoot: '/library/text/analytics/',

    get_total_unique: function(){
        if (this.get('percent_mining') != 100){
            return null;
        }
        return this.get('unknown') + this.get('known') +
               this.get('learning') + this.get('familiar');
    }
});

app.models.TextAnalytics = TextAnalyticsModel;

