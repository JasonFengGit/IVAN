import React, { useState, useEffect } from 'react';

// Define props types
interface TypewriterEffectProps {
  text: string;
  speed?: number; // Optional prop with a default value
}

const Typing: React.FC<TypewriterEffectProps> = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState<string>('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    // Cleanup function to clear interval when component unmounts or text changes
    return () => clearInterval(interval);
  }, [text, speed]); // Dependencies array to re-run effect when `text` or `speed` changes

  return <div>{displayedText}</div>;
};

export default Typing;
