'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    avatar: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth/signin';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/v1/profile',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccess('Profile created successfully!');
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create profile');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => setOpenSnackbar(false);

  return (
    <section className="min-h-screen bg-[#F5F2EC] p-4 md:p-8 lg:p-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Create Your Profile</h1>
          <p className="text-gray-600">Choose your avatar and write a short bio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose your avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3'].map((avatarId) => (
                <div
                  key={avatarId}
                  onClick={() => setFormData({ ...formData, avatar: avatarId })}
                  className={`cursor-pointer rounded-lg p-4 border-2 ${
                    formData.avatar === avatarId
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`/main${avatarId}.jpg`}
                    alt={`Avatar ${avatarId}`}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              placeholder="Write a short bio about yourself..."
              maxLength={500}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {isLoading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
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

export default CreateProfile;