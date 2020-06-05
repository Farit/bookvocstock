var UploadTextView = app.views.Base.extend({
    el: document.getElementById('text-upload-wrapper'),

    events: {
        'click #text-upload-browser': 'openFileBrowserEvent',
        'click #text-upload-browser input[type=file]': 'stopEventPropagation',
        'change #text-upload-browser input[type=file]': 'fileSelectedEvent',
        'click #text-upload-card input[name=text_type]': 'changeTextType',
        'click #text-upload-card input[value=cancel]': 'cancelEvent',
        'click #text-upload-card input[value=submit]': 'submitEvent',
    },

    transitions: {
        'idleState': {'openEvent': 'activeState'},
        'activeState': {
            'closeEvent': 'idleState',
            'fileSelectedEvent': 'textSaveState'
        },
        'textSaveState': {'requestStartedEvent': 'loadingTimerState'},
        'loadingTimerState': {
            'requestErrorEvent': 'errorState',
            'textCreatedEvent': 'textCardState',
            'closeEvent': 'haltState'
        },
        'errorState': {'closeEvent': 'idleState'},
        'textCardState': {
            'cancelEvent': 'activeState',
            'submitEvent': 'submitState',
            'closeEvent': 'haltState'
        },
        'submitState': {'finishEvent': 'idleState'}
    },

    initialize: function(){
        app.views.Base.prototype.initialize.call(this);
        this.event = null;
        this.current_state = null;
        this.selected_file_name = null;
        this.error_description = null;
        this._loading_timer = null;
        this.idleState();
        this._render_close_icon(this.el.querySelector('.header'));
        this._render_choose_file_icon('#text-upload-browser');
        this.listenTo(app.pubSub, 'upload-page:open', this.openEvent);
        this.listenTo(this.model, 'change:id', this.textCreatedEvent);
        this.listenTo(this, 'closeEvent', this.closeEvent);
        this.listenTo(this, 'finishEvent', this.finishEvent);
    },

    triggerTransition: function(eventName){
        if(this.current_state == 'haltState'){
            if(eventName == 'openEvent'){
                this[this.pending_state]();
                this.el.classList.add('reveal');
            }
            else{
                this.pending_state = this.transitions[this.pending_state][eventName];
            }
        }
        else{
            var next_state = this.transitions[this.current_state][eventName];
            this[next_state]();
        }
    },

    openFileBrowserEvent: function(event){
        this.event = event;
        var text_upload_browser = this.el.querySelector('#text-upload-browser');
        text_upload_browser['file-browser'].click();
    },

    stopEventPropagation: function(event){
        this.event = event;
        this.event.stopPropagation();
    },

    fileSelectedEvent: function(event){
        this.event = event;
        this.triggerTransition('fileSelectedEvent');
    },

    cancelEvent: function(event){
        this.event = event;
        this.triggerTransition('cancelEvent');
    },

    submitEvent: function(event){
        this.event = event;
        this.triggerTransition('submitEvent');
    },

    openEvent: function(event){
        this.event = event;
        this.triggerTransition('openEvent');
    },

    closeEvent: function(event){
        this.event = event;
        this.triggerTransition('closeEvent');
    },

    finishEvent: function(event){
        this.event = event;
        this.triggerTransition('finishEvent');
    },

    textCreatedEvent: function(event){
        this.event = event;
        this.triggerTransition('textCreatedEvent');
    },

    requestStarted: function(event){
        if(this.current_state == 'textSaveState'){
            this.event = event;
            this.triggerTransition('requestStartedEvent');
        }
    },

    requestError: function(description){
        if(this.current_state == 'loadingTimerState'){
            this.error_description = description;
            console.log('error description: ' + this.error_description)
            this.triggerTransition('requestErrorEvent');
        }
    },

    idleState: function(){
        this.current_state = 'idleState';
        this.el.classList.remove('reveal');
        this.hide();
        this.reset();
    },

    activeState: function(){
        this.current_state = 'activeState';
        this.hide();
        this.reset();
        this.show('textUploadBrowser');
        this.el.classList.add('reveal');
    },

    textSaveState: function(){
        this.current_state = 'textSaveState';
        var self = this;
        var target = this.el.querySelector('#text-upload-browser')['file-browser'];
        var file = target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            self.selected_file_name = file.name;
            self.model.set('file', event.target.result);
            self.model.save();
        };
        reader.readAsDataURL(file);
    },

    loadingTimerState: function(){
        this.current_state = 'loadingTimerState';
        this.hide();
        this.show('textUploadTimer');
    },

    haltState: function(){
        this.pending_state = this.current_state;
        this.current_state = 'haltState';
        this.el.classList.remove('reveal');
        this.hide();
    },

    errorState: function(){
        this.current_state = 'errorState';
        this.hide()
        this.reset('textUploadTimer');
        this.show('textUploadError');
    },

    textCardState: function(){
        this.current_state = 'textCardState';
        this.hide()
        this.reset('textUploadTimer');
        this.show('textUploadCard');
    },

    submitState: function(){
        this.current_state = 'submitState';
        this.event.preventDefault();

        // Update Text file
        var el = this.el.querySelector('#text-upload-card');

        this.model.set('title', el['title'].value);
        this.model.set(
            'text_type',
            el.querySelector('input[name="text_type"]:checked').value
        );

        var text_attrs = {};
        var NodeList = el.querySelectorAll(
            '.text-attr.' + this.model.get('text_type') + ' input');
        _.each(NodeList, function(node, NodeList){
            text_attrs[node.name] = node.value;
        })
        this.model.set('text_attrs', text_attrs);

        this.model.save(
            {
                'title': this.model.get('title'),
                'text_type': this.model.get('text_type'),
                'text_attrs': this.model.get('text_attrs'),
            },
            {'patch': true}
        );

        // Put Text file to the mining.
        $.ajax({
            url: '/library/text/mining/'+ this.model.get('id'),
            type: 'POST',
        });

        app.pubSub.trigger(
            'upload-page:added',
            new app.models.TextAnalytics(_.clone(this.model.attributes)));
        this.trigger('finishEvent');
    },

    reset: function(entity){
        if(entity === undefined){
            this.event = null;
            this.selected_file_name = null;
            this.error_description = null;
            this.model.clear({silent: true});
        }

        if (entity === undefined || entity == 'textUploadError'){
            this.el.querySelector('#text-upload-error').innerHTML = '';
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').reset()
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            var el = this.el.querySelector('#text-upload-timer');
            el.classList.remove('reveal');

            if (this._loading_timer != undefined){
                this._loading_timer.remove();
                this._loading_timer = null;
            }
            if (this._loading_timer_timeout != null){
                clearTimeout(this._loading_timer_timeout);
            }
        }

        if (entity === undefined || entity == 'textUploadCard'){
            this.el.querySelector('#text-upload-card').reset();
        }
    },

    show: function(entity){
        if (entity === undefined || entity == 'textUploadError'){
            var el = this.el.querySelector('#text-upload-error');
            el.innerHTML = this.error_description;
            el.classList.add('reveal');
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').classList.add('reveal');
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            var el = this.el.querySelector('#text-upload-timer');
            el.classList.add('reveal');

            if (this._loading_timer == null){
                var formatTime = d3.time.format("%S sec.");
                this._loading_timer = d3.select(el).append('div');

                var today = d3.time.day(new Date);
                var deadline = +(new Date()) + 30000;
                this._loading_timer_timeout = null;
                var self = this;
                (function tick(){
                    var now = new Date;
                    self._loading_timer.text(formatTime(new Date(
                        +today + deadline - d3.time.second(now)
                    )));
                    self._loading_timer_timeout = setTimeout(tick, 1000 - now % 1000);
                })();
            }
        }

        if (entity === undefined || entity == 'textUploadCard'){
            var el = this.el.querySelector('#text-upload-card');

            if (!this.model.get('title')){
                el['title'].value = this.selected_file_name;
            }
            else{
                el['title'].value = this.model.get('title');
            }

            var text_type = this.model.get('text_type');
            el[text_type + '-type'].checked = true;

            var attributes = this.model.get('text_attrs');
            _.each(attributes, function(value, key){
                var sel = '.text-attr.' + text_type + ' input[name=' + key + ']'
                el.querySelector(sel).value = value;
            })


            if (el.querySelector('.text-attr.reveal') != null){
                el.querySelector('.text-attr.reveal').classList.remove('reveal');
            }

            el.querySelector('.text-attr.' + text_type).classList.add('reveal');
            el.classList.add('reveal');
        }
    },

    changeTextType: function(event){
        var el = this.el.querySelector('#text-upload-card');
        el.querySelector('.text-attr.reveal').classList.remove('reveal');

        var text_type = event.target.value;
        el.querySelector('.text-attr.' + text_type).classList.add('reveal');
    },

    hide: function(entity){
        if (entity === undefined || entity == 'textUploadError'){
            this.el.querySelector('#text-upload-error').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadBrowser'){
            this.el.querySelector('#text-upload-browser').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadTimer'){
            this.el.querySelector('#text-upload-timer').classList.remove('reveal');
        }

        if (entity === undefined || entity == 'textUploadCard'){
            this.el.querySelector('#text-upload-card').classList.remove('reveal');
        }
    },

    _render_close_icon: function(parent_el){
        var self = this;
        var svg_width = 60;
        var svg_height = 60;
        var margin = {top: 15, right: 15, bottom: 15, left: 15};

        var svg = d3.select(parent_el)
            .append('svg')
                .attr('class', 'close-icon')
                .style('cursor', 'pointer')
                .attr('width', svg_width)
                .attr('height', svg_height);

        var group = svg.append('g')
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('transform', function(){
                var x_offset = margin.right - 1;
                return 'translate(' + x_offset + ',0)'
            })

        var l1 = group.append('line')
            .attr('x1', margin.left)
            .attr('y1', margin.top)
            .attr('x2', svg_width - margin.right)
            .attr('y2', svg_height - margin.bottom)

        var l2 = group.append('line')
            .attr('x1', svg_width - margin.right)
            .attr('y1', margin.top)
            .attr('x2', margin.left)
            .attr('y2', svg_height - margin.bottom)

        svg
            .on('mouseover', function(){
                l2.attr('stroke', 'red');
            })
            .on('mouseout', function(){
                l2.attr('stroke', 'auto');
            })
            .on('click', function(){
                self.trigger('closeEvent')
            })
    },

    _render_choose_file_icon: function(parent_el){
        var svg_width = 70;
        var svg_height = 85;
        var margin = {top: 10, right: 10, bottom: 10, left: 10};

        var svg = d3.select(parent_el)
            .append('svg')
                .attr('margin-top', '15px')
                .attr('width', svg_width)
                .attr('height', svg_height)
                .attr('shape-rendering', 'geometricPrecision')

        svg.append('path')
            .attr('d', function(){
                var w_start = Math.floor(
                    (svg_width - margin.left - margin.right) / 3);

                var h_start = Math.floor(
                    (svg_height - margin.top - margin.bottom) / 3);

                return (
                    'M' + (margin.left + w_start) + ',' + margin.top + ' ' +
                    'H' + (svg_width - margin.right) + ' ' +
                    'V' + (svg_height - margin.bottom) + ' ' +
                    'H' + margin.left + ' ' +
                    'V' + h_start + ' ' +
                    'H' + (margin.left + w_start) + ' ' +
                    'Z'
                )
            })
            .attr('fill', 'none')
            .attr('stroke', '#AAAAAA')
            .attr('stroke-width', '1px')
            .attr('stroke-linejoin', 'round')

        svg.append('path')
            .attr('d', function(){
                var w_start = Math.floor(
                    (svg_width - margin.left - margin.right) / 3);

                var h_start = Math.floor(
                    (svg_height - margin.top - margin.bottom) / 3);

                return (
                    'M' + (margin.left + w_start - 3) + ',' + margin.top + ' ' +
                    'V' + (h_start - 3) + ' ' +
                    'H' + margin.left + ' ' +
                    'Z'
                )
            })
            .attr('fill', '#AAAAAA')
            .attr('fill', 'none')
            .attr('stroke', '#AAAAAA')
            .attr('stroke-width', '1px')
            .attr('stroke-linejoin', 'round')

        var box = {top: 10, right: 7, bottom: 1, left: 7};
        var h_start = Math.floor(
            (svg_height - margin.top - margin.bottom) / 3);
        var height = (svg_height - margin.top - margin.bottom -
                      h_start - box.top - box.bottom);

        var linesY = [];
        var linesNumber = 5;
        for(var i = 1; i <= linesNumber; i++){
            var y = i * Math.floor(height / linesNumber);
            linesY.push(y);
        }

        var lines = svg.selectAll('line').data(linesY).enter()
            .append('line')
            .attr('x1', function(){
                return margin.left + box.left;
            })
            .attr('y1', function(d, i){
                return h_start + box.top + d;
            })
            .attr('x2', function(){
                return svg_width - margin.right - box.right;
            })
            .attr('y2', function(d, i){
                return h_start + box.top + d;
            })
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
    }

})

app.views.UploadText = UploadTextView;
