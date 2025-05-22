// components/admin/add-spice/ImageInput.js
import { FiX, FiCheckCircle } from "react-icons/fi";

export const ImageInput = ({
  index,
  value,
  onChange,
  onRemove,
  darkMode,
  error,
  isFirst
}) => {
  return (
    <div className="relative group p-4 border border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={`image-url-${index}`} className="block text-sm font-medium">
          Image URL {index + 1}
        </label>
        {!isFirst && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-500 text-sm flex items-center gap-1 p-1 transition-colors duration-200"
            aria-label={`Remove image ${index + 1}`}
          >
            <FiX className="text-lg" /> Remove
          </button>
        )}
      </div>

      <input
        type="url"
        id={`image-url-${index}`}
        className={`w-full px-4 py-2 rounded-lg border ${
          darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
        } ${error ? "border-red-500 ring-1 ring-red-500" : ""}`}
        value={value || ""}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder="https://example.com/spice-image.jpg"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `image-error-${index}` : null}
      />

      {error && <p id={`image-error-${index}`} className="mt-1 text-sm text-red-500 flex items-center gap-1"><FiAlertCircle size={14} /> {error}</p>}
      {value && !error && isValidUrl(value) && (
        <div className="mt-2 text-sm text-green-500 flex items-center gap-1">
          <FiCheckCircle size={14} /> Valid URL.
        </div>
      )}
    </div>
  );
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};