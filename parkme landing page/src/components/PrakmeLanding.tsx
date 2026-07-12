"use client";

import { useState, type ReactNode } from "react";

/* ── icons ── */
function Svg({ children, size = 22, viewBox = "0 0 24 24" }: { children: ReactNode; size?: number; viewBox?: string }) {
  return <svg width={size} height={size} viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}
const Icons = {
  shield: <Svg><path d="M12 3 19 6v5c0 4.7-3 7.6-7 10-4-2.4-7-5.3-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></Svg>,
  car: <Svg><path d="M5 16 6.7 9h10.6l1.7 7" /><path d="M3.5 16.5h17v3a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-3Z" /><circle cx="7" cy="17.5" r="1" fill="currentColor" /><circle cx="17" cy="17.5" r="1" fill="currentColor" /></Svg>,
  pin: <Svg><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.4" /></Svg>,
  star: <Svg><path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" /></Svg>,
  users: <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>,
  home: <Svg><path d="m4 11 8-7 8 7v9H4v-9Z" /><path d="M9 20v-5h6v5" /></Svg>,
  clock: <Svg><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></Svg>,
  wallet: <Svg><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" /><path d="M4 8h15" /><path d="M16 13h3" /></Svg>,
  arrow: <Svg><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>,
  check: <Svg><path d="m5 12 4.2 4.2L19 6.5" /></Svg>,
  sparkle: <Svg><path d="m12 3 1.45 5.55L19 10l-5.55 1.45L12 17l-1.45-5.55L5 10l5.55-1.45L12 3ZM19 16l.65 2.35L22 19l-2.35.65L19 22l-.65-2.35L16 19l2.35-.65L19 16Z" /></Svg>,
  menu: <Svg><path d="M4 7h16M4 12h16M4 17h16" /></Svg>,
  close: <Svg><path d="m6 6 12 12M18 6 6 18" /></Svg>,
  play: <Svg><circle cx="12" cy="12" r="9.5" /><path d="m10 8.5 5.5 3.5-5.5 3.5V8.5Z" fill="currentColor" stroke="none" /></Svg>,
};

/* ── Ethiopian Flag decorative bar ── */
function FlagBar({ tall }: { tall?: boolean }) {
  return <div className={`flag-bar ${tall ? "flag-bar-tall" : ""}`} aria-hidden="true"><span className="flag-green" /><span className="flag-yellow" /><span className="flag-red" /></div>;
}

/* ── Section wrapper ── */
function Section({ id, children, dark }: { id?: string; children: ReactNode; dark?: boolean }) {
  return <section id={id} className={`prakme-section ${dark ? "prakme-section-dark" : ""}`}><div className="prakme-container">{children}</div></section>;
}

/* ── Animated stat counter ── */
function Counter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  return <div className="stat-card"><span className="stat-value">{value.toLocaleString()}{suffix}</span><span className="stat-label">{label}</span></div>;
}

