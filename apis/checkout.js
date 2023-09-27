var {
	EmbedBuilder
} = require("discord.js")
var temp = require("../templates.js")
function write(spend, sum, currency, description, host) {
	if (spend) {
		return new EmbedBuilder()
		.setTitle("Списання коштів")
		.addFields([
			{
				name: "Сума",
				value: sum + " " + temp.icon[currency],
				inline: true
			},
			{
				name: "Призначення",
				value: description || "Нету",
				inline: true
			},
			{
				name: "Дата",
				value: "<t:" + Math.floor(Date.now() / 1000) + ":R>",
				inline: true
			}
		])
	} else if (!spend) {
		return new EmbedBuilder()
		.setTitle("Поповнення рахунку")
        .addFields([
        	{
        		name: "Відправник",
        		value: host,
        		inline: true
        	},
            {
                name: "Сума",
                value: String(sum) + " " + temp.icon[currency],
                inline: true
            },
            {
                name: "Призначення",
                value: description || "Нету",
                inline: true
            },
            {
            	name: "Дата",
            	value: "<t:" + Math.floor(Date.now() / 1000) + ":R>",
            	inline: true
            }
        ])
	} else {
		return undefined
	}
}
module.exports = write
