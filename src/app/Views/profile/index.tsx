'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { IoArrowBack } from 'react-icons/io5';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { colors, getColor } from '@/lib/utils';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLazyQuery, useMutation } from '@apollo/client';
import { UPDATE_USER_INFO } from './graphql/mutation';
import { GET_USER_INFO } from './graphql/query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ProfilePage() {
    const { userInfo, setUserInfo } = useAppStore();
    const router = useRouter();

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        image: null as string | null,
    });

    const [selectedColor, setSelectedColor] = useState(0);
    const [hovered, setHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [updateUserInfo] = useMutation(UPDATE_USER_INFO);
    const [fetchUserData, { data: fetchedData }] = useLazyQuery(GET_USER_INFO);

    useEffect(() => {
        if (!userInfo) {
            fetchUserData();
        } else {
            setUserData({
                firstName: userInfo.firstName || '',
                lastName: userInfo.lastName || '',
                image: userInfo.image || null,
            });
            setSelectedColor(userInfo.color || 0);
        }
    }, [userInfo]);

    useEffect(() => {
        if (fetchedData?.getUserInfo) {
            setUserInfo(fetchedData.getUserInfo);
        }
    }, [fetchedData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAssetUpload = async (file: File, type: 'image' | 'video') => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", type === "image" ? "images_preset" : "videos_preset");

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const api = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
            const res = await axios.post(api, data);
            const assetUrl = res.data.secure_url;
            setUserData((prev) => ({
                ...prev,
                image: assetUrl,
            }));
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload asset');
            return null;
        }
    };


    const validateProfile = () => {
        if (!userData.firstName.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!userData.lastName.trim()) {
            toast.error('Last name is required');
            return false;
        }
        return true;
    };

    const saveChanges = async () => {
        if (!validateProfile()) return;

        try {
            const { firstName, lastName } = userData;
            const { data } = await updateUserInfo({
                variables: {
                    input: {
                        firstName,
                        lastName,
                        color: selectedColor,
                        image: userData.image,
                    },
                },
            });

            if (data?.updateUserInfo) {
                setUserInfo(data.updateUserInfo);
                toast.success('Updated User Info Successfully');
            } else {
                toast.error('Something went wrong: No data returned');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Unexpected error');
        }
    };

    const handleNavigate = () => {
        // if (userInfo?.profileSetup) {
        //     router.push('/chat');
        // } else {
        //     toast.error('Complete profile first to access chat.');
        // }
    };

    const handleFile = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imageUrl = await handleAssetUpload(file, 'image');
        if (imageUrl) {
            setUserData((prev) => ({ ...prev, image: imageUrl }));
        }
    };

    const handleDeleteImage = () => {
        setUserData((prev) => ({ ...prev, image: null }));
    };

    return (
        <div className="bg-[#353746] h-[100vh] flex items-center justify-center flex-col gap-10">
            <div className="flex flex-col gap-10 w-[80vw] md:w-max">
                <div>
                    <IoArrowBack onClick={handleNavigate} className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
                </div>
                <div className="grid grid-cols-2">
                    <div
                        className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
                            {userData.image ? (
                                <AvatarImage src={userData.image} alt="profile" className="object-cover w-full h-full bg-black" />
                            ) : (
                                <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                                    {userData.firstName
                                        ? userData.firstName.charAt(0)
                                        : userInfo?.email?.charAt(0)}
                                </div>
                            )}
                        </Avatar>
                        {hovered && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                                onClick={userData.image ? handleDeleteImage : handleFile}
                            >
                                {userData.image ? (
                                    <FaTrash className="text-white text-3xl cursor-pointer" />
                                ) : (
                                    <FaPlus className="text-white text-3xl cursor-pointer" />
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageUpload}
                            name="profile-image"
                            accept=".png, .jpg, .jpeg, .svg, .webp"
                        />
                    </div>
                    <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
                        <Input
                            placeholder="Email"
                            type="email"
                            disabled
                            value={userInfo?.email || ''}
                            className="rounded-lg p-6 bg-[#8d92b1] border-none w-full"
                        />
                        <Input
                            placeholder="First Name"
                            type="text"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleChange}
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none w-full"
                        />
                        <Input
                            placeholder="Last Name"
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleChange}
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none w-full"
                        />
                        <div className="w-full flex gap-5">
                            {colors?.map((color, index) => (
                                <div
                                    key={index}
                                    className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${selectedColor === index ? 'outline outline-white' : ''}`}
                                    onClick={() => setSelectedColor(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <Button
                        className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