export default function PrakmeLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", role: "driver" as "driver" | "host" | "both" });
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormState("submitting");
    setFormError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFormError(data.error || "Registration failed. Please try again.");
        setFormState("error");
        return;
      }
      setRegisteredName(data.user.name);
      setFormState("success");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  }

  return (
    <div className="prakme-landing">
      {/* ── Navigation ── */}
      <header className="prakme-nav">
        <div className="prakme-container nav-inner">
          <a href="#" className="prakme-logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">rakme</span>
            <span className="logo-dot">•</span>
            <span className="logo-loc">ET</span>
          </a>
          <nav className={`prakme-nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#goals" onClick={() => setMenuOpen(false)}>Goals</a>
            <a href="#select" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#driver" onClick={() => setMenuOpen(false)}>For Drivers</a>
            <a href="#host" onClick={() => setMenuOpen(false)}>For Hosts</a>
            <a href="#join" className="nav-cta" onClick={() => setMenuOpen(false)}>Join Prakme</a>
          </nav>
          <button className="prakme-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? Icons.close : Icons.menu}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="prakme-hero">
        <FlagBar tall />
        <div className="prakme-container hero-inner">
          <div className="hero-badge"><span>{Icons.sparkle}</span> Ethiopia&apos;s trusted mobility platform</div>
          <h1>Park.<br /><span className="hero-highlight">Ride.</span><br />Earn.</h1>
          <p className="hero-sub">Prakme connects drivers, hosts, and riders across Ethiopia — from Addis Ababa to every corner of the nation. One platform for every journey.</p>
          <div className="hero-actions">
            <a href="#select" className="btn-primary">Find parking {Icons.arrow}</a>
            <a href="#host" className="btn-outline">{Icons.play} How Prakme works</a>
          </div>
          <div className="hero-stats">
            <Counter value={1280} suffix="+" label="Parking spaces listed" />
            <Counter value={34} suffix="K+" label="Rides completed" />
            <Counter value={96} suffix="%" label="Customer satisfaction" />
            <Counter value={12} label="Cities across Ethiopia" />
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-carousel">
            <div className="hero-card hero-card-1"><span className="hc-icon">{Icons.pin}</span><div><b>Unity Park Garage</b><small>Arat Kilo · 35 ETB/hr</small></div><span className="hc-badge green">Best value</span></div>
            <div className="hero-card hero-card-2"><span className="hc-icon">{Icons.car}</span><div><b>Bole Medhanialem</b><small>Covered · 6 spots left</small></div><span className="hc-badge yellow">Covered</span></div>
            <div className="hero-card hero-card-3"><span className="hc-icon">{Icons.home}</span><div><b>Meskel Square Lot</b><small>Open air · 18 spots</small></div><span className="hc-badge red">Open air</span></div>
          </div>
          <div className="hero-map-dot" />
          <div className="hero-map-pulse" />
        </div>
        <div className="hero-flag-stripe" aria-hidden="true"><span /><span /><span /></div>
      </section>

      {/* ── Goals ── */}
      <Section id="goals">
        <div className="section-eyebrow">{Icons.star} Our mission</div>
        <h2 className="section-heading">Building Ethiopia&apos;s<br />mobility future</h2>
        <p className="section-sub">Prakme was born in Addis Ababa with a simple belief: every Ethiopian deserves reliable, affordable, and dignified access to parking and transportation.</p>
        <div className="goals-grid">
          <article className="goal-card">
            <span className="goal-icon green">{Icons.shield}</span>
            <h3>Trust & Safety</h3>
            <p>Every driver and host is verified. Every transaction is secured. We built Prakme on a foundation of trust so you can focus on your journey.</p>
          </article>
          <article className="goal-card">
            <span className="goal-icon yellow">{Icons.users}</span>
            <h3>Community First</h3>
            <p>Prakme is a platform for Ethiopians, by Ethiopians. We reinvest in local communities, support small businesses, and create dignified income for thousands of hosts and drivers.</p>
          </article>
          <article className="goal-card">
            <span className="goal-icon red">{Icons.pin}</span>
            <h3>Every Corner Covered</h3>
            <p>From Addis Ababa to Mekelle, Dire Dawa to Hawassa — we are expanding to bring Prakme parking and rides to every city and every neighbourhood in Ethiopia.</p>
          </article>
        </div>
      </Section>

      {/* ── Selection ── */}
      <Section id="select" dark>
        <FlagBar />
        <div className="section-eyebrow light">{Icons.clock} How to book</div>
        <h2 className="section-heading light">Select. Park. Go.</h2>
        <p className="section-sub light">Three simple steps to get your Prakme experience started — right from your phone.</p>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <span className="step-icon">{Icons.pin}</span>
            <h3>Choose your spot</h3>
            <p>Browse verified parking spaces near you. Compare prices, read reviews, and pick the perfect spot for your car.</p>
            <div className="step-tag">Available 24/7</div>
          </div>
          <div className="step-connector" aria-hidden="true"><span /><span /><span /></div>
          <div className="step-card">
            <span className="step-number">02</span>
            <span className="step-icon">{Icons.wallet}</span>
            <h3>Pay securely</h3>
            <p>Use ArkWallet or telebirr for instant, secure payments. Apply coupon codes and track every transaction in your ledger.</p>
            <div className="step-tag">telebirr & wallet</div>
          </div>
          <div className="step-connector" aria-hidden="true"><span /><span /><span /></div>
          <div className="step-card">
            <span className="step-number">03</span>
            <span className="step-icon">{Icons.car}</span>
            <h3>Drive in & park</h3>
            <p>Scan your QR pass at the gate, unlock your space with a secure gate code, and enjoy peace of mind while you go about your day.</p>
            <div className="step-tag">Code & QR entry</div>
          </div>
        </div>
      </Section>

      {/* ── Driver Section ── */}
      <Section id="driver">
        <div className="split-section">
          <div className="split-text">
            <div className="section-eyebrow">{Icons.car} For drivers</div>
            <h2 className="section-heading">Park with<br />confidence</h2>
            <p className="section-sub">As a Prakme driver, you get: live availability across the city, upfront pricing with no hidden fees, digital gate codes so you never wait, and a wallet that tracks every birr you spend.</p>
            <ul className="feature-list">
              <li>{Icons.check} <span><b>Live availability map</b> — see open spaces in real time across Addis</span></li>
              <li>{Icons.check} <span><b>Upfront pricing</b> — know exactly what you pay before you arrive</span></li>
              <li>{Icons.check} <span><b>Digital gate passes</b> — QR codes and gate codes, no paper tickets</span></li>
              <li>{Icons.check} <span><b>Active pass timer</b> — track your elapsed parking time live</span></li>
              <li>{Icons.check} <span><b>Wallet & telebirr</b> — pay the way that works for you in Ethiopia</span></li>
            </ul>
            <a href="#join" className="btn-primary">Start driving with Prakme {Icons.arrow}</a>
          </div>
          <div className="split-visual driver-visual">
            <div className="driver-card">
              <FlagBar />
              <div className="driver-card-body">
                <span className="driver-badge">ACTIVE DRIVER PASS</span>
                <h3>Unity Park Garage</h3>
                <p>Level B · Space 27 · Arat Kilo</p>
                <div className="driver-code"><span>GATE CODE</span><b>4 8 2 6</b></div>
                <div className="driver-timer"><span>elapsed</span><b>01:18:32</b></div>
              </div>
              <div className="driver-card-notch left" /><div className="driver-card-notch right" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Host Section ── */}
      <Section id="host" dark>
        <FlagBar />
        <div className="split-section reverse">
          <div className="split-visual host-visual">
            <div className="host-earnings-card">
              <div className="host-earnings-header">
                <span className="host-avatar">MT</span>
                <div><b>Miki Tadesse</b><small>Host since 2024</small></div>
                <span className="host-badge">PRO</span>
              </div>
              <div className="host-earnings-body">
                <div className="host-metric"><small>This month</small><b>4,680 ETB</b><span className="up">↑ 18.5%</span></div>
                <div className="host-metric"><small>Active spaces</small><b>2</b></div>
                <div className="host-metric"><small>Bookings</small><b>42</b></div>
              </div>
              <div className="host-payout-bar"><span>Next payout: Monday</span><b>3,240 ETB</b></div>
            </div>
          </div>
          <div className="split-text">
            <div className="section-eyebrow light">{Icons.home} For hosts</div>
            <h2 className="section-heading light">Earn from your<br />extra space</h2>
            <p className="section-sub light">If you own a driveway, garage, or empty lot anywhere in Ethiopia, Prakme turns it into income. List your space in minutes, set your own price, block off dates you need, and watch the bookings come in.</p>
            <ul className="feature-list light">
              <li>{Icons.check} <span><b>List in 5 minutes</b> — snap a photo, set a price, go live instantly</span></li>
              <li>{Icons.check} <span><b>You control pricing</b> — adjust hourly rates anytime from your dashboard</span></li>
              <li>{Icons.check} <span><b>Blocked-date calendar</b> — mark days your space is unavailable</span></li>
              <li>{Icons.check} <span><b>Real earnings dashboard</b> — track every booking and payout in real time</span></li>
              <li>{Icons.check} <span><b>Payout to CBE or telebirr</b> — receive your earnings weekly, your way</span></li>
            </ul>
            <a href="#join" className="btn-primary light">Become a Prakme host {Icons.arrow}</a>
          </div>
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section>
        <div className="section-eyebrow">{Icons.star} Trusted across Ethiopia</div>
        <h2 className="section-heading">What Prakme<br />users say</h2>
        <div className="testimonials-grid">
          <article className="testimonial-card">
            <div className="testimonial-stars">{"★★★★★"}</div>
            <p>&ldquo;I used to circle Bole for 20 minutes looking for parking. Now I open Prakme and reserve a spot in seconds. It has changed how I move around Addis.&rdquo;</p>
            <div className="testimonial-author"><span className="ta-avatar">SA</span><div><b>Semere Alemu</b><small>Driver · Addis Ababa</small></div></div>
          </article>
          <article className="testimonial-card">
            <div className="testimonial-stars">{"★★★★★"}</div>
            <p>&ldquo;I listed my unused garage near Meskel Square and earned over 12,000 ETB in three months. The dashboard is simple and the payouts always arrive on time.&rdquo;</p>
            <div className="testimonial-author"><span className="ta-avatar">HG</span><div><b>Hanna Gebre</b><small>Host · Meskel Square</small></div></div>
          </article>
          <article className="testimonial-card">
            <div className="testimonial-stars">{"★★★★★"}</div>
            <p>&ldquo;As someone who drives between Bole and Arat Kilo every day, Prakme is a lifesaver. The gate codes work every time and the wallet integration with telebirr is seamless.&rdquo;</p>
            <div className="testimonial-author"><span className="ta-avatar">DT</span><div><b>Dawit Tesfaye</b><small>Driver · Bole</small></div></div>
          </article>
        </div>
      </Section>

      {/* ── Registration ── */}
      <Section id="join">
        <div className="register-section">
          <FlagBar />
          {formState === "success" ? (
            <div className="register-success">
              <span className="register-success-icon">{Icons.check}</span>
              <h2>Welcome to Prakme, {registeredName.split(" ")[0]}!</h2>
              <p>Your account has been created. You can now park, ride, and earn across Ethiopia.</p>
              <a href="/app" className="btn-primary large">Open Prakme app {Icons.arrow}</a>
            </div>
          ) : (
            <div className="register-block">
              <div className="register-intro">
                <div className="section-eyebrow">{Icons.sparkle} Start your journey</div>
                <h2>Create your Prakme account</h2>
                <p>Join thousands of Ethiopians parking, riding, and earning with Prakme. Free registration — takes under a minute.</p>
              </div>

              <form className="register-form" onSubmit={handleRegister}>
                {/* Role selector */}
                <div className="register-role-tabs">
                  <label className={`role-tab ${form.role === "driver" ? "active" : ""}`}>
                    <input type="radio" name="role" value="driver" checked={form.role === "driver"} onChange={() => setForm({ ...form, role: "driver" })} />
                    <span className="role-icon">{Icons.car}</span>
                    <span className="role-label">Driver</span>
                    <small>Park & ride</small>
                  </label>
                  <label className={`role-tab ${form.role === "host" ? "active" : ""}`}>
                    <input type="radio" name="role" value="host" checked={form.role === "host"} onChange={() => setForm({ ...form, role: "host" })} />
                    <span className="role-icon">{Icons.home}</span>
                    <span className="role-label">Host</span>
                    <small>Earn from space</small>
                  </label>
                  <label className={`role-tab ${form.role === "both" ? "active" : ""}`}>
                    <input type="radio" name="role" value="both" checked={form.role === "both"} onChange={() => setForm({ ...form, role: "both" })} />
                    <span className="role-icon">{Icons.users}</span>
                    <span className="role-label">Both</span>
                    <small>Park & earn</small>
                  </label>
                </div>

                {/* Fields */}
                <div className="register-fields">
                  <div className="register-field">
                    <label htmlFor="reg-name">Full name</label>
                    <input id="reg-name" type="text" placeholder="e.g. Miki Tadesse" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required minLength={2} />
                  </div>
                  <div className="register-field">
                    <label htmlFor="reg-email">Email address</label>
                    <input id="reg-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="register-field">
                    <label htmlFor="reg-phone">Phone number</label>
                    <input id="reg-phone" type="tel" placeholder="+251 9XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required minLength={9} />
                  </div>
                  <div className="register-field">
                    <label htmlFor="reg-password">Password</label>
                    <input id="reg-password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  </div>
                </div>

                {formError && <p className="register-error">{formError}</p>}

                <button type="submit" className="btn-primary large register-submit" disabled={formState === "submitting"}>
                  {formState === "submitting" ? "Creating your account..." : "Create free account"} {Icons.arrow}
                </button>

                <p className="register-disclaimer">
                  By registering, you agree to Prakme&apos;s <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </p>
              </form>

              <div className="register-trust">
                <span>{Icons.shield} Secured by Ethiopian banking standards</span>
                <span>{Icons.users} 34,000+ active users</span>
                <span>{Icons.star} 4.8 average rating</span>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="prakme-footer">
        <FlagBar />
        <div className="prakme-container footer-inner">
          <div className="footer-brand">
            <a href="#" className="prakme-logo"><span className="logo-mark">P</span><span className="logo-text">rakme</span><span className="logo-dot">•</span><span className="logo-loc">ET</span></a>
            <p>Ethiopia&apos;s parking and mobility platform. Park. Ride. Earn.</p>
          </div>
          <div className="footer-links">
            <div><b>Platform</b><a href="#select">How it works</a><a href="#driver">For drivers</a><a href="#host">For hosts</a><a href="#goals">Our mission</a></div>
            <div><b>Company</b><a href="#">About Prakme</a><a href="#">Careers</a><a href="#">Press</a><a href="#">Contact</a></div>
            <div><b>Support</b><a href="#">Help centre</a><a href="#">Safety guidelines</a><a href="#">Terms of service</a><a href="#">Privacy policy</a></div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="prakme-container"><span>© 2024 Prakme ET. All rights reserved.</span><span>Made with 🇪🇹 in Addis Ababa</span></div>
        </div>
      </footer>
    </div>
  );
}
