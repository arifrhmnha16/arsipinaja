import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { TelegramVerificationCode, TaskItem } from '../../types';
import { AuthService } from '../auth/authService';

const BOT_USERNAME = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'ArsipinAjaBot').replace('@', '');
const BOT_TOKEN = (import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '').trim();

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export interface DetectedTelegramUser {
  chatId: string;
  firstName: string;
  username?: string;
  text?: string;
  date: number;
}

export class TelegramService {
  static getBotUsername(): string {
    return BOT_USERNAME;
  }

  static getBotUrl(): string {
    return `https://t.me/${BOT_USERNAME}`;
  }

  /**
   * Fetch recent messages sent to the bot from getUpdates
   * Enables 1-click automatic Chat ID detection without needing complex webhooks
   */
  static async detectRecentChatFromBot(): Promise<{
    success: boolean;
    data?: DetectedTelegramUser;
    message: string;
  }> {
    if (!BOT_TOKEN) {
      return { success: false, message: 'Token Telegram Bot belum dikonfigurasi di .env.' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-10&limit=10`);
      const json = await res.json();

      if (!json.ok) {
        return {
          success: false,
          message: `Telegram API: ${json.description || 'Gagal membaca pembaruan bot.'}`,
        };
      }

      const updates = json.result || [];
      if (updates.length === 0) {
        return {
          success: false,
          message:
            'Belum ada pesan yang masuk ke bot. Silakan buka @' +
            BOT_USERNAME +
            ' di Telegram, lalu ketik /start atau kirim pesan apa saja.',
        };
      }

      // Find the latest message that has a chat ID
      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const msg = u.message || u.edited_message || u.channel_post;
        if (msg && msg.chat && msg.chat.id) {
          return {
            success: true,
            data: {
              chatId: String(msg.chat.id),
              firstName: msg.from?.first_name || msg.chat.first_name || 'Partner',
              username: msg.from?.username || msg.chat.username,
              text: msg.text,
              date: msg.date,
            },
            message: 'Akun Telegram berhasil terdeteksi!',
          };
        }
      }

      return {
        success: false,
        message: 'Tidak ditemukan pesan dengan Chat ID valid pada riwayat bot.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message || 'Tidak dapat menghubungi Telegram API'}`,
      };
    }
  }

