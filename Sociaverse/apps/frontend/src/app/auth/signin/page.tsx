import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Sign In | SociaVerse',
  description: 'Sign in to your SociaVerse account'
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">
        Sign In Page
      </h1>
    </div>
  )
}