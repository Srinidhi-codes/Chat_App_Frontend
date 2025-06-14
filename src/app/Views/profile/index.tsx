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
    const { userInfo, setUserInfo, isOtherProfile, otherProfileData, setIsOtherProfile, setFileUploadProgress, setIsUploading, theme } = useAppStore();
    const router = useRouter();

    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        image: null as string | null,
        email: '',
        theme
    });

    const [selectedColor, setSelectedColor] = useState(0);
    const [hovered, setHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [updateUserInfo] = useMutation(UPDATE_USER_INFO);
    const [fetchUserData, { data: fetchedData }] = useLazyQuery(GET_USER_INFO);

    useEffect(() => {
        if (isOtherProfile && otherProfileData) {
            setUserData({
                firstName: otherProfileData.firstName || '',
                lastName: otherProfileData.lastName || '',
                image: otherProfileData.image || null,
                email: otherProfileData.email || '',
                theme
            });
            setSelectedColor(otherProfileData.color || 0);
        } else if (userInfo) {
            setUserData({
                firstName: userInfo.firstName || '',
                lastName: userInfo.lastName || '',
                image: userInfo.image || null,
                email: userInfo.email || '',
                theme
            });
            setSelectedColor(userInfo.color || 0);
        } else {
            fetchUserData();
        }
    }, [isOtherProfile, otherProfileData, userInfo]);


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

            const res = await axios.post(api, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: any) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileUploadProgress(percent);
                },
            });

            const assetUrl = res.data.secure_url;

            // Only do this here if this function is responsible for updating state
            setUserData((prev) => ({
                ...prev,
                image: assetUrl,
            }));

            return assetUrl;
        } catch (error) {
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
                        theme
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
        setIsOtherProfile(false);
        router.push('/chat');
    };


    const handleFile = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            setFileUploadProgress(0);
            const imageUrl = await handleAssetUpload(file, 'image');
            if (imageUrl) {
                setUserData((prev) => ({ ...prev, image: imageUrl }));
                setIsUploading(false);
                setFileUploadProgress(0);
            }

        } catch (error) {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = () => {
        setUserData((prev) => ({ ...prev, image: null }));
    };

    return (
        <div className={`${theme === 'dark' ? 'text-white bg-[#353746]' : 'text-black bg-white border-t'} md:h-[100vh] h-[100dvh] flex items-center justify-center flex-col gap-10`}>
            <div className="flex flex-col gap-10 w-[80vw] md:w-max">
                <div>
                    <IoArrowBack onClick={handleNavigate} className={`text-2xl lg:text-6xl cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
                    {/* Avatar Section */}
                    <div
                        className="w-full flex justify-center"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <div className="relative h-32 w-32 md:h-48 md:w-48 flex items-center justify-center">
                            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden">
                                {userData.image ? (
                                    <AvatarImage
                                        src={userData.image}
                                        alt="profile"
                                        className="object-cover w-full h-full bg-black"
                                    />
                                ) : (
                                    <div className={`uppercase h-32 w-32 md:h-48 md:w-48 text-4xl md:text-5xl border flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                                        {userData.firstName
                                            ? userData.firstName.charAt(0)
                                            : userInfo?.email?.charAt(0)}
                                    </div>
                                )}
                            </Avatar>

                            {hovered && !isOtherProfile && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                                    onClick={userData.image ? handleDeleteImage : handleFile}
                                >
                                    {userData.image ? (
                                        <FaTrash className="text-white text-2xl md:text-3xl cursor-pointer" />
                                    ) : (
                                        <FaPlus className="text-white text-2xl md:text-3xl cursor-pointer hover:rotate-90 duration-300 transition-all" />
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
                    </div>

                    {/* Form Section */}
                    <div className="w-[15rem] flex flex-col gap-4 md:gap-5 items-center justify-center">
                        <Input
                            placeholder="Email"
                            type="email"
                            disabled
                            value={userData?.email || ''}
                            readOnly={isOtherProfile}
                            className="rounded-lg p-4 md:p-6 bg-[#8d92b1] border-none w-full"
                        />
                        <Input
                            placeholder="First Name"
                            type="text"
                            name="firstName"
                            value={userData.firstName}
                            readOnly={isOtherProfile}
                            onChange={handleChange}
                            className="rounded-lg p-4 md:p-6 w-full"
                        />
                        <Input
                            placeholder="Last Name"
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            readOnly={isOtherProfile}
                            onChange={handleChange}
                            className="rounded-lg p-4 md:p-6 w-full capitalize"
                        />
                        {!isOtherProfile && <div className="w-full flex gap-4 flex-wrap justify-center md:justify-start">
                            {colors?.map((color, index) => (
                                <div
                                    key={index}
                                    className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${selectedColor === index ? 'outline outline-white' : ''}`}
                                    onClick={() => setSelectedColor(index)}
                                />
                            ))}
                        </div>}
                    </div>
                </div>

                {!isOtherProfile && (
                    <Button
                        className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </Button>
                )}
            </div>
        </div>
    );
}
