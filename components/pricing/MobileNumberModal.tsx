import { useState } from "react";

interface MobileNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mobileNumber: string) => void;
  isLoading?: boolean;
}

export function MobileNumberModal({ isOpen, onClose, onConfirm, isLoading = false }: MobileNumberModalProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");

  const validateMobileNumber = (number: string): boolean => {
    // Indian mobile number validation: 10 digits, starts with 6-9
    const regex = /^[6-9]\d{9}$/;
    return regex.test(number);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber) {
      setError("Please enter your mobile number");
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setError("");
    onConfirm(mobileNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">Payment Confirmation</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-stone-600 text-sm mb-4">
          To send you payment success messages, please provide your mobile number.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium text-stone-700 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your 10-digit mobile number"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              maxLength={10}
            />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </form>

        <p className="text-xs text-stone-400 mt-3 text-center">
          Your mobile number will only be used for payment confirmation messages.
        </p>
      </div>
    </div>
  );
}