'use client'; 

import { Inter } from 'next/font/google';
import './globals.css';
import MainLayoutClient from '@/components/layout/MainLayoutClient';
import LockScreenWrapper from '@/components/auth/LockScreenWrapper';


const inter = Inter({ subsets: ['latin'] });

const DEFAULT_BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1501696461415-6bd6660c6742?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";



  
  export default function RootLayout({ children }) {
    const bodyStyle = {
      backgroundImage: `url(${DEFAULT_BACKGROUND_IMAGE_URL})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  
    return (
      <html lang="en">
        <body className={`${inter.className} min-h-screen`} style={bodyStyle}>
          <LockScreenWrapper>
             <MainLayoutClient>
                <div className="pt-16 md:pt-20">
                   {children}
                </div>
             </MainLayoutClient>
           </LockScreenWrapper>
        </body>
      </html>
    );
  }