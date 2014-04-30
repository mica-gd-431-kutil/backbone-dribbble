(function ($){
    'use strict';

    var Shot,
        ShotsList,
        PopularShots,
        DebutShots,
        AllShots,
        s,
        ShotView,
        AppView;

    Shot = Backbone.Model.extend({
        initialize:function (opts) {
            console.log("init shot : "+opts.id);
        }
    });

    // ShotsList Collection
    // A Collection of individual Shots
    // Collection can take a url property to reference where to get its data
    // This is the generic ShotsList Collection
    ShotsList = Backbone.Collection.extend({
        model: Shot,
        page: 1,
        per_page: 15,
        list_name: 'popular',
        sync: function (method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                url: model.url(),
                processData: false
            }, options);

            return $.ajax(params);
        },
        parse: function (response) {
            this.page++;
            return response.shots;
        },

        url: function() {
            return 'http://api.dribbble.com/shots/' + this.list_name + '?page=' + this.page + '&per_page=' + this.per_page;
        }
    });


    // Types of ShotsList
    // Popular stays the same
    PopularShots = new ShotsList;
    // Debut ShotsList gets updated list name
    DebutShots = new ShotsList;
    DebutShots.list_name = 'debuts';
    // All ShotsList gets updated list name
    AllShots = new ShotsList;
    AllShots.list_name = 'everyone';


    ShotView = Backbone.View.extend({
        tagName: 'div',
        className: 'shot',
        template: _.template($('#shot-template').html()),
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.el.id = this.model.get('id');
            return this;
        }
    });

    // Backbone views are almost more convention than they are code — they don't determine anything about your HTML or CSS for you, and can be used with any JavaScript templating library. The general idea is to organize your interface into logical views, backed by models, each of which can be updated independently when the model changes, without having to redraw the page.
    AppView = Backbone.View.extend({
        // Backbone View Specific Properties
        el: $('#container'),
        events: {
            "click #loadmore": "loadMore",
            "click #header li": "changeCurrentList"
        },
        initialize: function() {
            _.each(this.lists, function(list) {
                this.listenTo(list, 'add', this.addOne);
                this.listenTo(list, 'reset', this.addAll);
                this.listenTo(list, 'all', this.render);
                if (list == this.currentList) {
                    list.fetch();
                } else {
                    list.fetch({silent: true});
                }
            }, this);
        },
        render: function(el) {
            this.$("#shots").html("");
            this.currentList.each(this.addOne);

        },

        // custom properties & methods
        currentList: PopularShots,
        lists: [PopularShots, DebutShots, AllShots],
        addOne: function (shot) {
            var view = new ShotView({model: shot});
            $("#shots").append(view.render().el);
        },

        addAll: function (sender) {
            if (this.currentList === sender) {
                this.render();
            }
        },

        loadMore: function () {
            this.currentList.fetch({update: true, remove: false});
        },

        changeCurrentList: function(event) {
            switch (event.target.id) {
                case "popular":
                    this.currentList = PopularShots;
                    break;
                case "debuts":
                    this.currentList = DebutShots;
                    break;
                case "everyone":
                    this.currentList = AllShots;
                    break;
            }
            $("#header li").removeClass('selected');
            $(event.target).addClass('selected');
            this.render();
        }
    });

    s = new AppView;

})(jQuery);
