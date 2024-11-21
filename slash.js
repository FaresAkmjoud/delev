const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

// Function to delete all existing slash commands
async function deleteCommands(client, token) {
    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started deleting existing application (/) commands for token:', token);
        await rest.delete(
            Routes.applicationCommands(client.user.id)
        );
        console.log('Successfully deleted existing application (/) commands for token:', token);
    } catch (error) {
        console.error('Failed to delete existing commands for token:', token, error);
    }
}

// Function to register slash commands
async function registerCommands(client, token) {
    const commands = [
        {
            name: 'get-badge',
            description: 'to get active developer badge'
        },
    ];

    const rest = new REST({ version: '9' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands for token:', token);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands for token:', token);
    } catch (error) {
        console.error('Failed to refresh commands for token:', token, error);
    }
}

// Function to handle interactions
function handleInteractions(client) {
    const processedInteractions = new Set();

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand() || processedInteractions.has(interaction.id)) return;

        processedInteractions.add(interaction.id);

        if (interaction.commandName === 'get-badge') {
            try {
                await interaction.reply({ content: '**تـم. الرجاء قم بالإنتظار مدة 24 ساعه ثم قم بزيارة هذا الموقع و مبروك عليك الشارة https://discord.com/developers/active-developer**', ephemeral: true });
            } catch (error) {
                console.error('Failed to reply to interaction:', error);
            }
        }
    });
}

// Function to restart slash.js file
function restartSlashJS() {
    const exec = require('child_process').exec;
    exec('node slash.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting slash.js: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr while restarting slash.js: ${stderr}`);
            return;
        }
        console.log(`Restarted slash.js: ${stdout}`);
    });
}

// Read tokens from accounts.json
try {
    let accountsData = fs.readFileSync('accounts.json');
    let accounts = JSON.parse(accountsData);

    // Create a client for each token and register commands
    for (let i = 0; i < accounts.length; i++) {
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
        const token = accounts[i].botToken;

        client.once('ready', async () => {
            console.log(`Bot started with name ${client.user.tag}.`);
            await deleteCommands(client, token); // Delete existing commands

            try {
                await registerCommands(client, token); // Register new commands
                handleInteractions(client);
            } catch (error) {
                console.error(`Error registering commands for token ${token}:`, error);
            }
        });

        client.login(token).catch(error => {
            console.error(`Error logging in with token ${token}:`, error);
            accounts.splice(i, 1); // Remove the invalid token from accounts
            fs.writeFileSync('accounts.json', JSON.stringify(accounts, null, 2)); // Update accounts.json
            restartSlashJS(); // Restart slash.js
        });
    }
} catch (error) {
    console.error('Error reading accounts.json:', error);
}
