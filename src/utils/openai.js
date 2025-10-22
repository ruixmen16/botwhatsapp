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
            let systemPrompt = `Eres ${config?.personality?.name || 'un asistente virtual'} amigable y útil que responde mensajes de WhatsApp.
            
            ${config?.personality?.role || ''}
            
            CONTEXTO SOBRE TI:
            ${config?.personality?.context || ''}
            
            INSTRUCCIONES DE COMPORTAMIENTO:
            ${config?.personality?.instructions || '- Sé conciso y directo\n- Sé amigable y profesional'}
            
            ${context ? `\nCONTEXTO ADICIONAL: ${context}` : ''}
            
            ${config?.personality?.vipContext?.[senderName] ?
                    `\nCONTEXTO ESPECIAL PARA ${senderName}:${config.personality.vipContext[senderName]}
                
                IMPORTANTE: NO uses saludos genéricos como "¡Hola [nombre]! ¿En qué puedo ayudarte?". 
                Responde de manera natural y personalizada según el contexto y mensaje específico que recibiste.
                Usa los apodos cariñosos cuando sea apropiado.` : ''}`; const completion = await this.openai.chat.completions.create({
                        model: config?.openai?.model || "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "system",
                                content: systemPrompt
                            },
                            {
                                role: "user",
                                content: `${senderName} dice: ${message}`
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