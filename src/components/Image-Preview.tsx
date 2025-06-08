import { useAppStore } from '@/store';
import axios from 'axios';
import Image from 'next/image';
import React from 'react';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';

interface ImagePreviewProps {
    showImage: boolean;
    imageURL: string | null;
    setShowImage: (value: boolean) => void;
    setImageUrl: (value: string | null) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ showImage, imageURL, setShowImage, setImageUrl }) => {
    const { setFileDownloadProgress, setIsDownloading } = useAppStore();

    const downloadFile = async (fileUrl: string) => {
        try {
            setIsDownloading(true);
            setFileDownloadProgress(0);
            const fileName = fileUrl.split('/').pop();

            const response = await axios.get(fileUrl, {
                responseType: 'blob',
                onDownloadProgress: ({ loaded, total }) => {
                    if (total) {
                        setFileDownloadProgress(Math.round((loaded * 100) / total));
                    }
                }
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
            setFileDownloadProgress(0);
        }
    };

    if (!showImage || !imageURL) return null;

    return (
        <div className='fixed z-[1000] top-0 left-0 h-full w-full flex items-center justify-center backdrop-blur-lg'>
            <div>
                <Image src={imageURL} alt="Image View" width={300} height={300} className='h-[80vh] w-auto bg-cover rounded-xl' />
            </div>
            <div className='flex gap-5 fixed top-0 mt-5'>
                <button
                    className='bg-white/10 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                    onClick={() => downloadFile(imageURL)}
                >
                    <IoMdArrowRoundDown />
                </button>
                <button
                    className='bg-white/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                    onClick={() => {
                        setShowImage(false);
                        setImageUrl(null);
                    }}
                >
                    <IoCloseSharp />
                </button>
            </div>
        </div>
    );
};

export default ImagePreview;
