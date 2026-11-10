'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/store';

interface CalendarProps {
  kitId: number;
  fechaRetiro: string;
  fechaDevolucion: string;
  onChangeFechas: (retiro: string, devolucion: string) => void;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function Calendar({
  kitId,
  fechaRetiro,
  fechaDevolucion,
  onChangeFechas,
}: CalendarProps) {
  const { esFechaOcupada, rangoTieneConflicto } = useApp();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const formatYMD = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const todayStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const clickedDate = formatYMD(currentYear, currentMonth, day);
    if (clickedDate < todayStr) return;

    if (esFechaOcupada(kitId, clickedDate)) {
      setErrorMsg('Esta fecha ya está reservada. Por favor elegí un día en verde.');
      return;
    }

    setErrorMsg(null);

    // Si no hay retiro o ya teníamos rango y clica antes del retiro o reinicia selección:
    if (!fechaRetiro || (fechaRetiro && fechaDevolucion && fechaRetiro !== fechaDevolucion)) {
      // Por defecto asignamos devolución al día siguiente si está libre
      const nextDateObj = new Date(currentYear, currentMonth, day + 1);
      const nextDateStr = formatYMD(
        nextDateObj.getFullYear(),
        nextDateObj.getMonth(),
        nextDateObj.getDate()
      );

      if (!esFechaOcupada(kitId, nextDateStr)) {
        onChangeFechas(clickedDate, nextDateStr);
      } else {
        onChangeFechas(clickedDate, clickedDate);
      }
      return;
    }

    // Si clica una fecha posterior para devolución
    if (clickedDate >= fechaRetiro) {
      if (rangoTieneConflicto(kitId, fechaRetiro, clickedDate)) {
        setErrorMsg('No se puede reservar: hay días ocupados dentro del rango elegido.');
        return;
      }
      onChangeFechas(fechaRetiro, clickedDate);
    } else {
      onChangeFechas(clickedDate, clickedDate);
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatYMD(currentYear, currentMonth, day);
    const isPast = dateStr < todayStr;
    const isOccupied = esFechaOcupada(kitId, dateStr);
    const isSelectedStart = dateStr === fechaRetiro;
    const isSelectedEnd = dateStr === fechaDevolucion;
    const isInRange =
      fechaRetiro &&
      fechaDevolucion &&
      dateStr >= fechaRetiro &&
      dateStr <= fechaDevolucion;

    let btnClasses =
      'h-11 w-full rounded-xl text-sm font-bold flex flex-col items-center justify-center transition-all relative ';

    if (isPast) {
      btnClasses += 'bg-gray-100 text-gray-300 cursor-not-allowed';
    } else if (isOccupied) {
      btnClasses += 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed';
    } else if (isSelectedStart || isSelectedEnd) {
      btnClasses += 'bg-brand-pink text-white shadow-md scale-105 z-10';
    } else if (isInRange) {
      btnClasses += 'bg-pink-100 text-brand-pink border border-brand-pink/40';
    } else {
      btnClasses +=
        'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100';
    }

    days.push(
      <button
        key={dateStr}
        type="button"
        disabled={isPast || isOccupied}
        onClick={() => handleSelectDay(day)}
        className={btnClasses}
      >
        <span>{day}</span>
        {!isPast && (
          <span className="text-[9px] font-semibold leading-none mt-0.5">
            {isOccupied
              ? 'Ocupado'
              : isSelectedStart
              ? 'Retiro'
              : isSelectedEnd
              ? 'Devol.'
              : 'Libre'}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-card border border-pink-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-gray-900 text-base">
            Disponibilidad y Fechas
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Libre
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Ocupado
          </span>
        </div>
      </div>

      {/* Selector de Mes */}
      <div className="flex items-center justify-between bg-brand-bg px-3 py-2 rounded-2xl mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl hover:bg-white text-gray-700 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-gray-800 text-sm sm:text-base">
          {MESES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl hover:bg-white text-gray-700 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Cabecera días */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-xs font-bold text-gray-400">
            {d}
          </span>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1.5">{days}</div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Resumen de fechas seleccionadas */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-gray-100">
        <div className="bg-pink-50/70 rounded-2xl p-2.5 border border-pink-100">
          <span className="text-[11px] text-gray-500 block font-medium">
            Fecha de Retiro
          </span>
          <span className="text-sm font-extrabold text-gray-900">
            {fechaRetiro || 'Seleccionar'}
          </span>
        </div>
        <div className="bg-teal-50/70 rounded-2xl p-2.5 border border-teal-100">
          <span className="text-[11px] text-gray-500 block font-medium">
            Fecha de Devolución
          </span>
          <span className="text-sm font-extrabold text-gray-900">
            {fechaDevolucion || 'Seleccionar'}
          </span>
        </div>
      </div>
    </div>
  );
}
