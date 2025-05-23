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
import { IoPowerSharp } from 'react-icons/io5'
import { useMutation } from '@apollo/client'
import { LOGOUT_MUTATION } from '../../graphql/mutation'


function ProfileInfo() {
    const { userInfo, setUserInfo } = useAppStore();
    const router = useRouter();
    const [logoutMutation, { loading, error, data }] = useMutation(LOGOUT_MUTATION);

    const logout = async () => {
        try {
            const result = await logoutMutation();
            if (result?.data?.logout) {
                setUserInfo(null);
                router.push('/auth');
            }

        } catch (err) {
            console.error("Logout failed", err);
        }
    }
    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]'>
            <div className="flex gap-3 items-center justify-center">
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
            </div>
            <div>
                {userInfo?.firstName && userInfo?.lastName ? `${userInfo?.firstName} ${userInfo?.lastName}` : ""}
            </div>
            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger><FaEdit className='text-purple-500 cursor-pointer text-xl font-medium' onClick={() => router.push('/profile')} /></TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger><IoPowerSharp className='text-red-500 cursor-pointer text-xl font-medium' onClick={logout} /></TooltipTrigger>
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