var {
	EmbedBuilder
} = require("discord.js")
var temp = require("../templates.js")
function write(spend, sum, currency, description, host) {
	if (spend) {
		return new EmbedBuilder()
		.setTitle("Списание со счёта")
		.addFields([
			{
				name: "Сумма",
				value: sum + " " + temp.icon[currency]
			},
			{
				name: "Назначение",
				value: description || "Нету"
			}
		])
		.setTimestamp()
	} else if (!spend) {
		return new EmbedBuilder()
		.setTitle("Пополнение счёта")
        .addFields([
        	{
        		name: "Отправитель",
        		value: host
        	},
            {
                name: "Сумма",
                value: sum + " " + temp.icon[currency]
            },
            {
                name: "Назначение",
                value: description || "Нету"
            }
        ])
        .setTimestamp()
	} else {
		return undefined
	}
}
module.exports = write
