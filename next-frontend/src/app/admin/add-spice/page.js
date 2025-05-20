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
    images: [""]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Spice name is required";
    if (!formData.unit) newErrors.unit = "Unit selection is required";

    formData.variants.forEach((variant, index) => {
      if (!variant.qualityClass.trim()) {
        newErrors[`variantQuality-${index}`] = "Quality class is required";
      }
      if (!variant.price || isNaN(variant.price)) {
        newErrors[`variantPrice-${index}`] = "Valid price is required";
      }
    });

    formData.images.forEach((image, index) => {
      if (image.type === "url" && image.value && !isValidUrl(image.value)) {
        newErrors[`image-${index}`] = "Invalid URL format";
      }
      if (image.type === "file" && !image.value) {
        newErrors[`image-${index}`] = "Please select a file";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add variant functions
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

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  // app/admin/add-spice/page.js
  const addImage = () => {
      setFormData(prev => ({
          ...prev,
          images: [...prev.images, ""]
      }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateForm()) return;

    setIsSubmitting(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {
      const payload = new FormData();
      const imageUrls = [];
      const files = [];

      formData.images.forEach((url, index) => {
          if (url && !isValidUrl(url)) {
              newErrors[`image-${index}`] = "Invalid URL format";
          }
      });

      const spiceData = {
        name: formData.name,
        unit: formData.unit,
        description: formData.description,
        origin: formData.origin,
        isAvailable: formData.isAvailable,
        variants: formData.variants.map(v => ({
          qualityClass: v.qualityClass,
          price: parseFloat(v.price)
        })),
        imageUrls: formData.images.filter(url => url.trim() !== "")
      };

      payload.append("spice", JSON.stringify(spiceData));
      files.forEach(file => payload.append("files", file));

      const response = await fetch(`${backendUrl}/api/spices`, {
        method: "POST",
        body: payload
      });

      const data = await response.json();

      if (!response.ok) {
        const backendErrors = {};
        if (data.errors) {
          data.errors.forEach(err => {
            backendErrors[err.field] = err.message;
          });
        }
        setErrors(backendErrors);
        return;
      }

      setFormData({
        name: "",
        unit: "grams",
        description: "",
        origin: "",
        isAvailable: true,
        variants: [{ qualityClass: "", price: "" }],
        images: [{ type: "url", value: "" }]
      });
      setSuccessMessage("Spice added successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
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

          {successMessage && (
            <div className="p-4 mb-8 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <p className="font-semibold">✅ {successMessage}</p>
              <div className="mt-2 flex gap-4">
                <button
                  onClick={() => router.push("/admin/spices")}
                  className="text-green-700 hover:underline"
                >
                  View Spice List →
                </button>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-green-700 hover:underline"
                >
                  Add Another Spice +
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.general && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}

            <FormSection
                title="Basic Information"
                darkMode={darkMode}
                icon="📦"
                helpText="Fields marked with * are required"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Spice Name *
                      {errors.name && (
                        <span className="ml-2 text-red-500 text-sm">{errors.name}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                      } ${errors.name ? "border-red-500" : ""}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="E.g., Organic Turmeric Powder"
                    />
                  </div>

                  {/* Unit Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Unit *
                      {errors.unit && (
                        <span className="ml-2 text-red-500 text-sm">{errors.unit}</span>
                      )}
                    </label>
                    <select
                      name="unit"
                      required
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                      } ${errors.unit ? "border-red-500" : ""}`}
                      value={formData.unit}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a unit</option>
                      <option value="grams">Grams</option>
                      <option value="kilograms">Kilograms</option>
                      <option value="pieces">Pieces</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-400">
                      This determines how the product is measured and sold
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Description
                      <span className="ml-2 text-gray-400 text-sm">(Optional but recommended)</span>
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                      }`}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Add a compelling product description..."
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Help customers understand your product better
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Origin
                      <span className="ml-2 text-gray-400 text-sm">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="origin"
                      className={`w-full px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
                      }`}
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="E.g., Grown in Kerala, India"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Share the product's origin story - it adds authenticity!
                    </p>
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Product Variants"
                darkMode={darkMode}
                icon="📊"
                onAdd={addVariant}
                helpText="Add different quality tiers with their prices"
              >
                {formData.variants.map((variant, index) => (
                  <VariantInput
                    key={index}
                    index={index}
                    variant={variant}
                    onChange={handleVariantChange}
                    onRemove={() => removeVariant(index)}
                    darkMode={darkMode}
                    errors={{
                      quality: errors[`variantQuality-${index}`],
                      price:   errors[`variantPrice-${index}`]
                    }}
                  />
                ))}
                <p className="text-sm text-gray-400 mt-2">
                  Example: Quality Class could be 'Premium', 'Standard' etc.
                </p>
              </FormSection>


            <FormSection
                title="Product Images"
                darkMode={darkMode}
                icon="🖼️"
                onAdd={addImage}
                helpText="Add product image URLs"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.images.map((url, index) => (
                        <ImageInput
                            key={index}
                            index={index}
                            value={url}
                            onChange={handleImageChange}
                            onRemove={removeImage}
                            darkMode={darkMode}
                            error={errors[`image-${index}`]}
                            isFirst={index === 0}
                        />
                    ))}
                </div>
            </FormSection>

            <FormActions
              onCancel={() => router.push("/admin-dashboard")}
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
      </main>
    </div>
  );
}