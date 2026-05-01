"use client";

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import RSVPForm from "./RSVPForm";
import { useScrollReveal } from "./useScrollReveal";

interface HomePageClientProps {
  carouselSlot: ReactNode;
}

export default function HomePageClient({ carouselSlot }: HomePageClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Scroll-triggered animations
  useScrollReveal();

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Countdown timer
  useEffect(() => {
    const weddingDate = new Date("2027-05-01T18:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = weddingDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Raspored", href: "#raspored" },
    { name: "Potvrdite Dolazak", href: "#rsvp" },
    { name: "Kontakt", href: "#kontakt" },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#f7ebe9]/95 backdrop-blur-sm shadow-md"
            : "bg-[#f7ebe9]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Desktop Navigation */}
            <ul className="hidden lg:flex items-center justify-center flex-1 space-x-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#304254] hover:text-[#a0bdca] transition-colors font-medium text-sm tracking-wide"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-[#304254]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#304254]/10">
              <ul className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="block text-[#304254] hover:text-[#a0bdca] transition-colors font-medium text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center text-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Background image main"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-12 pt-20">
          {/* Names */}
          <div>
            <h1
              className="hero-name-1 text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.24em] uppercase mb-2"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Tina
            </h1>
            <p
              className="hero-ampersand text-white text-3xl sm:text-4xl md:text-5xl tracking-[0.24em] uppercase my-4"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              &
            </p>
            <h1
              className="hero-name-2 text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.24em] uppercase"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Sven
            </h1>
          </div>

          {/* Welcome text */}
          <p
            className="hero-welcome text-white text-sm sm:text-base tracking-[0.48em] uppercase mt-16 mb-4"
            style={{
              fontFamily: "var(--font-montserrat)",
            }}
          >
            Dobrodošli na naše
          </p>

          {/* Vjenčanje */}
          <h2
            className="hero-script text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal"
            style={{
              fontFamily: "var(--font-great-vibes)",
              textShadow: "0 4px 17px rgba(0,0,0,0.325)",
            }}
          >
            Vjenčanje
          </h2>

          {/* Date and Location Badge */}
          <div className="mt-16 hero-badge">
            <div className="inline-block bg-[#a0bdca]/80 rounded-full px-16 py-4">
              <p
                className="text-white text-base sm:text-lg tracking-[0.23em] uppercase"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                1.svibnja, 2027
              </p>
              <p
                className="text-white text-base sm:text-lg tracking-[0.23em] uppercase"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Zagreb
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - "Priča o nama" */}
      <section
        id="about"
        className="relative py-20 md:py-32 bg-[#b2d6e9]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <h2
            className="scroll-reveal fade-up text-white text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-center mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Priča o nama
          </h2>

          {/* Subtitle */}
          <p
            className="scroll-reveal fade-up text-[#f7ebe9] text-3xl sm:text-4xl md:text-5xl text-center mb-12 md:mb-16"
            style={{ fontFamily: "var(--font-great-vibes)" }}
          >
            7 godina iza, zauvijek pred nama
          </p>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="scroll-reveal fade-left text-white text-center md:text-left">
              <p
                className="text-lg md:text-xl leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Lorem ipsum dolor sit amet,
              </p>
              <p
                className="text-lg md:text-xl leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p
                className="text-lg md:text-xl leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur.
              </p>
              <p
                className="text-lg md:text-xl leading-relaxed"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
            </div>

            {/* Image Carousel Slot */}
            <div className="scroll-reveal fade-right">
              {carouselSlot}
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section
        id="countdown"
        className="relative py-20 md:py-32 bg-[#737373]"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full opacity-50">
            <Image
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                alt="Background"
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Title */}
          <h2
            className="scroll-reveal fade-up text-[#f9f7f8] text-3xl sm:text-4xl md:text-5xl font-normal mb-12"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            S veseljem odbrojavamo
          </h2>

          {/* Countdown Timer */}
          <div className="scroll-reveal fade-in inline-block bg-white/20 backdrop-blur-sm rounded-full px-8 sm:px-16 py-8">
            <div className="flex items-center justify-center space-x-4 sm:space-x-8">
              <div className="text-center">
                <div className="text-white text-4xl sm:text-5xl md:text-6xl font-light">
                  {countdown.days.toString().padStart(2, "0")}
                </div>
                <div className="text-white/80 text-xs sm:text-sm uppercase tracking-wider mt-2">
                  Dana
                </div>
              </div>
              <div className="text-white text-3xl">:</div>
              <div className="text-center">
                <div className="text-white text-4xl sm:text-5xl md:text-6xl font-light">
                  {countdown.hours.toString().padStart(2, "0")}
                </div>
                <div className="text-white/80 text-xs sm:text-sm uppercase tracking-wider mt-2">
                  Sati
                </div>
              </div>
              <div className="text-white text-3xl">:</div>
              <div className="text-center">
                <div className="text-white text-4xl sm:text-5xl md:text-6xl font-light">
                  {countdown.minutes.toString().padStart(2, "0")}
                </div>
                <div className="text-white/80 text-xs sm:text-sm uppercase tracking-wider mt-2">
                  Minuta
                </div>
              </div>
              <div className="text-white text-3xl">:</div>
              <div className="text-center">
                <div className="text-white text-4xl sm:text-5xl md:text-6xl font-light">
                  {countdown.seconds.toString().padStart(2, "0")}
                </div>
                <div className="text-white/80 text-xs sm:text-sm uppercase tracking-wider mt-2">
                  Sekundi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wedding Details Section */}
      <section
        id="raspored"
        className="relative py-20 md:py-32 bg-[#deebf0]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <h2
            className="scroll-reveal fade-up text-[#a6aec4] text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-center mb-16"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Detalji vjenčanja
          </h2>

          {/* Details Grid */}
          <div className="scroll-reveal fade-up grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Detail Card 1 */}
            <div className="text-center">
              <div className="w-36 h-48 mx-auto mb-6 relative rounded-lg shadow-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Dolazak gostiju"
                  fill
                  sizes="144px"
                  className="object-cover object-center"
                />
              </div>
              <p
                className="text-[#a6aec4] text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                14:00
              </p>
              <p
                className="text-[#a6aec4] text-sm sm:text-base"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Dolazak gostiju
              </p>
            </div>

            {/* Detail Card 2 */}
            <div className="text-center">
              <div className="w-36 h-48 mx-auto mb-6 relative rounded-lg shadow-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Ceremonija"
                  fill
                  sizes="144px"
                  className="object-cover object-center"
                />
              </div>
              <p
                className="text-[#a6aec4] text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                15:00
              </p>
              <p
                className="text-[#a6aec4] text-sm sm:text-base"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Ceremonija
              </p>
            </div>

            {/* Detail Card 3 */}
            <div className="text-center">
              <div className="w-36 h-48 mx-auto mb-6 relative rounded-lg shadow-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Koktel"
                  fill
                  sizes="144px"
                  className="object-cover object-center"
                />
              </div>
              <p
                className="text-[#a6aec4] text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                17:00
              </p>
              <p
                className="text-[#a6aec4] text-sm sm:text-base"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Koktel
              </p>
            </div>

            {/* Detail Card 4 */}
            <div className="text-center">
              <div className="w-36 h-48 mx-auto mb-6 relative rounded-lg shadow-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Večera i zabava"
                  fill
                  sizes="144px"
                  className="object-cover object-center"
                />
              </div>
              <p
                className="text-[#a6aec4] text-2xl sm:text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                19:00
              </p>
              <p
                className="text-[#a6aec4] text-sm sm:text-base"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Večera i zabava
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section
        id="rsvp"
        className="relative py-20 md:py-32 bg-[#f7ebe9]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="scroll-reveal fade-up text-[#304254] text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide mb-8 text-center"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Potvrdite Dolazak
          </h2>
          <p
            className="scroll-reveal fade-up text-[#304254]/70 text-lg mb-12 text-center"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Molimo vas da potvrdite svoj dolazak do 1. ožujka 2027.
          </p>
          <RSVPForm />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 bg-[#b2d6e9]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="scroll-reveal fade-up text-[#304254] text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Kontakt
          </h2>
          <p
            className="scroll-reveal fade-up text-[#304254]/70 text-3xl sm:text-4xl md:text-5xl mb-12"
            style={{ fontFamily: "var(--font-great-vibes)" }}
          >
            Javite nam se s povjerenjem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Tina */}
            <div className="scroll-reveal fade-left bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3
                className="text-[#304254] text-2xl md:text-3xl font-normal uppercase tracking-wide mb-6"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Tina
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:tina@example.com"
                  className="flex items-center justify-center gap-3 text-[#304254] hover:text-[#5b8fa8] transition-colors"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-sm md:text-base">tinamelkic@gmail.com</span>
                </a>
                <a
                  href="tel:+385911234567"
                  className="flex items-center justify-center gap-3 text-[#304254] hover:text-[#5b8fa8] transition-colors"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-sm md:text-base">+385 99 837 3201</span>
                </a>
              </div>
            </div>

            {/* Sven */}
            <div className="scroll-reveal fade-right bg-white/40 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3
                className="text-[#304254] text-2xl md:text-3xl font-normal uppercase tracking-wide mb-6"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Sven
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:sven@example.com"
                  className="flex items-center justify-center gap-3 text-[#304254] hover:text-[#5b8fa8] transition-colors"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-sm md:text-base">sven.scekic@gmail.com</span>
                </a>
                <a
                  href="tel:+385917654321"
                  className="flex items-center justify-center gap-3 text-[#304254] hover:text-[#5b8fa8] transition-colors"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-sm md:text-base">+385 99 789 8178</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="text-sm">
              Made with ❤️ for Tina & Sven
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
