import { useEffect, useState } from 'react';

const DynamicHeadings = ({ headings, interval = 2500 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % headings.length);
    }, interval);
    return () => clearInterval(timer);
  }, [headings, interval]);

  return (
    <h2 className="text-2xl md:text-3xl font-bold text-indigo-200 transition-all duration-700 animate-fade-in">
      {headings[index]}
    </h2>
  );
};

export default DynamicHeadings;
