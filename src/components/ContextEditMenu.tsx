import React from 'react';
import { FaCopy, FaEdit } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';

interface ContextMenuProps {
    x: number;
    y: number;
    onEdit: () => void;
    onCopy: () => void;
    onCancel: () => void;
    isUserMessage: boolean;
}

const ContextEditMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onEdit,
    onCopy,
    onCancel,
    isUserMessage,
}) => {
    return (
        <div
            style={{ top: y, left: x - 90, position: 'absolute' }}
            className="z-50 bg-[#2c2e3b] text-white text-left rounded-md shadow-md px-4 py-2"
        >
            {isUserMessage && (
                <div
                    className="flex items-center gap-3 hover:bg-white/10 p-2 cursor-pointer hover:text-yellow-500"
                    onClick={onEdit}
                >
                    <FaEdit /> Edit
                </div>
            )}
            <div
                className="flex items-center gap-3 hover:bg-white/10 p-2 cursor-pointer hover:text-blue-500"
                onClick={onCopy}
            >
                <FaCopy /> Copy
            </div>
            <div
                className="flex items-center gap-3 hover:bg-white/10 p-2 cursor-pointer hover:text-blue-500"
                onClick={onCancel}
            >
                <MdOutlineCancel /> Cancel
            </div>
        </div>
    );
};

export default ContextEditMenu;
