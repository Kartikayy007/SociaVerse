'use client'

import React, { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const SignUpForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
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
      <div className="flex min-h-screen">
        {/* Left side - Image */}
        <div className="w-1/2 relative">
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

        {/* Right side - Form */}
        <div className="w-1/2 flex flex-col px-16 justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Back button */}
            <div className="mb-8">
              <button className="text-gray-600 flex items-center gap-2">
                ← Back to website
              </button>
            </div>

            {/* Welcome text */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Welcome!</h1>
              <p className="text-gray-600">
                <span>Create a free account</span>
                {" or "}
                <button className="text-gray-900 underline">log in</button>
                {" to get started using SportWrench"}
              </p>
            </div>

            {/* Form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="chandler.blanks"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="w-5 h-5 text-gray-500" />
                    ) : (
                      <AiOutlineEye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <button type="button" className="text-sm text-gray-600 underline">
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
              >
                Log in
              </button>

              {/* Social login buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full border border-gray-300 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <FcGoogle className="text-xl" />
                  <span>Log in with Google</span>
                </button>
                
                <button
                  type="button"
                  className="w-full border border-gray-300 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  <span>Log in with Facebook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUpForm;