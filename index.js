const { Client, Intents, MessageEmbed, MessageButton, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const { exec } = require('child_process');
const ticketCategoryID = '1266885043767476265';

////=======================Setup=======================////
let settings = {};
try {
    const data = fs.readFileSync('settings.json', 'utf8');
    settings = JSON.parse(data);
} catch (error) {
    console.error("Error reading or parsing settings.json:", error);
}
probotid = "282859044593598464"
let { price, transferto, logroom, doneroom, category } = settings;
////=======================Setup=======================////
function restartSlashJS() {
    exec('node slash.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting slash.js: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr restarting slash.js: ${stderr}`);
            return;
        }
        console.log(`stdout restarting slash.js: ${stdout}`);
    });
}
client.once('ready', async () => {
    try {
        const commands = [
            {
                name: 'set-price',
                description: 'Set the price for the purchase',
                options: [
                    {
                        name: 'price',
                        type: 'INTEGER',
                        description: 'The new price',
                        required: true
                    }
                ]
            },
            {
                name: 'give',
                description: 'Give an auto reaction token to a user',
                options: [
                    {
                        name: 'user',
                        type: 'USER',
                        description: 'The user to give the token to',
                        required: true
                    },
                    {
                        name: 'token',
                        type: 'STRING',
                        description: 'The token to give',
                        required: true
                    }
                ]
            },
            {
                name: 'setup',
                description: 'Set up various parameters',
                options: [
                    {
                        name: 'category',
                        type: 'CHANNEL',
                        description: 'The category ID',
                        required: true
                    },
                    {
                        name: 'transferto',
                        type: 'STRING',
                        description: 'The ID to transfer to',
                        required: true
                    },
                    {
                        name: 'logroom',
                        type: 'CHANNEL',
                        description: 'The log room ID',
                        required: true
                    },
                    {
                        name: 'doneroom',
                        type: 'CHANNEL',
                        description: 'The donation room ID',
                        required: true
                    }
                ]
            }
        ];

        await client.application.commands.set(commands);
        console.log('Slash commands registered successfully.');
        console.log('|==== Start Checking Badge Bots ====|')
        require('./slash.js');
    } catch (error) {
        console.error('Failed to register slash commands:', error);
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.user.id !== '764180361559146556') { 
        return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    const { commandName, options } = interaction;

    if (commandName === 'set-price') {
        const newPrice = options.getInteger('price');
        price = newPrice.toString();  
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2)); 
        return interaction.reply({ content: `Price set to ${newPrice}.`, ephemeral: true });
    }

    if (commandName === 'give') {
        // Code for give command
        const userMention = interaction.options.getUser('user');
        const userId = userMention.id; 
        const token = interaction.options.getString('token');

        try {
            let accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
            if (!Array.isArray(accounts)) {
                console.error("Data in accounts.json is not an array. Resetting accounts to an empty array.");
                accounts = [];
            }
            accounts.push({ botToken: token });
            fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2));
        


            await interaction.reply({ content: '**:white_check_mark: |   .لقد تمتم عملية الإعطاء بنجاح**', ephemeral: true });
        } catch (error) {
            console.error("Error reading or writing accounts.json:", error);
            await interaction.reply({ content: 'حصل خطأ', ephemeral: true });
        }
    }

    if (commandName === 'setup') {
        const newCategory = options.getChannel('category');
        const newTransferto = options.getString('transferto');
        const newLogroom = options.getChannel('logroom');
        const newDoneroom = options.getChannel('doneroom');

        category = newCategory.id; 
        transferto = newTransferto; 
        logroom = newLogroom.id; 
        doneroom = newDoneroom.id;

        settings.category = category;
        settings.transferto = transferto;
        settings.logroom = logroom;
        settings.doneroom = doneroom;

        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 2));

        return interaction.reply({ content: 'Setup complete.', ephemeral: true });
    }
});

client.once('ready', async () => {
    const activityType = 'STREAMING';
    console.log(`Bot Started With Name ${client.user.tag}.`);


    client.user.setPresence({
        activities: [{ name: "TOKYO STUDIO", type: activityType }],
        status: 'idle'
        
    });

    console.log(`Done Set Activity`);

    let accounts = []; 


    try {
        const data = fs.readFileSync('accounts.json', 'utf8');
        if (data) {
            accounts = JSON.parse(data);
            if (!Array.isArray(accounts)) {
                console.error("Data in accounts.json is not an array. Resetting accounts to an empty array.");
                accounts = [];
            }
        }
    } catch (error) {
        console.error("Error reading or parsing accounts.json:", error);
    }


});





