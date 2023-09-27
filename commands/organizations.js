const {
	EmbedBuilder,
	SlashCommandBuilder,

} = require("discord.js")
const axios = require("axios")
const { APIKEY, APITOKEN } = require("../config.js")
const template = require("../templates.js")

/* 
User Object Structure
{
  "displayName":string
  "description":string
  "discordId":string
  "verified":boolean
  "organizationId":integer
  "premium":boolean
  "premiumExpires":integer
  "timeout":string
  "badges":string
  "avatarURL":string
  "bannerURL":string
  "createdTimestamp":integer
  "banned":boolean
  "bank":string
  "crypto":string
  "chatLevel":integer
  "chatLevelPoints":integer
  "chatLevelTier":integer
}
*/

module.exports = {
	data: new SlashCommandBuilder()
	.setName("організації")
	.setDescription("Організації")
	.addSubcommand(
		subcommand => subcommand
		.setName("створити")
		.setDescription("Створити організацію (2 000 000 M$) (Тільки підписникам)")
		.addStringOption(
			option => option
			.setName("displayname")
			.setDescription("Ім'я організації")
			.setRequired(true)
		)
		.addStringOption(
			option => option
			.setName("description")
			.setDescription("Опис організації")
			.setRequired(false)
		)
	)
	.addSubcommand(
		subcommand => subcommand
		.setName("редагувати")
		.setDescription("Редагувати організацію")
		.addStringOption(
			option => option
			.setName("displayname")
			.setDescription("Ім'я організації")
			.setRequired(true)
		)
		.addStringOption(
			option => option
			.setName("description")
			.setDescription("Опис організації")
			.setRequired(true)
		)
		.addStringOption(
			option => option
			.setName("avatar")
			.setDescription("Аватар організації (URL)")
			.setRequired(true)
		)
		.addStringOption(
			option => option
			.setName("banner")
			.setDescription("Баннер організації (URL)")
			.setRequired(true)
		)
	)
	.addSubcommand(
		subcommand => subcommand
		.setName("видалити")
		.setDescription("Видалити організацію")
	),
	async execute(interaction) {
		await interaction.deferReply()
		await axios.get(APIKEY + "/users?where[discordId][eq]=" + interaction.user.id, {
			headers: {
				"Authorization": "Bearer " + APITOKEN
			}
		}).then(async res => {
			const user = res.data[0];
			console.log(user);
			if (interaction.options.getSubcommand == "створити") {
				if (!user.premium) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає підписки.")
						], ephemeral: true
					})
				} else if (user.organizationId != null) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас вже є організація.")
						], ephemeral: true
					})
				} else if (user.bank < 2000000) {
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас недостатньо коштів.")
						], ephemeral: true
					})
				} else {
					var description = interaction.options.getString("description") || "No description yet."
					var name = interaction.options.getString("displayname")
					
					await axios.post(APIKEY + "/orgs", {
						name: name,
						balance: 0,
						description: description,
						ownerId: interaction.user.id,
						members: JSON.stringify([interaction.user.id])
					}, {
						headers: {
							"Authorization": "Bearer " + APITOKEN
						}
					}).then((newOrg) => {
						console.log(newOrg);
						interaction.editReply({
							embeds: [
								new EmbedBuilder()
								.setDescription(template.icon.y + " Організація створена!")
							], ephemeral: true
						})
						

					}).catch((err) => {
						console.log(err)
						interaction.editReply({
							embeds: [
								new EmbedBuilder()
								.setDescription(template.icon.n + template.resp.err)
							], ephemeral: true
						})
					})
				}
			} else if (interaction.options.getSubcommand == "редагувати") {
				if (user.organizationId == null) {
					interaction.editReply({
						embeds: [
							new EmbedBuilder()
							.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає організації.")
						], ephemeral: true
					})
				} else {
					axios.get(APIKEY + "/orgs/" + user.organizationId, {
						headers: {
							"Authorization": "Bearer " + APITOKEN
						}
					}).then(orgd => {
						var org = orgd.data[0]
						if (interaction.user.id != org.ownerId) {
							interaction.editReply({
								embeds: [
									new EmbedBuilder()
									.setDescription(template.icon.n + " Отакої! Схоже, що у Вас немає прав на редагування.")
								], ephemeral: true
							})
							return;
						}
						var description = interaction.options.getString("description") || org.description;
						var name = interaction.options.getString("displayname") || org.name;
						var bannerURL = interaction.options.getString("banner") || org.bannerURL;
						var avatarURL = interaction.options.getString("avatar") || org.avatarURL;

						axios.put(APIKEY + "/orgs/" + user.organizationId, {
							name: name,
							description: description,
							bannerURL: bannerURL,
							avatarURL: avatarURL
						}, {
							headers: {
								"Authorization": "Bearer " + APITOKEN
							}
						}).then(() => {
							interaction.editReply({
								embeds: [
									new EmbedBuilder()
									.setDescription(template.icon.y + " Організація оновлена!")
								], ephemeral: true
							})
							
						})
					})
				}
			}
		}).catch(() => {
			interaction.editReply({
				embeds: [
					new EmbedBuilder()
					.setDescription(template.icon.n + " Отакої! Схоже, що у Вас ще немає профілю.")
				], ephemeral: true
			})		
		})}
}
