/**
 * LandingPage.jsx
 * 
 * Public Facing Landing Page.
 * Human-centered, authentic fitness tracking showcase with zero AI buzzwords.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Flame, 
  Shield, 
  CheckCircle2, 
  UserCheck,
  FileText,
  Pause,
  Play,
  X,
  Quote,
  Maximize2,
  RotateCw,
  MousePointer
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema } from '../../validators/authValidators';
import { login, register as registerUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LandingFooter from '../../components/layout/LandingFooter';
import './LandingPage.css';

import arnoldImg from '../../assets/images/arnold.jpg';
import ronnieImg from '../../assets/images/ronnie.jpg';
import jayImg from '../../assets/images/jay.jpg';
import gym1Img from '../../assets/images/gym_freak_1.jpg';
import gym2Img from '../../assets/images/gym_freak_2.jpg';
import gym3Img from '../../assets/images/gym_freak_3.jpg';

const motivationCards = [
  {
    id: 1,
    img: arnoldImg,
    quote: '"Strength does not come from winning. Your struggles develop your strengths."',
    author: '- Arnold Schwarzenegger',
    title: '7x Mr. Olympia'
  },
  {
    id: 2,
    img: ronnieImg,
    quote: '"Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights."',
    author: '- Ronnie Coleman',
    title: '8x Mr. Olympia'
  },
  {
    id: 3,
    img: jayImg,
    quote: '"I do not eat for taste, I eat for function. Focus on your vision and execution."',
    author: '- Jay Cutler',
    title: '4x Mr. Olympia'
  },
  {
    id: 4,
    img: gym1Img,
    quote: '"Obsessed is just a word the lazy use to describe the dedicated."',
    author: '- Athletic Mindset',
    title: 'Relentless Drive'
  },
  {
    id: 5,
    img: gym2Img,
    quote: '"The only bad workout is the one that did not happen. Show up every day."',
    author: '- Iron Discipline',
    title: 'Consistency First'
  },
  {
    id: 6,
    img: gym3Img,
    quote: '"Discipline is doing what needs to be done, even when you do not feel like it."',
    author: '- Champion Mentality',
    title: 'Peak Focus'
  }
];

const serviceCards = [
  {
    id: 's1',
    icon: <Activity size={26} />,
    title: 'Daily Dashboard',
    desc: 'Quick overview of active training days, weekly streaks, and recent logged activities.'
  },
  {
    id: 's2',
    icon: <Flame size={26} />,
    title: 'Nutrition Journal',
    desc: 'Clear records of daily meals, calorie tracking, and nutritional intake benchmarks.'
  },
  {
    id: 's3',
    icon: <TrendingUp size={26} />,
    title: 'Progress & PR History',
    desc: 'Track body weight trends over time and keep an organized log of personal records.'
  },
  {
    id: 's4',
    icon: <FileText size={26} />,
    title: 'Downloadable Reports',
    desc: 'Export complete training logs and nutrition data to PDF documents or CSV files anytime.'
  },
  {
    id: 's5',
    icon: <Dumbbell size={26} />,
    title: 'Targeted Muscle Logging',
    desc: 'Organize sets by chest, back, shoulders, arms, legs, and abs for balanced strength gains.'
  },
  {
    id: 's6',
    icon: <Apple size={26} />,
    title: 'Macro & Calorie Goals',
    desc: 'Hit tailored targets for protein, carbohydrates, and fats to fuel optimal recovery.'
  },
  {
    id: 's7',
    icon: <CheckCircle2 size={26} />,
    title: 'Habit Consistency',
    desc: 'Maintain daily discipline with automated streaks, workout summaries, and PR trackers.'
  },
  {
    id: 's8',
    icon: <Shield size={26} />,
    title: 'Private & Secure',
    desc: 'Your personal athletic journals, logs, and body analytics remain completely private.'
  }
];

const LandingPage = () => {
  const [authMode, setAuthMode] = useState('login');
  const [isFeaturesPaused, setIsFeaturesPaused] = useState(false);
  
  // 3D Carousel state & refs
  const [selectedMotivationCard, setSelectedMotivationCard] = useState(null);
  const [isMotivationOrbitPaused, setIsMotivationOrbitPaused] = useState(false);
  const cardElementsRef = useRef([]);
  const motivationAngleRef = useRef(0);
  const isOrbitPausedRef = useRef(false);
  const selectedMotivationCardRef = useRef(null);
  const isDraggingMotivationRef = useRef(false);
  const dragStartXRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);

  // Sync ref values for requestAnimationFrame without closure stalls
  useEffect(() => {
    isOrbitPausedRef.current = isMotivationOrbitPaused;
  }, [isMotivationOrbitPaused]);

  useEffect(() => {
    selectedMotivationCardRef.current = selectedMotivationCard;
  }, [selectedMotivationCard]);

  // Function to project all 6 cards along the 3D elliptical orbit
  const updateCardPositions = (angle) => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = width <= 480;
    const isTablet = width <= 768;
    const isLaptop = width <= 1024;
    
    // Radii of the elliptical 3D orbit
    const radiusX = isMobile ? 155 : isTablet ? 230 : isLaptop ? 320 : 400;
    const radiusZ = isMobile ? 80 : isTablet ? 120 : isLaptop ? 165 : 210;

    cardElementsRef.current.forEach((el, index) => {
      if (!el) return;
      const cardAngle = (angle + index * 60) * (Math.PI / 180);
      const x = Math.sin(cardAngle) * radiusX;
      const z = Math.cos(cardAngle) * radiusZ;
      // normalizedZ: 0 at the farthest back, 1 at the closest front
      const normalizedZ = (z + radiusZ) / (2 * radiusZ);
      
      const scale = 0.65 + normalizedZ * 0.35; // 0.65 in the back, 1.0 in the front
      const opacity = 0.50 + normalizedZ * 0.50; // 0.50 in the back (always visible), 1.0 in front
      const zIndex = Math.round(normalizedZ * 100);
      const brightness = 0.55 + normalizedZ * 0.45; // subtle 3D lighting depth
      const rotateY = -Math.sin(cardAngle) * 22; // smooth inward 3D curve angle

      el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${(-normalizedZ * 16).toFixed(1)}px), ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateY(${rotateY.toFixed(1)}deg)`;
      el.style.zIndex = zIndex;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = `brightness(${brightness.toFixed(3)})`;
    });
  };

  // Escape key closes expanded modal and resumes 3D rotation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedMotivationCardRef.current) {
        setSelectedMotivationCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Continuous 3D Loop Animation with full rear visibility
  useEffect(() => {
    let animationId;
    // Initial positioning
    updateCardPositions(motivationAngleRef.current);

    const animateOrbit = () => {
      if (!isOrbitPausedRef.current && !selectedMotivationCardRef.current && !isDraggingMotivationRef.current) {
        motivationAngleRef.current += 0.22;
        updateCardPositions(motivationAngleRef.current);
      }
      animationId = requestAnimationFrame(animateOrbit);
    };
    animationId = requestAnimationFrame(animateOrbit);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Window resize handler to maintain orbit proportions
  useEffect(() => {
    const handleResize = () => {
      updateCardPositions(motivationAngleRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse/Touch drag & swipe interaction
  const handleMotivationPointerDown = (e) => {
    if (selectedMotivationCardRef.current) return;
    isDraggingMotivationRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
  };

  const handleMotivationPointerMove = (e) => {
    if (!isDraggingMotivationRef.current || selectedMotivationCardRef.current) return;
    const currentX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
    const diff = currentX - dragStartXRef.current;
    if (Math.abs(diff) > 4) {
      hasDraggedRef.current = true;
    }
    motivationAngleRef.current -= diff * 0.45;
    dragStartXRef.current = currentX;
    updateCardPositions(motivationAngleRef.current);
  };

  const handleMotivationPointerUp = () => {
    isDraggingMotivationRef.current = false;
  };

  // Card click: open modal and pause rotation
  const handleCardClick = (card, e) => {
    e.stopPropagation();
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    setSelectedMotivationCard(card);
  };

  // Close modal and resume rotation
  const handleCloseCardModal = () => {
    setSelectedMotivationCard(null);
  };

  // Rotate discrete 60-degree step
  const handleRotateStep = (direction) => {
    motivationAngleRef.current += direction * 60;
    updateCardPositions(motivationAngleRef.current);
  };

  const loginForm = useForm({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm({ 
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onLoginSubmit = async (data) => {
    try {
      const res = await dispatch(login(data)).unwrap();
      toast.success('Welcome back to FitTrack Pro!');
      if (res.user?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Login failed');
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  const fillDemoUser = () => {
    setAuthMode('login');
    loginForm.setValue('email', 'alex@fitnesspro.com');
    loginForm.setValue('password', 'password123');
    toast.success('Demo athlete credentials loaded. Sign in below.');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fillDemoAdmin = () => {
    setAuthMode('login');
    loginForm.setValue('email', 'admin@fitnesstracker.com');
    loginForm.setValue('password', 'Salman987$');
    toast.success('Admin credentials loaded. Sign in below.');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Viewport-locked responsive Goku background canvas */}
      <div className="landing-bg-canvas" aria-hidden="true" />

      {/* =========================================
          HERO SECTION
          ========================================= */}
      <section id="home" className="landing-section hero-section" data-aos="fade-up">
        <div className="hero-content">
          <div className="hero-pill-badge" data-aos="zoom-in">
            <span className="badge-pulse-dot" />
            <Dumbbell size={15} />
            <span>Built for Relentless Lifters &bull; Saiyan Mode</span>
          </div>

          <h1 className="hero-title">
            TRACK EVERY SET.<br />
            <span className="text-gradient">BUILD SUPREME STRENGTH.</span>
          </h1>

          <p className="hero-subtitle">
            Log heavy lifts, master daily nutrition, and break personal records week after week. No gimmicks, no fluff, just pure progressive overload.
          </p>

          <div className="hero-cta-group">
            <Button 
              onClick={() => { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }} 
              size="large" 
              className="hero-cta"
            >
              Get Started Free <ChevronRight size={19} />
            </Button>
            <button 
              className="hero-secondary-cta"
              onClick={fillDemoUser}
            >
              <UserCheck size={17} /> Try Athlete Demo
            </button>
          </div>
        </div>
      </section>

      {/* =========================================
          GYM LEGENDS & INSPIRATION (3D Rotating Circle)
          ========================================= */}
      <section id="motivation" className="landing-section motivation-section">
        <div className="section-header" data-aos="fade-up">
          <h2>Consistency Beats <span className="text-gradient">Motivation</span></h2>
          <p>Real wisdom from the greatest athletes to keep you moving forward.</p>

          <div className="carousel-3d-control-bar">
            <button 
              type="button" 
              className="carousel-step-btn prev"
              onClick={() => handleRotateStep(-1)}
              aria-label="Rotate 3D Circle Left"
              title="Rotate Left"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="carousel-info-chip">
              <MousePointer size={13} className="info-icon" />
              <span>Drag or swipe to spin in 3D &bull; Click card to expand</span>
            </div>

            <button 
              type="button" 
              className="carousel-pause-btn"
              onClick={() => setIsMotivationOrbitPaused(prev => !prev)}
              aria-label={isMotivationOrbitPaused ? "Resume 3D Rotation" : "Pause 3D Rotation"}
              title={isMotivationOrbitPaused ? "Resume Orbit" : "Pause Orbit"}
            >
              {isMotivationOrbitPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isMotivationOrbitPaused ? 'Resume Orbit' : 'Pause Orbit'}</span>
            </button>

            <button 
              type="button" 
              className="carousel-step-btn next"
              onClick={() => handleRotateStep(1)}
              aria-label="Rotate 3D Circle Right"
              title="Rotate Right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 3D Orbit Stage */}
        <div 
          className="carousel-3d-scene" 
          onPointerDown={handleMotivationPointerDown}
          onPointerMove={handleMotivationPointerMove}
          onPointerUp={handleMotivationPointerUp}
          onPointerLeave={handleMotivationPointerUp}
        >
          <div className="carousel-3d-ground-shadow" aria-hidden="true" />
          {motivationCards.map((card, index) => (
            <div 
              key={card.id} 
              ref={(el) => { cardElementsRef.current[index] = el; }}
              className="carousel-3d-card"
              onClick={(e) => handleCardClick(card, e)}
              role="button"
              tabIndex={0}
              aria-label={`View quote by ${card.author}`}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(card, e); }}
            >
              <div className="card-3d-image-wrap">
                <img src={card.img} alt={card.author} loading="lazy" />
                <div className="card-3d-overlay">
                  <span className="card-badge-small">{card.title}</span>
                  <h3 className="card-3d-quote">{card.quote}</h3>
                  <p className="author-tag">{card.author}</p>
                  <div className="card-expand-hint">
                    <Maximize2 size={12} />
                    <span>Click to expand</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Card Modal Popup */}
        {selectedMotivationCard && (
          <div 
            className="card-modal-backdrop" 
            onClick={handleCloseCardModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Athlete quote detail: ${selectedMotivationCard.author}`}
          >
            <div 
              className="card-modal-container" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button" 
                className="card-modal-close-btn"
                onClick={handleCloseCardModal}
                aria-label="Close modal and resume 3D rotation"
              >
                <X size={18} />
              </button>

              <div className="modal-hero-image-wrap">
                <img src={selectedMotivationCard.img} alt={selectedMotivationCard.author} />
                <div className="modal-hero-gradient" />
                <span className="modal-badge">{selectedMotivationCard.title}</span>
              </div>

              <div className="modal-body-content">
                <div className="modal-quote-header">
                  <Quote size={28} className="modal-quote-icon" />
                  <span className="modal-mindset-pill">Athlete Mindset</span>
                </div>
                <blockquote className="modal-quote-text">
                  {selectedMotivationCard.quote}
                </blockquote>
                <div className="modal-author-row">
                  <div>
                    <h3 className="modal-author-name">{selectedMotivationCard.author}</h3>
                    <p className="modal-author-title">{selectedMotivationCard.title}</p>
                  </div>
                </div>
                <div className="modal-actions-row">
                  <button 
                    type="button" 
                    className="modal-resume-btn"
                    onClick={handleCloseCardModal}
                  >
                    <RotateCw size={14} /> Resume 3D Orbit
                  </button>
                  <span className="modal-hint-text">Click anywhere outside to close</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================
          ABOUT / CORE VALUE PILLARS
          ========================================= */}
      <section id="about" className="landing-section about-section">
        <div className="section-header" data-aos="fade-up">
          <h2>Why Lifters Choose <span className="text-gradient">FitTrack Pro</span></h2>
          <p>No complicated setups or clutter. Just what matters for your training.</p>
        </div>

        <div className="about-grid">
          <Card className="about-card" data-aos="fade-up" data-aos-delay="0">
            <div className="icon-gradient">
              <Activity size={24} />
            </div>
            <h3>Fast Workout Logging</h3>
            <p>Log your exercises, sets, reps, and weights in seconds between sets without slowing down your workout.</p>
          </Card>

          <Card className="about-card" data-aos="fade-up" data-aos-delay="100">
            <div className="icon-gradient">
              <Dumbbell size={24} />
            </div>
            <h3>Targeted Muscle Groups</h3>
            <p>Organize your sessions easily by chest, back, shoulders, arms, legs, or abs to ensure balanced progress.</p>
          </Card>

          <Card className="about-card" data-aos="fade-up" data-aos-delay="200">
            <div className="icon-gradient">
              <Apple size={24} />
            </div>
            <h3>Simple Macro & Calorie Goals</h3>
            <p>Set daily targets for calories, protein, carbs, and fats. Know at a glance whether you are eating enough to recover.</p>
          </Card>
        </div>
      </section>

      {/* =========================================
          PRACTICAL FEATURES (Continuous Looping Slider)
          ========================================= */}
      <section id="services" className="landing-section services-section">
        <div className="section-header" data-aos="fade-up">
          <h2>Designed for <span className="text-gradient">Total Performance</span></h2>
          <p>Everything you need to log workouts, track nutrition, and review your progress.</p>
          <div className="slider-control-pill">
            <button 
              type="button" 
              className="slider-toggle-btn"
              onClick={() => setIsFeaturesPaused(prev => !prev)}
              aria-label="Toggle Features Slider Animation"
            >
              {isFeaturesPaused ? <Play size={13} /> : <Pause size={13} />}
              <span>{isFeaturesPaused ? 'Resume Infinite Scroll' : 'Pause Infinite Scroll'}</span>
            </button>
          </div>
        </div>

        <div className={`features-slider-wrapper ${isFeaturesPaused ? 'is-paused' : ''}`}>
          <div className="features-slider-track">
            {[...serviceCards, ...serviceCards].map((item, index) => (
              <div key={`feature-${item.id}-${index}`} className="feature-slider-card">
                <div className="service-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="feature-card-footer">
                  <span className="feature-status-pill">Core Feature</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          SIGN IN / REGISTER SECTION
          ========================================= */}
      <section id="contact" className="landing-section contact-section">
        <div className="contact-container">
          <div className="contact-info" data-aos="fade-right">
            <h2>Ready to Start <br /><span className="text-gradient">Tracking?</span></h2>
            <p>Create your account or use the quick demo logins to see how easy it is to manage your fitness.</p>
            
            <div className="contact-details">
              <div className="demo-chips-section">
                <span className="demo-chip-title">TEST WITH ONE CLICK:</span>
                <div className="demo-buttons-row">
                  <button type="button" className="demo-chip-btn" onClick={fillDemoUser}>
                    <UserCheck size={14} /> Fill Demo Athlete
                  </button>
                  <button type="button" className="demo-chip-btn admin" onClick={fillDemoAdmin}>
                    <Shield size={14} /> Fill Demo Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="auth-forms" data-aos="fade-left">
            <Card className="auth-card">
              <div className="auth-tabs">
                <button 
                  className={authMode === 'login' ? 'active' : ''} 
                  onClick={() => setAuthMode('login')}
                >
                  Sign In
                </button>
                <button 
                  className={authMode === 'register' ? 'active' : ''} 
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="auth-form">
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="e.g. athlete@fitnesstracker.com"
                    {...loginForm.register('email')} 
                    error={loginForm.formState.errors.email?.message} 
                  />
                  <Input 
                    label="Password" 
                    type="password" 
                    placeholder="Enter your password"
                    {...loginForm.register('password')} 
                    error={loginForm.formState.errors.password?.message} 
                  />
                  <Button type="submit" fullWidth isLoading={loading} style={{ marginTop: '0.75rem' }}>
                    Sign In to FitTrack
                  </Button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="auth-form">
                  <Input 
                    label="Your Name" 
                    placeholder="e.g. Alex Hunter"
                    {...registerForm.register('name')} 
                    error={registerForm.formState.errors.name?.message} 
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="e.g. alex@fitnesstracker.com"
                    {...registerForm.register('email')} 
                    error={registerForm.formState.errors.email?.message} 
                  />
                  <Input 
                    label="Create Password" 
                    type="password" 
                    placeholder="Choose a password"
                    {...registerForm.register('password')} 
                    error={registerForm.formState.errors.password?.message} 
                  />
                  <Input 
                    label="Confirm Password" 
                    type="password" 
                    placeholder="Confirm your password"
                    {...registerForm.register('confirmPassword')} 
                    error={registerForm.formState.errors.confirmPassword?.message} 
                  />
                  <Button type="submit" fullWidth isLoading={loading} style={{ marginTop: '0.75rem' }}>
                    Create My Account
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
