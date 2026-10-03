import React from 'react';
import './PageBackground.scss';

export const PageBackground = ({ variant = 'default' }) => {
    return (
        <div className={`page-background page-background--${variant}`}>
            {/* Ambient Dark Navy Base Gradient */}
            <div className="bg-gradient-base"></div>
            
            {/* Soft Ambient Light Blobs (Aurora Effect) */}
            <div className="bg-blob bg-blob--1"></div>
            <div className="bg-blob bg-blob--2"></div>
            <div className="bg-blob bg-blob--3"></div>
            <div className="bg-blob bg-blob--4"></div>
            
            {/* Extremely Subtle Noise Texture for Depth */}
            <div className="bg-noise"></div>
            
            {/* Variant Specific Overlays */}
            <div className="bg-overlay"></div>
        </div>
    );
};
