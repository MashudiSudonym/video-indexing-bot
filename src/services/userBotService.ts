import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import { BigInteger } from 'big-integer';
import videoService from '../services/videoService';

class UserBotService {
  private client: TelegramClient;
  private stringSession: StringSession;

  constructor() {
    // String session untuk menyimpan session login
    this.stringSession = new StringSession('');
    this.client = new TelegramClient(
      this.stringSession,
      parseInt(process.env.USER_BOT_API_ID || '0'),
      process.env.USER_BOT_API_HASH || '',
      { connectionRetries: 5 }
    );
  }

  // Inisialisasi dan login User Bot
  async initialize(): Promise<void> {
    console.log('Starting User Bot for video indexing...');

    // Untuk input, kita akan menggunakan readline dari node.js
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(query, (answer: string) => {
          resolve(answer);
        });
      });
    };

    await this.client.start({
      phoneNumber: async () => await question('Please enter your number: '),
      password: async () => await question('Please enter your password: '),
      phoneCode: async () => await question('Please enter the code you received: '),
      onError: (err) => console.log(err),
    });

    rl.close();
    console.log('User Bot authenticated successfully');
    console.log('Session string:', this.stringSession.save());
  }

  // Index video lama dari grup/channel tertentu
  async indexOldVideosFromGroup(groupId: number, limit: number = 0): Promise<void> {
    try {
      console.log(`Starting to index old videos from group/channel ${groupId}`);
      
      let offsetId = 0;
      let totalIndexed = 0;
      let processedMessages = 0;
      
      // Coba dapatkan entity untuk group/channel
      let peer;
      try {
        const entity = await this.client.getEntity(groupId);
        peer = await this.client.getInputEntity(entity);
        console.log(`Successfully got peer for group ${groupId}`);
      } catch (entityError) {
        console.log(`Could not get entity directly, trying alternative methods: ${entityError}`);
        
        // Fallback: coba dengan pendekatan berbeda berdasarkan tanda ID
        if (groupId < 0) {
          // Untuk supergroup, ID biasanya negatif besar
          if (groupId < -1000000000000) {
            // Channel/SuperGroup
            const channelId = Math.abs(groupId) - 1000000000000;
            peer = new Api.InputPeerChannel({ 
              channelId: BigInt(channelId) as unknown as BigInteger,
              accessHash: BigInt(0) as unknown as BigInteger
            });
          } else {
            // Chat biasa
            peer = new Api.InputPeerChat({ 
              chatId: BigInt(Math.abs(groupId)) as unknown as BigInteger 
            });
          }
        } else {
          // Untuk ID positif, biasanya channel
          peer = new Api.InputPeerChannel({ 
            channelId: BigInt(groupId) as unknown as BigInteger,
            accessHash: BigInt(0) as unknown as BigInteger
          });
        }
      }
      
      while (true) {
        // Dapatkan riwayat pesan dari grup/channel
        const messages = await this.client.getMessages(
          peer,
          {
            limit: 100, // Proses 100 pesan per batch
            offsetId: offsetId,
            reverse: false, // Dari yang terbaru ke terlama
          }
        );

        if (messages.length === 0) {
          console.log('No more messages to process');
          break;
        }

        console.log(`Processing batch of ${messages.length} messages`);

        // Proses setiap pesan
        for (const message of messages) {
          processedMessages++;
          
          // Cek apakah pesan mengandung video
          if (message.media && message.media instanceof Api.MessageMediaDocument) {
            const document = message.media.document;
            
            if (document instanceof Api.Document) {
              // Cek apakah dokumen adalah video
              const mimeType = document.mimeType;
              if (mimeType && mimeType.startsWith('video/')) {
                // Ekstrak informasi video
                const videoAttributes = document.attributes.find(
                  attr => attr instanceof Api.DocumentAttributeVideo
                ) as Api.DocumentAttributeVideo | undefined;
                
                const fileNameAttribute = document.attributes.find(
                  attr => attr instanceof Api.DocumentAttributeFilename
                ) as Api.DocumentAttributeFilename | undefined;
                
                if (videoAttributes) {
                  try {
                    // Simpan ke database
                    await videoService.saveVideo({
                      file_id: document.id.toString(),
                      file_name: fileNameAttribute?.fileName || `video_${document.id.toString()}`,
                      duration: videoAttributes.duration,
                      mime_type: mimeType,
                      file_size: document.size?.toString() ? parseInt(document.size.toString()) : 0,
                      message_id: message.id,
                      chat_id: groupId,
                      date: new Date(message.date * 1000),
                    });
                    
                    totalIndexed++;
                    console.log(`Indexed video: ${fileNameAttribute?.fileName || 'Unnamed'} (${videoAttributes.duration}s)`);
                  } catch (error) {
                    console.error(`Error indexing video ${document.id.toString()}:`, error);
                  }
                }
              }
            }
          }
          
          // Update offsetId untuk batch berikutnya
          offsetId = message.id;
        }
        
        console.log(`Processed ${processedMessages} messages, indexed ${totalIndexed} videos`);
        
        // Batas maksimal jika diperlukan
        if (limit && totalIndexed >= limit) {
          console.log(`Reached limit of ${limit} videos`);
          break;
        }
        
        // Jeda kecil untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`Finished indexing. Total videos indexed: ${totalIndexed}`);
    } catch (error) {
      console.error('Error indexing old videos:', error);
    }
  }

  // Index video lama dengan session string yang sudah tersimpan
  async initializeWithSession(sessionString: string): Promise<void> {
    this.stringSession = new StringSession(sessionString);
    this.client = new TelegramClient(
      this.stringSession,
      parseInt(process.env.USER_BOT_API_ID || '0'),
      process.env.USER_BOT_API_HASH || '',
      { connectionRetries: 5 }
    );
    
    await this.client.connect();
    console.log('User Bot authenticated with saved session');
  }

  // Dapatkan informasi grup/channel
  async getGroups(): Promise<any[]> {
    const dialogs = await this.client.getDialogs();
    const groups = [];
    
    for (const dialog of dialogs) {
      // Channel/Supergroup
      if (dialog.entity instanceof Api.Channel) {
        // Hanya sertakan channel/grup yang bisa diakses
        if (!(dialog.entity as any).left) { // Jika bukan channel yang sudah keluar
          // Format ID yang benar untuk supergroup/channel
          let id;
          const entityId = parseInt(dialog.entity.id.toString());
          if (dialog.entity.megagroup) {
            // Supergroup
            id = -(entityId + 1000000000000);
          } else {
            // Channel
            id = -(entityId + 1000000000000);
          }
          
          groups.push({
            id: id.toString(),
            title: dialog.entity.title || 'Unknown Channel',
            type: dialog.entity.megagroup ? 'Supergroup' : 'Channel'
          });
        }
      }
      // Chat biasa
      else if (dialog.entity instanceof Api.Chat) {
        // Hanya sertakan chat yang aktif
        if (!(dialog.entity as any).left && !(dialog.entity as any).kicked) {
          const entityId = parseInt(dialog.entity.id.toString());
          groups.push({
            id: (-entityId).toString(),
            title: dialog.entity.title || 'Unknown Chat',
            type: 'Chat'
          });
        }
      }
    }
    
    return groups;
  }
}

export default UserBotService;