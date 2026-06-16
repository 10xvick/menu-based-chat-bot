interface LiveFormProps {
  data: Record<string, string>;
}

export default function LiveForm({ data }: LiveFormProps) {
  const fields = Object.entries(data);

  return (
    <div className="live-form-container">
      <div className="live-form-header">
        <h2>Live Form Preview</h2>
        <p>Data collected from the chat appears here.</p>
      </div>
      <div className="live-form-content">
        {fields.length === 0 ? (
          <div className="live-form-empty">No form data collected yet.</div>
        ) : (
          <div className="live-form-fields">
            {fields.map(([key, value]) => (
              <div key={key} className="live-form-field">
                <label>{key.toUpperCase()}</label>
                <div className="live-form-value">{value || <span className="empty-value">Pending...</span>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
