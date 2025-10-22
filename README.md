# 🤖 WhatsApp AI Bot

Bot automatizado de WhatsApp que utiliza inteligencia artificial (OpenAI GPT-3.5) para responder mensajes automáticamente.

## ✨ Características

- 🤖 **Respuestas inteligentes** usando OpenAI GPT-3.5
- 📱 **Integración con WhatsApp Web** via whatsapp-web.js
- 🎯 **Filtros inteligentes** para determinar qué mensajes responder
- ⚙️ **Altamente configurable** con múltiples opciones
- 🛡️ **Control de acceso** con números permitidos/bloqueados
- 📊 **Comandos especiales** para administración
- 🔄 **Respuestas automáticas** o activadas por palabras clave

## 🚀 Instalación

### Prerrequisitos

- Node.js 16 o superior
- Cuenta de OpenAI con API key
- WhatsApp Web activo en tu teléfono

### Pasos de instalación

1. **Clona o descarga el proyecto**
   ```bash
   git clone <tu-repo>
   cd whatsapp-ai-bot
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   ```bash
   # Copia el archivo de ejemplo
   copy .env.example .env
   
   # Edita .env y agrega tu API key de OpenAI
   OPENAI_API_KEY=tu_api_key_aqui
   ```

4. **Obtén tu API Key de OpenAI**
   - Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
   - Crea una nueva API key
   - Cópiala al archivo `.env`

## 🎮 Uso

### Iniciar el bot

```bash
npm start
```

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Primera conexión

1. Ejecuta el bot
2. Escanea el código QR que aparece en la terminal con WhatsApp
3. ¡El bot estará listo para responder mensajes!

## ⚙️ Configuración

Edita el archivo `src/config.js` para personalizar el comportamiento:

### Configuración básica

```javascript
bot: {
    // Responder en grupos (false = solo chats privados)
    respondToGroups: false,
    
    // Responder automáticamente a todos los mensajes
    autoRespond: false,
    
    // Solo responder si contiene palabras clave
    useKeywordTrigger: true,
    
    // Palabras que activan respuesta automática
    triggerWords: ['bot', 'ayuda', 'help', 'info'],
    
    // Delay entre respuestas (milisegundos)
    responseDelay: 2000,
}
```

### Control de acceso

```javascript
// Solo estos números pueden usar el bot (vacío = todos)
allowedNumbers: ['521234567890'],

// Números bloqueados
blockedNumbers: ['521111111111'],
```

## 🎯 Comandos del bot

El bot responde a comandos especiales con el prefijo `!`:

- `!help` - Muestra ayuda
- `!status` - Estado del bot
- `!info` - Información del bot

## 🔧 Personalización

### Modificar prompts de IA

Edita `src/utils/openai.js` para cambiar cómo responde la IA:

```javascript
const systemPrompt = `Eres un asistente virtual amigable...`;
```

### Cambiar modelo de IA

En `src/config.js`:

```javascript
openai: {
    model: 'gpt-4', // Cambia a gpt-4 si tienes acceso
    maxTokens: 150,
    temperature: 0.7,
}
```

## 📁 Estructura del proyecto

```
ROBOT/
├── src/
│   ├── bot.js          # Lógica principal del bot
│   ├── config.js       # Configuración
│   └── utils/
│       └── openai.js   # Integración OpenAI
├── .env                # Variables de entorno
├── .env.example        # Ejemplo de configuración
├── package.json        # Dependencias
└── README.md          # Esta documentación
```

## 🛠️ Solución de problemas

### El bot no responde
- ✅ Verifica que el API key de OpenAI esté configurado
- ✅ Revisa la configuración en `src/config.js`
- ✅ Asegúrate de que las palabras clave estén en el mensaje

### Error de autenticación de WhatsApp
- 🔄 Elimina la carpeta `.wwebjs_auth` y reconecta
- 📱 Asegúrate de que WhatsApp Web esté activo en tu teléfono

### El código QR no aparece
- 🖥️ Asegúrate de ejecutar el bot en una terminal que soporte QR
- 🔄 Reinicia el bot

## 💡 Consejos de uso

1. **Configura filtros apropiados** para evitar spam
2. **Usa palabras clave** para controlar cuándo responde
3. **Ajusta el delay** para respuestas más naturales
4. **Monitorea los logs** para ver la actividad del bot
5. **Prueba en un chat personal** antes de usar en grupos

## 🔐 Seguridad

- ⚠️ **Nunca compartas tu API key de OpenAI**
- 🛡️ **Usa listas de números permitidos** en entornos de producción
- 📝 **Revisa los logs** regularmente
- 🔒 **Mantén el archivo `.env` privado**

## 📋 Dependencias principales

- `whatsapp-web.js` - Integración con WhatsApp Web
- `openai` - API de OpenAI
- `dotenv` - Variables de entorno
- `qrcode-terminal` - Mostrar QR en terminal

## 🆘 Soporte

Si tienes problemas:

1. 📖 Revisa esta documentación
2. 🔍 Verifica los logs de error
3. ✅ Confirma que todas las dependencias estén instaladas
4. 🔧 Revisa la configuración en `src/config.js`

## 📄 Licencia

MIT - Puedes usar este código libremente para proyectos personales y comerciales.

---

**⚡ ¡Disfruta tu bot de WhatsApp con IA!** 🚀