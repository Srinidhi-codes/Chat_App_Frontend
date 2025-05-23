import { animationDefaultOptions } from '@/lib/utils';
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('react-lottie'), { ssr: false });
import { Poppins } from 'next/font/google';

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: "400"
});
const EmptyChatContainer = () => {
    return (
        <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
            <Lottie
                isClickToPauseDisabled={true}
                height={200}
                width={200}
                options={animationDefaultOptions}
            />
            <div className='text-opacity-80 text-white flex flex-col justify-center items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center'>
                <h3 className={`${poppinsFont.className}`}>
                    Hi<span className='text-purple-500'>!</span> Welcome to
                    <span className='text-purple-500'> Chat App</span>.
                </h3>
            </div>
        </div>
    )
}

export default EmptyChatContainer