'use client'
import PrivateRoutes from '@/app/components/PrivateRoutes'
import AuthPage from '@/app/Views/auth'
import React from 'react'

function Auth() {
    return (
        <div>
            <AuthPage />
        </div>
    )
}
export default Auth
// export default PrivateRoutes({ Component: Auth });