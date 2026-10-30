import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Filter, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TaskService } from '../../services/firestore/taskService';
import { TaskItem } from '../../types';
import { WindowCard } from '../../components/ui/WindowCard';
import { RetroButton } from '../../components/ui/RetroButton';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    const userTasks = TaskService.getTasks(user.id);
    setTasks(userTasks);
  }, [user]);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const subjects = Array.from(new Set(tasks.map((t) => t.subject).filter(Boolean)));

  const filteredTasks = tasks.filter(
    (t) => selectedSubject === 'all' || t.subject === selectedSubject
  );

  // Month interval days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Tasks on selected date
  const selectedDateFormatted = format(selectedDate, 'yyyy-MM-dd');
  const tasksOnSelectedDate = filteredTasks.filter(
    (t) => t.deadlineDate === selectedDateFormatted
  );

  // Upcoming tasks in 7 days
  const upcomingDeadlines = [...filteredTasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-black text-2xl text-brand-black">
            Kalender Akademik & Jadwal Kuliah
          </h2>
          <p className="text-xs text-brand-secondary font-medium">
            Visualisasi seluruh tenggat waktu dan jadwal pengerjaan tugas kuliahmu.
          </p>
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border-2 border-brand-black rounded-lg px-3 py-1.5 bg-white text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="all">Semua Mata Kuliah</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <RetroButton variant="yellow" size="sm" onClick={goToToday}>
            Hari Ini
          </RetroButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8">
          <WindowCard
            title={format(currentDate, 'MMMM yyyy', { locale: idLocale }).toUpperCase()}
            tag="DEADLINE VIEW"
            headerBg="yellow"
            headerActions={
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded bg-white hover:bg-brand-cream border border-brand-black cursor-pointer shadow-xs"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded bg-white hover:bg-brand-cream border border-brand-black cursor-pointer shadow-xs"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            }
          >
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center font-heading font-extrabold text-xs text-brand-black mb-2 uppercase tracking-wider">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = filteredTasks.filter((t) => t.deadlineDate === dateKey);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[70px] sm:min-h-[85px] p-1 sm:p-1.5 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-black bg-brand-yellow/30 shadow-retro-sm'
                        : isCurrentMonth
                        ? 'border-brand-black/20 bg-white hover:border-brand-black'
                        : 'border-transparent bg-neutral-100/50 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrentDay
                            ? 'bg-brand-pink text-brand-black border border-brand-black font-extrabold'
                            : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-mono font-bold px-1 rounded bg-brand-black text-brand-yellow">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Mini Task Badges */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((t) => {
                        const bg = {
                          high: 'bg-brand-pink text-brand-black',
                          medium: 'bg-brand-yellow text-brand-black',
                          low: 'bg-brand-green text-white',
                        }[t.priority];

                        return (
                          <div
                            key={t.id}
                            className={`text-[9px] font-bold px-1 py-0.5 rounded border border-brand-black truncate ${bg}`}
                            title={t.title}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <div className="text-[9px] font-mono text-brand-secondary font-bold text-center">
                          +{dayTasks.length - 2} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </WindowCard>
        </div>

        {/* Right Column: Selected Date Details & Upcoming */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Date Tasks */}
          <WindowCard
            title={format(selectedDate, 'EEEE, d MMMM yyyy', { locale: idLocale }).toUpperCase()}
            tag={`${tasksOnSelectedDate.length} TUGAS`}
            headerBg="cream"
          >
            {tasksOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-xs text-brand-secondary">
                <CalendarIcon className="w-8 h-8 text-brand-secondary/60 mx-auto mb-2" />
                Tidak ada tugas atau deadline pada tanggal ini.
              </div>
            ) : (
              <div className="space-y-3">
                {tasksOnSelectedDate.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border-2 border-brand-black bg-brand-cream/30 space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-secondary truncate">
                        {t.subject}
                      </span>
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-brand-black">
                        {t.deadlineTime} WIB
                      </span>
                    </div>

                    <div className="font-heading font-extrabold text-sm text-brand-black">
                      {t.title}
                    </div>

                    {t.description && (
                      <p className="text-[11px] text-brand-secondary line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </WindowCard>

          {/* Upcoming Deadlines Widget */}
          <WindowCard
            title="DEADLINE MENDATANG"
            tag="UPCOMING"
            headerBg="green"
          >
            <div className="space-y-2.5">
              {upcomingDeadlines.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-brand-black bg-white text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-brand-black truncate">{t.title}</div>
                    <div className="text-[10px] text-brand-secondary font-mono">
                      {t.subject}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-yellow border border-brand-black">
                    {t.deadlineDate}
                  </div>
                </div>
              ))}
            </div>
          </WindowCard>
        </div>
      </div>
    </div>
  );
};
