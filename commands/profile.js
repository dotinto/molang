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
	.setDescription("Показать профиль пользователя.")
	.addUserOption(
		option => option
		.setName("user")
		.setDescription("Пользователь")
		),
	async execute(interaction) {
		await interaction.deferReply();
		var target = interaction.options.getUser("user") || interaction.user
		await axios.get(apiKey + "/users?where[discordId][eq]=" + target.id,
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async res => {
			async function getLevels() {
				var {data} = await axios.get("https://moondust-starlight.dx-assets.pages.dev/levels.json")
				
				return data
			}
			
			
			let levels = await getLevels()
			if (!res.data[0]) {
				if (target.id == interaction.user.id) {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Упс! Похоже, что у вас еще нет профиля.")
						], ephemeral: true
					})
				} else {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Упс! Похоже, что у пользователя " + target.username  + " еще нет профиля.")
						], ephemeral: true
					})
				}
			} else {
				var user = res.data[0]
				if (res.data[0].banned) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " К сожалению, профиль пользователя " + target.username + " недоступный для просмотра. Обратитесь к администрации для деталей.")
						], ephemeral: true
					})
				}
				var prestige = "";
				(user.chatLevelTier < 10 && user.chatLevel != 6)
				? prestige += template.number[user.chatLevelTier+1] + " "
				: (() => {
					prestige += "["
					prestige += String(user.chatLevelTier)
					prestige += "]"
				})();
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.molang + "\n\n"
						+ user.displayName + " " + getBadges(user.badges))
						.addFields(
							[{
								name: "Описание",
								value: user.description,
								inline: true
							},
							{
								name: "Баланс",
								value: template.icon.bank + " "
								+ user.bank + "\n" + template.icon.crypto + " "
								+ user.crypto,
								inline: true
							}, {
								name: "Уровень",
								value: prestige + " " + levels[user.chatLevel].name,
								inline: true
							},
							{
								name: "Номер профиля",
								value: String(user.id),
								inline: true
							},
							{
								name: "Организация",
								value: (user.organizationId == 0) ? "Нету" : "Не определено",
								inline: true
							}]	
						)
						.setThumbnail(user.avatarURL || target.displayAvatarURL())
						.setImage(user.bannerURL)
					], ephemeral: true
				})
			}
		})
		.catch(err => {
			interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + template.resp.err)
				], ephemeral: true
			})
			console.error(err)
		})
	}
}
