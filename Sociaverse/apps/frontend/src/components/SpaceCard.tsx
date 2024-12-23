"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, MoreVertical, Edit, Trash } from "lucide-react";
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface SpaceProps {
  space: {
    _id: string;  
    name: string;
    description: string;
    members: number;
    lastVisited: string;
    isOwner: boolean;
    isPrivate: boolean;
    ownerId: string;  
  };
  onUpdate: () => void;
}

export const SpaceCard = ({ space, onUpdate }: SpaceProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/v1/spaces/${space._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsDeleting(true);
      // Delay update to allow animation to complete
      setTimeout(() => {
        onUpdate();
        setDeleteDialogOpen(false);
      }, 500);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete space';
      setError(message);
      console.error('Failed to delete space:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <>
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 0.8,
              transition: { duration: 0.5 }
            }}
            whileHover="hover"
            transition={{
              duration: 1,
              ease: "backInOut",
            }}
            variants={{
              hover: {
                scale: 1.05,
              },
            }} 
            className={`relative h-[360px] w-full shrink-0 overflow-hidden mb-6 rounded-xl p-4 ${
              space.isPrivate ? 'bg-red-700' : 'bg-indigo-500'
            }`}
          >
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-white/10 rounded-full"
              >
                <MoreVertical size={20} color="white" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        // Implement edit logic
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Space
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={loading}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash size={16} className="mr-2" />
                      {loading ? 'Deleting...' : 'Delete Space'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 text-white">
              <span className="mb-3 w-fit rounded-full bg-white/30 px-3 py-2 text-xl font-light text-white flex">
                
                
                {space.isPrivate ? <Lock size={25} className="ml-2" /> : 
                <>
                <User size={25} />
                <span className="ml-2">{space.members}</span>
                </> 
                }
              </span>
              <motion.span
                initial={{ scale: 0.85 }}
                variants={{
                  hover: {
                    scale: 1,
                  },
                }}
                transition={{
                  duration: 1,
                  ease: "backInOut",
                }}
                className="my-2 block origin-top-left font-mono text-6xl font-black leading-[1.2]"
              >
                {space.name}
              </motion.span>
              <p>{space.description}</p>
            </div>
            <button className="absolute bottom-4 left-4 right-4 z-20 rounded border-2 border-white bg-white py-2 text-center font-mono font-black uppercase text-neutral-800 backdrop-blur transition-colors hover:bg-white/30 hover:text-white flex items-center justify-center gap-2">
              {space.isPrivate && <Lock size={20} />}
              {space.isPrivate ? 'Private Space' : 'Enter Space'}
            </button>
            <Background />
          </motion.div>

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Space</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this space? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                color="error"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </AnimatePresence>
  );
};

const Background = () => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 z-0"
      variants={{
        hover: {
          scale: 1.5,   
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
    >
      <motion.circle
        variants={{
          hover: {
            scaleY: 0.5,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="114.5"
        r="101.5"
        fill="#262626"
      />
      <motion.ellipse
        variants={{
          hover: {
            scaleY: 2.25,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="265.5"
        rx="101.5"
        ry="43.5"
        fill="#262626"
      />
    </motion.svg>
  );
};

export default SpaceCard;