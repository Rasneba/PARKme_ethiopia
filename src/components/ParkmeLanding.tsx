"use client";

import { useEffect, useRef, useState } from "react";

const IMG = {
  heroCity: "https://images.pexels.com/photos/35368884/pexels-photo-35368884.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
  parking: "https://images.pexels.com/photos/15216662/pexels-photo-15216662.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  addis2: "https://images.pexels.com/photos/36200692/pexels-photo-36200692.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

function Counter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const step = (now: number) => { const p = Math.min((now - start) / duration, 1); setVal(Math.floor(p * end)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
      observer.disconnect();
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); o.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`fade-in ${vis ? "visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const goals = [
  { icon: "🅿️", title: "Instant Parking", desc: "Find and reserve a verified parking spot in Addis Ababa in under 60 seconds.", color: "green" },
  { icon: "💰", title: "Earn As a Host", desc: "Turn your empty driveway, compound, or garage into a steady income stream.", color: "yellow" },
  { icon: "🛡️", title: "Safe & Secure", desc: "Every space is verified. Every transaction is protected. Every car is insured.", color: "red" },
  { icon: "🌍", title: "Ethiopian Made", desc: "Built in Addis, for Addis. Solving real parking pain with local knowledge.", color: "green" },
  { icon: "📱", title: "Smart Booking", desc: "Digital gate codes, live timer, wallet payments, and telebirr integration.", color: "yellow" },
  { icon: "📊", title: "Host Dashboard", desc: "Track earnings, manage availability, set dynamic pricing — all in one place.", color: "red" },
];

const steps = [
  { num: "01", title: "Search your destination", desc: "Enter where you're heading. We'll show every available space nearby with real-time pricing." },
  { num: "02", title: "Reserve & pay instantly", desc: "Pick your duration, pay via ParkWallet or telebirr. Your gate code appears immediately." },
  { num: "03", title: "Park with confidence", desc: "Navigate to your space, scan your QR pass at the gate, and park stress-free." },
];

const testimonials = [
  { name: "Abebe K.", role: "Driver, Bole", quote: "I used to circle for 20 minutes looking for parking near Edna Mall. Now I reserve ahead and walk straight in.", avatar: "AK" },
  { name: "Tigist M.", role: "Host, Arat Kilo", quote: "My compound sits empty while I'm at work. With Parkme I earn 4,000+ ETB a month from that space.", avatar: "TM" },
  { name: "Dawit S.", role: "Driver, Meskel Sq", quote: "The gate code system is brilliant. No attendants, no confusion. Just scan and go.", avatar: "DS" },
];

export default function ParkmeLanding() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [role, setRole] = useState<"driver" | "host">("driver");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regError, setRegError] = useState("");
  const [registered, setRegistered] = useState<{ fullName: string; email: string; role: string } | null>(null);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setRegError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });
      const data = (await res.json()) as { user?: { fullName: string; email: string; role: string }; error?: string };
      if (!res.ok || !data.user) throw new Error(data.error ?? "Registration failed. Please try again.");
      setRegistered(data.user);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="lp">
      <div className="flag-top"><i /><i /><i /></div>

      <nav className="lp-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="logo-mark">P</span>
            <div className="logo-text"><b>Park</b><span>me</span></div>
          </div>
          <div className={`nav-links ${mobileMenu ? "open" : ""}`}>
            <a href="#goals" onClick={() => setMobileMenu(false)}>Goals</a>
            <a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
            <a href="#choose" onClick={() => setMobileMenu(false)}>Get started</a>
            <a href="#stories" onClick={() => setMobileMenu(false)}>Stories</a>
            <a href="#register" className="nav-cta" onClick={() => setMobileMenu(false)}>Create account</a>
          </div>
          <a href={`/app?role=${role}`} className="nav-open-app">Open App</a>
          <button className="nav-burger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${IMG.heroCity})` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <FadeIn>
            <div className="hero-badge">
              <span className="hero-flag"><i /><i /><i /></span>
              <span>Made in Ethiopia 🇪🇹</span>
            </div>
          </FadeIn>
          <FadeIn delay={100}><h1>Park smarter<br />across <em>Addis Ababa</em></h1></FadeIn>
          <FadeIn delay={200}>
            <p className="hero-sub">Parkme connects drivers with verified parking spaces and lets hosts earn from their empty spots. One app. Zero circling.</p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="hero-actions">
              <a href="#register" className="btn btn-primary btn-lg">Create free account <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></a>
              <a href="#how" className="btn btn-glass btn-lg">See how it works</a>
            </div>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="hero-stats">
              <div><b><Counter end={2500} suffix="+" /></b><span>Parking spots</span></div>
              <div className="stat-divider" />
              <div><b><Counter end={18000} suffix="+" /></b><span>Happy drivers</span></div>
              <div className="stat-divider" />
              <div><b><Counter end={95} suffix="%" /></b><span>Satisfaction</span></div>
            </div>
          </FadeIn>
        </div>
        <div className="hero-scroll"><span /></div>
      </section>

      <section className="trusted">
        <p>Trusted across Addis Ababa</p>
        <div className="trusted-logos">
          <span>Bole Atlas</span><span>Edna Mall</span><span>Unity Park</span><span>Meskel Square</span><span>Sarbet</span><span>Lideta</span>
        </div>
      </section>

      <section className="goals" id="goals">
        <div className="section-container">
          <FadeIn>
            <div className="section-header">
              <span className="section-badge">Our goals</span>
              <h2>Why Parkme <em>exists</em></h2>
              <p>We&apos;re solving Addis Ababa&apos;s parking problem with technology that works for everyone.</p>
            </div>
          </FadeIn>
          <div className="goals-grid">
            {goals.map((g, i) => (
              <FadeIn key={g.title} delay={i * 80}>
                <article className={`goal-card goal-${g.color}`}>
                  <span className="goal-icon">{g.icon}</span>
                  <h3>{g.title}</h3>
                  <p>{g.desc}</p>
                  <div className="goal-accent" />
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-container">
          <div className="how-layout">
            <div className="how-left">
              <FadeIn>
                <span className="section-badge">How it works</span>
                <h2>Park in <em>3 simple steps</em></h2>
                <p>No more circling blocks. No more double parking. Just effortless reservations.</p>
              </FadeIn>
              <div className="steps">
                {steps.map((s, i) => (
                  <FadeIn key={s.num} delay={i * 120}>
                    <div className="step">
                      <span className="step-num">{s.num}</span>
                      <div><h3>{s.title}</h3><p>{s.desc}</p></div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
            <FadeIn className="how-right" delay={150}>
              <div className="how-phone">
                <div className="phone-frame">
                  <div className="phone-notch" />
                  <div className="phone-screen">
                    <div className="phone-header">
                      <span className="phone-logo">P</span><span>Parkme</span><span className="phone-dot" />
                    </div>
                    <div className="phone-search"><span>🔍</span><span>Bole, Addis Ababa</span></div>
                    <div className="phone-map">
                      <div className="pm-road r1" /><div className="pm-road r2" /><div className="pm-road r3" />
                      <div className="pm-pin p1">35</div>
                      <div className="pm-pin p2">45</div>
                      <div className="pm-pin p3">30</div>
                      <div className="pm-you" />
                    </div>
                    <div className="phone-card">
                      <div className="pc-flag"><i /><i /><i /></div>
                      <b>Unity Park Garage</b>
                      <span>35 ETB/hr · ⭐ 4.9</span>
                      <button>Reserve</button>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="choose" id="choose">
        <div className="section-container">
          <FadeIn>
            <div className="section-header">
              <span className="section-badge">Get started</span>
              <h2>Are you a <em>Driver</em> or a <em>Host</em>?</h2>
              <p>Choose your path. Both are completely free to join.</p>
            </div>
          </FadeIn>
          <div className="role-tabs">
            <button className={role === "driver" ? "active" : ""} onClick={() => setRole("driver")}><span>🚗</span> I&apos;m a Driver</button>
            <button className={role === "host" ? "active" : ""} onClick={() => setRole("host")}><span>🏠</span> I&apos;m a Host</button>
          </div>
          <FadeIn>
            <div className="role-cards">
              {role === "driver" ? (
                <div className="role-card driver-card">
                  <div className="rc-visual">
                    <img src={IMG.parking} alt="Parking in Addis Ababa" loading="lazy" />
                    <div className="rc-overlay" />
                    <div className="rc-badge-float"><span className="rc-emoji">🚗</span><span>Driver</span></div>
                  </div>
                  <div className="rc-body">
                    <h3>Find & reserve parking instantly</h3>
                    <ul className="rc-features">
                      <li><span className="feat-check">✓</span>Search 2,500+ verified spots across Addis</li>
                      <li><span className="feat-check">✓</span>Reserve in seconds, pay via wallet or telebirr</li>
                      <li><span className="feat-check">✓</span>Get digital gate codes — no cash, no hassle</li>
                      <li><span className="feat-check">✓</span>Live parking timer and navigation support</li>
                      <li><span className="feat-check">✓</span>Rate spaces and help the community</li>
                    </ul>
                    <div className="rc-price">
                      <div><span>Starting from</span><b>25 <small>ETB/hr</small></b></div>
                      <button className="btn btn-primary" onClick={() => { setRole("driver"); document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); }}>Sign up as Driver →</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="role-card host-card">
                  <div className="rc-visual">
                    <img src={IMG.addis2} alt="Addis Ababa cityscape" loading="lazy" />
                    <div className="rc-overlay rc-overlay-gold" />
                    <div className="rc-badge-float host-badge"><span className="rc-emoji">🏠</span><span>Host</span></div>
                  </div>
                  <div className="rc-body">
                    <h3>Turn your empty space into income</h3>
                    <ul className="rc-features">
                      <li><span className="feat-check feat-gold">✓</span>List your driveway, compound, or garage</li>
                      <li><span className="feat-check feat-gold">✓</span>Set your own price and availability</li>
                      <li><span className="feat-check feat-gold">✓</span>Earn 4,000+ ETB/month on average</li>
                      <li><span className="feat-check feat-gold">✓</span>Full dashboard: earnings, calendar, analytics</li>
                      <li><span className="feat-check feat-gold">✓</span>Weekly payouts to your bank account</li>
                    </ul>
                    <div className="rc-price">
                      <div><span>Average monthly</span><b>4,680 <small>ETB</small></b></div>
                      <button className="btn btn-gold" onClick={() => { setRole("host"); document.getElementById("register")?.scrollIntoView({ behavior: "smooth" }); }}>Sign up as Host →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="compare-strip">
              <div className="cs-item"><span className="cs-icon cs-green">🚗</span><div><b>Driver</b><span>Find parking fast</span></div></div>
              <div className="cs-vs">VS</div>
              <div className="cs-item"><span className="cs-icon cs-gold">🏠</span><div><b>Host</b><span>Earn from your space</span></div></div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="stories" id="stories">
        <div className="section-container">
          <FadeIn>
            <div className="section-header">
              <span className="section-badge">Stories</span>
              <h2>Loved by <em>Addis drivers</em></h2>
              <p>Real people. Real parking problems. Solved.</p>
            </div>
          </FadeIn>
          <div className="testimonial-grid">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 100}>
                <article className="testimonial-card">
                  <div className="tc-stars">★★★★★</div>
                  <p>&ldquo;{t.quote}&rdquo;</p>
                  <div className="tc-author">
                    <div className="tc-avatar">{t.avatar}</div>
                    <div><b>{t.name}</b><span>{t.role}</span></div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="cities">
        <div className="section-container">
          <FadeIn>
            <div className="section-header section-header-light">
              <span className="section-badge section-badge-dark">Coverage</span>
              <h2>Live across <em>Addis Ababa</em></h2>
              <p>Growing every week. More neighborhoods coming soon.</p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="city-tags">
              {["Bole", "Arat Kilo", "Meskel Square", "Piassa", "Mexico", "Sarbet", "CMC", "Lideta", "Kazanchis", "Megenagna", "Gerji", "Ayat", "Summit", "Lebu"].map((c) => (
                <span key={c} className="city-tag">{c}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="register" id="register">
        <div className="section-container">
          <FadeIn>
            <div className="reg-card">
              <div className="join-flag"><i /><i /><i /></div>

              {!registered ? (
                <>
                  <div className="reg-header">
                    <span className="reg-badge">🇪🇹 Free account</span>
                    <h2>Create your <em>Parkme</em> account</h2>
                    <p>Sign up in 30 seconds. Start parking or earning today.</p>
                  </div>

                  <form className="reg-form" onSubmit={(e) => void handleRegister(e)}>
                    <div className="reg-role-row">
                      <span className="reg-role-label">I want to:</span>
                      <div className="reg-role-btns">
                        <button type="button" className={`reg-role-btn ${role === "driver" ? "active driver-active" : ""}`} onClick={() => setRole("driver")}>
                          <span className="reg-role-icon">🚗</span>
                          <div><b>Find parking</b><small>Driver account</small></div>
                        </button>
                        <button type="button" className={`reg-role-btn ${role === "host" ? "active host-active" : ""}`} onClick={() => setRole("host")}>
                          <span className="reg-role-icon">🏠</span>
                          <div><b>Earn money</b><small>Host account</small></div>
                        </button>
                      </div>
                    </div>

                    <div className="reg-fields">
                      <div className="reg-field">
                        <label htmlFor="reg-name">Full name</label>
                        <div className="reg-input-wrap">
                          <span className="reg-input-icon">👤</span>
                          <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Abebe Tadesse" required minLength={2} />
                        </div>
                      </div>
                      <div className="reg-field">
                        <label htmlFor="reg-email">Email address</label>
                        <div className="reg-input-wrap">
                          <span className="reg-input-icon">✉️</span>
                          <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abebe@email.com" required />
                        </div>
                      </div>
                      <div className="reg-field">
                        <label htmlFor="reg-phone">Phone number</label>
                        <div className="reg-input-wrap">
                          <span className="reg-input-icon">📱</span>
                          <span className="reg-phone-prefix">+251</span>
                          <input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="912 345 678" required minLength={9} />
                        </div>
                      </div>
                      <div className="reg-field">
                        <label htmlFor="reg-pw">Password</label>
                        <div className="reg-input-wrap">
                          <span className="reg-input-icon">🔒</span>
                          <input id="reg-pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                          <button type="button" className="reg-pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? "Hide" : "Show"}</button>
                        </div>
                      </div>
                    </div>

                    {regError && <p className="reg-error" role="alert">{regError}</p>}

                    <button type="submit" className="reg-submit" disabled={submitting}>
                      {submitting ? (
                        <><span className="reg-spinner" /> Creating your account…</>
                      ) : (
                        <>Create {role === "driver" ? "Driver" : "Host"} account <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg></>
                      )}
                    </button>

                    <p className="reg-terms">By signing up you agree to our <a href="#register">Terms of Service</a> and <a href="#register">Privacy Policy</a>.</p>
                    <p className="reg-signin">Already have an account? <a href={`/app?role=${role}`}><b>Sign in</b></a></p>
                  </form>
                </>
              ) : (
                <div className="reg-success">
                  <div className="reg-success-icon">
                    <span className="reg-check-ring"><span className="reg-check-mark">✓</span></span>
                  </div>
                  <h2>Welcome to Parkme, <em>{registered.fullName.split(" ")[0]}</em>! 🎉</h2>
                  <p className="reg-success-sub">Your <b>{registered.role}</b> account has been created successfully.</p>

                  <div className="reg-success-card">
                    <div className="rsc-flag"><i /><i /><i /></div>
                    <div className="rsc-row"><span>Name</span><b>{registered.fullName}</b></div>
                    <div className="rsc-row"><span>Email</span><b>{registered.email}</b></div>
                    <div className="rsc-row"><span>Role</span><b className="rsc-role">{registered.role === "driver" ? "🚗 Driver" : "🏠 Host"}</b></div>
                    <div className="rsc-row"><span>Status</span><b className="rsc-active"><i />Active</b></div>
                  </div>

                  <div className="reg-next-steps">
                    <h3>What&apos;s next?</h3>
                    <div className="reg-next-grid">
                      {registered.role === "driver" ? (
                        <>
                          <div className="rn-step"><span>1</span><div><b>Open the app</b><p>Search for parking near your destination</p></div></div>
                          <div className="rn-step"><span>2</span><div><b>Reserve a spot</b><p>Pay with ParkWallet or telebirr</p></div></div>
                          <div className="rn-step"><span>3</span><div><b>Park & go</b><p>Use your gate code to enter</p></div></div>
                        </>
                      ) : (
                        <>
                          <div className="rn-step"><span>1</span><div><b>List your space</b><p>Add photos, location, and pricing</p></div></div>
                          <div className="rn-step"><span>2</span><div><b>Get bookings</b><p>Drivers reserve your spot</p></div></div>
                          <div className="rn-step"><span>3</span><div><b>Earn weekly</b><p>Get paid to your bank account</p></div></div>
                        </>
                      )}
                    </div>
                  </div>

                  <a href={`/app?role=${registered.role}`} className="reg-submit" style={{ textDecoration: "none" }}>
                    Open Parkme App <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                  </a>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo"><span className="logo-mark">P</span><div className="logo-text"><b>Park</b><span>me</span></div></div>
            <p>Parking made simple for Addis Ababa.</p>
            <div className="footer-flag"><i /><i /><i /></div>
          </div>
          <div className="footer-links">
            <div><h4>Product</h4><a href="#goals">Features</a><a href="#how">How it works</a><a href="#choose">Pricing</a><a href="#register">Sign up</a></div>
            <div><h4>Company</h4><a href="#register">About</a><a href="#stories">Stories</a><a href="#register">Careers</a><a href="#register">Contact</a></div>
            <div><h4>Support</h4><a href="#register">Help center</a><a href="#register">Safety</a><a href="#register">Privacy</a><a href="#register">Terms</a></div>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2024 Parkme. Made with ❤️ in Addis Ababa, Ethiopia.</span></div>
      </footer>
    </div>
  );
}
