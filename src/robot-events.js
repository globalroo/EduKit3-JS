const EventEmitter2 = require("eventemitter2")

const events = new EventEmitter2({
	wildcard: false,
	delimiter: ".",
	newListener: false,
	removeListener: false,
	maxListeners: 10,
	verboseMemoryLeak: false,
	ignoreErrors: false
})

module.exports = events
