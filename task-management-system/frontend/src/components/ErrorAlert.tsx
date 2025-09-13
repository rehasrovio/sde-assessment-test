import React from "react";

interface ErrorAlertProps {
  error: string;
  onClose?: () => void;
  type?: "error" | "warning" | "info";
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onClose,
  type = "error",
}) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "❌";
    }
  };

  return (
    <div className={`error-alert ${type}`}>
      <div className="error-content">
        <span className="error-icon">{getIcon()}</span>
        <span className="error-message">{error}</span>
        {onClose && (
          <button className="btn btn-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
