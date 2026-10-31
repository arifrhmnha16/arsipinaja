import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { TaskItem, TaskPriority, TaskStatus, TaskReminderSettings } from '../../types';

export class TaskService {
  static async getTasks(userId: string): Promise<TaskItem[]> {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const list: TaskItem[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as TaskItem), id: d.id }));
      // Sort by closest deadline in memory
      return list.sort((a, b) => {
        const da = new Date(`${a.deadlineDate}T${a.deadlineTime || '23:59'}`).getTime();
        const dbTime = new Date(`${b.deadlineDate}T${b.deadlineTime || '23:59'}`).getTime();
        return da - dbTime;
      });
    } catch (err) {
      console.error('Error fetching tasks from Firestore:', err);
      return [];
    }
  }

  static async getTaskById(taskId: string): Promise<TaskItem | null> {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'tasks', taskId));
      if (!snap.exists()) return null;
      return { ...(snap.data() as TaskItem), id: snap.id };
    } catch {
      return null;
    }
  }

  static async createTask(params: {
    userId: string;
    title: string;
    description?: string;
    subject: string;
    folderId?: string | null;
    deadlineDate: string;
    deadlineTime: string;
    priority: TaskPriority;
    checklist?: { id: string; title: string; completed: boolean }[];
    attachments?: string[];
    notes?: string;
    reminderSettings?: TaskReminderSettings;
  }): Promise<TaskItem> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');

    const newTaskData = {
      userId: params.userId,
      title: params.title.trim(),
      description: params.description?.trim() || '',
      subject: params.subject.trim(),
      folderId: params.folderId || null,
      deadlineDate: params.deadlineDate,
      deadlineTime: params.deadlineTime || '23:59',
      priority: params.priority,
      status: 'todo' as TaskStatus,
      checklist: params.checklist || [],
      attachments: params.attachments || [],
      notes: params.notes || '',
      reminderSettings: params.reminderSettings || {
        h3: true,
        h1: true,
        h0: true,
        overdue: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTaskData);
    return { ...newTaskData, id: docRef.id };
  }

  static async updateTask(taskId: string, updates: Partial<TaskItem>): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'tasks', taskId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteTask(taskId: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, 'tasks', taskId));
  }

  static async toggleStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    await this.updateTask(taskId, { status: newStatus });
  }

  static async toggleChecklistItem(task: TaskItem, itemId: string): Promise<void> {
    const updatedChecklist = task.checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    await this.updateTask(task.id, { checklist: updatedChecklist });
  }

  static isOverdue(task: TaskItem): boolean {
    if (task.status === 'completed') return false;
    const deadlineStr = `${task.deadlineDate}T${task.deadlineTime || '23:59'}:00`;
    const deadline = new Date(deadlineStr).getTime();
    return Date.now() > deadline;
  }

  static isDueToday(task: TaskItem): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return task.deadlineDate === todayStr;
  }
}
