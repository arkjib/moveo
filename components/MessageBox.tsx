
import React from 'react';
import Button from './common/Button';

interface MessageBoxProps {
  message: string;
  onClose: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 border-[#f7a01c]">
        <p className="text-white text-lg mb-6 font-semibold">{message}</p>
        <Button variant="primary" onClick={onClose} className="py-2 px-8">
          OK
        </Button>
      </div>
    </div>
  );
};

export default MessageBox;
