'use client'

import { useAppStore } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect } from "react";

export default function PrivateRoutes({ Component }: { Component: any }) {
    return function IsAuth(props: any) {
        const { userInfo } = useAppStore();
        const router = useRouter();
        const pathName = usePathname();

        useLayoutEffect(() => {
            const isAuthPage = pathName === "/" || pathName === "/auth";

            if (!userInfo && !isAuthPage) {
                // 🚫 Not logged in, redirect to /auth
                router.replace("/auth");
            }

            if (userInfo && isAuthPage) {
                // ✅ Logged in, redirect away from /auth
                router.replace("/chat");
            }
        }, [userInfo, pathName, router]);

        return <Component {...props} />;
    };
}
