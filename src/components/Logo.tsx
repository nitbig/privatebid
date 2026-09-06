// src/components/Logo.tsx
import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  monochrome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ monochrome = true, className, ...props }) => {
  // If monochrome is true, we use white/gray for the central diamond.
  // Otherwise, we use the original copper colors (#FFBC96 -> #99715A).
  const centerStartColor = monochrome ? '#FFFFFF' : '#FFBC96';
  const centerEndColor = monochrome ? '#8F8F8F' : '#99715A';

  // We use white/gray gradients for the outer shapes to fit the Vercel theme
  const outerStartColor = '#FFFFFF';
  const outerEndColor = '#8F8F8F';

  return (
    <svg
      width="425"
      height="715"
      viewBox="0 0 425 715"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M170.86 0L33.4133 86.8388C12.6208 99.9755 0.0409566 122.878 0.108432 147.473L1.42216 626.327C1.42535 627.491 2.74293 628.164 3.68727 627.484L180.516 500.194C182.837 498.524 182.904 495.093 180.65 493.333L117.328 443.881C112.768 440.32 110.127 434.839 110.182 429.054L111.46 295.504C111.5 291.267 113.418 287.266 116.696 284.581L170.86 240.205V0Z"
        fill="url(#paint0_linear_logo)"
      />
      <path
        d="M413.619 106.705L209.88 242.097C202.944 246.706 198.851 254.544 199.032 262.869L199.925 303.946C200.081 311.124 203.403 317.866 208.999 322.364L327.156 417.321C341.973 429.229 341.263 452.011 325.734 462.973L204.794 548.343C200.998 551.022 198.741 555.378 198.741 560.023V709.421C198.741 711.731 201.339 713.088 203.235 711.768L402.838 572.804C416.476 563.309 424.511 547.662 424.283 531.046L422.691 415.366C422.572 406.764 418.588 398.673 411.843 393.335L323.133 323.133L410.103 266.822C417.835 261.815 422.504 253.231 422.504 244.019V111.468C422.504 106.904 417.42 104.178 413.619 106.705Z"
        fill="url(#paint1_linear_logo)"
      />
      <path
        d="M285.672 426.036L148.787 319.918C144.089 316.276 137.258 319.624 137.258 325.568V419.125C137.258 421.264 138.216 423.291 139.869 424.649L213.003 484.723C215.542 486.809 219.177 486.895 221.812 484.931L285.564 437.418C289.355 434.593 289.409 428.932 285.672 426.036Z"
        fill="url(#paint2_linear_logo)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_logo"
          x1="212.324"
          y1="0"
          x2="212.324"
          y2="714.896"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={outerStartColor} />
          <stop offset="1" stopColor={outerEndColor} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_logo"
          x1="212.324"
          y1="0"
          x2="212.324"
          y2="714.896"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={outerStartColor} />
          <stop offset="1" stopColor={outerEndColor} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_logo"
          x1="215.182"
          y1="310.98"
          x2="215.182"
          y2="488.275"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={centerStartColor} />
          <stop offset="1" stopColor={centerEndColor} />
        </linearGradient>
      </defs>
    </svg>
  );
};
