import Loading from '@/components/Loading'
import VerifyOtp from '@/components/verifyOtp'
import React, { Suspense } from 'react'

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyOtp />
    </Suspense>
  )
}
