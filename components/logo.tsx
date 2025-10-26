import React from "react";

export const ConstellationLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    {...props} // Allows you to pass className, width, height, etc.
  >
    <g
      fill="currentColor" // The stars will use the current text color
    >
      <circle cx="100" cy="50" r="35" stroke="none" />
      <circle cx="60" cy="125" r="28" stroke="none" />
      <circle cx="140" cy="135" r="25" stroke="none" />
    </g>
  </svg>
);

export default ConstellationLogo;
