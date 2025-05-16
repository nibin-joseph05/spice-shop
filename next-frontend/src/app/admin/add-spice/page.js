// app/admin/add-spice/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FiPlus } from "react-icons/fi";
import { FormSection } from "@/components/admin/add-spice/FormSection";
import { ImageInput } from "@/components/admin/add-spice/ImageInput";
import { VariantInput } from "@/components/admin/add-spice/VariantInput";
import { FormActions } from "@/components/admin/add-spice/FormActions";

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
    imageUrls: [""],
    imageFiles: []
  });

  // Form handlers remain the same but updated for separated state
  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVariantChange = (index, e) => {
    const newVariants = [...formData.variants];
    newVariants[index][e.target.name] = e.target.value;
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...formData.imageUrls];
    newImageUrls[index] = value;
    setFormData(prev => ({ ...prev, imageUrls: newImageUrls }));
  };

  const handleFileUpload = (index, file) => {
    const newImageFiles = [...formData.imageFiles];
    newImageFiles[index] = file;
    setFormData(prev => ({ ...prev, imageFiles: newImageFiles }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { qualityClass: "", price: "" }]
    }));
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""]
    }));
  };

  const addImageFile = () => {
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, null]
    }));
  };

  const removeItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Handle file uploads first
      const uploadedUrls = await Promise.all(
        formData.imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
          });
          return response.json().url;
        })
      );

      // Combine URLs from inputs and uploaded files
      const allImageUrls = [...formData.imageUrls.filter(url => url), ...uploadedUrls];

      // Submit main form data
      const response = await fetch("/api/spices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: allImageUrls,
          variants: formData.variants.map(v => ({
            qualityClass: v.qualityClass,
            price: parseFloat(v.price)
          }))
        })
      });

      if (response.ok) router.push("/admin-dashboard");
    } catch (error) {
      console.error("Submission error:", error);
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
            
            <FormSection title="Basic Information" darkMode={darkMode} icon="📦">
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
            </FormSection>

            <FormSection
              title="Product Variants"
              darkMode={darkMode}
              icon="📊"
              onAdd={addVariant}
            >
              {formData.variants.map((variant, index) => (
                <VariantInput
                  key={index}
                  index={index}
                  variant={variant}
                  onChange={handleVariantChange}
                  onRemove={(i) => removeItem("variants", i)}
                  darkMode={darkMode}
                />
              ))}
            </FormSection>

            <FormSection
              title="Image URLs"
              darkMode={darkMode}
              icon="🔗"
              onAdd={addImageUrl}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.imageUrls.map((url, index) => (
                  <ImageInput
                    key={index}
                    index={index}
                    value={url}
                    onChange={handleImageUrlChange}
                    onRemove={(i) => removeItem("imageUrls", i)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection
              title="Upload Images"
              darkMode={darkMode}
              icon="🖼️"
              onAdd={addImageFile}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.imageFiles.map((file, index) => (
                  <ImageInput
                    key={index}
                    index={index}
                    value={file}
                    onChange={handleFileUpload}
                    onRemove={(i) => removeItem("imageFiles", i)}
                    darkMode={darkMode}
                    isFile
                  />
                ))}
              </div>
            </FormSection>

            <FormActions onCancel={() => router.push("/admin-dashboard")} />
          </form>
        </div>
      </main>
    </div>
  );
}