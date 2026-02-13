import { useState, useEffect } from 'react';
import { DEFAULT_PIN } from '../data';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function PinModal({ isOpen, onClose, onSuccess, title = 'Enter Parent PIN' }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === DEFAULT_PIN) {
            onSuccess();
            onClose();
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, 1000);
          }
        }, 100);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h2>

        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold border-4 transition-all ${
                error
                  ? 'border-red-500 bg-red-50'
                  : pin.length > i
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-semibold">Incorrect PIN</p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 text-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl transition-colors active:scale-95"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={onClose}
            className="h-16 text-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl transition-colors active:scale-95"
          >
            Cancel
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          Default PIN: 1234
        </p>
      </div>
    </div>
  );
}
