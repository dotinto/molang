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
	.setDescription("Заробити кошти"),
	async execute(interaction, client) {
		await interaction.deferReply();
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async res => {
			if (!res.data[0]) {
				interaction.editReply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
					], ephemeral: true
				})
			} else {
				if (JSON.parse(res.data[0].timeout).work > Date.now()) {
					return interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Наразі діє відлік до нового використання вами команди work: `" + Math.floor( (JSON.parse(res.data[0].timeout).work - Date.now()) / 1000) + " секунд`")
						], ephemeral: true
					})
				}
				var newTimeout1 = Date.now() + 3600000
				var newTimeout2 = JSON.parse(res.data[0].timeout)
				newTimeout2.work = newTimeout1
				var newTimeout = JSON.stringify(newTimeout2)
				var sum = Math.floor(Math.random() * 12000);
				await axios.put(apiKey + "/users/" + res.data[0].id, {
					timeout: newTimeout,
					bank: String(eval(res.data[0].bank) += sum)
				}, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				}).then(r => {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.y + " Ви заробили " + sum + " " +  template.icon.cash)
						], ephemeral: true
					})
				}).catch(err => {
					interaction.editReply({
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
