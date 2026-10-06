import React from 'react';
import { AvatarId } from '../types';

export const AVATAR_LIST: { id: AvatarId; name: string; tag: string; gender: 'male' | 'female' }[] = [
  { id: 'boy1', name: 'Leo', tag: 'Cozy Beanie Boy', gender: 'male' },
  { id: 'boy2', name: 'Kai', tag: 'Lofi Headphone Boy', gender: 'male' },
  { id: 'girl1', name: 'Mira', tag: 'Spectacled Scholar Girl', gender: 'female' },
  { id: 'girl2', name: 'Sora', tag: 'Golden Star Girl', gender: 'female' }
];

export const AvatarIcon: React.FC<{ id: AvatarId; className?: string }> = ({ id, className = 'w-10 h-10' }) => {
  if (id === 'boy1') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#2A2A05" stroke="#FFD700" strokeWidth="2.5" />
        {/* Soft chubby neck and hoodie */}
        <path d="M26 88C26 74 37 68 50 68C63 68 74 74 74 88V98H26V88Z" fill="#3D3B0A" />
        <path d="M38 72L50 82L62 72" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        {/* Chubby Face */}
        <ellipse cx="50" cy="50" rx="26" ry="24" fill="#F8E5CE" />
        <ellipse cx="33" cy="52" rx="4" ry="2.5" fill="#E8A88E" opacity="0.6" />
        <ellipse cx="67" cy="52" rx="4" ry="2.5" fill="#E8A88E" opacity="0.6" />
        {/* Cozy Beanie */}
        <path d="M26 44C26 30 36 20 50 20C64 20 74 30 74 44C74 46 72 48 50 48C28 48 26 46 26 44Z" fill="#1A1A00" />
        <rect x="24" y="42" width="52" height="7" rx="3.5" fill="#FFD700" />
        <circle cx="50" cy="18" r="6" fill="#FFFFCC" />
        {/* Eyes & Smile */}
        <ellipse cx="42" cy="48" rx="2.5" ry="3.5" fill="#1A1A00" />
        <ellipse cx="58" cy="48" rx="2.5" ry="3.5" fill="#1A1A00" />
        <circle cx="43" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="47" r="1" fill="#FFFFFF" />
        <path d="M47 55C48.5 57 51.5 57 53 55" stroke="#1A1A00" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'boy2') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#2A2A05" stroke="#FFD700" strokeWidth="2.5" />
        {/* Cozy Sweater */}
        <path d="M25 88C25 72 38 67 50 67C62 67 75 72 75 88V98H25V88Z" fill="#24280E" />
        {/* Chubby Face */}
        <ellipse cx="50" cy="50" rx="26" ry="25" fill="#EEDAC5" />
        <ellipse cx="32" cy="53" rx="4.5" ry="2.5" fill="#E2977F" opacity="0.6" />
        <ellipse cx="68" cy="53" rx="4.5" ry="2.5" fill="#E2977F" opacity="0.6" />
        {/* Soft Wavy Hair */}
        <path d="M26 46C24 35 32 24 50 24C68 24 76 35 74 46C69 38 62 36 50 36C38 36 31 38 26 46Z" fill="#382C1E" />
        <path d="M34 32C42 27 58 27 66 32" stroke="#4F3E2B" strokeWidth="3" strokeLinecap="round" />
        {/* Lofi Studio Headphones */}
        <path d="M20 50C20 32 33 20 50 20C67 20 80 32 80 50" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="18" y="44" width="7" height="15" rx="3.5" fill="#FFFFCC" stroke="#FFD700" strokeWidth="1.5" />
        <rect x="75" y="44" width="7" height="15" rx="3.5" fill="#FFFFCC" stroke="#FFD700" strokeWidth="1.5" />
        {/* Eyes & Smile */}
        <ellipse cx="42" cy="49" rx="2.5" ry="3.5" fill="#1A1A00" />
        <ellipse cx="58" cy="49" rx="2.5" ry="3.5" fill="#1A1A00" />
        <circle cx="43" cy="48" r="1" fill="#FFFFFF" />
        <circle cx="59" cy="48" r="1" fill="#FFFFFF" />
        <path d="M46 56C48.5 58 51.5 58 54 56" stroke="#1A1A00" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'girl1') {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#2A2A05" stroke="#FFD700" strokeWidth="2.5" />
        {/* Cozy matcha scarf and coat */}
        <path d="M26 88C26 73 37 68 50 68C63 68 74 73 74 88V98H26V88Z" fill="#333D1A" />
        <path d="M36 71C44 76 56 76 64 71" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
        {/* Chubby Face */}
        <ellipse cx="50" cy="49" rx="25" ry="24" fill="#FCEAD7" />
        <ellipse cx="33" cy="52" rx="4" ry="2.5" fill="#E89B8E" opacity="0.65" />
        <ellipse cx="67" cy="52" rx="4" ry="2.5" fill="#E89B8E" opacity="0.65" />
        {/* Topknot Bun & Hair */}
        <circle cx="50" cy="20" r="10" fill="#2C2018" />
        <path d="M27 45C25 32 35 25 50 25C65 25 75 32 73 45C68 36 60 33 50 33C40 33 32 36 27 45Z" fill="#2C2018" />
        {/* Chic Round Spectacles */}
        <circle cx="41" cy="48" r="6" stroke="#FFD700" strokeWidth="2" fill="none" />
        <circle cx="59" cy="48" r="6" stroke="#FFD700" strokeWidth="2" fill="none" />
        <path d="M47 48H53" stroke="#FFD700" strokeWidth="2" />
        {/* Eyes & Smile */}
        <circle cx="41" cy="48" r="2.5" fill="#1A1A00" />
        <circle cx="59" cy="48" r="2.5" fill="#1A1A00" />
        <circle cx="42" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="60" cy="47" r="1" fill="#FFFFFF" />
        <path d="M47 56C49 57.5 51 57.5 53 56" stroke="#1A1A00" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // girl2
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#2A2A05" stroke="#FFD700" strokeWidth="2.5" />
      {/* Cozy Golden Hoodie */}
      <path d="M26 88C26 73 37 68 50 68C63 68 74 73 74 88V98H26V88Z" fill="#423E11" />
      <path d="M42 74L50 82L58 74" stroke="#FFFFCC" strokeWidth="2" strokeLinecap="round" />
      {/* Chubby Face */}
      <ellipse cx="50" cy="50" rx="25" ry="24" fill="#FBE6D3" />
      <ellipse cx="32" cy="53" rx="4" ry="2.5" fill="#F09B93" opacity="0.65" />
      <ellipse cx="68" cy="53" rx="4" ry="2.5" fill="#F09B93" opacity="0.65" />
      {/* Flowing Soft Hair */}
      <path d="M25 48C24 33 34 23 50 23C66 23 76 33 75 48C76 60 73 66 71 70C67 56 64 35 50 35C36 35 33 56 29 70C27 66 24 60 25 48Z" fill="#3D291F" />
      {/* Golden Star Hairpin */}
      <path d="M33 32L34.5 35L38 35.5L35.5 37.5L36.5 41L33 39L29.5 41L30.5 37.5L28 35.5L31.5 35L33 32Z" fill="#FFD700" />
      {/* Eyes & Smile */}
      <ellipse cx="42" cy="49" rx="2.5" ry="3.5" fill="#1A1A00" />
      <ellipse cx="58" cy="49" rx="2.5" ry="3.5" fill="#1A1A00" />
      <circle cx="43" cy="48" r="1" fill="#FFFFFF" />
      <circle cx="59" cy="48" r="1" fill="#FFFFFF" />
      <path d="M47 56C49 57.5 51 57.5 53 56" stroke="#1A1A00" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
