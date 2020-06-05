var TextDataModel = app.models.Text.extend({
    urlRoot: '/library/text/data/',

    parse: function(data, options){
        var words = data['words'];
        data['words'] = JSON.parse(words);
        return data
    },

    change_stage: function(word_index, new_stage){
        this.get('words')[word_index].stage = new_stage;
        this.trigger('update:viz');
    },

    get_words: function(args){
        var data = [];
        var words_array = this.get('words');
        if(args.last_index == null){
            var ind = 0;
        }
        else{
            var ind = args.last_index + 1;
        }

        for (ind; ind < words_array.length; ind++){

            if (words_array[ind]['stage'] == args.stage){
                var include = true;
                if (args.occur){
                    include = true ? words_array[ind].occur == args.occur : false;
                }
                if (include && data.length < args.quantity){
                    var item = _.clone(words_array[ind]);
                    item['index'] = ind;
                    data.push(item)
                }
            }

        }
        return data
    },

    /**
     * Aggregates total value
     * if args == undefined returns total words in text.
     * else returns total words in specified learning stage.
     */
    get_total: function(args){
        var value = 0;
        var words = this.get('words');

        if(args !== undefined){
            for(var ind=0; ind < words.length; ind++){
                if (words[ind].stage == args.stage){
                    if(args.occur == null || args.occur == words[ind].occur){
                        value += 1;
                    }
                }
            }
        }
        else{
            value = words.length;
        }

        return value
    },

    get_total_common_words: function(){
        var value = 0;
        var words = this.get('words');

        for(var ind=0; ind < words.length; ind++){
            if (words[ind].fivet_common_word != undefined){
                value += 1;
            }
        }
        return value
    },

    get_occur: function(){
        // data = [
        //    { occur: 0, unknown: 0, known: 0, learning: 0, familiar: 0 }, ...]
        var data = []
        var words_by_occurrences = _.groupBy(this.get('words'), function(item){
            return item.occur;
        });

        _.each(words_by_occurrences, function(list, occurrence){
            words_by_occurrences[occurrence] = _.groupBy(list, function(item){
                return item.stage;
            });
            var data_item = {'occur': parseInt(occurrence)};
            _.each(words_by_occurrences[occurrence], function(obj, stage){
                if(stage == 'unknown'){
                    data_item['unknown'] = obj.length;
                }
                else if(stage == 'known'){
                    data_item['known'] = obj.length;
                }
                else if(stage == 'learning'){
                    data_item['learning'] = obj.length;
                }
                else if(stage == 'familiar'){
                    data_item['familiar'] = obj.length;
                }
            })
            data.push(_.defaults(
                data_item,
                {unknown: 0, known: 0, learning: 0, familiar: 0 }
            ));
        });
        return data
    }

});

app.models.TextData = TextDataModel;
