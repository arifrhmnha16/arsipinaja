import { TaskItem, TaskPriority, TaskStatus, TaskChecklistItem, TaskReminderSettings } from '../../types';
import { INITIAL_TASKS } from '../mockData';

const TASKS_KEY = 'arsipinaja_tasks';

function getTasks(): TaskItem[] {
  const data = localStorage.getItem(TASKS_KEY);
  if (!data) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TASKS;
  }
}

function saveTasks(tasks: TaskItem[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export class TaskService {
  static getTasks(userId: string): TaskItem[] {
    const all = getTasks();
    return all.filter((t) => t.userId === userId);
  }

  static getTaskById(taskId: string): TaskItem | null {
    const all = getTasks();
    return all.find((t) => t.id === taskId) || null;
  }

  static createTask(params: {
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
  }): TaskItem {
    const tasks = getTasks();
    const newTask: TaskItem = {
      id: 'task_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      userId: params.userId,
      title: params.title.trim(),
      description: params.description?.trim() || '',
      subject: params.subject.trim(),
      folderId: params.folderId || null,
      deadlineDate: params.deadlineDate,
      deadlineTime: params.deadlineTime || '23:59',
      priority: params.priority,
      status: 'todo',
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

    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
  }

  static updateTask(taskId: string, updates: Partial<TaskItem>): TaskItem {
    const tasks = getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Tugas tidak ditemukan.');

    const updated = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updated;
    saveTasks(tasks);
    return updated;
  }

  static deleteTask(taskId: string): void {
    const tasks = getTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);
    saveTasks(filtered);
  }

  static toggleStatus(taskId: string, newStatus: TaskStatus): TaskItem {
    return this.updateTask(taskId, { status: newStatus });
  }

  static toggleChecklistItem(taskId: string, itemId: string): TaskItem {
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    task.checklist = task.checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    return task;
  }

  static getSubjects(userId: string): string[] {
    const tasks = this.getTasks(userId);
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set);
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
