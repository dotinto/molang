const apiKey = require("./config.js").APIKEY || process.env.APIKEY
const apiToken = require("./config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
axios.put(apiKey + "/users/1", {
	badges: JSON.stringify(["developer", "verified", "sponsor", "partner", "subscriber", "bughunter"]),
	verified: true,
	displayName: "<:emoji_42:1134825713439084648><:emoji_43:1134825742736302080><:emoji_44:1134825763254849537>"
}, {
	headers: {
		"Authorization": "Bearer " + apiToken
	}
})
	.then(res => console.log(res))
	.catch(err => console.log(err))
