import React from 'react';
import { FaCopy, FaEdit } from 'react-icons/fa';
import { BiMessageSquareX } from "react-icons/bi";
import { MdOutlineCancel } from 'react-icons/md';

interface ContextMenuProps {
    x: number;
    y: number;
    onEdit: () => void;
    onRemove: () => void;
    onCopy: () => void;
    onCancel: () => void;
    isUserMessage: boolean;
}

const ContextEditMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onEdit,
    onRemove,
    onCopy,
    onCancel,
    isUserMessage,
}) => {
    return (
        <div
            style={{ top: y, left: x - 90, position: 'absolute' }}
            className="z-50 min-w-[130px] bg-[#1e1f29] text-white/80 rounded-xl shadow-2xl px-2 py-2 backdrop-blur-sm border border-white/10"
        >
            {isUserMessage && (
                <MenuItem onClick={onEdit} color="text-xl" icon={<FaEdit />}>
                    Edit
                </MenuItem>
            )}
            {isUserMessage && (
                <MenuItem onClick={onRemove} color="text-xl" icon={<BiMessageSquareX />}>
                    Delete
                </MenuItem>
            )}
            <MenuItem onClick={onCopy} color="text-xl" icon={<FaCopy />}>
                Copy
            </MenuItem>
            <MenuItem onClick={onCancel} color="text-xl" icon={<MdOutlineCancel />}>
                Cancel
            </MenuItem>
        </div>
    );
};

interface MenuItemProps {
    onClick: () => void;
    icon: React.ReactNode;
    color?: string;
    children: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, icon, children, color = "text-white" }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer hover:bg-white/10 hover:scale-[1.03] transition-all duration-200 ease-in-out ${color}`}
    >
        {icon} <span className="text-sm">{children}</span>
    </div>
);

export default ContextEditMenu;
