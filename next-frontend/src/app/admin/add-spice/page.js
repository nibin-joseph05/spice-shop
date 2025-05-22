// app/admin/add-spice/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FiPlus, FiAlertCircle, FiCheckCircle, FiInfo, FiEdit } from "react-icons/fi";
import { FormSection } from "@/components/admin/add-spice/FormSection";
import { ImageInput } from "@/components/admin/add-spice/ImageInput";
import { VariantInput } from "@/components/admin/add-spice/VariantInput";
import { FormActions } from "@/components/admin/add-spice/FormActions";

export default function AddSpicePage() {
  const router = useRouter();
  const [darkMode] = useState(true);
  const [existingSpiceId, setExistingSpiceId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    isAvailable: true,
    variants: [{
      qualityClass: "",
      packs: [{
        packWeightInGrams: "",
        price: "",
        stockQuantity: ""
      }]
    }],
    images: [""]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Spice name is required. This helps identify the product.";
    }

    formData.variants.forEach((variant, vIndex) => {
      if (!variant.qualityClass.trim()) {
        newErrors[`variantQuality-${vIndex}`] = "Quality class is required (e.g., 'Premium', 'Organic').";
      }

      variant.packs.forEach((pack, pIndex) => {
        if (!pack.packWeightInGrams || isNaN(parseInt(pack.packWeightInGrams))) {
          newErrors[`packWeight-${vIndex}-${pIndex}`] = "Weight is required and must be a number (in grams).";
        } else if (parseInt(pack.packWeightInGrams) <= 0) {
          newErrors[`packWeight-${vIndex}-${pIndex}`] = "Weight must be greater than 0 grams.";
        }
        if (!pack.price || isNaN(parseFloat(pack.price))) {
          newErrors[`packPrice-${vIndex}-${pIndex}`] = "Price is required and must be a valid number.";
        } else if (parseFloat(pack.price) <= 0) {
          newErrors[`packPrice-${vIndex}-${pIndex}`] = "Price must be greater than ₹0.";
        }
        if (!pack.stockQuantity || isNaN(parseInt(pack.stockQuantity))) {
          newErrors[`packStock-${vIndex}-${pIndex}`] = "Stock quantity is required and must be a number.";
        } else if (parseInt(pack.stockQuantity) < 0) {
          newErrors[`packStock-${vIndex}-${pIndex}`] = "Stock quantity cannot be negative.";
        }
      });
    });

    formData.images.forEach((url, index) => {
      if (url && !isValidUrl(url)) {
        newErrors[`image-${index}`] = "Invalid URL format. Please ensure it starts with 'http://' or 'https://'.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        qualityClass: "",
        packs: [{
          packWeightInGrams: "",
          price: "",
          stockQuantity: ""
        }]
      }]
    }));
    setErrors({});
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
    setErrors({});
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleVariantChange = (index, e) => {
    const newVariants = [...formData.variants];
    if (e.target.name === "packs") {
      newVariants[index].packs = e.target.value;
    } else {
      newVariants[index][e.target.name] = e.target.value;
    }
    setFormData(prev => ({ ...prev, variants: newVariants }));

    const errorKey = `variantQuality-${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
    const errorKey = `image-${index}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
    setErrors({});
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setErrors({});
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
    setErrorMessage("");
    setErrors({});

    if (!validateForm()) {
      setErrorMessage("Please correct the highlighted errors before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    try {


      const validImageUrls = formData.images.filter(url => url.trim() !== "");

      const spiceData = {
        name: formData.name,
        description: formData.description,
        origin: formData.origin,
        isAvailable: formData.isAvailable,
        variants: formData.variants.map(v => ({
          qualityClass: v.qualityClass,
          packs: v.packs.map(p => ({
            packWeightInGrams: parseInt(p.packWeightInGrams),
            price: parseFloat(p.price),
            stockQuantity: parseInt(p.stockQuantity)
          }))
        })),
        imageUrls: validImageUrls
      };


      const response = await fetch(`${backendUrl}/api/spices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spiceData)
      });

      const data = await response.json();

            if (!response.ok) {
              let backendErrors = {};
              let generalErrorMessage = "Failed to add spice. Please check your inputs.";

              // Handle duplicate name error
              if (response.status === 409 && data.existingId) {
                generalErrorMessage = `Spice '${formData.name}' already exists. `;
                generalErrorMessage += "Would you like to edit the existing entry instead?";

                setErrorMessage(generalErrorMessage);
                setErrors({});
                setExistingSpiceId(data.existingId);
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }

              // Validation-error or other message
              if (data.errors && Array.isArray(data.errors)) {
                data.errors.forEach(err => {
                  backendErrors[err.field] = err.message;
                });
                generalErrorMessage = "Some fields have issues. Please review them.";
              } else if (data.message) {
                generalErrorMessage = data.message;
              }

              setErrors(backendErrors);
              setErrorMessage(generalErrorMessage);
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }


      setFormData({
        name: "",
        description: "",
        origin: "",
        isAvailable: true,
        variants: [{
          qualityClass: "",
          packs: [{
            packWeightInGrams: "",
            price: "",
            stockQuantity: ""
          }]
        }],
        images: [""]
      });
      setSuccessMessage("🎉 Spice product added successfully! You can now view it in your inventory.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("Network error or server unreachable. Please check your connection and try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="p-4 mb-8 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md animate-fade-in-down">
              <p className="font-semibold flex items-center gap-2 text-lg">
                <FiCheckCircle className="text-green-500 text-2xl" /> {successMessage}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/admin/spice-list")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  View Spice List <FiInfo />
                </button>
                <button
                  onClick={() => { setSuccessMessage(""); setErrors({}); }}
                  className="px-4 py-2 border border-green-500 text-green-700 hover:bg-green-50 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Add Another Spice <FiPlus />
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 mb-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md animate-fade-in-down">
              <p className="font-semibold flex items-center gap-2 text-lg">
                <FiAlertCircle className="text-red-500 text-2xl" /> {errorMessage}
              </p>
              {existingSpiceId && (
                <div className="mt-4">
                  <button
                    onClick={() => router.push(`/admin/edit-spice/${existingSpiceId}`)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-300 flex items-center gap-2"
                  >
                    <FiEdit /> Edit Existing Spice
                  </button>
                </div>
              )}
              {!existingSpiceId && (
                <p className="text-sm mt-2">
                  Please review the form for highlighted errors and try again.
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection
              title="Basic Information"
              darkMode={darkMode}
              icon="📦"
              helpText="Start by providing the essential details about your spice product. Fields marked with * are crucial."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Spice Name *
                    {errors.name && (
                      <span className="ml-2 text-red-500 text-sm font-normal italic flex items-center gap-1">
                        <FiAlertCircle size={14} /> {errors.name}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
                    } ${errors.name ? "border-red-500 ring-1 ring-red-500" : ""}`}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="E.g., Organic Turmeric Powder"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : null}
                  />
                  {errors.name && <p id="name-error" className="sr-only">{errors.name}</p>}
                  <p className="mt-1 text-xs text-gray-400">This is the main identifier for your product.</p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                    <span className="ml-2 text-gray-400 text-xs font-normal">(Optional but highly recommended)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
                    }`}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add a compelling product description, highlighting its benefits, taste notes, or uses..."
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    A good description helps customers make informed decisions and boosts sales.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="origin" className="block text-sm font-medium mb-2">
                    Origin
                    <span className="ml-2 text-gray-400 text-xs font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode ? "bg-gray-700 border-gray-600 focus:border-amber-500" : "bg-gray-100 border-gray-300 focus:border-amber-500"
                    }`}
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="E.g., Grown in Kerala, India or Sourced from Madagascar"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Share the product's origin story - it adds authenticity and value.
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Product Variants"
              darkMode={darkMode}
              icon="📊"
              onAdd={addVariant}
              helpText="Define different quality tiers or types for your spice. Each variant can have multiple pack sizes with distinct prices and stock levels."
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
                    packs: variant.packs.map((_, pIndex) => ({
                      weight: errors[`packWeight-${index}-${pIndex}`],
                      price: errors[`packPrice-${index}-${pIndex}`],
                      stock: errors[`packStock-${index}-${pIndex}`],
                    }))
                  }}
                />
              ))}
              <p className="text-sm text-gray-400 mt-4 flex items-center gap-1">
                <FiInfo size={14} /> Example: A 'Turmeric' product might have 'Premium' and 'Standard' quality classes.
              </p>
            </FormSection>

            <FormSection
              title="Product Images"
              darkMode={darkMode}
              icon="🖼️"
              onAdd={addImage}
              helpText="Showcase your spice product with high-quality images. Provide direct image URLs here."
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
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                <FiInfo size={14} /> Provide direct links to your images (e.g., from a CDN or image hosting service).
              </p>
            </FormSection>

            <FormActions
              onCancel={() => router.push("/admin/dashboard")}
              isSubmitting={isSubmitting}
            />
          </form>
        </div>
      </main>
    </div>
  );
}