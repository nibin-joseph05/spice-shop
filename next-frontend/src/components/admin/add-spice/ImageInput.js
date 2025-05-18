// components/admin/add-spice/ImageInput.js
import { FiX, FiLink, FiUpload } from "react-icons/fi";

export const ImageInput = ({
  index,
  type,
  value,
  onChange,
  onRemove,
  darkMode,
  error
}) => {
  // Toggle between URL and File modes, resetting the value safely
  const toggleType = () => {
    const newType = type === "url" ? "file" : "url";
    // URLs expect a string; files expect null (no file selected)
    const newValue = newType === "url" ? "" : null;
    onChange(index, newType, newValue);
  };

  return (
    <div className="relative group">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Image {index + 1} ({type === "url" ? "URL" : "File"})
        </label>
        <button
          type="button"
          onClick={toggleType}
          className="text-sm flex items-center gap-1 p-1 hover:bg-gray-700/20 rounded"
        >
          {type === "url" ? <FiUpload /> : <FiLink />}
          Switch to {type === "url" ? "File" : "URL"}
        </button>
      </div>

      <div className="flex gap-2">
        {type === "url" ? (
          <input
            type="url"
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            } ${error ? "border-red-500" : ""}`}
            value={value || ""}
            onChange={(e) => onChange(index, "url", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        ) : (
          <input
            type="file"
            accept="image/jpeg, image/png"
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            } ${error ? "border-red-500" : ""}`}
            onChange={(e) => onChange(index, "file", e.target.files[0] || null)}
          />
        )}

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
        >
          <FiX />
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
