var WordView = Backbone.View.extend({
    el: document.getElementById('word-view'),

    events: {
        'click .close': 'remove',
        'click .stage button': 'changeWordStage',
    },

    word: null,
    freq: null,
    word_index: null,

    render: function(word, freq, stage, word_index){
        this.clear();
        this.word_index = word_index;
        this.word = word;
        this.el.querySelector('.word').innerHTML = word;
        this.freq = freq;
        this.el.querySelector('.freq').innerHTML = freq;

        this.setWordStage(stage);
        this.el.classList.add('reveal');
        var self = this;
        setTimeout(function(){
            self.getWordContext();
        }, 1000)
    },

    getWordStage: function(){
        var selector = '.stage button.current';
        var stage = this.el.querySelector(selector).name;
        return stage;
    },

    setWordStage: function(stage){
        var current = this.el.querySelector('.stage button.current');
        if ( current != undefined){
            current.classList.remove('current');
        }
        var selector = '.stage button[name=' + stage + ']';
        this.el.querySelector(selector).classList.add('current');
    },

    changeWordStage: function(event){
        if (! event.target.classList.contains('current')){
            var self = this;
            var old_stage = this.getWordStage();
            var new_stage = event.target.getAttribute('name');

            $.ajax({
                url: '/vocabulary',
                type: 'POST',
                data: {
                    'word': this.word,
                    'current_stage': old_stage,
                    'to_stage': new_stage
                },
                success: function(data){
                    self.setWordStage(new_stage);
                    self.model.change_stage(self.word_index, new_stage);
                    self.trigger('change:stage', self.word, new_stage);
                },
                error: function(event){
                    self.el.querySelector('.main').innerHTML = 'Server error';
                    console.log('vocabulary updating failure');
                    console.log(event);
                }
            });
        }
    },

    getWordContext: function(){
        var self = this;
        var base_url = '/library/text/'+ this.model.get('id');
        $.ajax({
            url: base_url + '/word/context/' + self.word,
            type: 'GET',
            success: function(data){
                var context = data['context'];
                self.setWordContext(context);
            },
            error: function(event){
                self.el.querySelector('.main').innerHTML = 'Server error';
                console.log('context getting failure');
                console.log(event);
            }
        });
    },

    setWordContext: function(context){
        var rePattern = new RegExp(this.word + '[a-zA-Z]*', 'gi');
        var fragment = document.createDocumentFragment();
        _.each(context, function(item){
            var li = document.createElement('li')
            li.innerHTML = item.replace(rePattern, function(x){
                return '<span class="highlight">' + x + '</span>';
            })
            fragment.appendChild(li);
        });
        this.el.querySelector('.context').appendChild(fragment);
    },

    remove: function(event){
        this.el.classList.remove('reveal');
    },

    clear: function(){
        this.word = null;
        this.freq = null;
        this.el.querySelector('.word').innerHTML = '';
        this.el.querySelector('.freq').innerHTML = '';
        this.el.querySelector('.context').innerHTML = '';
    }

});

app.views.Word = WordView;
