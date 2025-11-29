"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
    { name: "FAQ", href: "#faq" },
    { name: "Potvrdite Dolazak", href: "#rsvp" },
    { name: "Accommodations", href: "#accommodations" },
    { name: "Contact", href: "#contact" },
    { name: "About", href: "#about" },
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
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-12 pt-20">
          {/* Names */}
          <div className="animate-fade-in-up">
            <h1
              className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.24em] uppercase mb-2"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Tina
            </h1>
            <p
              className="text-white text-3xl sm:text-4xl md:text-5xl tracking-[0.24em] uppercase my-4"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              &
            </p>
            <h1
              className="text-white text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-[0.24em] uppercase"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Sven
            </h1>
          </div>

          {/* Welcome text */}
          <p
            className="text-white text-sm sm:text-base tracking-[0.48em] uppercase mt-16 mb-4 animate-fade-in-up"
            style={{
              fontFamily: "var(--font-montserrat)",
              animationDelay: "0.2s",
            }}
          >
            Dobrodošli na naše
          </p>

          {/* Vjenčanje */}
          <h2
            className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal animate-fade-in-up"
            style={{
              fontFamily: "var(--font-great-vibes)",
              textShadow: "0 4px 17px rgba(0,0,0,0.325)",
              animationDelay: "0.3s",
            }}
          >
            Vjenčanje
          </h2>

          {/* Date and Location Badge */}
          <div
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
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
            className="text-white text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-center mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Priča o nama
          </h2>

          {/* Subtitle */}
          <p
            className="text-[#f7ebe9] text-3xl sm:text-4xl md:text-5xl text-center mb-12 md:mb-16"
            style={{ fontFamily: "var(--font-great-vibes)" }}
          >
            7 godina iza, zauvijek pred nama
          </p>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text Content */}
            <div className="text-white text-center md:text-left">
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

            {/* Image */}
            <div className="relative">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-2xl transform rotate-2">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                  }}
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 text-4xl">❦</div>
              <div className="absolute -top-4 -right-4 text-4xl transform rotate-180">❦</div>
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
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat opacity-50"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Title */}
          <h2
            className="text-[#f9f7f8] text-3xl sm:text-4xl md:text-5xl font-normal mb-12"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            S veseljem odbrojavamo
          </h2>

          {/* Countdown Timer */}
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-8 sm:px-16 py-8">
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
            className="text-[#a6aec4] text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide text-center mb-16"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Detalji vjenčanja
          </h2>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Detail Card 1 */}
            <div className="text-center">
              <div className="w-32 h-40 mx-auto mb-6 relative">
                <div
                  className="w-full h-full bg-cover bg-center rounded-lg shadow-lg"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')`,
                  }}
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
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div
                  className="w-full h-full bg-cover bg-center rounded-lg shadow-lg"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')`,
                  }}
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
              <div className="w-32 h-28 mx-auto mb-6 relative opacity-70">
                <div
                  className="w-full h-full bg-cover bg-center rounded-lg shadow-lg"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')`,
                  }}
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
              <div className="w-28 h-36 mx-auto mb-6 relative opacity-70">
                <div
                  className="w-full h-full bg-cover bg-center rounded-lg shadow-lg"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80')`,
                  }}
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-[#304254] text-4xl sm:text-5xl md:text-6xl font-normal uppercase tracking-wide mb-8"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Potvrdite Dolazak
          </h2>
          <p
            className="text-[#304254]/70 text-lg mb-12"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Molimo vas da potvrdite svoj dolazak do 1. ožujka 2027.
          </p>
          <Link
            href="#contact"
            className="inline-block bg-[#a0bdca] text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-[#8badb9] transition-colors"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <button className="hover:text-[#a0bdca] transition-colors">
                Terms & Support
              </button>
              <button className="hover:text-[#a0bdca] transition-colors">
                Privacy Policy
              </button>
            </div>
            <div className="text-sm">
              Made with ❤️ for Tina & Sven
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
