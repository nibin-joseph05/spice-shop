// components/admin/add-spice/FormActions.js
// Updated to handle more prominent button styles and loading indicators
export const FormActions = ({ onCancel, isSubmitting }) => (
  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
      disabled={isSubmitting} // Disable cancel button during submission
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className={`relative px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
        ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding Spice...
        </span>
      ) : (
        "Add Spice Product"
      )}
    </button>
  </div>
);