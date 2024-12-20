'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const ResetPasswordForm = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/main1.jpg', '/main2.jpg', '/main3.jpg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen bg-[#F5F2EC] relative">
      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/2 relative h-[300px] md:h-auto">
          {images.map((img, index) => (
            <img
              key={img}
              src={img}
              alt={`Decorative background ${index + 1}`}
              className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                currentImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        <div className="w-full md:w-1/2 p-4 md:p-8 lg:p-12 justify-center flex items-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <Link href="/auth/signin" className="text-gray-600 flex items-center gap-2">
                ← Back to login
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
              <p className="text-gray-600">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Send Reset Instructions
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordForm;
