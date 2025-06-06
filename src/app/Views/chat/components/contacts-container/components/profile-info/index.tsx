'use client'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getColor } from '@/lib/utils'
import { useAppStore } from '@/store'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { LuLogOut } from "react-icons/lu";
import { useApolloClient, useMutation } from '@apollo/client'
import { LOGOUT_MUTATION } from '../../graphql/mutation'
import { useRouter } from 'next/navigation'
import clsx from 'clsx';

function ProfileInfo() {
    const {
        userInfo,
        setUserInfo,
        resetChatState
    } = useAppStore();

    const router = useRouter();
    const [logoutMutation, { loading }] = useMutation(LOGOUT_MUTATION);
    const client = useApolloClient();



    const logout = async () => {
        try {
            const result = await logoutMutation();
            resetChatState();
            setUserInfo(null);
            await client.clearStore();
            localStorage.removeItem("token");
            localStorage.removeItem("app-store");
            router.push('/auth');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]'>
            <div
                className="flex gap-5 items-center justify-center cursor-pointer"
                onClick={() => router.push('/profile')}
            >
                <div className='w-12 h-12 relative'>
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {userInfo?.image ? (
                            <AvatarImage
                                src={userInfo.image}
                                alt="profile"
                                className="object-cover w-full h-full bg-black"
                            />
                        ) : (
                            <div className={clsx(
                                "uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full",
                                getColor(userInfo?.color)
                            )}>
                                {userInfo?.firstName
                                    ? userInfo.firstName.charAt(0)
                                    : userInfo?.email?.charAt(0)}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className='transition-transform duration-200 hover:translate-y-[3px] text-white'>
                    {userInfo?.firstName && userInfo?.lastName
                        ? `${userInfo.firstName} ${userInfo.lastName}`
                        : ""}
                </div>
            </div>

            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <LuLogOut
                                onClick={logout}
                                className={clsx(
                                    'cursor-pointer text-xl font-medium text-white transition-transform duration-200 hover:translate-x-1',
                                    {
                                        'opacity-50 pointer-events-none': loading,
                                        'hover:text-red-500': !loading
                                    }
                                )}
                            />
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default ProfileInfo;
