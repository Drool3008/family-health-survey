"use client";

export default function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="progress">
      <div className="label">Part {step} of {total}</div>
      <div className="bar" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={"seg" + (i < step ? " on" : "")} />
        ))}
      </div>
    </div>
  );
}
