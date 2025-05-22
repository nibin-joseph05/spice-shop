// app/admin/edit-spice/[id]/page.js
"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { FiSave, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { FormSection } from "@/components/admin/add-spice/FormSection";
import { ImageInput } from "@/components/admin/add-spice/ImageInput";
import { VariantInput } from "@/components/admin/add-spice/VariantInput";
import { FormActions } from "@/components/admin/add-spice/FormActions";

export default function EditSpicePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [darkMode] = useState(true);
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [existingSpiceId, setExistingSpiceId] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchSpice = async () => {
      try {
        // Use params.id directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch spice');
        const data = await response.json();

        setFormData({
          ...data,
          variants: data.variants.map(v => ({
            ...v,
            packs: v.packs.map(p => ({
              ...p,
              packWeightInGrams: p.packWeightInGrams.toString(),
              price: p.price.toString(),
              stockQuantity: p.stockQuantity.toString()
            }))
          })),
          images: data.imageUrls || []
        });

        setOriginalData({
          ...data,
          variants: data.variants.map(v => ({
            ...v,
            packs: v.packs.map(p => ({
              ...p,
              packWeightInGrams: p.packWeightInGrams.toString(),
              price: p.price.toString(),
              stockQuantity: p.stockQuantity.toString()
            }))
          })),
          images: data.imageUrls || []
        });

      } catch (err) {
        setErrorMessage(err.message);
      }
    };

    // Add params.id to the dependency array
    fetchSpice();
  }, [params.id]); // Changed back to params.id


  const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (e) {
        return false;
      }
    };

  const checkDirty = (current) => {
    return JSON.stringify(current) !== JSON.stringify(originalData);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Spice name is required.";
    }

    formData.variants.forEach((variant, vIndex) => {
      if (!variant.qualityClass.trim()) {
        newErrors[`variantQuality-${vIndex}`] = "Quality class is required.";
      }

      variant.packs.forEach((pack, pIndex) => {
        if (!pack.packWeightInGrams || isNaN(parseInt(pack.packWeightInGrams))) {
          newErrors[`packWeight-${vIndex}-${pIndex}`] = "Weight is required.";
        } else if (parseInt(pack.packWeightInGrams) <= 0) {
          newErrors[`packWeight-${vIndex}-${pIndex}`] = "Weight must be > 0g.";
        }

        if (!pack.price || isNaN(parseFloat(pack.price))) {
          newErrors[`packPrice-${vIndex}-${pIndex}`] = "Price is required.";
        } else if (parseFloat(pack.price) <= 0) {
          newErrors[`packPrice-${vIndex}-${pIndex}`] = "Price must be > ₹0.";
        }

        if (!pack.stockQuantity || isNaN(parseInt(pack.stockQuantity))) {
          newErrors[`packStock-${vIndex}-${pIndex}`] = "Stock is required.";
        } else if (parseInt(pack.stockQuantity) < 0) {
          newErrors[`packStock-${vIndex}-${pIndex}`] = "Stock cannot be negative.";
        }
      });
    });

    formData.images.forEach((url, index) => {
      if (url && !isValidUrl(url)) {
        newErrors[`image-${index}`] = "Invalid image URL format.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      setIsDirty(checkDirty(newData));
      return newData;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index][name] = value;
      const newData = { ...prev, variants: newVariants };
      setIsDirty(checkDirty(newData));
      return newData;
    });
    if (errors[`variantQuality-${index}`]) {
      setErrors(prev => ({ ...prev, [`variantQuality-${index}`]: undefined }));
    }
  };

  const handlePackChange = (vIndex, pIndex, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[vIndex].packs[pIndex][name] = value;
      const newData = { ...prev, variants: newVariants };
      setIsDirty(checkDirty(newData));
      return newData;
    });
    if (errors[`packWeight-${vIndex}-${pIndex}`]) {
      setErrors(prev => ({
        ...prev,
        [`packWeight-${vIndex}-${pIndex}`]: undefined,
        [`packPrice-${vIndex}-${pIndex}`]: undefined,
        [`packStock-${vIndex}-${pIndex}`]: undefined
      }));
    }
  };

  const handleImageChange = (index, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = value;
      const newData = { ...prev, images: newImages };
      setIsDirty(checkDirty(newData));
      return newData;
    });
    if (errors[`image-${index}`]) {
      setErrors(prev => ({ ...prev, [`image-${index}`]: undefined }));
    }
  };

  const addVariant = () => {
    setFormData(prev => {
      const newData = {
        ...prev,
        variants: [...prev.variants, {
          qualityClass: "",
          packs: [{ packWeightInGrams: "", price: "", stockQuantity: "" }]
        }]
      };
      setIsDirty(checkDirty(newData));
      return newData;
    });
  };

  const removeVariant = (index) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      };
      setIsDirty(checkDirty(newData));
      return newData;
    });
  };

  const addImage = () => {
    setFormData(prev => {
      const newData = { ...prev, images: [...prev.images, ""] };
      setIsDirty(checkDirty(newData));
      return newData;
    });
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      };
      setIsDirty(checkDirty(newData));
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setErrors({});

    if (!validateForm()) {
      setErrorMessage("Please fix the validation errors before saving.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      const spiceData = {
        ...formData,
        variants: formData.variants.map(v => ({
          ...v,
          packs: v.packs.map(p => ({
            ...p,
            packWeightInGrams: parseInt(p.packWeightInGrams),
            price: parseFloat(p.price),
            stockQuantity: parseInt(p.stockQuantity)
          }))
        })),
        imageUrls: formData.images.filter(url => url.trim() !== "")
      };

      const response = await fetch(
        // Use params.id directly
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${params.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spiceData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.existingId) {
          setErrorMessage(`Spice '${formData.name}' already exists.`);
          setExistingSpiceId(data.existingId);
          return;
        }

        let backendErrors = {};
        if (data.errors) {
          data.errors.forEach(err => backendErrors[err.field] = err.message);
        }
        setErrors(backendErrors);
        setErrorMessage(data.message || "Update failed");
        return;
      }

      setSuccessMessage("Spice updated successfully!");
      setOriginalData(formData);
      setIsDirty(false);

    } catch (err) {
      setErrorMessage("Network error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-900 text-gray-100 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">
            Loading spice details...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent mb-8">
            Edit {formData.name}
          </h1>

          {successMessage && (
            <div className="p-4 mb-8 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <FiCheckCircle className="inline-block mr-2" /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-4 mb-8 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <FiAlertCircle className="inline-block mr-2" /> {errorMessage}
              {existingSpiceId && (
                <button
                  onClick={() => router.push(`/admin/edit-spice/${existingSpiceId}`)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Go to Existing Spice
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormSection
              title="Basic Information"
              darkMode={darkMode}
              icon="📦"
              helpText="Update core details of your spice product. All fields are required unless marked optional."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Spice Name *
                    {errors.name && (
                      <span className="ml-2 text-red-500 text-sm italic">
                        <FiAlertCircle className="inline mr-1" /> {errors.name}
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
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                    <span className="ml-2 text-gray-400 text-xs">(Optional)</span>
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
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="origin" className="block text-sm font-medium mb-2">
                    Origin
                    <span className="ml-2 text-gray-400 text-xs">(Optional)</span>
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
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Product Variants"
              darkMode={darkMode}
              icon="📊"
              onAdd={addVariant}
              helpText="Manage different quality tiers and their pricing. Each variant must have at least one pack size."
            >
              {formData.variants.map((variant, index) => (
                <VariantInput
                  key={index}
                  index={index}
                  variant={variant}
                  onChange={handleVariantChange}
                  onRemove={removeVariant}
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
            </FormSection>

            <FormSection
              title="Product Images"
              darkMode={darkMode}
              icon="🖼️"
              onAdd={addImage}
              helpText="Update product images. First image will be used as main display image."
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
                    showPreview={true}
                  />
                ))}
              </div>
            </FormSection>

            <FormActions
              onCancel={() => {
                if (isDirty && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  return;
                }
                router.back();
              }}
              isSubmitting={isSubmitting}
              submitLabel="Save Changes"
            />
          </form>
        </div>
      </main>
    </div>
  );
}