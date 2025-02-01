'use client'

import React, { useState } from 'react';

interface CopyTooltipProps {
    address: string;
    isMobile: boolean;
}

function CopyTooltip({ address, isMobile }: CopyTooltipProps) {

    const [tooltipText, setTooltipText] = useState('Copy'); // Initial tooltip text
    const [showTooltip, setShowTooltip] = useState(false); // Tooltip visibility state

    const handleMouseEnter = () => {
        setTooltipText('Copy'); // Reset tooltip when mouse enters
        setShowTooltip(true); // Show tooltip
    };

    const handleMouseLeave = () => {
        setShowTooltip(false); // Hide tooltip
    };

    const handleClick = () => {
        navigator.clipboard.writeText(address) // Use Clipboard API to copy address
            .then(() => setTooltipText('Copied')) // On success, show "Copied"
            .catch(err => console.error('Failed to copy: ', err)); // Handle possible errors
    };

    return (
        <div className='ml-2' style={{ position: 'relative', display: 'inline-block' }}>
            <p className="text-black font-mono text-sm"
                style={{ fontFamily: 'GLY', fontSize: isMobile ? "20px" : "20px", marginTop: "0px" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}>
                {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </p>
            {/*showTooltip && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '5px',
                    padding: '4px 8px',
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap'
                }}>
                    {tooltipText}
                </div>
            )*/}
        </div>
    );
}

export default CopyTooltip;
