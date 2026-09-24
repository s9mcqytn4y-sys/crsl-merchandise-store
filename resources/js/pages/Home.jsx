import React from 'react';
import StorefrontLayout from '../Layouts/StorefrontLayout';
import HeroCarousel from '../Components/HeroCarousel';

export default function Home({ keranjang = {}, cart = {} }) {
    return (
        <StorefrontLayout keranjang={keranjang} cart={cart}>
            {/* Landing Viewport Utama: Hero Carousel dengan GSAP 3 Parallax */}
            <HeroCarousel />
        </StorefrontLayout>
    );
}
