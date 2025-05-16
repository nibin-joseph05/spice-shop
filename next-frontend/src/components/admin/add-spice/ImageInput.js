// components/admin/add-spice/ImageInput.js
import { FiX } from "react-icons/fi";

export const ImageInput = ({ index, value, onChange, onRemove, darkMode, isFile = false }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-2">
      {isFile ? `Upload Image ${index + 1}` : `Image URL ${index + 1}`}
    </label>
    <div className="flex gap-2">
      {isFile ? (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(index, e.target.files[0])}
          className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
        />
      ) : (
        <input
          type="url"
          required
          className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
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
  </div>
);