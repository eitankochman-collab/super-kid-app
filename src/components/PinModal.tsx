import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_PIN } from '../data';
import { PIN_LENGTH, PIN_ERROR_CLEAR_MS, PIN_SUBMIT_DELAY_MS } from '../constants';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export function PinModal({ isOpen, onClose, onSuccess, title = 'הכנס קוד הורים' }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          if (newPin === DEFAULT_PIN) {
            onSuccess();
            onClose();
          } else {
            setError(true);
            setTimeout(() => {
              setPin('');
              setError(false);
            }, PIN_ERROR_CLEAR_MS);
          }
        }, PIN_SUBMIT_DELAY_MS);
      }
    }
  }, [pin, onSuccess, onClose]);

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div ref={modalRef} className="modal-content bg-white rounded-3xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{title}</h2>

        <div className="flex justify-center gap-3 mb-8" role="status" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-bold border-3 transition-all ${
                error
                  ? 'border-red-500 bg-red-50'
                  : pin.length > i
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-semibold" role="alert">
            קוד שגוי
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              className="h-14 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-colors active:scale-95"
              aria-label={`Digit ${digit}`}
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 text-base font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl transition-colors active:scale-95"
            aria-label="Clear PIN"
          >
            מחיקה
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition-colors active:scale-95"
            aria-label="Digit 0"
          >
            0
          </button>
          <button
            onClick={onClose}
            className="h-14 text-base font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl transition-colors active:scale-95"
            aria-label="Cancel PIN entry"
          >
            ביטול
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-4">
          קוד ברירת מחדל: 1234
        </p>
      </div>
    </div>
  );
}
