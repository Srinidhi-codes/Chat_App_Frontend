import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getColor } from '@/lib/utils'
import { useAppStore } from '@/store'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { FaEdit } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { LuLogOut } from "react-icons/lu";
import { useMutation } from '@apollo/client'
import { LOGOUT_MUTATION } from '../../graphql/mutation'


function ProfileInfo() {
    const { userInfo, setUserInfo, setSelectedChatData, setSelectedChatType, setSelectedChatMessages, closeChat } = useAppStore();
    const router = useRouter();
    const [logoutMutation, { loading, error, data }] = useMutation(LOGOUT_MUTATION);

    const logout = async () => {
        try {
            const result = await logoutMutation();
            if (result?.data?.logout) {
                setSelectedChatData([]),
                    setSelectedChatType(''),
                    setSelectedChatMessages([]),
                    closeChat();
                setUserInfo(null);
                localStorage.setItem("token", "");
                router.push('/auth');
            }

        } catch (err) {
            console.error("Logout failed", err);
        }
    }
    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]'>
            <div className="flex gap-5 items-center justify-center cursor-pointer" onClick={() => router.push('/profile')}>
                <div className='w-12 h-12 relative'>
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {userInfo?.image ? (
                            <AvatarImage src={userInfo.image} alt="profile" className="object-cover w-full h-full bg-black" />
                        ) : (
                            <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(userInfo?.color)}`}>
                                {userInfo?.firstName
                                    ? userInfo?.firstName.charAt(0)
                                    : userInfo?.email?.charAt(0)}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className='transition-transform duration-200 hover:translate-y-[3px]'>
                    {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName}` : ""}
                </div>
            </div>
            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger><LuLogOut className='cursor-pointer text-xl font-medium text-white transition-transform duration-200 hover:translate-x-1 hover:text-red-500' onClick={logout} /></TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
        </div>
    )
}

export default ProfileInfo