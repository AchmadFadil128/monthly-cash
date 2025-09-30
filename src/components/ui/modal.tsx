import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

interface ModalProps extends ComponentPropsWithoutRef<'div'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, className, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div
          ref={ref}
          className={cn(
            "relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800">
                {title}
              </h3>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };