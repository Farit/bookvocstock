var LibraryCollection = Backbone.Collection.extend({
    model: app.models.TextAnalytics
});
app.collections.Library = LibraryCollection;

