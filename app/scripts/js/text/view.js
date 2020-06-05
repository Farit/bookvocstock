var TextView = app.views.Account.extend({
    subviews: {},

    initialize: function(){
        app.views.Account.prototype.initialize.call(this);
        this.thousands_format = d3.format(',');
        this.percent_format = d3.format('%');

        this.subviews.wordsList = new app.views.WordsList({model: this.model});
        this.subviews.vis_by_stage = new app.views.TextVisualizationByStage(
            {model: this.model});
        this.subviews.vis_by_occur = new app.views.TextVisualizationByOccur(
            {model: this.model});

        this.listenTo(this.subviews.vis_by_stage, 'show:wordsList',
                      this.showWordsList);
        this.listenTo(this.subviews.vis_by_occur, 'show:wordsList',
                      this.showWordsList);
        this.listenTo(this.model, 'update:viz', this.updateVisualization);
    },

    render: function(){
        app.views.Account.prototype.render.call(this);
        this.setTextAttrs();
        this.setTextStats();
        this.subviews.vis_by_stage.render();
        this.subviews.vis_by_occur.render();
    },

    setTextAttrs: function(){
        var el = this.el.querySelector('.text-card');
        var fragment = document.createDocumentFragment();
        var text_attrs = this.model.get('text_attrs');
        _.each(text_attrs, function(value, key){
            var input = document.createElement('input');
            input.type = 'text';
            input.name = key;
            input.value = value;
            input.readOnly = true;
            fragment.appendChild(input);
        });
        el.appendChild(fragment);
    },

    setTextStats: function(){
        var total = this.model.get_total();
        var html = this.thousands_format(total)
        this.el.querySelector('.total-words span').innerHTML = html;

        var total_common = this.model.get_total_common_words();
        var percent_common = this.percent_format(
            total_common / total
        )
        var html = this.thousands_format(total_common) + ' / ' + percent_common;
        this.el.querySelector('.total-common-words span').innerHTML = html;
    },

    showWordsList: function(args){
        this.subviews.wordsList.render(args.wordsListName, args.occur);
    },

    updateVisualization: function(event){
        this.subviews.vis_by_stage.update();
        this.subviews.vis_by_occur.update();
    }
});

app.views.Text = TextView;
