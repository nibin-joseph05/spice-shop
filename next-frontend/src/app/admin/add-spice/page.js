// app/admin/add-spice/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FiX, FiPlus } from "react-icons/fi";

export default function AddSpicePage() {
  const router = useRouter();
  const [darkMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    unit: "grams",
    description: "",
    origin: "",
    isAvailable: true,
    variants: [{ qualityClass: "", price: "" }],
    images: [""]
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleVariantChange = (index, e) => {
    const newVariants = [...formData.variants];
    newVariants[index][e.target.name] = e.target.value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { qualityClass: "", price: "" }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const removeImageField = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/spices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          variants: formData.variants.map(v => ({
            qualityClass: v.qualityClass,
            price: parseFloat(v.price)
          }))
        })
      });

      if (response.ok) {
        alert("Spice added successfully!");
        router.push("/admin-dashboard");
      } else {
        alert("Error adding spice");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit form");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className={`flex-1 p-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent mb-8">
            Add New Spice Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className={`p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"} shadow-xl transition-all`}>
              <h2 className="text-xl font-semibold mb-4 text-amber-400">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Spice Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unit *</label>
                  <select
                    name="unit"
                    required
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                    value={formData.unit}
                    onChange={handleInputChange}
                  >
                    <option value="grams">Grams</option>
                    <option value="kilograms">Kilograms</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                    value={formData.origin}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select
                    name="isAvailable"
                    className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                    value={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isAvailable: e.target.value === "true"
                    }))}
                  >
                    <option value={true}>Available</option>
                    <option value={false}>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className={`p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"} shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-400">Product Variants</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  <FiPlus /> Add Variant
                </button>
              </div>

              {formData.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality Class *</label>
                    <input
                      type="text"
                      name="qualityClass"
                      required
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                      value={variant.qualityClass}
                      onChange={(e) => handleVariantChange(index, e)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      required
                      className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, e)}
                    />
                  </div>

                  <div className="flex items-end">
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
                      >
                        <FiX /> Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Images Section */}
            <div className={`p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"} shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-400">Product Images</h2>
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  <FiPlus /> Add Image
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <label className="block text-sm font-medium mb-2">Image URL {index + 1}</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        className={`w-full px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} transition-colors`}
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-3 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Submission */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin-dashboard")}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all"
              >
                Add Spice Product
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}