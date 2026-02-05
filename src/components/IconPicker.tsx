import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const EMOJI_OPTIONS = [
  '🎯', '🧠', '🚀', '☕', '🌿', '💼', '📚', '✍️', '🎨', '💡',
  '🔥', '⚡', '🎮', '🎵', '📱', '💻', '🏃', '🧘', '📝', '🔧',
  '🎁', '🌟', '💪', '🎬', '📊', '🔬', '🎤', '📸', '🛠️', '🎲',
];

export function IconPicker({ value, onChange, size = 'md' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'text-xl h-8 w-8',
    md: 'text-2xl h-10 w-10',
    lg: 'text-4xl h-14 w-14',
  };

  const isImageUrl = value.startsWith('data:') || value.startsWith('http') || value.startsWith('/');

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 500KB for thumbnails)
      if (file.size > 500 * 1024) {
        alert('Image too large. Please use an image under 500KB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onChange(result);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${sizeClasses[size]} rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors cursor-pointer border border-border hover:border-primary/50`}
        >
          {isImageUrl ? (
            <img 
              src={value} 
              alt="Task icon" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span>{value || '🎯'}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Choose Icon</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmojiSelect(emoji)}
                className={`text-xl h-9 w-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors ${
                  value === emoji ? 'bg-primary/20 ring-2 ring-primary' : ''
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Upload Image
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Max 500KB, square recommended
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