client.on('channelCreate', async channel => {
    if (channel.type !== 'GUILD_TEXT' || channel.parentId !== category) return;
    

    setTimeout(async () => {
        const embed = new MessageEmbed()
            .setColor('#0033ff')
            .setTitle('**إكمال عملية شراء شارة **')
            .setDescription('لــشراء شارة المطور الناشط قم بالضغط على الزر اسفل الرسالة')
            .setTimestamp();

        const actionRow = new MessageActionRow().addComponents(
            {
                type: 'BUTTON',
                style: 'DANGER',
                emoji: '<:developers:1266530544884383885>',
                label: 'لشراء شارة المطور',
                customId: 'الشراء'
            }
        );

        const sentMessage = await channel.send({ embeds: [embed], components: [actionRow] });
    }, 1000); 
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'الشراء') { 
        const modal = new Modal()
            .setCustomId('DeveloperConfig')
            .setTitle('شـراء شـارة مـبـرمـج');

        const tokenInput = new TextInputComponent()
            .setCustomId('botToken')
            .setLabel('تـوكـن بـوتـك يـجـب وضـع تـوكـن بـوت')
            .setStyle('SHORT');

        const firstActionRow = new MessageActionRow().addComponents(tokenInput);

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'DeveloperConfig') {
        const botToken = interaction.fields.getTextInputValue('botToken');

        if (!botToken) {
            await interaction.reply({ content: 'Please provide bot token.', ephemeral: true });
            return;
        }

        const confirmationEmbed = new MessageEmbed()
            .setDescription(`هـــل أنت متأكـد انك تريد شراء شارة المطور الناشط لهذا الحساب ؟`)
            .setColor('#0033ff');

        const confirmButton = new MessageButton()
            .setCustomId('confirmPurchase')
            .setLabel('موافقة')
            .setEmoji('<:r_:1221893032031551568>')
            .setStyle('SUCCESS');

        const cancelButton = new MessageButton()
            .setCustomId('cancelPurchase')
            .setLabel('إلغاء')
            .setEmoji('✖️')
            .setStyle('DANGER');

        await interaction.reply({
            embeds: [confirmationEmbed],
            components: [
                new MessageActionRow().addComponents(confirmButton, cancelButton)
            ],
            ephemeral: true
        });

        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'confirmPurchase') {
                collector.stop();
                const resulting = Math.floor(price * (20) / (19) + (1));

                const transferMessage = `\`\`\`c ${transferto} ${resulting}\`\`\``;

                await interaction.reply({ content: transferMessage, ephemeral: true });

                console.log('Waiting for payment confirmation...');

                const filter = (response) =>
                    response.author.id === probotid &&
                    response.content.includes(
                        `:moneybag: | ${interaction.user.username}, has transferred \`$${price}\` to <@!${transferto}> **`
                    );

                const paymentCollector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
                paymentCollector.on('collect', async () => {
                    console.log('Payment confirmation received.');
                    restartSlashJS();
                    try {
                        let accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
                        if (!Array.isArray(accounts)) {
                            console.error("Data in accounts.json is not an array. Resetting accounts to an empty array.");
                            accounts = [];
                        }
                        accounts.push({ botToken });
                        fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2));
                    
                        await interaction.followUp({ content: '**☑️ |   .لقد تمتم عملية الشراء بنجاح**', ephemeral: false });

                        const doneEmbed = new MessageEmbed()
                            .setTitle('عملية شراء')
                            .setDescription(`☑️ ${interaction.user.username} تمت عملية شراء شارة مطور بنجاح من قبل `)
                            .setColor('#00ff00');
                        const doneroomChannel = await client.channels.fetch(doneroom);
                        await doneroomChannel.send({ embeds: [doneEmbed] });

                        const logEmbed = new MessageEmbed()
                            .setDescription(`تم تسجيل عملية الشراء لشارة المطور الناشط بنجاح. المشتري: ${interaction.user.username}, المبلغ: $${price}`)
                            .setColor('#0033ff');
                        const logRoomChannel = await client.channels.fetch(logroom);
                        await logRoomChannel.send({ embeds: [logEmbed] });

                    } catch (error) {
                        console.error("Error reading or writing accounts.json:", error);
                        await interaction.followUp({ content: 'حصل خطأ', ephemeral: true });
                    }
                });

                paymentCollector.on('end', async (collected, reason) => {
                    if (reason === 'time') {
                        console.log('No payment confirmation received within the time limit.');
                        await interaction.followUp({ content: '**لقد نفذ الوقت قم بمحاولة اخرى :timer:**', ephemeral: true });
                    }
                });

            } else if (interaction.customId === 'cancelPurchase') {
                collector.stop();
                await interaction.channel.delete();
            }
            });
    }
});



client.on('messageCreate', async message => {
    if (message.content === '-setup') {
        const embed = new MessageEmbed()
            .setTitle('** شـراء شـارة | Buy Dadge **')
            .setDescription('تـكـت لـي شـراء شـارة مـبـرمـج')
            .setColor('#0033ff');

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('open_ticket')
                    .setLabel('شـراء شـارة')
                
.setEmoji('<:developers:1266530544884383885>')          
                    .setStyle('PRIMARY')
            );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        await interaction.deferReply({ ephemeral: true });

        const ticketChannel = await interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
            type: 'GUILD_TEXT',
            parent: ticketCategoryID,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL'],
                },
            ],
        });

        const embed = new MessageEmbed()
            .setTitle('** تـم فـتـح تـذكـرة**')
            .setDescription(`تم فتح تذكرة. ${ticketChannel}`)
            .setColor('#0033ff');

        await interaction.editReply({ embeds: [embed], ephemeral: true }); // هنا يتم تعيين الرسالة لتكون خفية

        const closeButton = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('close_ticket')
                    .setLabel('قـفـل')
                
.setEmoji('<:delete:1266543269878300742>')               
                    .setStyle('DANGER')
            );

        await ticketChannel.send({
            content: `${interaction.user}`,
            components: [closeButton]
        });
    } else if (interaction.customId === 'close_ticket') {
        await interaction.channel.delete();
    }
});


client.login("MTMwOTE4NDY2NTU3OTU1Njk2NA.Gkf4aG.MO0Y1bV_A-FQdMjBWn2mZvAlF7aiS3KfHbqgq8");
