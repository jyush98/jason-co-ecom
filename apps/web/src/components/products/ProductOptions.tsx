// components/product/ProductOptions.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/types/product";
import { PRODUCT_CONFIG } from "@/config/productConfig";
import { createStaggeredListItem } from "@/lib/animations";

interface ProductOptionsProps {
  product: Product;
  isDark?: boolean;
}

interface ProductOption {
  id: string;
  name: string;
  values: string[];
  required?: boolean;
}

// Fixed: Added underscore prefix to unused parameters
export default function ProductOptions({ product: _product, isDark: _isDark = false }: ProductOptionsProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Default options for jewelry (can be expanded with real product options)
  const defaultOptions: ProductOption[] = [
    {
      id: "size",
      name: "Size",
      values: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "Custom"],
      required: true
    },
    {
      id: "engraving",
      name: "Engraving",
      values: ["None", "Initials", "Date", "Custom Message"],
      required: false
    },
    {
      id: "gift_box",
      name: "Gift Packaging",
      values: ["Standard Box", "Premium Box", "Luxury Presentation"],
      required: false
    }
  ];

  // Use default options since Product type doesn't have options property yet
  // TODO: Add options property to Product type if needed for specific products
  const options = defaultOptions;

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const optionVariants = createStaggeredListItem(0.1, 0.4, 15);

  if (!PRODUCT_CONFIG.features.showProductOptions) {
    return null;
  }

  return (
    <div className="space-y-8">
      {options.map((option, optionIndex) => (
        <motion.div
          key={option.id}
          custom={optionIndex}
          variants={optionVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Option Label */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium tracking-wide uppercase">
              {option.name}
            </h3>
            {option.required && (
              <span className="text-xs text-gold">*</span>
            )}
          </div>

          {/* Size Options (Special Layout) */}
          {option.id === "size" && (
            <div className="grid grid-cols-4 gap-2">
              {option.values.map((value) => (
                <button
                  key={value}
                  onClick={() => handleOptionChange(option.id, value)}
                  className={`aspect-square flex items-center justify-center text-sm font-medium transition-all duration-300 border ${selectedOptions[option.id] === value
                    ? "border-gold bg-gold text-black"
                    : "border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold"
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {/* Dropdown Options */}
          {option.id !== "size" && (
            <select
              value={selectedOptions[option.id] || ""}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-600 text-sm tracking-wide focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
            >
              <option value="">Select {option.name}</option>
              {option.values.map((value) => (
                <option key={value} value={value} className="bg-white dark:bg-black">
                  {value}
                </option>
              ))}
            </select>
          )}

          {/* Custom Message Input for Engraving */}
          {option.id === "engraving" && selectedOptions[option.id] === "Custom Message" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <textarea
                placeholder="Enter your custom message (max 50 characters)"
                maxLength={50}
                rows={3}
                className="w-full px-4 py-3 bg-transparent border border-gray-300 dark:border-gray-600 text-sm tracking-wide resize-none focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Custom engraving may add 3-5 business days to delivery
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Size Guide Link */}
      {options.some(opt => opt.id === "size") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <button className="text-sm text-gold hover:text-gold/80 transition-colors underline decoration-dotted underline-offset-4">
            Size Guide & Measurement Tips
          </button>
        </motion.div>
      )}

      {/* Custom Order CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-6 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {/* Fixed: Escaped apostrophes */}
            Don&apos;t see exactly what you&apos;re looking for?
          </p>
          <a
            href="/custom-orders"
            className="inline-block px-6 py-2 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 text-sm tracking-widest uppercase"
          >
            Create Custom Order
          </a>
        </div>
      </motion.div>
    </div>
  );
}