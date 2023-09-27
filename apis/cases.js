const axios = require("axios")
const { APIKEY, APITOKEN } = require("../config.js")

module.exports = (method, user, moderator, reason, server, duration) => {
	axios.post(APIKEY + "/cases", {
	  "server": server,
	  "date": new Date().now(),
	  "reason": reason,
	  "user": user,
	  "moderator": moderator,
	  "duration": duration,
	  "method": method
	})
}
