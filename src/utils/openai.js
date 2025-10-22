const { OpenAI } = require('openai');

class OpenAIService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateResponse(message, senderName = 'Usuario', context = '', config = null) {
        try {
            // Construir prompt personalizado
            let systemPrompt = `${config?.personality?.role || 'Eres una persona real respondiendo mensajes de WhatsApp'}
            
            INFORMACIÓN SOBRE TI:
            ${config?.personality?.context || ''}
            
            CÓMO DEBES RESPONDER:
            ${config?.personality?.instructions || '- Responde naturalmente'}
            
            ${context ? `\nCONTEXTO DE LA CONVERSACIÓN: ${context}` : ''}
            
            ${config?.personality?.vipContext?.[senderName] ?
                    `\nINFORMACIÓN ESPECÍFICA - CONTACTO VIP (${senderName}):${config.personality.vipContext[senderName]}
                
                REGLAS PARA CONTACTO VIP: 
                - Responde exactamente como ${config?.personality?.name} respondería a su esposa
                - Sé cariñoso, personal y usa apodos
                - Habla como si estuvieras físicamente con ella
                - Puedes hacer referencias familiares y personales` :
                    `\nINFORMACIÓN PARA CONTACTO GENERAL:
                ${config?.personality?.generalInstructions || ''}
                
                REGLAS PARA CONTACTO GENERAL:
                - Responde como ${config?.personality?.name} lo haría con cualquier persona
                - Sé amigable pero no excesivamente personal
                - Mantén un tono profesional pero cercano`}`;

            const completion = await this.openai.chat.completions.create({
                model: config?.openai?.model || "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: config?.openai?.maxTokens || 150,
                temperature: config?.openai?.temperature || 0.7,
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error al generar respuesta con OpenAI:', error);
            return 'Lo siento, no puedo procesar tu mensaje en este momento. ¿Puedes intentarlo de nuevo?';
        }
    }

    async isQuestionOrNeedsResponse(message) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "Determina si el siguiente mensaje requiere una respuesta o es una pregunta. Responde solo 'SI' o 'NO'."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 10,
                temperature: 0.1,
            });

            const response = completion.choices[0].message.content.trim().toLowerCase();
            return response.includes('si') || response.includes('yes');
        } catch (error) {
            console.error('Error al analizar mensaje:', error);
            // En caso de error, asumimos que necesita respuesta
            return true;
        }
    }
}

module.exports = OpenAIService;