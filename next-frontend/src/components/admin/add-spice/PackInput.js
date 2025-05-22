// components/admin/add-spice/PackInput.js
import { FiX } from "react-icons/fi";

export const PackInput = ({ index, pack, onChange, onRemove, darkMode, errors }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div>
            <label className="block text-sm font-medium mb-2">
                Weight (g) *
                {errors?.weight && <span className="ml-2 text-red-500 text-sm">{errors.weight}</span>}
            </label>
            <input
                type="number"
                name="packWeightInGrams"
                required
                className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                } ${errors?.weight ? "border-red-500" : ""}`}
                value={pack.packWeightInGrams}
                onChange={onChange}
            />
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">
                Price (₹) *
                {errors?.price && <span className="ml-2 text-red-500 text-sm">{errors.price}</span>}
            </label>
            <input
                type="number"
                name="price"
                step="0.01"
                required
                className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                } ${errors?.price ? "border-red-500" : ""}`}
                value={pack.price}
                onChange={onChange}
            />
        </div>

        <div>
            <label className="block text-sm font-medium mb-2">
                Stock *
                {errors?.stock && <span className="ml-2 text-red-500 text-sm">{errors.stock}</span>}
            </label>
            <input
                type="number"
                name="stockQuantity"
                required
                className={`w-full px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                } ${errors?.stock ? "border-red-500" : ""}`}
                value={pack.stockQuantity}
                onChange={onChange}
            />
        </div>

        <div className="flex items-end">
            {index !== 0 && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                    <FiX />
                </button>
            )}
        </div>
    </div>
);