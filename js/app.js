var app = app || {};

//model - contact
var Contact = Backbone.Model.extend({
    defaults: {
        name: '',
        email: '',
        phone: '',
        visibile: true
    }
});

var john = new Contact({
    name: 'John',
    email: 'john@example.com',
    phone: '5555555555'
});

var jack = new Contact({
    name: 'Jack',
    email: 'jack@example.com',
    phone: '4444444444'
});

//collection - contacts
var ContactList = Backbone.Collection.extend();

var contactList = new ContactList([john, jack]);

//view - contact single
var ContactItemView = Backbone.View.extend({
    tagName: 'tr',
    events: {
        'click .edit': 'editContact',
        'click .delete': 'deleteContact',
        'click .update': 'updateContact',
        'click .cancel': 'render'
    },

    //template for regular view
    template: _.template($('.contact-list-template').html()),

    //template for editing contact
    editTemplate: _.template($('.edit-list-template').html()),

    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    editContact: function() {
        this.$el.html(this.editTemplate(this.model.attributes));
    },
    deleteContact: function() {
        this.model.destroy();
    },
    updateContact: function() {
        var contact = {
            name: this.$('.name-input').val(),
            email: this.$('.email-input').val(),
            phone: this.$('.phone-input').val()
        };
        this.model.set(contact);
        this.render();
    }
});

//view - contact list
var ContactListView = Backbone.View.extend({
    el: '.contacts',
    collection: contactList,
    _views: [], //array to handle ContactItemViews
    initialize: function() {
        this.reset();
        this.render();
        this.listenTo(this.collection, 'remove', this.reset);
        this.listenTo(this.collection, 'add', this.addItem);
        this.listenTo(this.collection, 'all', this.render);
    },
    render: function() {
        //clear list
        this.$el.html('');
        var self = this;

        //append each contact view
        _.each(this._views, function(item) {

            //check if visible
            if(item.model.get('visibile') === true) {
                self.$el.append(item.render().el);
                //need to re-delegate events
                item.delegateEvents();
            }
            return this;
        });

        return this;
    },
    reset: function() {
        var self = this;
        this._views = [];

        this.collection.each(function(item) {
            self.addItem(item);
        });
    },
    addItem: function(item) {
        var contact = new ContactItemView({model: item});
        //console.log(contact);
        this._views.push(contact);
    }
});

//view - add form
var AddView = Backbone.View.extend({
    el: '.add-form',
    collection: contactList,
    events: {
        'click .add': 'addContact'
    },
    addContact: function() {
        //object with form fields values
        var contact = {
            name: $('.name-input').val(),
            email: $('.email-input').val(),
            phone: $('.phone-input').val()
        };
        //create new contact model and add to collection
        this.collection.add(new Contact(contact));

        //clear form fields
        $('.name-input').val('');
        $('.email-input').val('');
        $('.phone-input').val('');
    }
});

//view - search view
var SearchView = Backbone.View.extend({
    el: '.search-contacts',
    collection: contactList,
    events: {
        'click .search': 'search',
        'click .reset': 'reset'
    },
    search: function() {
        var query = this.$('.search-input').val();

        this.collection.each(function(item) {
            if (item.get('name').indexOf(query) > -1) {
                item.set('visibile', true);
            } else {
                item.set('visibile', false);
            }
        });

        this.$('.search-input').val('');
    },
    reset: function() {
        this.collection.each(function(item) {
            item.set('visibile', true);
        });
        this.$('.search-input').val('');
    }
});
(function() {
    app.contactListView = new ContactListView();
    app.addView = new AddView();
    app.searchView = new SearchView();
})();