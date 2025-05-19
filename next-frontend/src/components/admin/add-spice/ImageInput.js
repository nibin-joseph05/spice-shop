// components/admin/add-spice/ImageInput.js
import { useRef, useEffect } from "react";
import { FiX, FiLink, FiUpload } from "react-icons/fi";

export const ImageInput = ({
  index,
  type,
  value,
  onChange,
  onRemove,
  darkMode,
  error,
  isFirst
}) => {
  const fileInputRef = useRef(null);
  const urlInputRef = useRef(null);

  useEffect(() => {
    if (type === "url") {
      if (fileInputRef.current) fileInputRef.current.value = "";
      urlInputRef.current.value = value || "";
    } else {
      if (urlInputRef.current) urlInputRef.current.value = "";
    }
  }, [type, value]);

  const toggleType = () => {
    const newType = type === "url" ? "file" : "url";
    onChange(index, newType, newType === "url" ? "" : null);
  };

  const handleFileChange = (e) => {
    onChange(index, "file", e.target.files?.[0] || null);
  };

  const handleUrlChange = (e) => {
    onChange(index, "url", e.target.value);
  };

  return (
    <div className="relative group">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Image {index + 1} ({type === "url" ? "URL" : "File"})
        </label>
        {isFirst && (
          <button
            type="button"
            onClick={toggleType}
            className="text-sm flex items-center gap-1 p-1 hover:bg-gray-700/20 rounded"
          >
            {type === "url" ? <FiUpload /> : <FiLink />}
            Switch to {type === "url" ? "File" : "URL"}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {type === "url" ? (
          <input
            ref={urlInputRef}
            type="url"
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            } ${error ? "border-red-500" : ""}`}
            defaultValue={value || ""}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
          />
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png"
            className={`w-full px-4 py-2 rounded-lg ${
              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
            } ${error ? "border-red-500" : ""}`}
            onChange={handleFileChange}
          />
        )}

        {!isFirst && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <FiX />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};