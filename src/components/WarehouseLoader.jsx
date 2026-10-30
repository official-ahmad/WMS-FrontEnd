export default function WarehouseLoader({ label = "Loading...", compact = false }) {
  return (
    <div className={`warehouse-loader-wrap${compact ? " warehouse-loader-wrap--compact" : ""}`} role="status" aria-live="polite">
      <div className="warehouse-loader" aria-hidden="true">
        <div className="warehouse-loader__cloud">
          <span />
          <span />
          <span />
        </div>
        <div className="warehouse-loader__arrows">↻</div>
      </div>
      <p>{label}</p>
    </div>
  );
}
