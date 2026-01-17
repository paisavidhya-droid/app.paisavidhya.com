// client\src\components\ui\ActiveFilterPill\ActiveFilterPill.jsx
import { FaTimes } from "react-icons/fa";
import "./ActiveFilterPill.css";
import Tooltip from "../Tooltip";

const ActiveFilterPill = ({
  label,
  onClear,
  showSeparator = false,
  children,
  clearTooltip = "Clear", 
}) => {
 const clearBtn = (
    <button
      className="btn-clear-x"
      onClick={onClear}
      aria-label={clearTooltip}
    >
      <FaTimes />
    </button>
  );

  return (
    <div className="enabled-filter-wrapper">
      <span className="enabled-filter-label">
        {label}
        {children}
      </span>

      {showSeparator && <span className="filter-separator" />}
      
      {clearTooltip ? (
        <Tooltip content={clearTooltip}>{clearBtn}</Tooltip>
      ) : (
        clearBtn
      )}
    </div>
  );
};

export default ActiveFilterPill;
