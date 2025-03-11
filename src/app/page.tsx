// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import './styles/home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div>
          <h1 className="home-title">Holy Grail Fantasy</h1>
          <p className="home-description">
            A turn-based battle game where Knights and Wizards team up against a powerful Boss
          </p>
        </div>
        
        <div className="character-showcase">
          <div className="character-card wizard fixed-position">
            <Image 
              src="/assets/wizard/wizard-idle-ezgif.com-crop.gif" 
              alt="Wizard" 
              width={250} 
              height={250}
              priority
            />
          </div>
          <div className="character-card knight fixed-position">
            <Image 
              src="/assets/king/king-idle-ezgif.com-crop.gif" 
              alt="Knight" 
              width={250} 
              height={250}
              priority
            />
          </div>
          <div className="character-card cthulhu fixed-position">
            <Image 
              src="/assets/cthulu/cthulu-idle-ezgif.com-crop.gif" 
              alt="Cthulhu" 
              height={350} 
              width={290}
              priority
            />
          </div>
        </div>
        
        <div className="cta-container">
          <Link href="/lobby" className="action-button enter-lobby-button">
            Enter Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}