var VocabularyView = app.views.Account.extend({
    subviews: {},

    initialize: function(){
        app.views.Account.prototype.initialize.call(this);
        this.subviews.visualization = new app.views.VocabularyVisualization(
            {model: this.model});
    },

    render: function(){
        app.views.Account.prototype.render.call(this);
        this.subviews.visualization.render();
    }
});

app.views.Vocabulary = VocabularyView;
