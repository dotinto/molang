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
	.setName("work")
	.setDescription("Працювати"),
	async execute(interaction, client) {
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async res => {
			if (!res.data[0]) {
				interaction.reply({
			        embeds: [
			            new EmbedBuilder()
			            .setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
			        ], ephemeral: true
			    })
			} else {
				var sum = Math.floor(Math.random() * 500000);
				await axios.put(apiKey + "/users/" + res.data[0].id, {
					bank: res.data[0].bank += sum
				}, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				}).then(r => {
					interaction.reply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.y + " Ви заробили " + sum + " " +  template.icon.cash)
						], ephemeral: true
					})
				}).catch(err => {
					interaction.reply({
					    embeds: [
					        new EmbedBuilder()
					        .setDescription(template.icon.n + template.resp.err)
					    ], ephemeral: true
					})
					console.error(err)
				})
				
			}
		})
		.catch()
	}
}
