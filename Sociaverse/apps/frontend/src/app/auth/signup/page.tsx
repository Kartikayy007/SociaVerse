'use client'

import React, { useEffect, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Link from 'next/link';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const SignUpForm = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
  
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters with 1 capital letter and 1 number (special characters allowed)');
      setOpenSnackbar(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/v1/auth/signup', formData);
      
      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        setFormData({ username: '', email: '', password: '' });
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const images = ['/main1.jpg', '/main2.jpg', '/main3.jpg'];

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
              <Link href="/">
                <button className="text-gray-600 flex items-center gap-2">
                  ← Back to website
                </button>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2">Welcome!</h1>
              <p className="text-gray-600">
                <span>Create a free account</span>
                {" or "}
                <Link href="/auth/signin">
                  <button className="text-gray-900 underline">log in</button>
                </Link>
                {" to get started using SociaVerse."}
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              
              <div>
                <label htmlFor="username" className="block text-sm text-gray-600 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full"
                    required
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
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

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
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleClose}
          severity={error ? "error" : "success"}
        >
          {error || success}
        </MuiAlert>
      </Snackbar>
    </section>
  );
};

export default SignUpForm;