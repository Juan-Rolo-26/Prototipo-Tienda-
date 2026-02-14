
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/package_opening.json';
import '../styles/BundleAnimation.css';

const BundleAnimation = () => {
    return (
        <div className="bundle-scene">
            <div className="bundle-animation-container">
                <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                />
            </div>
        </div>
    );
};

export default BundleAnimation;
