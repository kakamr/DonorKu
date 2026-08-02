"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type DatePickerInputProps = {
  value: string; // format "yyyy-mm-dd"
  onChange: (value: string) => void;
  placeholder?: string;
};

const namaBulan = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const namaHari = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatToValue(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "Pilih Tanggal",
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseValue(value);
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate) setViewDate(selectedDate);
  }, [value]);

  const formatDisplay = (date: Date) =>
    `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const buildCalendarGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const offset = getFirstDayOffset(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const cells: { day: number; current: boolean }[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, current: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: cells.length - offset - daysInMonth + 1, current: false });
    }

    return cells;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number, current: boolean) => {
    if (!current) return;
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(formatToValue(newDate));
    setIsOpen(false);
  };

  const isSelectedDay = (day: number, current: boolean) => {
    if (!current || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number, current: boolean) => {
    if (!current) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-5 py-3 text-left text-black focus:outline-none focus:ring-2 focus:ring-red-400"
      >
        <span className={selectedDate ? "text-black" : "text-gray-400"}>
          {selectedDate ? formatDisplay(selectedDate) : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-black">
              {namaBulan[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={handlePrevMonth} className="flex h-6 w-6 items-center justify-center text-red-500">‹</button>
              <button type="button" onClick={handleNextMonth} className="flex h-6 w-6 items-center justify-center text-red-500">›</button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-xs text-gray-400">
            {namaHari.map((hari) => (
              <span key={hari}>{hari}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
            {buildCalendarGrid().map((cell, idx) => (
              <div key={idx} className="mx-auto flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleSelectDay(cell.day, cell.current)}
                  disabled={!cell.current}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    isSelectedDay(cell.day, cell.current)
                      ? "bg-red-600 font-semibold text-white"
                      : cell.current
                      ? "text-black hover:bg-gray-100"
                      : "text-gray-300"
                  }`}
                >
                  {cell.day}
                </button>
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isToday(cell.day, cell.current) && !isSelectedDay(cell.day, cell.current)
                      ? "bg-red-500"
                      : "bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}