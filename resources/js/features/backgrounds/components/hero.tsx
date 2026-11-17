import { Heart, Image as ImageIcon } from 'lucide-react';
import { HeroArt } from './hero-art';

export function Hero() {
    return (
        <section className="bk-hero">
            <div className="bk-hero-text">
                <span className="bk-pill">
                    <ImageIcon size={16} />
                    Backgrounds
                </span>
                <h1 className="bk-title">
                    Backgrounds
                    <Heart size={34} />
                </h1>
                <p className="bk-sub">
                    Personalize your little universe with beautiful backgrounds.
                    <small>
                        Make it feel more like home, together. <Heart size={15} />
                    </small>
                </p>
            </div>
            <HeroArt />
        </section>
    );
}