import React from 'react';
import { useBranding } from '../../context/BrandingContext';

export const StyledAppName = ({ className = "", style = {}, darkTheme = false }) => {
  const { branding } = useBranding();
  const appName = "HomeBuddy24";

  return (
    <span className={className} style={style}>
      {(appName.match(/(\D+)|(\d+)/g) || [appName]).map((part, index) => {
        if (/^\d+$/.test(part)) {
          return <span key={index} style={{ color: darkTheme ? '#FCD34D' : '#00a6a6' }}>{part}</span>;
        }
        return <span key={index} style={{ color: darkTheme ? '#FFFFFF' : '#00a6a6' }}>{part}</span>;
      })}
    </span>
  );
};

export default StyledAppName;
