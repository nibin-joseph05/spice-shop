// components/admin/add-spice/VariantInput.js
import { FiX } from "react-icons/fi";

export const VariantInput = ({ index, variant, onChange, onRemove, darkMode, errors }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    <div>
      <label className="block text-sm font-medium mb-2">
        Quality Class *
        {errors?.quality && (
          <span className="ml-2 text-red-500 text-sm">{errors.quality}</span>
        )}
      </label>
      <input
        type="text"
        name="qualityClass"
        required
        className={`w-full px-4 py-2 rounded-lg ${
          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
        } ${errors?.quality ? "border-red-500" : ""}`}
        value={variant.qualityClass}
        onChange={(e) => onChange(index, e)}
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">
        Price (₹) *
        {errors?.price && (
          <span className="ml-2 text-red-500 text-sm">{errors.price}</span>
        )}
      </label>

      <input
        type="number"
        name="price"
        step="0.01"
        min="0"
        required
        className={`w-full px-4 py-2 rounded-lg ${
          darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
        } ${errors?.price ? "border-red-500" : ""}`}
        value={variant.price || ""}
        onChange={(e) => onChange(index, e)}
      />
    </div>

    <div className="flex items-end">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
      >
        <FiX /> Remove
      </button>
    </div>
  </div>
);