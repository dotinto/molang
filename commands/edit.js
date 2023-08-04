const {
	EmbedBuilder,
	SlashCommandBuilder
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")

module.exports = {
	data: new SlashCommandBuilder()
	.setName("edit")
	.setDescription("Редагувати публічні дані.")
	.addSubcommand(
		subcommand => subcommand
		.setName("displayname")
		.setDescription("Редагувати відображене ім'я")
	)
	.addSubcommand(
		subcommand => subcommand
		.setName("description")
		.setDescription("Редагувати опис профілю")
	),
	async execute(interaction, client) {
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id,
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(res => {
			if (!res.data[0]) {
					interaction.reply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
						], ephemeral: true
					})
			} else {
				var user = res.data[0]
				
			}
		})
		.catch(err => {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + template.resp.err)
				], ephemeral: true
			})
			console.error(err)
		})
	}
}
