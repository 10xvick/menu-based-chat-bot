import { data } from '../../data/data';

export default function JsonEditor() {
  return (
    <div className="json-editor">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
