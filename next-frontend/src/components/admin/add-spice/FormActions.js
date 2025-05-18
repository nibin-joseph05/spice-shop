// components/admin/add-spice/FormActions.js
export const FormActions = ({ onCancel, isSubmitting }) => (
  <div className="flex justify-end gap-4 mt-8">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className={`px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all ${
        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isSubmitting ? "Adding..." : "Add Spice Product"}
    </button>
  </div>
);