var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
	title: {type: String, default: ''},
	image: {type: String, default: ''},
	date: {type: Date, default: Date.now},
	from: {type: String, default: ''},
	to: {type: String, default: ''},
	description: {type: String, default: ''},
	venue: {type: String, default: ''}
});

module.exports = mongoose.model('Event', eventSchema);