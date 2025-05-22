// components/admin/add-spice/VariantInput.js
import { FiX, FiPlus, FiInfo } from "react-icons/fi"; // Add FiInfo here
import { PackInput } from "./PackInput";

export const VariantInput = ({ index, variant, onChange, onRemove, darkMode, errors }) => {
    const addPack = () => {
        const newVariant = { ...variant };
        newVariant.packs = [...newVariant.packs, { packWeightInGrams: "", price: "", stockQuantity: "" }];
        onChange(index, { target: { name: "packs", value: newVariant.packs } });
    };

    const handlePackChange = (packIndex, e) => {
        const newPacks = [...variant.packs];
        newPacks[packIndex][e.target.name] = e.target.value;
        onChange(index, { target: { name: "packs", value: newPacks } });
    };

    const removePack = (packIndex) => {
        const newPacks = variant.packs.filter((_, i) => i !== packIndex);
        onChange(index, { target: { name: "packs", value: newPacks } });
    };

    return (
        <div className={`mb-6 p-6 rounded-lg ${darkMode ? "bg-gray-800/70" : "bg-gray-100"} border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-md`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-amber-300">Variant {index + 1}</h3>
                {index !== 0 && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                        aria-label={`Remove variant ${index + 1}`}
                    >
                        <FiX /> Remove Variant
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor={`quality-class-${index}`} className="block text-sm font-medium mb-2">
                        Quality Class *
                        {errors?.quality && <span className="ml-2 text-red-500 text-sm font-normal italic flex items-center gap-1"><FiAlertCircle size={14} /> {errors.quality}</span>}
                    </label>
                    <input
                        type="text"
                        id={`quality-class-${index}`}
                        name="qualityClass"
                        required
                        className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
                        } ${errors?.quality ? "border-red-500 ring-1 ring-red-500" : ""}`}
                        value={variant.qualityClass}
                        onChange={(e) => onChange(index, e)}
                        placeholder="e.g. Premium, Organic, Bulk"
                        aria-invalid={errors?.quality ? "true" : "false"}
                        aria-describedby={errors?.quality ? `quality-error-${index}` : null}
                    />
                    {errors?.quality && <p id={`quality-error-${index}`} className="sr-only">{errors.quality}</p>}
                </div>
            </div>

            <div className="ml-0 md:ml-4 pl-0 md:pl-4 border-l-0 md:border-l-2 border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-300 flex items-center gap-1">
                        <FiInfo size={16} /> Pack Sizes for this Variant
                    </h4>
                    <button
                        type="button"
                        onClick={addPack}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all duration-300 transform hover:scale-105"
                        aria-label="Add new pack size"
                    >
                        <FiPlus /> Add Pack
                    </button>
                </div>

                {variant.packs.length === 0 && (
                    <p className="text-gray-400 text-sm italic mb-4">
                        No pack sizes added yet. Click "Add Pack" to define a weight, price, and stock for this variant.
                    </p>
                )}

                {variant.packs.map((pack, packIndex) => (
                    <PackInput
                        key={packIndex}
                        index={packIndex}
                        pack={pack}
                        onChange={(e) => handlePackChange(packIndex, e)}
                        onRemove={() => removePack(packIndex)}
                        darkMode={darkMode}
                        errors={errors?.packs?.[packIndex]} // Pass specific pack errors
                    />
                ))}
            </div>
        </div>
    );
};