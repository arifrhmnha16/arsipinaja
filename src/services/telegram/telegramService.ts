import { TelegramVerificationCode, TaskItem, TaskReminderSettings } from '../../types';
import { AuthService } from '../auth/authService';

const VERIFICATIONS_KEY = 'arsipinaja_tg_verifications';
const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'ArsipinAjaBot';
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';

function getVerifications(): TelegramVerificationCode[] {
  const data = localStorage.getItem(VERIFICATIONS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveVerifications(list: TelegramVerificationCode[]) {
  localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(list));
}

export class TelegramService {
  static getBotUsername(): string {
    return BOT_USERNAME;
  }

  static getBotUrl(): string {
    return `https://t.me/${BOT_USERNAME.replace('@', '')}`;
  }

  static generateVerificationCode(userId: string): TelegramVerificationCode {
    const list = getVerifications();
    // Invalidate previous active codes for this user
    list.forEach((v) => {
      if (v.userId === userId && !v.isUsed) {
        v.isUsed = true;
      }
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    const newCodeRecord: TelegramVerificationCode = {
      id: 'tg_' + Math.random().toString(36).substring(2, 9),
      userId,
      code,
      expiresAt,
      isUsed: false,
    };

    list.push(newCodeRecord);
    saveVerifications(list);
    return newCodeRecord;
  }

  static getActiveCode(userId: string): TelegramVerificationCode | null {
    const list = getVerifications();
    const now = Date.now();
    return (
      list.find(
        (v) => v.userId === userId && !v.isUsed && new Date(v.expiresAt).getTime() > now
      ) || null
    );
  }

  static async verifyCodeAndConnect(userId: string, code: string, simulatedChatId?: string): Promise<boolean> {
    const list = getVerifications();
    const now = Date.now();
    const match = list.find(
      (v) =>
        v.userId === userId &&
        v.code === code.trim() &&
        !v.isUsed &&
        new Date(v.expiresAt).getTime() > now
    );

    if (!match) {
      throw new Error('Kode verifikasi tidak valid atau telah kedaluwarsa (15 menit).');
    }

    match.isUsed = true;
    match.usedAt = new Date().toISOString();
    saveVerifications(list);

    const chatId = simulatedChatId || `tg_${Math.floor(100000000 + Math.random() * 900000000)}`;
    await AuthService.updateProfile(userId, {
      telegramChatId: chatId,
      telegramConnectedAt: new Date().toISOString(),
    });

    return true;
  }

  static async disconnectTelegram(userId: string): Promise<void> {
    await AuthService.updateProfile(userId, {
      telegramChatId: null,
      telegramUsername: null,
      telegramConnectedAt: null,
    });
  }

  static formatReminderMessage(task: TaskItem): string {
    return [
      `🔔 *ARSIPINAJA REMINDER*`,
      ``,
      `Halo! Jangan sampai tugasmu terlewat.`,
      ``,
      `*Mata kuliah:* ${task.subject}`,
      `*Tugas:* ${task.title}`,
      `*Deadline:* ${task.deadlineDate}`,
      `*Jam:* ${task.deadlineTime} WIB`,
      ``,
      `Semangat mengerjakan tugasmu! 💪`,
      `_Pesan otomatis dari ArsipinAja — Biar Kuliah Nggak Berantakan_`
    ].join('\n');
  }

  static async sendTestTelegramReminder(chatId: string, task: TaskItem): Promise<{ success: boolean; message: string }> {
    const text = this.formatReminderMessage(task);

    if (BOT_TOKEN && chatId && !chatId.startsWith('tg_simulated')) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
          }),
        });
        const data = await res.json();
        if (data.ok) {
          return { success: true, message: 'Notifikasi berhasil dikirim langsung ke Telegram Anda!' };
        }
      } catch (err: any) {
        console.warn('Real Telegram API error:', err);
      }
    }

    // Interactive simulated delivery toast
    return {
      success: true,
      message: `[Simulasi Telegram Bot] Notifikasi berhasil dikirimkan ke Chat ID: ${chatId}`,
    };
  }
}
