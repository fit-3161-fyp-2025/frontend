"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Box, FileCode2, Library, Rocket } from "lucide-react";

const svgs = [
  <Atom strokeWidth={1.25} />,
  <Library strokeWidth={1.25} />,
  <Box strokeWidth={1.25} />,
  <FileCode2 strokeWidth={1.25} />,
  <Rocket strokeWidth={1.25} />,
];

export default function Loading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % svgs.length);
    }, 1300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center m-5">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.75, rotate: -90 }}
          animate={{ opacity: 1, scale: 1.5, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.75, rotate: 90 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-center"
        >
          {svgs[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
