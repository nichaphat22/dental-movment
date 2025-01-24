import { useState } from "react";
import '../../tailwind.css'
const Carousel = () => {
    const images = [
        'https://via.placeholder.com/1600x600/1e40af/ffffff?text=Image+1',
        'https://via.placeholder.com/1600x600/3b82f6/ffffff?text=Image+2',
        'https://via.placeholder.com/1600x600/60a5fa/ffffff?text=Image+3',
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div className="relative w-full h-[600px] overflow-hidden">
            {/* Image */}
            <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="w-full h-full object-cover" />

            {/* Previous Button */}
            <button
                onClick={prevSlide}
                className="absolute inset-y-0 left-4 transform -translate-y-1/2 bg-white text-blue-500 rounded-full p-4 hover:bg-gray-200 top-1/2"
            >
                &#10094;
            </button>

            {/* Next Button */}
            <button
                onClick={nextSlide}
                className="absolute inset-y-0 right-4 transform -translate-y-1/2 bg-white text-blue-500 rounded-full p-4 hover:bg-gray-200 top-1/2"
            >
                &#10095;
            </button>
        </div>
    );
};

export default Carousel;
