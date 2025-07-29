const MAX_RGB_VALUE = 1 << 24; // Represents 16,777,216, the total number of colors in a 24-bit RGB color space.
export const generateRandomColor = () => "#" + (Math.floor(MAX_RGB_VALUE * Math.random())).toString(16).padStart(6, '0');
