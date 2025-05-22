// components/admin/add-spice/FormSection.js
import { FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi"; // Added Chevron icons
import { useState } from "react"; // Import useState for collapse functionality

export const FormSection = ({ title, children, darkMode, onAdd, icon, helpText }) => {
  const [isOpen, setIsOpen] = useState(true); // State to manage collapse/expand

  return (
    <div className={`p-6 rounded-2xl ${
      darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"
    } shadow-xl transition-all duration-300 mb-8`}>
      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <h2 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
          {isOpen ? <FiChevronUp className="ml-2" /> : <FiChevronDown className="ml-2" />}
        </h2>
        {onAdd && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd(); }} // Stop propagation to prevent collapsing
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <FiPlus /> Add
          </button>
        )}
      </div>
      {helpText && <p className="text-sm text-gray-400 mb-4">{helpText}</p>}

      {isOpen && ( // Conditionally render children based on isOpen state
        <div className="animate-fade-in-down">
          {children}
        </div>
      )}
    </div>
  );
};
