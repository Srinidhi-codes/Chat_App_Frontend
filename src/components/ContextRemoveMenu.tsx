import React from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { MdOutlineCancel } from "react-icons/md";

interface ContextMenuProps {
    x: number;
    y: number;
    onDelete: () => void;
    onCancel: () => void;
}

const ContextRemoveMenu: React.FC<ContextMenuProps> = ({ x, y, onDelete, onCancel }) => {
    return (
        <div
            className="bg-[#2c2e3b] text-white rounded-md shadow p-2 w-[130px] z-50 noselect"
            style={{
                position: "fixed",
                top: `${y}px`,
                left: `${x}px`,
            }}
        >
            <div
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-3 py-1"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <RiDeleteBin2Fill /> Delete
            </div>
            <div
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 px-3 py-1"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    onCancel();
                }}
            >
                <MdOutlineCancel /> Cancel
            </div>
        </div>
    );
};

export default ContextRemoveMenu;
