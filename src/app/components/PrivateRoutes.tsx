'use client'

import { useAppStore } from "@/store"
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";

export default function PrivateRoutes({ Component }: any) {
    return function isAuth(props: any) {
        const { userInfo } = useAppStore();
        const router = useRouter();
        const pathName = usePathname();

        // useLayoutEffect(() => {
        //     // If user is logged in and tries to access "/", redirect to /chat
        //     if (userInfo && pathName === '/') {
        //         router.replace('/chat');
        //     }

        //     // If user is not logged in and tries to access any other route
        //     if (!userInfo && pathName !== '/') {
        //         router.replace('/');
        //     }
        // }, [userInfo, pathName]);

        // return <Component {...props} />;
    };
}
