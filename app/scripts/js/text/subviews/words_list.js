var WordsListView = Backbone.View.extend({
    el: document.getElementById('words-list-view'),

    events: {
        'click .close': 'remove',
        'click .footer .load-more': 'onloadMoreClick',
        'click .list-item': 'onListItemClick',
    },

    subviews: {},

    initialize: function(){
        this.slice_length = 25;
        this.last_displayed_index = null;
        this.total_displayed = 0;
        this.template = this.el.querySelector('#item');
        this.subviews.word = new app.views.Word({model: this.model});
        this.listenTo(this.subviews.word, 'change:stage',
                      this.onWordStageChange);
        this.onloadMoreClickThrottled = _.throttle(
            this.populateList, 200, {leading: false})
    },

    render: function(wordsListType, occur){
        this.list_type = wordsListType;
        this.occur = occur;
        this.setListTypeElement();
        this.setTotalField();
        this.el.classList.add('reveal');
        setTimeout(_.bind(this.populateList, this), 1000);
    },

    onloadMoreClick: function(event){
        if (!event.target.classList.contains('exhausted')){
            this.onloadMoreClickThrottled();
        }
    },


    remove: function(event){
        this.el.classList.remove('reveal');
        this.clearListTypeElement();
        this.clearTotalField();
        this.clearDisplayedField();
        this.el.querySelector(".load-more").classList.remove('exhausted');
        this.el.querySelector('.main').innerHTML = '';
        this.list_type = null;
        this.last_displayed_index = null;
        this.total_displayed = 0;
    },

    populateList: function(){
        var self = this;
        var fragment = document.createDocumentFragment();

        var iteratee = this.model.get_words(
            {
                'stage': this.list_type,
                'occur': this.occur,
                'last_index': this.last_displayed_index,
                'quantity': this.slice_length
            }
        );

        _.each(iteratee, function(item, ind){
            var temp = document.importNode(self.template.content, true).firstElementChild
            temp.setAttribute('data-stage', self.list_type)
            temp.setAttribute('data-index', item['index'])
            temp.setAttribute('data-word', item['word'])
            temp.querySelector('.word').innerHTML = item['word'];
            temp.querySelector('.freq').innerHTML = item['occur'];
            if (item.fivet_common_word != undefined){
                temp.querySelector('.common-word').innerHTML = '&#9734;';
            }
            fragment.appendChild(temp);
        });
        this.el.querySelector('.main').appendChild(fragment);

        if (iteratee.length > 0){
            this.last_displayed_index = iteratee[iteratee.length - 1].index;
        }

        this.total_displayed += iteratee.length;
        this.setDisplayedField();

        var total_value = this.model.get_total(
            {'stage': this.list_type, 'occur': this.occur})

        if (this.total_displayed == total_value){
            this.el.querySelector(".load-more").classList.add('exhausted');
        }
    },

    setListTypeElement: function(){
        this.el.querySelector(".header .stage").innerHTML = this.list_type;
        this.el.querySelector(".header .stage").classList.add(this.list_type)
    },

    clearListTypeElement: function(){
        this.el.querySelector(".header .stage").innerHTML = '';
        this.el.querySelector(".header .stage").classList.remove(this.list_type);
    },

    setTotalField: function(){
        var total_value = this.model.get_total(
            {'stage': this.list_type, 'occur': this.occur})
        this.el.querySelector(".footer .total .value").innerHTML = total_value;
    },

    clearTotalField: function(){
        this.el.querySelector(".footer .total .value").innerHTML = '';
    },

    setDisplayedField: function(displayed_value){
        this.el.querySelector(".footer .displayed .value").innerHTML = this.total_displayed;
    },

    clearDisplayedField: function(){
        this.el.querySelector(".footer .displayed .value").innerHTML = '';
    },

    onListItemClick: function(event){
        if (!event.target.classList.contains('list-item')){
            var list_item = event.target.parentNode;
        }
        else{
            var list_item = event.target;
        }
        var word = list_item.querySelector('.word').innerHTML;
        var freq = list_item.querySelector('.freq').innerHTML;
        var stage = list_item.getAttribute('data-stage')
        var index = list_item.getAttribute('data-index')
        this.subviews.word.render(word, freq, stage, index);
    },

    onWordStageChange: function(word, new_stage){
        var list_item = this.el.querySelector(
            '.list-item[data-word=' + word + ']');
        if (list_item != undefined){
            var stage = list_item.getAttribute('data-stage');
            if (stage != new_stage){
                if (! list_item.classList.contains('hide')){
                    list_item.classList.add('hide');
                    this.total_displayed -= 1;
                }
            }
            else{
                list_item.classList.remove('hide');
                this.total_displayed += 1;
            }
            this.setTotalField();
            this.setDisplayedField();
        }
    },

});

app.views.WordsList = WordsListView;
