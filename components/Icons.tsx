
import React from 'react';

export const KestrelLogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  const colors = [
    '#7B2CBF', '#2C7DA0', '#01A7E1', '#0077B6', 
    '#E85D04', '#DC2F02', '#F3722C', '#F9C74F', 
    '#F9844A', '#90BE6D', '#43AA8B', '#4D908E', 
    '#277DA1', '#4895EF', '#3F37C9', '#560BAD'
  ];
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 16 Radial Petals mimicking the colorful drops in a flower circle */}
      {colors.map((color, index) => {
        const angle = index * 22.5;
        return (
          <path
            key={index}
            d="M 100 73 C 92 63, 85 53, 90 38 C 94 28, 106 28, 110 38 C 115 53, 108 63, 100 73 Z"
            fill={color}
            transform={`rotate(${angle}, 100, 100)`}
          />
        );
      })}
      
      {/* Central Phoenix soaring with outstretched feathered wings */}
      {/* Elegant Body & Head */}
      <path
        d="M 100 80 C 103 80, 105 83, 103 86 C 101 88, 100 93, 100 97 C 100 102, 102 106, 100 112 C 98 106, 100 102, 100 97 C 100 93, 99 88, 97 86 C 95 83, 97 80, 100 80 Z"
        fill="#0F4C81"
      />
      {/* Beak profile */}
      <path d="M 102 83 L 105 84.5 L 102 86 Z" fill="#0F4C81" />
      
      {/* Flowing Tail Feathers */}
      <path d="M 100 112 C 101 125, 103 138, 103 150 C 103 152, 97 152, 97 150 C 97 138, 99 125, 100 112 Z" fill="#0F4C81" />
      <path d="M 99 112 C 95 125, 89 135, 83 145 C 81 146, 84 148, 86 146 C 92 137, 97 126, 99 112 Z" fill="#0F4C81" />
      <path d="M 99 112 C 92 122, 80 130, 72 136 C 70 137, 72 139, 74 138 C 82 132, 93 124, 99 112 Z" fill="#0F4C81" />
      <path d="M 101 112 C 105 125, 111 135, 117 145 C 119 146, 116 148, 114 146 C 108 137, 103 126, 101 112 Z" fill="#0F4C81" />
      <path d="M 101 112 C 108 122, 120 130, 128 136 C 130 137, 128 139, 126 138 C 118 132, 107 124, 101 112 Z" fill="#0F4C81" />
      
      {/* Proud Left Wing Feathers */}
      <path d="M 98 98 C 85 92, 70 85, 54 85 C 50 85, 48 88, 52 90 C 65 95, 80 102, 96 104 Z" fill="#0F4C81" />
      <path d="M 98 96 C 80 85, 62 76, 45 74 C 40 73.5, 41 77.5, 48 80 C 65 86, 81 94, 97 99 Z" fill="#0F4C81" />
      <path d="M 98 93 C 78 77, 58 66, 38 65 C 33 64.8, 35 69.8, 43 72 C 61 77, 79 86, 97 94 Z" fill="#0F4C81" />
      <path d="M 99 90 C 78 68, 58 52, 38 46 C 33 44.5, 33 49.5, 42 53 C 60 60, 78 72, 98 86 Z" fill="#0F4C81" />
      <path d="M 99 87 C 82 65, 65 48, 46 36 C 41 33, 38 36, 43 41 C 60 52, 76 68, 96 82 Z" fill="#0F4C81" />
      
      {/* Proud Right Wing Feathers */}
      <path d="M 102 98 C 115 92, 130 85, 146 85 C 150 85, 152 88, 148 90 C 135 95, 120 102, 104 104 Z" fill="#0F4C81" />
      <path d="M 102 96 C 120 85, 138 76, 155 74 C 160 73.5, 159 77.5, 152 80 C 135 86, 119 94, 103 99 Z" fill="#0F4C81" />
      <path d="M 102 93 C 122 77, 142 66, 162 65 C 167 64.8, 165 69.8, 157 72 C 139 77, 121 86, 103 94 Z" fill="#0F4C81" />
      <path d="M 101 90 C 122 68, 142 52, 162 46 C 167 44.5, 167 49.5, 158 53 C 140 60, 122 72, 102 86 Z" fill="#0F4C81" />
      <path d="M 101 87 C 118 65, 135 48, 154 36 C 159 33, 162 36, 157 41 C 140 52, 124 68, 104 82 Z" fill="#0F4C81" />
    </svg>
  );
};

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2ZM9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7ZM12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
  </svg>
);

export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21.0001C9 21.5524 9.44772 22.0001 10 22.0001H14C14.5523 22.0001 15 21.5524 15 21.0001V20.0001H9V21.0001Z" />
    <path d="M12 2.00009C8.13401 2.00009 5 5.1341 5 9.00009C5 11.3854 6.03195 13.5204 7.64177 14.9086C8.36186 15.5491 8.94864 16.3216 9.35168 17.1685C9.65997 17.8286 9.87372 18.5337 10 19.0001H14C14.1263 18.5337 14.3401 17.8286 14.6483 17.1685C15.0514 16.3216 15.6381 15.5491 16.3582 14.9086C17.9681 13.5204 19 11.3854 19 9.00009C19 5.1341 15.866 2.00009 12 2.00009Z"/>
  </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const IndianRupeeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" >
    <path d="M6 3H18M6 7H18M10.5 11H18M10.5 15H18M6 21H18M6 3L10.5 11L6 21M10.5 11C10.5 11 12 9.5 13.5 9.5C15 9.5 16.5 11 16.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M11.54 22.35a.75.75 0 01-1.08 0l-6.75-6.75a.75.75 0 010-1.08l10.5-10.5a.75.75 0 011.08 0l6.75 6.75a.75.75 0 010 1.08l-10.5 10.5zM12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
  </svg>
);

export const EnvelopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
  </svg>
);

export const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.298-.083.465a7.48 7.48 0 003.429 3.429c.167.081.364.052.465-.083l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
    </svg>
);

export const CodeBracketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
  </svg>
);

export const BuildingOfficeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

export const BanknotesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414-.336.75-.75.75h-1.5m1.5 0v.375c0 .621-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.504-1.125-1.125V6.375m19.5 0v9.375c0 .621-.504 1.125-1.125 1.125h-17.25c-.621 0-1.125-.504-1.125-1.125V6.375m19.5 0h.375c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375m-19.5 0h-.375c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125h.375" />
  </svg>
);

export const ChevronUpDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.036-2.134H8.716C7.59 2.75 6.68 3.704 6.68 4.884v.916m7.5 0h-7.5" />
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.14,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H21" />
  </svg>
);
