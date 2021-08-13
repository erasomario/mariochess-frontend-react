import { useEffect, useState } from "react";

export const useDimensions = () => {
    function getWindowDimensions() {

        const width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;

        const height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

        return {
            width,
            height
        };
    }

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowDimensions
}