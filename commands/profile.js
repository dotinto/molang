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
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
						], ephemeral: true
					})
				} else {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у користувача " + target.username  + " ще немає профілю.")
						], ephemeral: true
					})
				}
			} else {
				var user = res.data[0]
				if (res.data[0].banned) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Нажаль, профіль користувача " + target.username + " недоступний для публічного перегляду. Зверніться до адміністрації для деталей.")
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
								name: "Опис",
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
								name: "Рівень",
								value: prestige + " " + levels[user.chatLevel].name,
								inline: true
							},
							{
								name: "Ідентифікаційний номер профілю",
								value: String(user.id),
								inline: true
							},
							{
								name: "Організація",
								value: (user.organizationId == 0) ? "Немає" : "Не визначено",
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
