'use client'
import PrivateRoutes from '@/app/components/PrivateRoutes'
import ProfilePage from '@/app/Views/profile'
import React, { useEffect } from 'react'
function Profile() {

    return (
        <div>
            <ProfilePage />
        </div>
    )
}
export default Profile;
// export default PrivateRoutes({ Component: Profile });