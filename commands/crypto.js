const {
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} = require("discord.js")
const apiKey = require("../config.js").APIKEY || process.env.APIKEY
const apiToken = require("../config.js").APITOKEN || process.env.APITOKEN
const axios = require("axios")
const template = require("../templates.js")
const checkout = require("../apis/checkout.js")

module.exports = {
	data: new SlashCommandBuilder()
	.setName("crypto")
	.setDescription("Информация о Molang Crypto."),
	async execute(interaction, client) {
		await interaction.deferReply();
		await axios.get(apiKey + "/crypto?max=updatedAt",
		{
			headers: {
				"Authorization": "Bearer " + apiToken
			}
		})
		.then(async f => {
			await axios.get(apiKey + "/crypto?where[updatedAt][eq]=" + f.data, 
			{																   
				headers: {
					"Authorization": "Bearer " + apiToken
				}
			})
			.then(async s => {
				await axios.get(apiKey + "/users?where[discordId][eq]=" + interaction.user.id, {
					headers: {
						"Authorization": "Bearer " + apiToken
					}
				}).then(user => {
					var updated = "<t:" + Math.floor(s.data[0].updatedAt / 1000) + ":R>"
					var buyButton = new ButtonBuilder()
					.setLabel("Купить")
					.setCustomId("buy")
					.setStyle(ButtonStyle.Success)
					.setEmoji("1137712961855688714")
					if (!user.data[0] || eval(user.data[0].bank) < s.data[0].price || !user.data[0]) {
						buyButton.setDisabled(true)
					}
					var sellButton = new ButtonBuilder()
					.setLabel("Продать")
					.setCustomId("sell")
					.setStyle(ButtonStyle.Danger)
					.setEmoji("1137711911543263271")
					if (!user.data[0] || eval(user.data[0].crypto) < 1 || !user.data[0]) {
						sellButton.setDisabled(true)
					}
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.addFields([
								{
									name: "Цена",
									value: s.data[0].price + " " + template.icon.bank
								},
								{
									name: "Обновлено",
									value: updated
								}
							])
							.setThumbnail("https://cdn.discordapp.com/attachments/1108726298915909633/1137824810836185199/3068-new-nitro-boost.gif")
						], ephemeral: true,
						components: [new ActionRowBuilder().addComponents(buyButton, sellButton)]
					}).then(async response => {
						var collector = response.createMessageComponentCollector({});
						
						collector.on('collect', async i => {
							if (i.customId == "sell") {
								var modal = new ModalBuilder()
								.setCustomId("modal")
								.setTitle("Продать Molang Crypto")
								var count = new TextInputBuilder()
								.setStyle(TextInputStyle.Short)
								.setLabel("Количество")
								.setRequired(true)
								.setCustomId("count")

								modal.addComponents(new ActionRowBuilder().addComponents(count))

								i.showModal(modal)
								.then(async () => {
									i.awaitModalSubmit({time: 0})
									.then(async mresm => {
										i.deleteReply()
										var count = mresm.fields.getTextInputValue("count")
										if (isNaN(count)) {
											await mresm.reply({
												embeds: [
													new EmbedBuilder()
													.setDescription(template.icon.n + " Введите коректное число.")
												], ephemeral: true
											})
										} else {
											if (eval(user.data[0].crypto) < eval(count)) {
												await mresm.reply({
													embeds: [
														new EmbedBuilder()
														.setDescription(template.icon.n + " Недостаточно средств.")
													], ephemeral: true
												})
											} else {
												await axios.put(apiKey + "/users/" + user.data[0].id, {
													crypto: String(eval(user.data[0].crypto) - eval(count)),
													bank: String(Math.floor(eval(user.data[0].bank) + (s.data[0].price * eval(count))))
												}, {
													headers: {
														"Authorization": "Bearer " + apiToken
													}
												}).then(async () => {
													var u = client.users.cache.get(interaction.user.id)
													await u.send({
														embeds: [checkout(true, count, "crypto", "Molang Crypto")]
													})
													await u.send({
														embeds: [checkout(false, Math.floor(eval(count) * s.data[0].price), "bank", "Molang Crypto", "<:emoji_45:1101886471113293824><:emoji_46:1101886494240673913><:emoji_47:1101886521457508432>")]
													})
													
													await mresm.reply({
														embeds: [
															new EmbedBuilder()
															.setDescription(template.icon.y + " Операция прошла успешно.")
														], ephemeral: true
													})
												})
											}
										}
									})
								})
							} else if (i.customId == "buy") {
								var modalb = new ModalBuilder()
								.setCustomId("modalb")
								.setTitle("Купить Molang Crypto")
								var countb = new TextInputBuilder()
								.setStyle(TextInputStyle.Short)
								.setLabel("Количество")
								.setCustomId("countb")
								
								modalb.addComponents(new ActionRowBuilder().addComponents(countb))
								
								i.showModal(modalb)
								.then(() => {
									i.awaitModalSubmit({time: 0})
									.then(async mresm => {
										i.deleteReply()
										var count = mresm.fields.getTextInputValue("count")
										if (isNaN(count)) {
											mresm.reply({
												embeds: [
													new EmbedBuilder()
													.setDescription(template.icon.n + " Введите коректное число.")
												], ephemeral: true
											})
										} else {
											var buySum = s.data[0].price * eval(count);
											if (eval(user.data[0].bank) < buySum) {
												mresm.reply({
													embeds: [
														new EmbedBuilder()
														.setDescription(template.icon.n + " Недостаточно средств.")
													], ephemeral: true
												})
											} else {
												await axios.put(apiKey + "/users/" + user.data[0].id, {
													crypto: String(eval(user.data[0].crypto) + eval(count)),
													bank: String(Math.floor(eval(user.data[0].bank) - buySum))
												}, {
													headers: {
														"Authorization": "Bearer " + apiToken
													}
												}).then(() => {
													var u = client.users.cache.get(interaction.user.id)
													u.send({
														embeds: [checkout(true, buySum, "bank", "Molang Crypto")]
													})
													u.send({
														embeds: [checkout(false, count, "crypto", "Molang Crypto", "<:emoji_45:1101886471113293824><:emoji_46:1101886494240673913><:emoji_47:1101886521457508432>")]
													})
								
													mresm.reply({
														embeds: [
															new EmbedBuilder()
															.setDescription(template.icon.y + " Операция прошла успешно.")
														], ephemeral: true
													})
												})
											}
										}
									})
								})
							}
						});
					})
				})
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
