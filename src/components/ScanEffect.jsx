import React, { useState } from 'react';

export default function ScanEffect({ children, className = '' }) {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsScanning(true)}
      onMouseLeave={() => setIsScanning(false)}
    >
      {children}
      
      {isScanning && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-copper-400 to-transparent animate-scan"
            style={{
              animation: 'scan 2s linear infinite',
              boxShadow: '0 0 20px rgba(94, 234, 212, 0.8)'
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes scan {
          0% {
            top: -2px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}