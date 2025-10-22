const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAIService = require('./utils/openai');
const config = require('./config');
require('dotenv').config();

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
        });

        this.openaiService = new OpenAIService();
        this.isReady = false;

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Mostrar QR para conectar
        this.client.on('qr', (qr) => {
            console.log('📱 Escanea el código QR con WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Cliente listo
        this.client.on('ready', () => {
            console.log('✅ Bot de WhatsApp conectado y listo!');
            this.isReady = true;
        });

        // Manejar mensajes entrantes
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Manejar desconexión
        this.client.on('disconnected', (reason) => {
            console.log('❌ Cliente desconectado:', reason);
            this.isReady = false;
        });

        // Manejar errores
        this.client.on('auth_failure', (message) => {
            console.error('❌ Error de autenticación:', message);
        });
    }

    async handleMessage(message) {
        try {
            // Ignorar mensajes propios
            if (message.fromMe) return;

            // Ignorar mensajes de estado
            if (message.isStatus) return;

            // Obtener información del chat
            const chat = await message.getChat();
            const contact = await message.getContact();

            console.log(`📨 Mensaje recibido de ${contact.name || contact.number}: ${message.body}`);

            // Verificar si es un grupo y si está configurado para responder
            if (chat.isGroup && !config.bot.respondToGroups) {
                console.log('⏭️ Ignorando mensaje de grupo (configuración)');
                return;
            }

            // Verificar números permitidos
            if (config.bot.allowedNumbers.length > 0) {
                const senderNumber = contact.number;
                if (!config.bot.allowedNumbers.includes(senderNumber)) {
                    console.log('⏭️ Número no autorizado:', senderNumber);
                    return;
                }
            }

            // Verificar números bloqueados
            if (config.bot.blockedNumbers.includes(contact.number)) {
                console.log('⏭️ Número bloqueado:', contact.number);
                return;
            }

            // Manejar comandos especiales
            if (message.body.startsWith(config.bot.commandPrefix)) {
                await this.handleCommand(message, chat, contact);
                return;
            }

            // Verificar si hay mensaje automático por horario
            const timeMessage = this.getTimeBasedMessage(contact.name);
            if (timeMessage) {
                await this.sendDirectMessage(message, chat, timeMessage);
                return;
            }

            // Decidir si responder automáticamente
            const shouldRespond = await this.shouldRespondToMessage(message.body, contact);

            if (shouldRespond) {
                await this.sendAIResponse(message, chat, contact);
            } else {
                console.log('⏭️ Mensaje no requiere respuesta automática');
            }
        } catch (error) {
            console.error('❌ Error al procesar mensaje:', error);
        }
    }

    async shouldRespondToMessage(messageBody, contact) {
        const message = messageBody.toLowerCase();

        // RESPONDER SIEMPRE A CONTACTOS VIP (como tu esposa)
        if (config.bot.vipContacts.includes(contact.name)) {
            console.log(`💕 Mensaje de contacto VIP (${contact.name}) - Respondiendo automáticamente`);
            return true;
        }

        // Si auto-respuesta está habilitada, siempre responder
        if (config.bot.autoRespond) {
            return true;
        }

        // Si usa trigger por palabras clave
        if (config.bot.useKeywordTrigger) {
            const hasKeyword = config.bot.triggerWords.some(word =>
                message.includes(word.toLowerCase())
            );

            if (hasKeyword) {
                return true;
            }
        }

        // Usar OpenAI para determinar si necesita respuesta
        return await this.openaiService.isQuestionOrNeedsResponse(messageBody);
    } async sendAIResponse(message, chat, contact) {
        try {
            console.log('🤖 Generando respuesta con IA...');

            // Mostrar que está escribiendo
            await chat.sendStateTyping();

            // Generar respuesta con configuración personalizada
            const response = await this.openaiService.generateResponse(
                message.body,
                contact.name || contact.number,
                chat.isGroup ? `Grupo: ${chat.name}` : 'Chat privado',
                config
            );

            // Delay antes de responder (más natural)
            await this.delay(config.bot.responseDelay);

            // Enviar respuesta
            await message.reply(response);

            console.log(`✅ Respuesta enviada: ${response}`);

        } catch (error) {
            console.error('❌ Error al enviar respuesta:', error);
            await message.reply('Lo siento, hubo un error al procesar tu mensaje.');
        }
    }

    async handleCommand(message, chat, contact) {
        const command = message.body.slice(1).toLowerCase(); // Remover prefijo

        switch (command) {
            case 'help':
            case 'ayuda':
                await message.reply(`🤖 *Comandos disponibles:*\n\n${config.bot.commandPrefix}help - Mostrar esta ayuda\n${config.bot.commandPrefix}status - Estado del bot\n${config.bot.commandPrefix}info - Información del bot`);
                break;

            case 'status':
                await message.reply(`🤖 *Estado del Bot:*\n\n✅ Conectado y funcionando\n🔋 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configurado' : 'No configurado'}`);
                break;

            case 'info':
                await message.reply(`🤖 *WhatsApp AI Bot*\n\nBot automatizado con inteligencia artificial\nPowered by OpenAI GPT-3.5\n\nPara más información, escribe: ${config.bot.commandPrefix}help`);
                break;

            default:
                await message.reply(`❌ Comando no reconocido: ${command}\n\nEscribe ${config.bot.commandPrefix}help para ver comandos disponibles.`);
        }
    }

    getTimeBasedMessage(contactName) {
        // Solo para contactos VIP
        if (!config.bot.vipContacts.includes(contactName)) {
            return null;
        }

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (config.bot.timeBasedMessages && config.bot.timeBasedMessages[currentTime]) {
            console.log(`⏰ Mensaje automático de las ${currentTime} para ${contactName}`);
            return config.bot.timeBasedMessages[currentTime];
        }

        return null;
    }

    async sendDirectMessage(message, chat, directMessage) {
        try {
            console.log('📅 Enviando mensaje automático por horario...');

            // Mostrar que está escribiendo
            await chat.sendStateTyping();

            // Delay antes de responder
            await this.delay(config.bot.responseDelay);

            // Enviar mensaje directo
            await message.reply(directMessage);

            console.log(`✅ Mensaje automático enviado: ${directMessage}`);

        } catch (error) {
            console.error('❌ Error al enviar mensaje automático:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async start() {
        console.log('🚀 Iniciando WhatsApp Bot...');

        // Verificar configuración
        if (!process.env.OPENAI_API_KEY) {
            console.error('❌ OPENAI_API_KEY no está configurada en el archivo .env');
            process.exit(1);
        }

        try {
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Error al inicializar el cliente:', error);
            process.exit(1);
        }
    }

    async stop() {
        console.log('🛑 Deteniendo bot...');
        await this.client.destroy();
    }
}

// Crear e iniciar el bot
const bot = new WhatsAppBot();

// Manejar cierre del proceso
process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal de interrupción...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal de terminación...');
    await bot.stop();
    process.exit(0);
});

// Iniciar el bot
bot.start().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});

module.exports = WhatsAppBot;