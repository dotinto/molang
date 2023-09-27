const {
	EmbedBuilder,
	SlashCommandBuilder
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")

var reg = new RegExp(/<:[^:]+:\d+>/g);

module.exports = {
	data: new SlashCommandBuilder()
	.setName("edit")
	.setDescription("Редагувати публічні дані.")
	.addStringOption(
		option => option
		.setName("displayname")
		.setDescription("Відображене ім'я")
	)
	.addStringOption(
		option => option
		.setName("description")
		.setDescription("Опис профілю")
	)
	.addStringOption(
		option => option
		.setName("avatar_url")
		.setDescription("Посилання на аватар")
	)
	.addStringOption(
		option => option
		.setName("banner_url")
		.setDescription("Посилання на банер")
	),
	async execute(interaction, client) {
		await interaction.deferReply()
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id,
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(res => {
			if (!res.data[0]) {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
						], ephemeral: true
					})
			} else {
				var user = res.data[0]
				var _dn = interaction.options.getString("displayname") || user.displayName
				var _d = interaction.options.getString("description") || user.description
				var _aurl = interaction.options.getString("avatar_url") || user.avatarURL
				var _burl = interaction.options.getString("banner_url") || user.bannerURL

				if (interaction.options.getString("displayname") != null &&
				interaction.options.getString("displayname").match(reg)) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Нове відображене ім'я не може містити емодзі, що форматуються.")
						], ephemeral: true
					})
				} else
				if (!user.premium && interaction.options.getString("banner_url")) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Для зміни або встановлення баннеру необхідно мати активну підписку " + template.molang + " " + template.magic)
						], ephemeral: true
					})
				}
				
				axios.put(apiKey + "/users/" + user.id, {
					displayName: _dn,
					description: _d,
					avatarURL: _aurl,
					bannerURL: _burl
				}, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				}).then(() => {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.y + " Зміни збережено.")
						], ephemeral: true
					})
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
