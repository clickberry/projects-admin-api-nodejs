var mongoose = require('mongoose');
var error = require('clickberry-http-errors');

var Schema = mongoose.Schema;

var projectSchema = new Schema({
    userId: String,
    name: String,
    nameSort: String,
    description: String,
    imageUri: String,
    created: Date,
    isPrivate: Boolean,
    isHidden: Boolean,
    videos: [new Schema({
        contentType: String,
        uri: String,
        width: Number,
        height: Number
    }, {_id: false})]
});

var Project = module.exports = mongoose.model('Project', projectSchema);