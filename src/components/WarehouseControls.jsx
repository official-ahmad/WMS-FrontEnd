export function PhotoButton({ onChange }) {
  return (
    <label className="warehouse-photo-button">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g strokeWidth="2" strokeLinecap="round" stroke="#fff" fillRule="evenodd" clipRule="evenodd">
          <path d="m4 9c0-1.10457.89543-2 2-2h2l.44721-.89443c.33879-.67757 1.03131-1.10557 1.78889-1.10557h3.5278c.7576 0 1.4501.428 1.7889 1.10557l.4472.89443h2c1.1046 0 2 .89543 2 2v8c0 1.1046-.89543 2-2 2h-12c-1.10457 0-2-.89543-2-2z" />
          <path d="m15 13c0 1.6569-1.3431 3-3 3s-3-1.3431-3-3 1.3431-3 3-3 3 1.3431 3 3z" />
        </g>
      </svg>
      <span>Take a Photo</span>
      <input type="file" accept="image/*" capture="environment" onChange={onChange} />
    </label>
  );
}

export function DownloadButton({ children = "Download", onClick }) {
  return (
    <button type="button" className="warehouse-download-button" onClick={onClick}>
      <span>{children}</span>
    </button>
  );
}

export function RangeSwitch({ value, onChange }) {
  return (
    <div className="warehouse-range-switch" role="tablist" aria-label="Range">
      {["day", "week", "month", "year"].map((range) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === range}
          className={value === range ? "is-active" : ""}
          key={range}
          onClick={() => onChange(range)}
        >
          {range[0].toUpperCase() + range.slice(1)}
        </button>
      ))}
    </div>
  );
}
