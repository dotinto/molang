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
	.setName("setup")
	.setDescription("Встановлення профілю користувача"),
	async execute(interaction) {
		await interaction.deferReply()
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async res => {
			if (!res.data[0]) {
			await axios.post(apiKey + "/users", {
				displayName: interaction.user.username,
				description: "No description yet.",
				discordId: interaction.user.id,
				verified: false,
				premium: false,
				premiumExpires: 0,
				badges: JSON.stringify([]),
				timeout: JSON.stringify({
					work: 0,
					rob: 0,
					crime: 0
				}),
				cash: "0",
				bank: "0",
				crypto: "0",
				banned: false,
				createdTimestamp: Date.now(),
				chatLevel: 0,
				chatLevelPoints: 0,
				chatLevelTier: 0
			}, {
				headers: {
					"Authorization": "Bearer " + apiToken
				}
			}).then(() => {
				console.log("New user: ", interaction.user.id)
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.y + " Профіль користувача створено.")
					], ephemeral: true
				})
			}).catch(err => {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Щось пішло не так! Помилка направлена до відділу спеціалістів. ^-^")
					], ephemeral: true
				})
				console.error(err)
			})
			} else {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Отакої! Схоже, що Ви вже маєте профіль користувача.")
					], ephemeral: true
				})
			}
		})
		.catch((err) => {
			interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + template.resp.err)
				], ephemeral: true
					
			})
			console.log(err)
		})
	}
}
