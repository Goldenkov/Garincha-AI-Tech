"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
      Распечатать или сохранить в PDF
    </button>
  );
}
