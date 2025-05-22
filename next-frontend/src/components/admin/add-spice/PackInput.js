// components/admin/add-spice/PackInput.js
import { FiX } from "react-icons/fi";

export const PackInput = ({ index, pack, onChange, onRemove, darkMode, errors }) => (
  <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"} relative`}>
    <div className="md:col-span-1">
      <label htmlFor={`weight-${index}`} className="block text-sm font-medium mb-2">
        Weight (g) *
        {errors?.weight && <span className="ml-2 text-red-500 text-sm font-normal italic flex items-center gap-1"><FiAlertCircle size={14} /> {errors.weight}</span>}
      </label>
      <input
        type="number"
        id={`weight-${index}`}
        name="packWeightInGrams"
        required
        min="1"
        className={`w-full px-4 py-2 rounded-lg border ${
          darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
        } ${errors?.weight ? "border-red-500 ring-1 ring-red-500" : ""}`}
        value={pack.packWeightInGrams}
        onChange={onChange}
        placeholder="e.g. 50, 100, 250"
        aria-invalid={errors?.weight ? "true" : "false"}
        aria-describedby={errors?.weight ? `weight-error-${index}` : null}
      />
      {errors?.weight && <p id={`weight-error-${index}`} className="sr-only">{errors.weight}</p>}
    </div>

    <div className="md:col-span-1">
      <label htmlFor={`price-${index}`} className="block text-sm font-medium mb-2">
        Price (₹) *
        {errors?.price && <span className="ml-2 text-red-500 text-sm font-normal italic flex items-center gap-1"><FiAlertCircle size={14} /> {errors.price}</span>}
      </label>
      <input
        type="number"
        id={`price-${index}`}
        name="price"
        step="0.01"
        required
        min="0.01"
        className={`w-full px-4 py-2 rounded-lg border ${
          darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
        } ${errors?.price ? "border-red-500 ring-1 ring-red-500" : ""}`}
        value={pack.price}
        onChange={onChange}
        placeholder="e.g. 199.50"
        aria-invalid={errors?.price ? "true" : "false"}
        aria-describedby={errors?.price ? `price-error-${index}` : null}
      />
      {errors?.price && <p id={`price-error-${index}`} className="sr-only">{errors.price}</p>}
    </div>

    <div className="md:col-span-1">
      <label htmlFor={`stock-${index}`} className="block text-sm font-medium mb-2">
        Stock Quantity *
        {errors?.stock && <span className="ml-2 text-red-500 text-sm font-normal italic flex items-center gap-1"><FiAlertCircle size={14} /> {errors.stock}</span>}
      </label>
      <input
        type="number"
        id={`stock-${index}`}
        name="stockQuantity"
        required
        min="0"
        className={`w-full px-4 py-2 rounded-lg border ${
          darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
        } ${errors?.stock ? "border-red-500 ring-1 ring-red-500" : ""}`}
        value={pack.stockQuantity}
        onChange={onChange}
        placeholder="e.g. 100"
        aria-invalid={errors?.stock ? "true" : "false"}
        aria-describedby={errors?.stock ? `stock-error-${index}` : null}
      />
      {errors?.stock && <p id={`stock-error-${index}`} className="sr-only">{errors.stock}</p>}
    </div>

    <div className="flex items-end justify-end md:col-span-1">
      {index !== 0 && (
        <button
          type="button"
          onClick={onRemove}
          className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1"
          aria-label={`Remove pack ${index + 1}`}
        >
          <FiX className="text-lg" />
        </button>
      )}
    </div>
  </div>
);