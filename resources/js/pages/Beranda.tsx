import React from 'react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeroCarousel from '../Components/HeroCarousel';

interface BerandaProps {
    keranjang?: any;
    cart?: any;
}

export default function Beranda({ keranjang = {}, cart = {} }: BerandaProps) {
    return (
        <StorefrontLayout keranjang={keranjang} cart={cart}>
            {/* Landing Viewport Utama: Hero Carousel dengan GSAP 3 Parallax */}
            <HeroCarousel />
        </StorefrontLayout>
    );
}
