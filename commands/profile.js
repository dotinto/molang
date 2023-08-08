const {
	EmbedBuilder,
	SlashCommandBuilder
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")

function getBadges(query) {
	query = JSON.parse(query)
	var result = "";
	query.forEach(b => {
		result += template.badges[b] + " "
	})
	return result
}

module.exports = {
	data: new SlashCommandBuilder()
	.setName("profile")
	.setDescription("Показати профіль користувача.")
	.addUserOption(
		option => option
		.setName("user")
		.setDescription("Користувач")
	),
	async execute(interaction, client) {
		var target = interaction.options.getUser("user") || interaction.user
		await axios.get(apiKey + "/users?where[discordId][eq]=" + target.id,
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(res => {
			if (!res.data[0]) {
				if (target.id == interaction.user.id) {
					interaction.reply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
						], ephemeral: true
					})
				} else {
					interaction.reply({
					   embeds: [
					       new EmbedBuilder()
					       .setDescription(template.icon.n + " Отакої! Схоже, що у користувача " + target.username  + " ще немає профілю.")
					   ], ephemeral: true
					})
				}
			} else {
				var user = res.data[0]
				if (res.data[0].banned) {
				    return interaction.reply({
				        embeds: [
				            new EmbedBuilder()
				            .setDescription(template.icon.n + " Нажаль, профіль користувача " + target.username + " недоступний для публічного перегляду. Зверніться до адміністрації для деталей.")
				        ], ephemeral: true
				    })
				}
				interaction.reply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.molang + "\n\n"
						+ user.displayName + " " + getBadges(user.badges))
						.addFields(
							[{
								name: "Опис",
								value: user.description
							},
							{
								name: "Ідентифікаційний номер профілю",
								value: String(user.id)
							},
							{
								name: "Організація",
								value: (user.organizationId == 0) ? "Немає" : "Не визначено"
							},
							{
								name: "Баланс",
								value: template.icon.bank + " " 
								+ String(user.bank) + "\n" + template.icon.crypto + " " 
								+ String(user.crypto)
							}]
						)
						.setThumbnail(user.avatarURL)
						.setImage(user.bannerURL)
					], ephemeral: true
				})
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
