import React from 'react';

interface ErrorMessageProps {
    message: string | null;
    onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full flex justify-center items-center">
            <div className="bg-red-600 text-white p-4 rounded-md shadow-lg">
                <span>{message}</span>
                <button 
                    className="ml-4 bg-transparent border-0 text-white font-semibold"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ErrorMessage;