  /**
   * Connect and verify a real Telegram Chat ID
   */
  static async connectRealTelegram(
    userId: string,
    chatId: string,
    username?: string
  ): Promise<{ success: boolean; message: string }> {
    const cleanChatId = chatId.trim();

    if (!cleanChatId || isNaN(Number(cleanChatId))) {
      return {
        success: false,
        message: 'Chat ID harus berupa angka unik Telegram Anda (misal: 123456789).',
      };
    }

    // Try sending a test welcome notification to confirm the Chat ID actually works
    const welcomeHtml = [
      `🎉 <b>Koneksi Berhasil!</b>`,
      ``,
      `Akun Telegram kamu berhasil terhubung dengan <b>ArsipinAja — Ruang Arsip Kuliah &amp; Tugas Berdua</b>.`,
      ``,
      `🔔 <i>Notifikasi deadline tugas kuliah kita akan dikirimkan otomatis ke sini.</i>`,
    ].join('\n');

    const sendRes = await this.sendRawMessage(cleanChatId, welcomeHtml);
    if (!sendRes.success) {
      return sendRes;
    }

    // Save to Firestore
    try {
      await AuthService.updateProfile(userId, {
        telegramChatId: cleanChatId,
        telegramUsername: username || null,
        telegramConnectedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Telegram berhasil terhubung! Pesan konfirmasi telah dikirim ke Telegram Anda.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menyimpan ke profil: ${err.message}`,
      };
    }
  }

  /**
   * Disconnect Telegram
   */
  static async disconnectTelegram(userId: string): Promise<void> {
    await AuthService.updateProfile(userId, {
      telegramChatId: null,
      telegramUsername: null,
      telegramConnectedAt: null,
    });
  }

  /**
   * Send a raw message using HTML mode
   */
  static async sendRawMessage(
    chatId: string,
    htmlText: string
  ): Promise<{ success: boolean; message: string }> {
    if (!BOT_TOKEN) {
      return {
        success: false,
        message: 'Token Bot Telegram tidak ditemukan di file .env (VITE_TELEGRAM_BOT_TOKEN).',
      };
    }

    if (!chatId || chatId.startsWith('tg_')) {
      return {
        success: false,
        message: `Chat ID tidak valid (${chatId}). Silakan hubungkan ulang akun Telegram Anda di Pengaturan.`,
      };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlText,
          parse_mode: 'HTML',
        }),
      });

      const data = await res.json();

      if (data.ok) {
        return {
          success: true,
          message: 'Notifikasi berhasil dikirim langsung ke Telegram Anda!',
        };
      }

      let errorExplanation = data.description || 'Gagal mengirim pesan';
      if (errorExplanation.includes('chat not found')) {
        errorExplanation =
          'Chat ID tidak ditemukan. Pastikan Anda sudah membuka https://t.me/' +
          BOT_USERNAME +
          ' lalu klik START sebelum mengirim pesan.';
      } else if (errorExplanation.includes('bot was blocked')) {
        errorExplanation =
          'Bot diblokir oleh akun Telegram Anda. Silakan unblock @' + BOT_USERNAME + ' di Telegram.';
      }

      return {
        success: false,
        message: `Telegram API: ${errorExplanation}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengirim ke Telegram: ${err.message || 'Koneksi error'}`,
      };
    }
  }

  /**
   * Format friendly couple task reminder
   */
  static formatReminderHtml(task: TaskItem): string {
    return [
      `🔔 <b>[ARSIPINAJA — PENGINGAT TUGAS KULIAH]</b>`,
      ``,
      `Halo! Jangan sampai tugas kuliah kita terlewat:`,
      ``,
      `📚 <b>Mata Kuliah:</b> ${escapeHtml(task.subject || 'Umum')}`,
      `📝 <b>Judul Tugas:</b> ${escapeHtml(task.title)}`,
      `📅 <b>Deadline:</b> ${escapeHtml(task.deadlineDate)}`,
      `⏰ <b>Jam:</b> ${escapeHtml(task.deadlineTime || '23:59')} WIB`,
      ``,
      `Semangat mengerjakan tugas bareng! 💪`,
      `<i>Pesan otomatis dari ArsipinAja Ruang Berdua</i>`,
    ].join('\n');
  }

  /**
   * Send test reminder for a task
   */
  static async sendTestTelegramReminder(
    chatId: string,
    task: TaskItem
  ): Promise<{ success: boolean; message: string }> {
    const htmlText = this.formatReminderHtml(task);
    return this.sendRawMessage(chatId, htmlText);
  }

  /**
   * Send a general test message to verify connection
   */
  static async sendTestHelloMessage(
    chatId: string,
    userName?: string
  ): Promise<{ success: boolean; message: string }> {
    const htmlText = [
      `👋 <b>Tes Notifikasi Telegram ArsipinAja</b>`,
      ``,
      `Halo ${escapeHtml(userName || 'Partner')}!`,
      `Koneksi bot Telegram dengan aplikasi web ArsipinAja berjalan 100% lancar dan siap mengirimkan pengingat deadline tugas kuliah kita berdua.`,
      ``,
      `⏰ <i>Waktu Pengujian: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`,
    ].join('\n');

    return this.sendRawMessage(chatId, htmlText);
  }

  /**
   * Verification code generator (retained for backward compatibility)
   */
  static async generateVerificationCode(userId: string): Promise<TelegramVerificationCode> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newCodeRecord: TelegramVerificationCode = {
      id: 'tg_' + Math.random().toString(36).substring(2, 9),
      userId,
      code,
      expiresAt,
      isUsed: false,
    };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'telegramVerifications'), newCodeRecord);
        newCodeRecord.id = docRef.id;
      } catch (err) {
        console.error('Error saving telegram verification code to Firestore:', err);
      }
    }

    return newCodeRecord;
  }
}
