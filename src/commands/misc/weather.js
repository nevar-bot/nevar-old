const BaseCommand = require('@structures/BaseCommand');
const { SlashCommandBuilder} = require('discord.js');
const axios = require("axios");

class Weather extends BaseCommand {
    constructor(client){
        super(client, {
            name: "weather",
            description: "Zeigt das Wetter für eine Stadt an",

            cooldown: 2000,
            dirname: __dirname,

            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option => option
                        .setName("stadt")
                        .setDescription("Gib einen Ort oder Stadt an")
                        .setRequired(true)
                    )
            }
        })
    }

    static interaction;

    async dispatch(interaction, data){
        this.interaction = interaction;

        await this.showWeather(interaction.options.getString("stadt"));
    }

    async showWeather(city){
        if(!this.client.config.apikeys["WEATHER"] || this.client.config.apikeys["WEATHER"] === ""){
            const noApiKeyEmbed = this.client.createEmbed("Da in der Bot-Config der nötige Openweathermap-API-Key nicht hinterlegt wurde, kann der Weather-Befehl nicht genutzt werden.", "error", "error");
            return this.interaction.followUp({ embeds: [noApiKeyEmbed] });
        }
        if(!city){
            const noCityEmbed = this.client.createEmbed("Bitte gib einen Ort oder eine Stadt an.", "error", "error");
            return this.interaction.followUp({ embeds: [noCityEmbed] });
        }

        const weatherInformation = (await axios.get("https://api.openweathermap.org/data/2.5/weather?q=" + encodeURI(city) + "&appid=" + this.client.config.apikeys["WEATHER"] + "&lang=de&units=metric", {
            validateStatus: false
        })).data;

        if(weatherInformation?.cod === 200){
            const weather = {
                description: weatherInformation.weather[0].description,
                temp: Math.round(weatherInformation.main.temp),
                tempMin: Math.round(weatherInformation.main.temp_min),
                tempMax: Math.round(weatherInformation.main.temp_max),
                tempFeelsLike: Math.round(weatherInformation.main.feels_like),
                humidity: weatherInformation.main.humidity,
                wind: {
                    ms: weatherInformation.wind.speed,
                    kmh: Math.round(weatherInformation.wind.speed * 3.6),
                },
                sunrise: new Date(weatherInformation.sys.sunrise * 1000).toLocaleTimeString("de-DE"),
                sunset: new Date(weatherInformation.sys.sunset * 1000).toLocaleTimeString("de-DE"),
            }

            const text =
                " Temperatur (min/max/gefühlt): " + weather.temp + "°C (" + weather.tempMin + "°C /" + weather.tempMax + "°C /" + weather.tempFeelsLike + "°C)\n\n" +

                this.client.emotes.text + " Luftfeuchtigkeit: " + weather.humidity + "%\n\n" +
                this.client.emotes.strike + " Windgeschwindigkeit: " + weather.wind.kmh + "km/h (" + weather.wind.ms + "m/s)\n\n" +
                this.client.emotes.shine + " Sonnenaufgang: " + weather.sunrise + "\n" +
                this.client.emotes.shine2 + " Sonnenuntergang: " + weather.sunset;

            const weatherEmbed = this.client.createEmbed(text, "bright", "normal");
            weatherEmbed.setTitle(weatherInformation.name + ": " + weather.description);

            return this.interaction.followUp({ embeds: [weatherEmbed] });
        }else{
            const errorEmbed = this.client.createEmbed("Es konnte kein Ort mit dem Namen \"" + city + "\" gefunden werden.", "error", "error");
            return this.interaction.followUp({ embeds: [errorEmbed] });
        }

    }
}

module.exports = Weather;