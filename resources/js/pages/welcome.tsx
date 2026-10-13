import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Clock,
    Flame,
    GraduationCap,
    HelpCircle,
    Layers,
    MapPin,
    QrCode,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    Tag,
    TrendingUp,
    Users,
    Wallet,
    Zap,
    BookOpen,
    Shirt,
    Wrench,
    Beaker
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';
import student from '@/routes/student';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const { auth } = usePage<{ auth: { user?: { name: string; email: string } | null } }>().props;
    const [searchQuery, setSearchQuery] = useState('');

    const targetBrowseUrl = auth?.user ? student.browse().url : register().url;

    return (
        <>
            <Head title="UniMart - Campus Buy & Sell Consignment Hub" />

            <div className="min-h-screen bg-background text-foreground selection:bg-ocean-teal selection:text-white">
                {/* 1. Header / Navbar */}
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Brand Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <AppLogoIcon className="size-11 object-contain transition-transform duration-300 group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-foreground font-sans leading-tight">
                                    Uni<span className="text-golden-sand">Mart</span>
                                </span>
                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase leading-tight">
                                    Campus Hub
                                </span>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                            <a href="#how-it-works" className="transition-colors hover:text-foreground">
                                How It Works
                            </a>
                            <a href="#features" className="transition-colors hover:text-foreground">
                                Why UniMart
                            </a>
                            <a href="#categories" className="transition-colors hover:text-foreground">
                                Categories
                            </a>
                            <a href="#pathways" className="transition-colors hover:text-foreground">
                                Buyers & Sellers
                            </a>
                            <a href="#hub" className="transition-colors hover:text-foreground">
                                Campus Hub
                            </a>
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ocean-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ocean-teal-600 hover:shadow-md"
                                >
                                    <span>Go to Portal</span>
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-full bg-ocean-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ocean-teal-600 hover:shadow-md"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* 2. Hero Section */}
                <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
                    {/* Subtle background ambient glows */}
                    <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-ocean-teal/10 blur-3xl" />
                    <div className="pointer-events-none absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-golden-sand/10 blur-3xl" />

                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
                            
                            {/* Left Column: Headline & Action */}
                            <div className="flex flex-col items-start lg:col-span-7">

                                {/* Main Headline */}
                                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                                    Buy & Sell Campus Gear.{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-teal to-seafoam-aqua">
                                        Zero Flakes. 100% Scam-Free.
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                    Say goodbye to sketchy meetups, ghosted chats, and overpriced textbooks.
                                    UniMart connects students through a staff-verified physical consignment hub, 
                                    QR-code handovers, and instant payouts.
                                </p>

                                {/* Action / Search bar input matching inspo style */}
                                <div className="mt-8 flex w-full max-w-lg flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search uniforms, textbooks, PE gear..."
                                            className="w-full rounded-full border border-border bg-card/80 py-3.5 pl-11 pr-4 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus:border-ocean-teal focus:outline-hidden focus:ring-2 focus:ring-ocean-teal/20"
                                        />
                                    </div>
                                    <Link
                                        href={targetBrowseUrl}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-ocean-teal px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-ocean-teal-600 hover:shadow-lg shrink-0"
                                    >
                                        <span>Get Started</span>
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>

                                {/* Trust Proof Badges */}
                                <div className="mt-10 pt-8 border-t border-border/60 w-full">
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                                        Trusted by university students across departments
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-foreground/80">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="size-4 text-seafoam-aqua" />
                                            <span>Verified Student IDs</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="size-4 text-ocean-teal" />
                                            <span>Campus Hub Verified</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <QrCode className="size-4 text-golden-sand" />
                                            <span>QR-Code Handovers</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="size-4 text-seafoam-aqua" />
                                            <span>Instant E-Wallet Payouts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Inspo-Inspired Stacked UI Card Component */}
                            <div className="relative flex justify-center lg:col-span-5">
                                <div className="relative w-full max-w-md">
                                    
                                    {/* Main Base Card (Consignment Item Slip) */}
                                    <div className="relative rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:scale-[1.02]">
                                        {/* Card Header */}
                                        <div className="flex items-center justify-between border-b border-border/60 pb-4">
                                            <div className="flex items-center gap-3">
                                                <AppLogoIcon className="size-9 object-contain" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-foreground">Campus Hub Slip</h3>
                                                    <p className="text-xs text-muted-foreground">Order #UM-9482 • Verified Item</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                                                Ready for Claim
                                            </span>
                                        </div>

                                        {/* Item & Pricing Info */}
                                        <div className="my-5 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="text-xs font-medium text-ocean-teal uppercase tracking-wider">College of Nursing</span>
                                                    <h4 className="text-base font-bold text-foreground">Official Clinical Scrub Set (Size M)</h4>
                                                </div>
                                                <span className="rounded-md bg-golden-sand/15 px-2 py-0.5 text-xs font-bold text-golden-sand-700 dark:text-golden-sand">
                                                    Save 68%
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-extrabold text-foreground">₱450.00</span>
                                                <span className="text-sm text-muted-foreground line-through">₱1,400.00</span>
                                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">vs Bookstore</span>
                                            </div>
                                        </div>

                                        {/* Active Hold Status Timer Widget */}
                                        <div className="rounded-2xl bg-muted/60 p-3.5 border border-border/60 mb-5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                    <Clock className="size-3.5 text-golden-sand" />
                                                    <span>Hard Hold Active</span>
                                                </div>
                                                <span className="font-mono font-bold text-ocean-teal">18h 42m remaining</span>
                                            </div>
                                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-golden-sand to-ocean-teal" />
                                            </div>
                                            <p className="mt-2 text-[11px] text-muted-foreground">
                                                Reserved for pickup at Campus Hub Room 204.
                                            </p>
                                        </div>

                                        {/* Hub Location & Scan Action */}
                                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="size-3.5 text-ocean-teal" />
                                                <span>Student Center, Hub 204</span>
                                            </div>
                                            <span className="text-xs font-bold text-foreground">Seller: @maria.cl</span>
                                        </div>
                                    </div>

                                    {/* Floating Overlay Card 1: Student Claim QR & Payment Badge (mimics Finpay Credit Card in Inspo) */}
                                    <div className="absolute -bottom-8 -right-4 sm:-right-6 w-64 rounded-2xl bg-gradient-to-br from-slate-marine-900 to-ocean-teal-950 p-4 text-white shadow-2xl border border-white/10 backdrop-blur-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <QrCode className="size-4 text-seafoam-aqua" />
                                                <span className="text-xs font-bold tracking-wide">Claim QR Pass</span>
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                                                Verified
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-2.5 border border-white/10 mb-3">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-white p-1 shrink-0">
                                                <QrCode className="size-full text-slate-900" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[11px] font-bold text-white truncate">Scan at Campus Hub</p>
                                                <p className="text-[10px] text-white/70">Tap to present QR</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] pt-1 text-white/80 border-t border-white/10">
                                            <span>Instant Payout</span>
                                            <span className="font-bold text-seafoam-aqua">GCash • Maya</span>
                                        </div>
                                    </div>

                                    {/* Floating Overlay Card 2: Instant Payout Banner (Top Left) */}
                                    <div className="absolute -top-6 -left-4 sm:-left-6 rounded-2xl bg-card/95 border border-border/80 px-3.5 py-2.5 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-bounce [animation-duration:4s]">
                                        <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                            <Wallet className="size-3.5" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-extrabold text-foreground">₱450.00 Disbursed</p>
                                            <p className="text-[9px] text-muted-foreground">Disbursed to Seller's E-Wallet</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 3. Core Pillars Bento Bar (Sub-Hero Bar matching Inspo) */}
                <section className="py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 lg:p-12 shadow-sm">
                            
                            {/* Bar Top Header */}
                            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 border-b border-border/60 pb-8">
                                <div className="lg:col-span-6">
                                    <span className="text-xs font-bold uppercase tracking-wider text-ocean-teal">
                                        Campus Consignment
                                    </span>
                                    <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                        A safer, smarter way to buy and sell gear on campus.
                                    </h2>
                                </div>
                                <div className="lg:col-span-6 flex items-center">
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                        Built around actual university student schedules. No more waiting outside libraries for flakey buyers, no haggling with strangers, and zero risk of counterfeit payments.
                                    </p>
                                </div>
                            </div>

                            {/* 3 Value Pillars */}
                            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Pillar 1 */}
                                <div className="flex flex-col items-start space-y-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-ocean-teal/10 text-ocean-teal">
                                        <Building2 className="size-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Physical Campus Hub</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Drop off items once at the on-campus hub. Authorized Staff verifies item quality, safe-keeps inventory, and handles handovers directly.
                                    </p>
                                </div>

                                {/* Pillar 2 */}
                                <div className="flex flex-col items-start space-y-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-golden-sand/15 text-golden-sand-700 dark:text-golden-sand">
                                        <Clock className="size-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Smart 2-Stage Holds</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        15-minute rolling soft holds protect your cart while browsing; explicit purchase locks a guaranteed 24-hour pickup window.
                                    </p>
                                </div>

                                {/* Pillar 3 */}
                                <div className="flex flex-col items-start space-y-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl bg-seafoam-aqua/15 text-seafoam-aqua-700 dark:text-seafoam-aqua">
                                        <Wallet className="size-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground">Dual-Payout System</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Receive your payout directly to your e-wallet (GCash / Maya) via QR scan once sold, or claim physical cash right at the hub.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 4. "Why Students Prefer UniMart" Bento Grid */}
                <section id="features" className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-ocean-teal">
                                Why UniMart
                            </span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                Designed for real university life
                            </h2>
                            <p className="mt-4 text-base text-muted-foreground">
                                Traditional marketplaces fail college students. UniMart replaces chaotic meetups with verified campus infrastructure.
                            </p>
                        </div>

                        {/* Bento Grid Layout (matching inspo 4-block layout) */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
                            
                            {/* Bento 1: 100% Scam-Free (Big Stat Card) */}
                            <div className="rounded-3xl border border-border/80 bg-card p-8 lg:col-span-5 flex flex-col justify-between shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                                <div>
                                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-seafoam-aqua/10 text-seafoam-aqua mb-6">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-ocean-teal dark:text-seafoam-aqua">
                                        100%
                                    </span>
                                    <h3 className="mt-2 text-xl font-bold text-foreground">Scam-Free Transactions</h3>
                                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                        Every single item is physically inspected by authorized Staff before going live. No mystery packages, no broken zippers, and no misrepresented textbooks.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-ocean-teal">
                                    <span>Verified physical inspection protocol</span>
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </div>

                            {/* Bento 2: QR Handover Visual Flow */}
                            <div className="rounded-3xl border border-border/80 bg-card p-8 lg:col-span-7 flex flex-col justify-between shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                                <div>
                                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-golden-sand/15 text-golden-sand mb-4">
                                        <QrCode className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">QR-Verified Physical Handovers</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Eliminates manual entry errors. Quick scans keep handovers under 30 seconds.
                                    </p>
                                </div>

                                {/* Flow Visual */}
                                <div className="my-6 grid grid-cols-3 gap-2 sm:gap-4 rounded-2xl bg-muted/50 p-4 border border-border/60">
                                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-card border border-border/40">
                                        <div className="size-8 rounded-full bg-ocean-teal/10 flex items-center justify-center text-ocean-teal mb-1">
                                            <Tag className="size-4" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">1. Drop-off QR</span>
                                        <span className="text-[10px] text-muted-foreground">Seller gives item</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-card border border-border/40">
                                        <div className="size-8 rounded-full bg-golden-sand/15 flex items-center justify-center text-golden-sand mb-1">
                                            <Building2 className="size-4" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">2. Hub Verifies</span>
                                        <span className="text-[10px] text-muted-foreground">Goes live in app</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center p-2 rounded-xl bg-card border border-border/40">
                                        <div className="size-8 rounded-full bg-seafoam-aqua/15 flex items-center justify-center text-seafoam-aqua mb-1">
                                            <ShoppingBag className="size-4" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground">3. Claim QR</span>
                                        <span className="text-[10px] text-muted-foreground">Buyer picks up</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Average counter time: <strong>&lt; 30 seconds</strong></span>
                                    <span className="font-semibold text-foreground">Zero Paperwork</span>
                                </div>
                            </div>

                            {/* Bento 3: Unified Student Account */}
                            <div className="rounded-3xl border border-border/80 bg-card p-8 lg:col-span-5 flex flex-col justify-between shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                                <div>
                                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-deep-indigo/10 text-deep-indigo-600 dark:text-deep-indigo-300 mb-4">
                                        <Users className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">Unified Student Profile</h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                        No separate buyer and seller portals. Buy medical scrubs in the morning, list an old calculus textbook in the afternoon with one unified student login.
                                    </p>
                                </div>
                                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
                                    <div className="flex -space-x-2">
                                        <div className="size-7 rounded-full bg-ocean-teal text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-card">B</div>
                                        <div className="size-7 rounded-full bg-golden-sand text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-card">S</div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Seamless access to buying & selling in one profile</span>
                                </div>
                            </div>

                            {/* Bento 4: Campus Savings & Speed Tracker Chart Card */}
                            <div className="rounded-3xl border border-border/80 bg-card p-8 lg:col-span-7 flex flex-col justify-between shadow-xs transition-transform duration-300 hover:scale-[1.01]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Semester Impact</span>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-3xl sm:text-4xl font-black text-foreground">₱3,200</span>
                                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+64% Savings</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Average student expenditure saved each term</p>
                                    </div>
                                </div>

                                {/* Simulated sparkline graph matching Dribbble inspiration */}
                                <div className="my-6">
                                    <div className="relative h-24 w-full">
                                        <svg className="h-full w-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="var(--color-ocean-teal)" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="var(--color-ocean-teal)" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M0,80 Q100,60 200,45 T400,15 L400,100 L0,100 Z"
                                                fill="url(#grad)"
                                            />
                                            <path
                                                d="M0,80 Q100,60 200,45 T400,15"
                                                fill="none"
                                                stroke="var(--color-ocean-teal)"
                                                strokeWidth="3"
                                            />
                                            <circle cx="400" cy="15" r="4" fill="var(--color-ocean-teal)" />
                                        </svg>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2 border-t border-border/40 pt-2">
                                        <span>Aug (Sem Start)</span>
                                        <span>Midterm</span>
                                        <span>Finals</span>
                                        <span>Sem End (Peak Resale)</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>Verified campus recirculations</span>
                                    <span className="font-bold text-foreground">Active Hub: Room 204</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 5. Deep Navy "How It Works" Section */}
                <section id="how-it-works" className="py-24 bg-gradient-to-b from-[#0A0E23] via-[#0E1533] to-[#0A0E23] text-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        
                        {/* Section Header */}
                        <div className="max-w-2xl mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-seafoam-aqua">
                                Operational Workflow
                            </span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                                3 simple steps from locker clutter to verified cash
                            </h2>
                            <p className="mt-4 text-slate-300 text-sm sm:text-base">
                                UniMart merges digital convenience with physical verification to ensure safe transactions for everyone.
                            </p>
                        </div>

                        {/* 3 Step Cards */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            
                            {/* Step 1 */}
                            <div className="group rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-seafoam-aqua/50">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-seafoam-aqua/20 text-seafoam-aqua font-black text-2xl mb-6 group-hover:scale-110 transition-transform">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-white">Post & Drop Off</h3>
                                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                                    List your uniform or equipment on the app in 60 seconds. Receive a unique <strong>Drop-off QR</strong> and bring the item to the Hub on your way to class.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-seafoam-aqua">
                                    <CheckCircle2 className="size-4" />
                                    <span>Staff inspects & activates catalog listing</span>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="group rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-golden-sand/50">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-golden-sand/20 text-golden-sand font-black text-2xl mb-6 group-hover:scale-110 transition-transform">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-white">Reserve & Claim</h3>
                                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                                    Buyers enjoy a <strong>15-minute soft hold</strong> in their cart while browsing. Clicking "Buy" locks a <strong>24-hour Hard Hold</strong> to visit the hub and pick it up.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-golden-sand">
                                    <Clock className="size-4" />
                                    <span>Guaranteed reservation window</span>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="group rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-ocean-teal/50">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-ocean-teal/20 text-ocean-teal font-black text-2xl mb-6 group-hover:scale-110 transition-transform">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-white">Handover & Payout</h3>
                                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                                    Buyer presents their <strong>Claim QR</strong> and pays cash at the Hub. Staff hands over the item and disburses funds to the seller's e-wallet or marks for cash claim.
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-ocean-teal-300">
                                    <Zap className="size-4" />
                                    <span>Zero meetup anxiety & instant payouts</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 6. Campus Impact & Metrics Counter */}
                <section className="py-20 border-b border-border/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <span className="text-xs font-bold uppercase tracking-wider text-ocean-teal">
                                Campus Mission
                            </span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                Real impact for the student body
                            </h2>
                            <p className="mt-3 text-base text-muted-foreground">
                                We are making university education more affordable and sustainable by keeping quality academic gear in circulation.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
                            <div className="p-6 rounded-2xl bg-card border border-border/60">
                                <span className="text-4xl sm:text-5xl font-black text-ocean-teal">60% – 80%</span>
                                <p className="mt-2 text-sm font-bold text-foreground">Average Student Discount</p>
                                <p className="text-xs text-muted-foreground mt-1">Compared to brand-new bookstore prices</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-card border border-border/60">
                                <span className="text-4xl sm:text-5xl font-black text-golden-sand">2,500+</span>
                                <p className="mt-2 text-sm font-bold text-foreground">Items Recirculated</p>
                                <p className="text-xs text-muted-foreground mt-1">Uniforms, textbooks, and course equipment</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-card border border-border/60">
                                <span className="text-4xl sm:text-5xl font-black text-seafoam-aqua">0%</span>
                                <p className="mt-2 text-sm font-bold text-foreground">Meetup Flake Rate</p>
                                <p className="text-xs text-muted-foreground mt-1">Backed by the physical campus Hub</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Academic Categories Showcase */}
                <section id="categories" className="py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-ocean-teal">
                                    Catalog
                                </span>
                                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                                    Popular Campus Categories
                                </h2>
                            </div>
                            <Link
                                href={targetBrowseUrl}
                                className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-ocean-teal hover:underline"
                            >
                                <span>Browse all categories</span>
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            
                            {/* Category 1: Uniforms & Scrubs */}
                            <Link
                                href={targetBrowseUrl}
                                className="group rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-ocean-teal hover:shadow-md"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-ocean-teal/10 text-ocean-teal mb-4 group-hover:scale-110 transition-transform">
                                    <Shirt className="size-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground group-hover:text-ocean-teal">
                                    Uniforms & Scrubs
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Nursing, HM, Tourism, PE uniforms, and formal college attire.
                                </p>
                            </Link>

                            {/* Category 2: Academic Textbooks */}
                            <Link
                                href={targetBrowseUrl}
                                className="group rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-golden-sand hover:shadow-md"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-golden-sand/15 text-golden-sand mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpen className="size-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground group-hover:text-golden-sand">
                                    Textbooks & Manuals
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Engineering calculus, law codals, accounting reviewers, and gen-ed books.
                                </p>
                            </Link>

                            {/* Category 3: Lab Equipment */}
                            <Link
                                href={targetBrowseUrl}
                                className="group rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-seafoam-aqua hover:shadow-md"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-seafoam-aqua/15 text-seafoam-aqua mb-4 group-hover:scale-110 transition-transform">
                                    <Beaker className="size-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground group-hover:text-seafoam-aqua">
                                    Lab Coats & Kits
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Dissection kits, safety goggles, lab coats, and chemistry sets.
                                </p>
                            </Link>

                            {/* Category 4: Engineering & Tools */}
                            <Link
                                href={targetBrowseUrl}
                                className="group rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-deep-indigo-400 hover:shadow-md"
                            >
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-deep-indigo/10 text-deep-indigo-600 dark:text-deep-indigo-300 mb-4 group-hover:scale-110 transition-transform">
                                    <Wrench className="size-6" />
                                </div>
                                <h3 className="text-base font-bold text-foreground group-hover:text-deep-indigo-500">
                                    Drafting & Calculators
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    T-squares, scientific calculators, drafting tables, and art supplies.
                                </p>
                            </Link>

                        </div>
                    </div>
                </section>

                {/* 8. Dual Role Pathways: Buyers vs Sellers (Replacing Inspo SaaS Pricing Cards) */}
                <section id="pathways" className="py-20 bg-muted/30 border-y border-border/60">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        
                        {/* Header */}
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="text-xs font-bold uppercase tracking-wider text-ocean-teal">
                                Tailored Experience
                            </span>
                            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                Built for Buyers & Sellers Alike
                            </h2>
                            <p className="mt-3 text-sm text-muted-foreground">
                                Transparent, student-first consignment powered by a unified campus profile.
                            </p>
                        </div>

                        {/* 2 Comparison Cards (matching Inspo side-by-side card structure) */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
                            
                            {/* Card 1: For Buyers */}
                            <div className="rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold text-foreground">For Student Buyers</h3>
                                        <span className="rounded-full bg-ocean-teal/10 px-3 py-1 text-xs font-bold text-ocean-teal">
                                            Save 50-80%
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Get your semester requirements without breaking the bank or taking chances on sketchy meetups.
                                    </p>

                                    <ul className="space-y-3.5 text-sm text-foreground">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-ocean-teal shrink-0" />
                                            <span>Filter by your specific college & course</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-ocean-teal shrink-0" />
                                            <span>15-min soft hold cart protection</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-ocean-teal shrink-0" />
                                            <span>Guaranteed 24h pickup window with Claim QR</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-ocean-teal shrink-0" />
                                            <span>Pay in physical cash at the Hub upon claim</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/40">
                                    <Link
                                        href={targetBrowseUrl}
                                        className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                                    >
                                        <span>Start Browsing Items</span>
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>

                            {/* Card 2: For Sellers (Highlighted) */}
                            <div className="rounded-3xl border border-ocean-teal bg-gradient-to-br from-card to-ocean-teal/5 p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold text-foreground">For Student Sellers</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Turn your completed course items and old uniforms into instant cash without managing meetups.
                                    </p>

                                    <ul className="space-y-3.5 text-sm text-foreground">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-seafoam-aqua shrink-0" />
                                            <span>Post item in 60 seconds with Drop-off QR</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-seafoam-aqua shrink-0" />
                                            <span>Drop off once at Hub; staff manages all sales</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-seafoam-aqua shrink-0" />
                                            <span>Zero meetup no-shows or uncomfortable haggling</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle2 className="size-4 text-seafoam-aqua shrink-0" />
                                            <span>Dual payout via e-wallet (GCash/Maya QR) or cash claim</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border/40">
                                    <Link
                                        href={register()}
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-ocean-teal py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-ocean-teal-600 hover:shadow-md"
                                    >
                                        <span>Start Listing Items</span>
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 9. Bottom Call to Action Banner (matching Inspo CTA block) */}
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A0E23] via-[#102B36] to-[#0A0E23] px-8 py-14 sm:p-16 text-center text-white shadow-2xl border border-white/10">
                            
                            {/* Decorative ambient elements */}
                            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-ocean-teal/20 blur-3xl" />

                            <div className="relative max-w-2xl mx-auto">
                                <span className="inline-block text-xs font-bold uppercase tracking-wider text-seafoam-aqua mb-2">
                                    Join The University Marketplace
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    Ready to declutter your locker or find affordable campus gear?
                                </h2>
                                <p className="mt-4 text-sm sm:text-base text-slate-300">
                                    Join thousands of fellow university students buying and selling safely with UniMart.
                                    Fast, verified, and physically backed right on campus.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href={register()}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-ocean-teal px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-ocean-teal-600 hover:scale-105"
                                    >
                                        <span>Create Free Student Account</span>
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <Link
                                        href={targetBrowseUrl}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm border border-white/15 transition-all hover:bg-white/20"
                                    >
                                        <span>Explore Campus Catalog</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 10. Campus Hub Schedule & Info Banner */}
                <section id="hub" className="py-12 bg-card border-t border-border/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-muted/40 p-6 border border-border/60">
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-ocean-teal/10 text-ocean-teal shrink-0">
                                    <MapPin className="size-6" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-foreground">Campus Hub Location & Hours</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Student Center Building, Room 204 • Open Mon–Fri, 8:00 AM – 5:00 PM
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    Hub Active & Open
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 11. Footer */}
                <footer className="border-t border-border/60 bg-background py-16 text-muted-foreground">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                            
                            {/* Brand Info */}
                            <div className="col-span-2 space-y-4">
                                <Link href="/" className="flex items-center gap-3">
                                    <AppLogoIcon className="size-10 object-contain" />
                                    <span className="text-xl font-black tracking-tight text-foreground font-sans">
                                        Uni<span className="text-golden-sand">Mart</span>
                                    </span>
                                </Link>
                                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                    The centralized, closed-loop consignment platform built exclusively for the university ecosystem. Safe handovers, QR-verified pickups, and instant student payouts.
                                </p>
                                <p className="text-xs text-muted-foreground/80">
                                    © {new Date().getFullYear()} UniMart. All Rights Reserved.
                                </p>
                            </div>

                            {/* Column 1: Academic Categories */}
                            <div className="space-y-3 text-xs">
                                <h4 className="font-bold text-foreground uppercase tracking-wider">Categories</h4>
                                <ul className="space-y-2">
                                    <li><Link href={targetBrowseUrl} className="hover:text-foreground">Uniforms & Scrubs</Link></li>
                                    <li><Link href={targetBrowseUrl} className="hover:text-foreground">Textbooks & Reviewers</Link></li>
                                    <li><Link href={targetBrowseUrl} className="hover:text-foreground">PE Equipment & Shirts</Link></li>
                                    <li><Link href={targetBrowseUrl} className="hover:text-foreground">Lab Equipment & Coats</Link></li>
                                    <li><Link href={targetBrowseUrl} className="hover:text-foreground">Drafting & Calculators</Link></li>
                                </ul>
                            </div>

                            {/* Column 2: Platform Features */}
                            <div className="space-y-3 text-xs">
                                <h4 className="font-bold text-foreground uppercase tracking-wider">Platform</h4>
                                <ul className="space-y-2">
                                    <li><a href="#how-it-works" className="hover:text-foreground">How It Works</a></li>
                                    <li><a href="#features" className="hover:text-foreground">Consignment Model</a></li>
                                    <li><a href="#pathways" className="hover:text-foreground">Two-Stage Holds</a></li>
                                    <li><a href="#hub" className="hover:text-foreground">QR Verification</a></li>
                                    <li><a href="#pathways" className="hover:text-foreground">Dual Payouts</a></li>
                                </ul>
                            </div>

                            {/* Column 3: Campus & Help */}
                            <div className="space-y-3 text-xs">
                                <h4 className="font-bold text-foreground uppercase tracking-wider">Hub & Support</h4>
                                <ul className="space-y-2">
                                    <li><a href="#hub" className="hover:text-foreground">Campus Hub Schedule</a></li>
                                    <li><a href="#hub" className="hover:text-foreground">Drop-off Guidelines</a></li>
                                    <li><Link href={login()} className="hover:text-foreground">Student Portal</Link></li>
                                    <li><Link href={register()} className="hover:text-foreground">Register Account</Link></li>
                                    <li><span className="text-muted-foreground/60">Terms & Safety</span></li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
