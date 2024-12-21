"use client";

import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";

interface SpaceProps {
  space: {
    id: number;
    name: string;
    description: string;
    members: number;
    lastVisited: string;
    isOwner: boolean;
    isPrivate: boolean;  
  }
}

export const SpaceCard = ({ space }: SpaceProps) => {
  return (
    <motion.div
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
      className={`relative h-96 w-80 shrink-0 overflow-hidden rounded-xl p-4 ${
        space.isPrivate ? 'bg-red-700' : 'bg-indigo-500'
      }`}
    >
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