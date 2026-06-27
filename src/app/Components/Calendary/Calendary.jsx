"use client";


import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Calendar() {
  return (
    <DayPicker
      modifiers={{
        weekend: { dayOfWeek: [0, 6] } // domingo e sábado
      }}
      modifiersStyles={{
        weekend: {
          backgroundColor: "#78afe7",
          color: "white",
          borderRadius: "6px"
        }
      }}
    />
  );
}