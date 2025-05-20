import { FiX } from "react-icons/fi";

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
        <div className="relative group">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                    Image URL {index + 1}
                </label>
                {!isFirst && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-sm flex items-center gap-1 p-1 hover:bg-gray-700/20 rounded"
                    >
                        Remove
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    type="url"
                    className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                    } ${error ? "border-red-500" : ""}`}
                    value={value || ""}
                    onChange={(e) => onChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};