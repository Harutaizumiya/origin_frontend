import React from "react";
import { motion } from "motion/react";
import { Plus, Package } from "lucide-react";

export const FloatingActionButtons: React.FC = () => (
  <div className="fixed bottom-8 right-8 flex flex-col gap-4">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center text-primary border border-primary/10 group"
    >
      <Plus size={24} className="group-hover:rotate-90 transition-transform" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-14 h-14 bg-primary text-white shadow-xl rounded-full flex items-center justify-center group"
    >
      <Package
        size={24}
        className="group-hover:scale-110 transition-transform"
      />
    </motion.button>
  </div>
);
