import * as Baileys from 'baileys';

export async function SerializeMessage(fuqi, msg) {
    if (!msg || !msg.message) return null;
    
    let m = Baileys.extractMessageContent(msg.message);
    let ctx = {};
    
    ctx.id = Baileys.jidNormalizedUser(msg.key.remoteJid);
    ctx.group = ctx.id.endsWith("@g.us");
    ctx.sender = Baileys.jidNormalizedUser(ctx.group ? (msg.key.participantAlt || msg.participantAlt) : msg.key.remoteJidAlt);
    ctx.pushname = msg.pushName || null;
    ctx.fromMe = msg.key.fromMe;
    ctx.msgType = Baileys.getContentType(m || msg.message);
    ctx.timestamp = msg.messageTimestamp ? parseInt(msg.messageTimestamp) * 1000 : Date.now();
    
    let deviceId = msg.key?.id || '';
    ctx.device = deviceId.startsWith('3EB0') ? 'Web' : deviceId.includes('BAE5') ? 'Android' : deviceId.includes('BAE4') ? 'iOS' : 'Unknown';
    ctx.isBaileys = deviceId.length === 16 || (deviceId.startsWith('3EB0' || deviceId.startsWith('BAE5')) && deviceId.length === 22);
    ctx.isBot = ctx.isBaileys && !ctx.fromMe;
    
    ctx.text = m?.conversation ||
        m?.extendedTextMessage?.text ||
        m?.imageMessage?.caption ||
        m?.videoMessage?.caption ||
        m?.documentMessage?.caption ||
        m?.buttonsResponseMessage?.selectedDisplayText ||
        m?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        m?.templateButtonReplyMessage?.selectedDisplayText ||
        m?.pollCreationMessage?.name ||
        "";
        
    if (ctx.msgType === 'interactiveResponseMessage' && m?.interactiveResponseMessage?.nativeFlowResponseMessage) {
        try {
            let parsed = JSON.parse(m.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);
            ctx.text = parsed?.id || parsed?.response || '';
        } catch {
            ctx.text = '';
        }
    }
    
    let contextInfo = m?.extendedTextMessage?.contextInfo ||
        m?.imageMessage?.contextInfo ||
        m?.videoMessage?.contextInfo ||
        m?.documentMessage?.contextInfo;
    
    ctx.mentionedJid = (contextInfo?.mentionedJid || [])
        .map(jid => Baileys.jidNormalizedUser(jid))
        .filter(Boolean);
    
    ctx.quoted = contextInfo?.quotedMessage || null;
    
    let mediaContent = m[ctx.msgType];
    ctx.mimetype = mediaContent?.mimetype || null;
    ctx.isMedia = /image|video|sticker|audio|document/.test(ctx.mimetype || '');
    ctx.mediaType = ctx.isMedia ? ctx.msgType?.replace('Message', '').toLowerCase() : null;
    ctx.fileName = mediaContent?.fileName || null;
    ctx.fileSize = mediaContent?.fileLength || null;
    ctx.isViewOnce = mediaContent?.viewOnce || false;
    
    let text = ctx.text.trim();
    let prefixes = ['!', '.', '#', '/', '-', '$', '%', '^', '&', '*', '+', '='];
    ctx.prefix = prefixes.find(p => text.startsWith(p)) || null;
    
    if (ctx.prefix) {
        let withoutPrefix = text.slice(ctx.prefix.length).trim();
        let parts = withoutPrefix.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map(p => p.replace(/^["']|["']$/g, '')) || [];
        
        ctx.cmd = parts[0]?.toLowerCase() || null;
        ctx.args = parts.slice(1);
        ctx.query = ctx.args.join(' ');
    } else {
        ctx.cmd = null;
        ctx.args = [];
        ctx.query = '';
    }
    
    ctx.reply = (text, options = {}) => 
        fuqi.sendMessage(ctx.id, { text, ...options }, { quoted: msg })
            .catch(e => { throw new Error('Reply failed: ' + e.message); });
    
    ctx.react = (emoji) => 
        fuqi.sendMessage(ctx.id, { react: { text: emoji, key: msg.key } })
            .catch(e => { throw new Error('React failed: ' + e.message); });
    
    ctx.delete = () => 
        fuqi.sendMessage(ctx.id, { delete: msg.key })
            .catch(e => { throw new Error('Delete failed: ' + e.message); });
    
    ctx.edit = (text, options = {}) => 
        fuqi.sendMessage(ctx.id, { text, edit: msg.key, ...options })
            .catch(e => { throw new Error('Edit failed: ' + e.message); });
    
    ctx.forward = (jid, options = {}) => 
        fuqi.sendMessage(jid, { forward: msg, ...options })
            .catch(e => { throw new Error('Forward failed: ' + e.message); });
    
    if (ctx.isMedia && mediaContent?.url) {
        let mediaType = ctx.mediaType;
        let downloadMedia = async () => {
            let stream = await Baileys.downloadContentFromMessage(mediaContent, mediaType);
            let chunks = [];
            for await (let chunk of stream) chunks.push(chunk);
            return Buffer.concat(chunks);
        };
        
        ctx.download = (saveToFile = false) => 
            downloadMedia().then(buffer => {
                if (!saveToFile) return buffer;
                return import('fs/promises').then(fs => 
                    import('path').then(path => {
                        let filename = `${Date.now()}_${ctx.id}.${mediaType}`;
                        let filepath = path.join(process.cwd(), 'downloads', filename);
                        return fs.writeFile(filepath, buffer).then(() => filepath);
                    })
                );
            }).catch(e => { throw new Error('Download failed: ' + e.message); });
    }
    
    ctx.getName = () => 
        Promise.resolve(ctx.pushname || fuqi.getContact?.(ctx.sender)
            .then(c => c?.name || c?.notify || ctx.sender.split('@')[0])
            .catch(() => ctx.sender?.split('@')[0] || 'Unknown'));
    
    return ctx;
}