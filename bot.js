/* eslint-disable no-inner-declarations */
const status = 'dnd';
require('dotenv').config();
const channelID = process.env.CHANNELID;
const token = process.env.TOKEN;
const Discord = require('discord.js');
const logger = require('./logger.js');
const client = new Discord.Client();
const fetch = require('node-fetch');
const moment = require('moment');
const pagination = require('discord-paginationembed'); // I was lazy to do the handlers myself :D
let version;

process.on('unhandledRejection', async (err) => {
    logger.error('Unhandled rejection: ' + err.message);
});

client.on('ready', async () => {
    logger.info(`Logged in as ${client.user.tag} and serving ${client.guilds.cache.size} servers.`);
    await client.user.setActivity('League of Legends', {
        type: 5,
        url: 'https://twitch.tv/thaddeuskkr'
    });
    await client.user.setStatus(status);
    // Checking LoL datadragon latest version
    logger.info('Checking DataDragon version');
    version = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    version = await version.json();
    version = version[0];
    logger.info(`Using latest DataDragon version ${version}`);
    client.prefixless = true;
});

client.on('message', async (message) => {
    if (message.content.includes('\\') || message.content.includes('+')) return;
    if (message.author.bot) return;
    if (message.channel.id != channelID && !message.content.startsWith('mh ')) {
        return;
    } else if (message.content.includes('mh dd') || message.content.includes('mh datadragon')) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('LoL DataDragon API')
            .setDescription(`Current ddragon version: \`${version || 'Disconnected'}\``)
            .setColor('PURPLE')
            .setFooter('Made by tkkr#7552');
        return message.channel.send(embed);
    } else if (message.content.includes('help') && message.channel.id == channelID) {
        if (client.prefixless == false) return;
        const embed = new Discord.MessageEmbed()
            .setAuthor('Help', client.user.avatarURL())
            .setDescription(
                'A bot made to check the details of a match in the match history of a player in Garena.' + '\n' +
                `**Prefixless Channel:** ${client.channels.cache.find(c => c.id == channelID).toString()}` + '\n' +
                '**Format:** \n`<summoner name> | [champion filter / none] | [index | latest/oldest] | [matchestofind]`' + '\n' +
                '*Take note that `[]` denotes optional arguments while `<>` denotes compulsory arguments.*' + '\n' + 
                '**Example:** `ThaddeusKKR | Shen | latest | 15`' + '\n' + 
                'To send a ignored message in the prefixless channel, append `+` or `\\` to any part of your message.' + '\n\n' +
                'For an overview of a player\'s matches, use `<summoner name> -o`'
            )
            .setFooter('Created by tkkr#7552')
            .setColor('PURPLE');
        message.delete();
        message.channel.send(embed).then(msg => msg.delete({ timeout: 30000 }));
        return;
    } else if (message.content.includes('mh help')) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Help', client.user.avatarURL())
            .setDescription(
                'A bot made to check the details of a match in the match history of a player in Garena.' + '\n' +
                `**Prefixless Channel:** ${client.channels.cache.find(c => c.id == channelID).toString()}` + '\n' +
                '**Format:** \n`mh <summoner name> | [champion filter / none] | [index | latest/oldest] | [matchestofind]`' + '\n' +
                '*Take note that `[]` denotes optional arguments while `<>` denotes compulsory arguments.*' + '\n' + 
                '**Example:** `mh ThaddeusKKR | Shen | latest | 15`' + '\n\n' +
                'For an overview of a player\'s matches, use `mh <summoner name> -o`'
            )
            .setFooter('Created by tkkr#7552')
            .setColor('PURPLE');
        message.delete();
        message.channel.send(embed).then(msg => msg.delete({ timeout: 30000 }));
        return;
    } else if (message.content.includes('mh purge') || message.content.includes('mh clear') && message.channel.id == channelID) {
        await message.channel.messages.fetch(null, false, true);
        const numberOfTimes = Math.ceil(message.channel.messages.cache.size / 100);
        for (let i = 0; i < numberOfTimes; i++) {
            await message.channel.bulkDelete(100);
        }
        const today = new Date();
        message.channel.send(
            '__**How to use:**__\n' +
            'This channel is a *prefixless channel*. This means that commands used here do not require a prefix (for this bot only). If you want to chat here, you can add a `+` or a `\\` to your messages so that the bot ignores them completely, or use `mh pre` to toggle prefixless mode on this channel.\n' + 
            '\n' +
            '**Command syntax:**\n' +
            '`<summonerName> [-o | --overview] | [championFilter] | [gameIndex] | [numberOfResults]`\n' +
            '\n' +
            '**Arguments:**\n' + 
            '**`summonerName [str]`**: The name of the League of Legends player to find stats for.\n' +
            '`-o | --overview`: Shows the recent 20 matches in 1 embed. The champion filter works with this.\n' +
            '`championFilter [str; default: none]`: Filter such that only a specific champion appears.\n' +
            '`gameIndex [int; default: latest]`: Up to 20 games are found, 1 being the latest and 20 being the oldest. Alternatively, use `oldest` and `latest`.\n' +
            '`numberOfResults [int; default: 100]`: Currently not working.\n' +
            '\n' +
            '**Examples:**\n' +
            '`ThaddeusKKR -o | Shen`: Shows recent 20 Shen games for the player `ThaddeusKKR`\n' +
            '`ThaddeusKKR | Shen | 12`: Shows the 12\'th match in `ThaddeusKKR`\'s match history\n' + 
            '`ThaddeusKKR`: Shows the latest match that the player played in\n' + 
            '`ThaddeusKKR -o`: Shows the last 20 matches the player has participated in\n' +
            '\n' +
            '*Made by ThaddeusKKR - 2021*\n' +
            client.user.toString() + '\n\n' +
            `**Last purged:** \`${today.toString()}\``
        );
        return;
    } else if (message.content.includes('mh prefixless') || message.content.includes('mh pre') && message.channel.id == channelID) {
        if (client.prefixless == false) {
            client.prefixless = true;
            const embed = new Discord.MessageEmbed()
                .setAuthor('Success!')
                .setDescription('Enabled watcher (prefixless mode).')
                .setColor('GREEN');
            message.delete();
            message.channel.send(embed).then(msg => msg.delete({ timeout: 60000 }));
            return;
        } else if (client.prefixless == true) {
            client.prefixless = false;
            const embed = new Discord.MessageEmbed()
                .setAuthor('Success!')
                .setDescription('Disabled watcher (prefixless mode).')
                .setColor('GREEN');
            message.delete();
            message.channel.send(embed).then(msg => msg.delete({ timeout: 60000 }));
            return;
        }
    } else {
        if (!message.content.includes('mh ') && client.prefixless == false) return;
        if (message.content.includes('--overview') || message.content.includes('-o')) {
            message.overview = true;
        }
        let args = message.content.replace('mh ', '');
        if (message.overview == true) {
            args = args.replace('--overview', '').replace('-o', '');
        }
        args = args.split(' | ');
        // eslint-disable-next-line no-unused-vars
        const rawUser = args[0];
        const username = encodeURI(args[0]);
        let champion;
        if (args[1] && args[1] == 'none') {
            champion = '*';
        } else {
            champion = args[1] || '*';
        }
        let index = args[2] - 1 || 'latest';
        const beginIndex = args[4] || 0;
        const endIndex = args[3] || 100;

        logger.debug(`${message.author.tag} > ${args.join(' | ')}`);

        // Getting the ID of the account by the summoner name
        let id = await fetch(`https://acs-garena.leagueoflegends.com/v1/players?name=${username}&region=SG`);
        if (id.status != 200) {
            const embed = new Discord.MessageEmbed()
                .setAuthor('Error')
                .setDescription(`Summoner **${decodeURI(username)}** was not found.`)
                .setColor('RED');
            return message.channel.send(embed);
        }
        id = await id.json();
        const accountID = id.accountId;

        async function getItemNames (ids) {
            let itemList = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);
            itemList = await itemList.json();
            let nameArr = [];
            ids.filter(val => val != 0).forEach(id => {
                let item = itemList.data[id];
                if (!item) return;
                nameArr.push(item.name);
            });
            return nameArr;
        }

        async function getChampName (id) {
            if (isNaN(id)) return 'NaN';
            let championInfo = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
            championInfo = await championInfo.json();
            let list = championInfo.data;
            let championID;
            let championName;
            let rawName;
            for (let i in list) {
                if (list[i].key == id) {
                    championID = list[i].key;
                    championName = list[i].id;
                    rawName = list[i].name;
                }
            }
            return { championID: championID, championName: championName, rawName: rawName };
        }

        async function getChampID (champion) {
            let championInfo = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
            championInfo = await championInfo.json();
            let list = championInfo.data;
            let championID;
            let championName;
            let rawName;
            for (let i in list) {
                if (list[i].id.toLowerCase() == champion.toLowerCase() || list[i].name.toLowerCase().includes(champion.toLowerCase())) {
                    championID = list[i].key;
                    championName = list[i].id;
                    rawName = list[i].name;
                }
            }
            return { championID: championID, championName: championName, rawName: rawName };
        }
        let champInfo = await getChampID(champion);
        let initial = champInfo;

        // Getting the match history
        let res = await fetch(`https://acs-garena.leagueoflegends.com/v1/stats/player_history/SG/${accountID}?begIndex=${beginIndex}&endIndex=${endIndex}&champion=${champInfo.championID || ''}`);
        if (res.status != 200) {
            logger.error('Error ' + res.status);
            return;
        }
        res = await res.json();

        // Handling data
        if (index == 'latest') {
            index = 0;
        } else if (index == 'earliest') {
            index = res.games.games.length - 1;
        }
        let rawMatch;
        if (index == 0) {
            rawMatch = 'Latest match';
        } else if (index == res.games.games.length - 1) {
            rawMatch = 'Earliest match found';
        } else {
            rawMatch = `Match ${parseInt(index) + 1} of ${endIndex}`;
        }
        const games = res.games.games.reverse();

        // Overview mode
        if (message.overview == true) {
            const arr = [];
            for (let i = 0; i < games.length; i++) {
                const participant = games[i].participants[0];
                const stats = games[i].participants[0].stats;
                champInfo = await getChampName(participant.championId);
                if (!champInfo || !stats || !participant) continue;
                let seconds = moment.duration(games[i].gameDuration, 'seconds').seconds();
                if (String(seconds).length == 1) seconds = `0${seconds}`;
                arr.push({
                    name: i + 1,
                    value: `\`${i+1}\`: **${champInfo.rawName}** (${stats.champLevel}) **|** ${stats.kills}/${stats.deaths}/${stats.assists} **|** ${stats.totalMinionsKilled} **|** ${moment.duration(games[i].gameDuration, 'seconds').minutes()}:${seconds} **|** ${(stats.win == true) ? 'Win' : 'Loss'}`
                });
            }
            const fields = new pagination.FieldsEmbed()
                .setArray(arr)
                .setAuthorizedUsers([message.author.id])
                .setChannel(message.channel)
                .setElementsPerPage(10)
                .setPageIndicator(false)
                .formatField('Champion | KDA | CS | Duration | Result', a => a.value);
            fields.embed
                .setAuthor(games[0].participantIdentities[0].player.summonerName, `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${games[0].participantIdentities[0].player.profileIcon}.png`)
                .setColor('PURPLE')
                .setTitle('Match History')
                .setFooter('Made by tkkr#7552' + ` | DataDragon ${version}`);
            fields.build();
            return;
        }

        const game = games[index];
        if (res.games.gameCount == 0) {
            logger.error('No stats found for ' + decodeURI(username));
            const embed = new Discord.MessageEmbed()
                .setAuthor('Error')
                .setDescription(`**${rawUser}** has no matches in their match history for **${champInfo.rawName || 'all champions'}**.`)
                .setColor('RED')
                .setFooter(`Made by tkkr#7552 | DataDragon ${version}`);
            message.channel.send(embed).then(m => m.delete({ timeout: 5000 }));
            return;
        }
        if (!game) return;
        const participant = game.participants[0];
        if (initial.championID != participant.championId && champion != '*') {
            const embed = new Discord.MessageEmbed()
                .setAuthor('Error')
                .setDescription(`Champion **${champion}** not found.`)
                .setColor('RED')
                .setFooter(`Made by tkkr#7552 | DataDragon ${version}`);
            message.channel.send(embed).then(m => m.delete({ timeout: 5000 }));
            return;
        }
        const stats = game.participants[0].stats;
        const itemIDArray = [stats.item0, stats.item1, stats.item2, stats.item3, stats.item4, stats.item5, stats.item6];
        const itemList = await getItemNames(itemIDArray);
        const trinket = itemList.pop();
        const embeds = [];
        let seconds = moment.duration(game.gameDuration, 'seconds').seconds();
        if (String(seconds).length == 1) seconds = `0${seconds}`;
        champInfo = await getChampName(participant.championId);
        embeds.push(new Discord.MessageEmbed()
            .setTitle('General')
            .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champInfo.championName}.png`)
            .addFields([
                {
                    name: 'Kills / Deaths / Assists',
                    value: `${stats.kills}/${stats.deaths}/${stats.assists}`
                },
                {
                    name: 'Items',
                    value: itemList.join(', ').replace('%i:ornnIcon%', '[Ornn]')
                },
                {
                    name: 'Trinket',
                    value: trinket
                },
                {
                    name: 'Champion level',
                    value: stats.champLevel
                },
                {
                    name: 'Lane',
                    value: participant.timeline.lane.toLowerCase().charAt(0).toUpperCase() + participant.timeline.lane.toLowerCase().slice(1)
                },
                {
                    name: 'Role (predicted)',
                    value: participant.timeline.role.toLowerCase().charAt(0).toUpperCase() + participant.timeline.role.toLowerCase().slice(1)
                },
                {
                    name: 'Game duration',
                    value: `${moment.duration(game.gameDuration, 'seconds').minutes()}:${seconds}`
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Kills')
            .addFields([
                {
                    name: 'Largest killing spree',
                    value: stats.largestKillingSpree,
                    inline: true
                },
                {
                    name: 'Largest multi kill',
                    value: stats.largestMultiKill,
                    inline: true
                },
                {
                    name: 'Killing sprees',
                    value: stats.killingSprees,
                    inline: true
                },
                {
                    name: 'Longest life',
                    value: `${moment.duration(stats.longestTimeSpentLiving, 'seconds').minutes()}:${moment.duration(stats.longestTimeSpentLiving, 'seconds').seconds()}`,
                    inline: true
                },
                {
                    name: 'Double kills',
                    value: stats.doubleKills,
                    inline: true
                },
                {
                    name: 'Triple kills',
                    value: stats.tripleKills,
                    inline: true
                },
                {
                    name: 'Quadra kills',
                    value: stats.quadraKills,
                    inline: true
                },
                {
                    name: 'Penta kills',
                    value: stats.pentaKills,
                    inline: true
                },
                {
                    name: 'Unreal kills',
                    value: stats.unrealKills,
                    inline: true
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Damage')
            .addFields([
                {
                    name: 'Total damage dealt',
                    value: stats.totalDamageDealt,
                    inline: true
                },
                {
                    name: 'Magic damage dealt',
                    value: stats.magicDamageDealt,
                    inline: true
                },
                {
                    name: 'Physical damage dealt',
                    value: stats.physicalDamageDealt,
                    inline: true
                },
                {
                    name: 'True damage dealt',
                    value: stats.trueDamageDealt,
                    inline: true
                },
                {
                    name: 'Largest critical strike',
                    value: stats.largestCriticalStrike,
                    inline: true
                },
                {
                    name: 'Total damage taken',
                    value: stats.totalDamageTaken,
                    inline: true
                },
                {
                    name: 'Physical damage taken',
                    value: stats.physicalDamageTaken,
                    inline: true
                },
                {
                    name: 'Magic damage taken',
                    value: stats.magicalDamageTaken,
                    inline: true
                },
                {
                    name: 'True damage taken',
                    value: stats.trueDamageTaken,
                    inline: true
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Damage to champions')
            .addFields([
                {
                    name: 'Total damage to champions',
                    value: stats.totalDamageDealtToChampions
                },
                {
                    name: 'Magic damage to champions',
                    value: stats.magicDamageDealtToChampions
                },
                {
                    name: 'Physical damage to champions',
                    value: stats.physicalDamageDealtToChampions
                },
                {
                    name: 'True damage dealt to champions',
                    value: stats.trueDamageDealtToChampions
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Utility')
            .addFields([
                {
                    name: 'Total healing',
                    value: stats.totalHeal
                },
                {
                    name: 'Total units healed',
                    value: stats.totalUnitsHealed
                },
                {
                    name: 'Self-mitigated damage',
                    value: stats.damageSelfMitigated
                },
                {
                    name: 'CC time',
                    value: stats.timeCCingOthers
                },
                {
                    name: 'Total time CC dealt',
                    value: stats.totalTimeCrowdControlDealt
                },
                {
                    name: 'Gold spent / earned',
                    value: `${stats.goldSpent} / ${stats.goldEarned}`
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Objectives')
            .addFields([
                {
                    name: 'Damage dealt to objectives',
                    value: stats.damageDealtToObjectives
                },
                {
                    name: 'Damage dealt to turrets',
                    value: stats.damageDealtToTurrets
                },
                {
                    name: 'Turrets destroyed',
                    value: stats.turretKills
                },
                {
                    name: 'Inhibitors destroyed',
                    value: stats.inhibitorKills
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Creep Score')
            .addFields([
                {
                    name: 'Total minions killed',
                    value: stats.totalMinionsKilled
                },
                {
                    name: 'Neutral monsters killed',
                    value: stats.neutralMinionsKilled || '0'
                },
                {
                    name: 'Neutral monsters killed (team jungle)',
                    value: stats.neutralMinionsKilledTeamJungle || '0'
                },
                {
                    name: 'Neutral monsters killed (enemy jungle)',
                    value: stats.neutralMinionsKilledEnemyJungle || '0'
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Vision')
            .addFields([
                {
                    name: 'Vision score',
                    value: stats.visionScore || '0'
                },
                {
                    name: 'Control wards purchased',
                    value: stats.visionWardsBoughtInGame || '0'
                },
                {
                    name: 'Sight wards purchased',
                    value: stats.sightWardsBoughtInGame || '0'
                },
                {
                    name: 'Wards placed',
                    value: stats.wardsPlaced || '0'
                },
                {
                    name: 'Wards destroyed',
                    value: stats.wardsKilled || '0'
                }
            ])
        );
        embeds.push(new Discord.MessageEmbed()
            .setTitle('Team')
            .addFields([
                {
                    name: 'First blood',
                    value: (stats.firstBloodKill == true) ? 'Yes' : 'No'
                },
                {
                    name: 'First tower',
                    value: (stats.firstTowerKill == true) ? 'Yes' : 'No'
                }
            ])
        );
        let gameMode;
        if (game.gameMode == 'ARAM') gameMode = 'Howling Abyss';
        if (game.gameMode == 'CLASSIC') gameMode = 'Summoner\'s Rift';
        if (game.gameMode == 'RGM') gameMode = 'Rotating Game Mode';
        if (game.gameMode == 'ONEFORALL') gameMode = 'One for All';
        new pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([message.author.id])
            .setChannel(message.channel)
            .setDisabledNavigationEmojis(['jump'])
            .setPage(1)
            .setAuthor(game.participantIdentities[0].player.summonerName, `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${game.participantIdentities[0].player.profileIcon}.png`)
            .setFooter(`${rawMatch}: ${champInfo.rawName} (${gameMode})` + ` | DataDragon ${version}`)
            .setColor('PURPLE')
            .build();
    }
});

client.login(token);