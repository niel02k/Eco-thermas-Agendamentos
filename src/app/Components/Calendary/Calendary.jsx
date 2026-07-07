"use client";

import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import styles from "./Calendary.module.css"; // ajuste o caminho se necessário

export default function Calendary({
  selectedDates,
  toggleDate,
  hoveredDate,
  setHoveredDate,
  month,
  setMonth,
  modifiers,
}) {
  return (
    <DayPicker
      mode="multiple"
      selected={selectedDates}
      onDayClick={(date, { disabled }) => {
        if (disabled) return;
        toggleDate(date);
      }}
      onDayMouseEnter={(date) => setHoveredDate(date)}
      onDayMouseLeave={() => setHoveredDate(null)}
      month={month}
      onMonthChange={setMonth}
      locale={ptBR}
      disabled={[{ before: new Date() }]}
      modifiers={modifiers}
      modifiersClassNames={{
        selected: styles.daySelected,
        savedOpen: styles.daySavedOpen,
        newOpen: styles.dayNewOpen,
        savedClosed: styles.daySavedClosed,
        past: styles.dayPast,
      }}
      classNames={{
          root: styles.rdpRoot,
          months: styles.rdpMonths,
          month: styles.rdpMonth,

         month_caption: styles.rdpCaption,
        caption_label: styles.rdpCaptionLabel,

         nav: styles.rdpNav,
        button_previous: styles.rdpNavBtnPrev,
         button_next: styles.rdpNavBtnNext,

         month_grid: styles.rdpTable,

        weekdays: styles.rdpHeadRow,
         weekday: styles.rdpHeadCell,

        week: styles.rdpRow,

       day: styles.rdpCell,
       day_button: styles.rdpDayBtn,

      today: styles.rdpToday,
      outside: styles.rdpOutside,
      disabled: styles.rdpDisabled,
      hidden: styles.rdpHidden,
      selected: styles.rdpSelected,

      chevron: styles.rdpChevron,
        }}
    />
  );
}