const {
	EmbedBuilder,
	SlashCommandBuilder
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")
const checkout = require("../apis/checkout.js")

module.exports = {
	data: new SlashCommandBuilder()
	.setName("transfer")
	.setDescription("Передати грошові одиниці іншій особі.")
	.addUserOption(
		option => option
		.setName("user")
		.setDescription("Користувач")
		.setRequired(true)
	)
	.addIntegerOption(
		option => option
		.setName("sum")
		.setDescription("Сумма")
		.setRequired(true)
	)
	.addStringOption(
		option => option
		.setName("currency")
		.setDescription("Валюта")
		.setRequired(true)
		.addChoices(
			{ name: "Molang Dollar", value: "bank" },
			{ name: "Molang Crypto", value: "crypto" }
		)
	)
	.addStringOption(
		option => option
		.setName("description")
		.setDescription("Призначення")
	),
	async execute(interaction, client) {
		var target = interaction.options.getUser("user")
		var _sum = interaction.options.getInteger("sum")
		var _currency = interaction.options.getString("currency")
		var _description = interaction.options.getString("description") || "Не вказано"
		await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id,
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async host => {
			if (!host.data[0]) {
				interaction.reply({
					embeds: [
						new EmbedBuilder()
						.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
					], ephemeral: true
				})
			} else {
				await axios.get(apiKey + "/users?where[discordId][eq]=" + target.id, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				})
				.then(async user => {
					if (!user.data[0]) {
						interaction.reply({
						    embeds: [
						        new EmbedBuilder()
						        .setDescription(template.icon.n + " Отакої! Схоже, що у користувача " + target.username + " ще немає профілю.")
						    ], ephemeral: true
						})
					} else {
						if (_currency == "bank") {
							if (host.data[0].bank < _sum) {
								interaction.reply({
									embeds: [
										new EmbedBuilder()
										.setDescription(template.icon.n + " Недостатньо коштів.")
									], ephemeral: true
								})
							} else {
								var newBank = user.data[0].bank += _sum;
								var oldBank = host.data[0].bank -= _sum;
								await axios.put(apiKey + "/users/" + host.data[0].id, {
									bank: oldBank
								}, {
									headers: {
										"Authorization": "Bearer " + apiToken
									}
								})
								client.users.cache.get(host.data[0].discordId).send({
									embeds: [
										checkout(true, _sum, "bank", _description)
									]
								})
								await axios.put(apiKey + "/users/" + user.data[0].id, {
									bank: newBank
								}, {
									headers: {
										"Authorization": "Bearer " + apiToken
									}
								})
								client.users.cache.get(user.data[0].discordId).send({
									embeds: [
										checkout(false, _sum, "bank", _description, host.data[0].displayName)
									]
								})
								interaction.reply({
									embeds: [
										new EmbedBuilder()
										.setDescription(template.icon.y + " Операція виконана.")
									], ephemeral: true
								})
							}
						} else if (_currency == "crypto") {
							if (host.data[0].crypto < _sum) {
							    interaction.reply({
							        embeds: [
							            new EmbedBuilder()
							            .setDescription(template.icon.n + " Недостатньо коштів.")
							        ], ephemeral: true
							    })
							} else {
							    var newBank = user.data[0].crypto += _sum;
							    var oldBank = host.data[0].crypto -= _sum;
							    await axios.put(apiKey + "/users/" + host.data[0].id, {
							        crypto: oldBank
							    }, {
							        headers: {
							            "Authorization": "Bearer " + apiToken
							        }
							    })
							    client.users.cache.get(host.data[0].discordId).send({
							        embeds: [
							            checkout(true, _sum, "crypto", _description)
							        ]
							    })
							    await axios.put(apiKey + "/users/" + user.data[0].id, {
							        crypto: newBank
							    }, {
							        headers: {
							            "Authorization": "Bearer " + apiToken
							        }
							    })
							    client.users.cache.get(user.data[0].discordId).send({
							        embeds: [
							            checkout(false, _sum, "crypto", _description, host.data[0].displayName)
							        ]
							    })
							    interaction.reply({
							        embeds: [
							            new EmbedBuilder()
							            .setDescription(template.icon.y + " Операція виконана.")
							        ], ephemeral: true
							    })
							}
						}
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
