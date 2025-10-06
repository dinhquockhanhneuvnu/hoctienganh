
import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2,
};

export const BookOpenIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export const PlusCircleIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

export const BookIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

export const MicIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

export const SparklesIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"></path>
  </svg>
);

export const QuestionMarkIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12" y2="17"></line>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

export const CheckCircleIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const ArrowLeftIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const ArrowRightIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const VolumeIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

export const RefreshCwIcon: React.FC<{className?: string}> = ({className}) => (
  <svg {...iconProps} className={className ?? iconProps.className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64M3.51 15A9 9 0 0 0 18.36 18.36"></path>
  </svg>
);

export const ChevronLeftIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

export const ChevronRightIcon: React.FC = () => (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

export const SaveIcon: React.FC = () => (
  <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);
