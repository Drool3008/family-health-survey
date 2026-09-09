"use client";

export default function Progress({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="progress">
      <div className="label">{label}</div>
      <div className="bar" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={"seg" + (i < step ? " on" : "")} />
        ))}
      </div>
    </div>
  );
}
