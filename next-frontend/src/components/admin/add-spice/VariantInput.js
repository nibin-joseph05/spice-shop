// components/admin/add-spice/VariantInput.js
import { FiX, FiPlus } from "react-icons/fi";
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
        <div className="mb-6 border-b border-gray-700 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-2">
                        Quality Class *
                        {errors?.quality && <span className="ml-2 text-red-500 text-sm">{errors.quality}</span>}
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

                <div className="flex items-end justify-end">
                    {index !== 0 && (
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                            <FiX />
                        </button>
                    )}
                </div>
            </div>

            <div className="ml-4 pl-4 border-l-2 border-gray-600">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-400">Pack Sizes</h3>
                    <button
                        type="button"
                        onClick={addPack}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                    >
                        <FiPlus /> Add Pack
                    </button>
                </div>

                {variant.packs.map((pack, packIndex) => (
                    <PackInput
                        key={packIndex}
                        index={packIndex}
                        pack={pack}
                        onChange={(e) => handlePackChange(packIndex, e)}
                        onRemove={() => removePack(packIndex)}
                        darkMode={darkMode}
                        errors={{
                            weight: errors?.[`packWeight-${index}-${packIndex}`],
                            price: errors?.[`packPrice-${index}-${packIndex}`],
                            stock: errors?.[`packStock-${index}-${packIndex}`]
                        }}
                    />
                ))}
            </div>
        </div>
    );
};