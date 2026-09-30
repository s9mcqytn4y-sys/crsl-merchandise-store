<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full scroll-smooth">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    {{-- CSRF Token untuk Fetch API & Axios --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Meta Branding & PWA Address Bar --}}
    <meta name="theme-color" content="#E52027">
    <meta name="color-scheme" content="light">
    <meta name="description"
        content="CRSL Official Store - Animals as your Bestfriends. Temukan koleksi ransel, t-shirt, tumbler, dan merchandise karakter original CRSL.">

    <title inertia>{{ config('app.name', 'CRSL Official Store') }}</title>

    {{-- Favicon Multi-Platform --}}
    <link rel="icon" type="image/webp" href="/favicon.webp">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/gambar/logo-crsl.png">

    {{-- Google Fonts: Plus Jakarta Sans dengan Optimasi Display Swap --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
        rel="stylesheet">

    {{-- Inertia Routes & Assets --}}
    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>

<body
    class="h-full bg-white text-slate-900 font-sans antialiased selection:bg-red-500 selection:text-white overflow-x-hidden">
    @inertia
</body>

</html>
