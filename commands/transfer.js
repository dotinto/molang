const {
	EmbedBuilder,
	SlashCommandBuilder
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")

module.exports = {
	data: new SlashCommandBuilder(),
	async execute(interaction, client) {
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id)
		.then()
		.catch()
	}
}
