// components/admin/add-spice/FormSection.js
import { FiPlus } from "react-icons/fi";

export const FormSection = ({ title, children, darkMode, onAdd, icon }) => (
  <div className={`p-6 rounded-2xl ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"} shadow-xl transition-all mb-8`}>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
        >
          <FiPlus /> Add
        </button>
      )}
    </div>
    {children}
  </div>
);