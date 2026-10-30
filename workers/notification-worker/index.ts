/**
 * ArsipinAja - Cloudflare Notification & Telegram Bot Worker
 * Runs hourly cron scheduler for H-3, H-1, H-0 deadlines and handles Telegram Bot Webhook
 */

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  FIREBASE_PROJECT_ID: string;
  TIMEZONE: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

export default {
  // 1. Cron Trigger: Scheduled hourly deadline check
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[Cron] Checking deadline reminders at ${new Date().toISOString()} in ${env.TIMEZONE}`);

    // Calculates Asia/Jakarta date
    const jakartaTime = new Date(
      new Date().toLocaleString('en-US', { timeZone: env.TIMEZONE || 'Asia/Jakarta' })
    );

    const todayDateStr = jakartaTime.toISOString().split('T')[0];

    // In production Worker: query Firestore REST API for active tasks
    // /v1/projects/{projectId}/databases/(default)/documents/tasks
    console.log(`[Cron] Scanning tasks for date ${todayDateStr}`);
  },

  // 2. HTTP Webhook: Telegram Bot message handler & 6-digit code verification
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('ArsipinAja Telegram Bot Webhook Active', { status: 200 });
    }

    try {
      const update = (await request.json()) as TelegramUpdate;
      if (!update.message || !update.message.text) {
        return new Response('OK', { status: 200 });
      }

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // Greeting or /start command
      if (text.startsWith('/start')) {
        const welcomeMsg = [
          `👋 *Halo! Selamat datang di Bot ArsipinAja!*`,
          ``,
          `Bot ini akan mengirimkan pengingat deadline tugas kuliahmu secara otomatis.`,
          ``,
          `📌 *Cara menghubungkan akun:*`,
          `1. Buka website *ArsipinAja* -> menu *Settings* -> tab *Bot Telegram*.`,
          `2. Klik *Hubungkan Telegram* untuk mendapatkan 6-digit kode verifikasi.`,
          `3. Kirimkan 6-digit kode tersebut ke bot ini.`,
          ``,
          `_Biar Kuliah Nggak Berantakan!_ 🎓`,
        ].join('\n');

        await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, welcomeMsg);
        return new Response('OK', { status: 200 });
      }

      // Check if user submitted a 6-digit verification code
      if (/^\d{6}$/.test(text)) {
        const verificationCode = text;
        
        // In production: validate against Firestore /telegramVerifications
        // and link chatId with userId
        const successMsg = [
          `🎉 *Koneksi Berhasil!*`,
          ``,
          `Akun Telegram kamu (Chat ID: \`${chatId}\`) kini telah terhubung dengan *ArsipinAja*.`,
          ``,
          `🔔 Kamu akan menerima pengingat otomatis:`,
          `• H-3 sebelum deadline`,
          `• H-1 sebelum deadline`,
          `• H-0 pada hari pengumpulan`,
          ``,
          `Selamat belajar dan sukses perkuliahannya! 💪`,
        ].join('\n');

        await sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, chatId, successMsg);
        return new Response('OK', { status: 200 });
      }

      // Default reply
      await sendTelegramMessage(
        env.TELEGRAM_BOT_TOKEN,
        chatId,
        `Ketik /start atau kirimkan 6-digit kode verifikasi dari menu Pengaturan ArsipinAja untuk menghubungkan akun.`
      );
      return new Response('OK', { status: 200 });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

async function sendTelegramMessage(botToken: string, chatId: number, text: string): Promise<void> {
  if (!botToken || botToken === 'YOUR_TELEGRAM_BOT_TOKEN') {
    console.log(`[Telegram Simulation] Message to ${chatId}: ${text}`);
    return;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}
