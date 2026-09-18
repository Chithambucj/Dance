package com.dancestudio.config;

import com.dancestudio.entity.*;
import com.dancestudio.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudioSettingsRepository studioSettingsRepository;

    @Autowired
    private WebsiteContentRepository websiteContentRepository;

    @Autowired
    private DanceProgramRepository programRepository;

    @Autowired
    private InstructorRepository instructorRepository;

    @Autowired
    private GalleryMediaRepository galleryRepository;

    @Autowired
    private MembershipPlanRepository planRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private FreeTrialRepository freeTrialRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedStudioSettings();
        seedWebsiteSections();
        seedDancePrograms();
        seedInstructors();
        seedPricingPlans();
        seedGallery();
        seedEvents();
        seedUsersAndMemberships();
    }

    private void seedStudioSettings() {
        if (studioSettingsRepository.count() == 0) {
            StudioSettings settings = new StudioSettings();
            settings.setId("default");
            settings.setStudioName("StepUp Dance Studio");
            settings.setTagline("Move • Groove • Inspire");
            settings.setDescription("Premier dance studio empowering dancers of all ages and levels. Experience the joy of movement with India's leading choreographers and world-class sprung wooden floors.");
            settings.setPhone("+91 98765 43210");
            settings.setEmail("hello@stepupdance.com");
            settings.setAddress("124 Dance Avenue, Arts & Culture District, Chennai, TN 600028");
            settings.setGoogleMapsUrl("https://maps.google.com");
            settings.setInstagram("https://instagram.com/stepupdance");
            settings.setFacebook("https://facebook.com/stepupdance");
            settings.setYoutube("https://youtube.com/stepupdance");
            settings.setWhatsapp("+919876543210");
            settings.setBusinessHours("Mon - Sat: 6:30 AM - 9:30 PM | Sun: 8:00 AM - 2:00 PM");
            settings.setCurrency("INR (₹)");
            settings.setTimezone("Asia/Kolkata");
            settings.setHeroTitle("Dance Your Way");
            settings.setHeroSubtitle("to Pure Joy & Confidence");
            settings.setHeroButtonText("Start Free Trial");
            settings.setPromotionalBanner("🎉 New Dance Batches Starting This Month! Book Your Free Trial Today.");
            settings.setShowPromoBanner(true);
            studioSettingsRepository.save(settings);
        }
    }

    private void seedWebsiteSections() {
        if (websiteContentRepository.count() == 0) {
            // Hero
            WebsiteContent hero = new WebsiteContent();
            hero.setSectionKey("hero");
            hero.setTitle("Welcome to StepUp");
            hero.setHeading("Dance Your Way");
            hero.setHighlightedText("to Pure Joy & Rhythm");
            hero.setDescription("Join our expert-led dance classes and experience the thrill of movement in an energetic, supportive studio environment.");
            hero.setBadgeText("Move • Groove • Inspire");
            hero.setPrimaryBtnText("Register for Free Trial");
            hero.setPrimaryBtnLink("/free-trial");
            hero.setSecondaryBtnText("Explore Programs");
            hero.setSecondaryBtnLink("/programs");
            hero.setImage("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop");
            websiteContentRepository.save(hero);

            // About
            WebsiteContent about = new WebsiteContent();
            about.setSectionKey("about");
            about.setTitle("About Our Studio");
            about.setHeading("Crafting Passion into Art");
            about.setHighlightedText("Since 2015");
            about.setDescription("StepUp Dance Studio is dedicated to bringing world-class dance training to enthusiasts and aspiring performers alike. From traditional classical expressions to explosive street styles, our studio fosters discipline, creativity, and self-confidence.");
            about.setImage("https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop");
            websiteContentRepository.save(about);

            // Testimonials
            WebsiteContent testimonials = new WebsiteContent();
            testimonials.setSectionKey("testimonials");
            testimonials.setTitle("What Dancers Say");
            testimonials.setHeading("Loved by Hundreds of Students");
            testimonials.setDataJson("[{\"name\":\"Ananya Sharma\",\"role\":\"Western Dance Student\",\"text\":\"StepUp transformed my stage confidence! The instructors break down complex choreo with patience and passion.\",\"rating\":5},{\"name\":\"Vikram Rathore\",\"role\":\"Hip Hop Enthusiast\",\"text\":\"The energy in the studio is contagious. High-level musicality training with sprung wooden floors that are great for footwork!\",\"rating\":5},{\"name\":\"Pooja Sundaram\",\"role\":\"Parent of Kids Batch Student\",\"text\":\"My 8-year-old daughter looks forward to her weekend classes every single week. Best dance academy in town!\",\"rating\":5}]");
            websiteContentRepository.save(testimonials);
        }
    }

    private void seedDancePrograms() {
        if (programRepository.count() == 0) {
            List<DanceProgram> list = List.of(
                    createProgram("Bharatanatyam", "Ancient Indian classical dance emphasizing intricate footwork, hand gestures (mudras), and expressive facial storytelling.", "Kids & Adults", "All Levels", "60 mins", 1800.0, 1, "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Western Dance", "High-energy commercial choreography blending jazz, funk, and modern pop dance techniques for stage performances.", "Teens & Adults", "Intermediate", "60 mins", 1500.0, 2, "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Hip Hop & Street Styles", "Learn popping, locking, breaking, and urban choreography with dynamic grooves and freestyle sessions.", "Teens & Adults", "All Levels", "75 mins", 1600.0, 3, "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Salsa & Bachata", "Passionate Latin partner dancing emphasizing lead-and-follow dynamics, turns, spins, and rhythmic social dance styling.", "Adults (18+)", "Beginner to Pro", "60 mins", 2000.0, 4, "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Zumba Fitness", "Cardio workout party set to infectious Latin and international rhythms. Burn up to 600 calories while having a blast.", "All Ages", "All Levels", "50 mins", 1400.0, 5, "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Contemporary", "Expressive dance style combining elements of modern, jazz, lyrical and classical ballet with floorwork and fluid transitions.", "Teens & Adults", "Intermediate", "60 mins", 1700.0, 6, "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop"),
                    createProgram("Kids Creative Dance", "Fun foundational rhythm, coordination, musicality, and gross motor skills training for children aged 4 to 12.", "Kids (4-12 yrs)", "Beginner", "45 mins", 1400.0, 7, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop")
            );
            programRepository.saveAll(list);
        }
    }

    private DanceProgram createProgram(String name, String desc, String age, String level, String duration, Double price, int order, String image) {
        DanceProgram p = new DanceProgram();
        p.setName(name);
        p.setDescription(desc);
        p.setAgeGroup(age);
        p.setLevel(level);
        p.setDuration(duration);
        p.setPrice(price);
        p.setDisplayOrder(order);
        p.setImage(image);
        p.setIsPublished(true);
        return p;
    }

    private void seedInstructors() {
        if (instructorRepository.count() == 0) {
            List<Instructor> list = List.of(
                    createInstructor("Rahul Menon", "Hip Hop & Urban Choreography", "Over 10 years of experience touring nationally. Finalist on Dance India Dance and choreographer for top music videos.", "8+ Years", 1, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"),
                    createInstructor("Divya Natarajan", "Bharatanatyam & Semi-Classical", "Graduated from Kalakshetra with distinction. Performed at international cultural festivals across Europe and Southeast Asia.", "12+ Years", 2, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop"),
                    createInstructor("Carlos Ramirez", "Salsa, Bachata & Latin Ballroom", "Certified Latin Dance master from Colombia. Specializes in social dancing musicality, body isolation, and partner connection.", "9+ Years", 3, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"),
                    createInstructor("Sneha Kapoor", "Contemporary & Jazz Funk", "Former lead dancer at Terence Lewis Dance Company. Master of emotive storytelling and floor-work dynamics.", "7+ Years", 4, "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop")
            );
            instructorRepository.saveAll(list);
        }
    }

    private Instructor createInstructor(String name, String spec, String bio, String exp, int order, String image) {
        Instructor i = new Instructor();
        i.setName(name);
        i.setSpecialization(spec);
        i.setBiography(bio);
        i.setExperience(exp);
        i.setDisplayOrder(order);
        i.setImage(image);
        i.setIsActive(true);
        i.setIsFeatured(true);
        return i;
    }

    private void seedPricingPlans() {
        if (planRepository.count() == 0) {
            List<MembershipPlan> list = List.of(
                    createPlan("Monthly Plan", "Ideal for students building consistency with dedicated weekly classes.", 1500.0, "/ Month", "MONTHLY", 30, "8 Classes / Month", "30 Days", "[\"8 Dance Classes per month\",\"Access to practice floor\",\"Free workshop discounts\",\"Direct instructor feedback\"]", false, null, 1),
                    createPlan("Quarterly Plan", "Our most popular membership offering structured progression and savings.", 4000.0, "/ 3 Months", "QUARTERLY", 90, "24 Classes / 3 Months", "90 Days", "[\"24 Dance Classes in total\",\"Full video recording of routines\",\"Priority studio showcase enrollment\",\"Free studio dance tee\",\"Save ₹500 vs monthly\"]", true, "Most Popular", 2),
                    createPlan("Annual Plan", "Complete transformation package with unlimited masterclasses and showcase pass.", 12000.0, "/ Year", "ANNUAL", 365, "Unlimited Classes", "365 Days", "[\"Unlimited classes all year long\",\"Free entry to all masterclasses & workshops\",\"Annual showcase stage performance pass\",\"1-on-1 private choreography session\",\"Save ₹6,000 annually\"]", true, "Best Value", 3)
            );
            planRepository.saveAll(list);
        }
    }

    private MembershipPlan createPlan(String name, String desc, Double price, String period, String billing, int days, String classes, String validity, String features, boolean featured, String badge, int order) {
        MembershipPlan p = new MembershipPlan();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setPeriod(period);
        p.setBillingPeriod(billing);
        p.setDurationDays(days);
        p.setClassesIncluded(classes);
        p.setValidity(validity);
        p.setFeatures(features);
        p.setIsFeatured(featured);
        p.setBadge(badge);
        p.setDisplayOrder(order);
        p.setIsPublished(true);
        return p;
    }

    private void seedGallery() {
        if (galleryRepository.count() == 0) {
            List<GalleryMedia> list = List.of(
                    createMedia("Hip Hop Cypher Night", "High energy street battle showcase", "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop", "Classes", "Hip Hop batch grooving during Thursday routine", 1),
                    createMedia("Annual Dance Showcase 2025", "Grand finale performance by senior batch", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop", "Performances", "Contemporary group performing 'Awakening'", 2),
                    createMedia("Latin Social Dance Night", "Friday Salsa & Bachata social", "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop", "Events", "Students practicing cross-body leads and turns", 3),
                    createMedia("Classical Arangetram Recital", "Traditional Bharatanatyam graduation recital", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", "Performances", "Recital at Music Academy Hall", 4),
                    createMedia("Kids Summer Camp Fun", "Young dancers learning coordination & rhythm", "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop", "Workshops", "Creative movement graduation", 5),
                    createMedia("Acoustic Studio Hall", "Main sprung wooden floor and mirror arena", "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800&auto=format&fit=crop", "Studio", "3,000 sq ft climate controlled studio", 6)
            );
            galleryRepository.saveAll(list);
        }
    }

    private GalleryMedia createMedia(String title, String desc, String url, String category, String caption, int order) {
        GalleryMedia g = new GalleryMedia();
        g.setTitle(title);
        g.setDescription(desc);
        g.setUrl(url);
        g.setCategory(category);
        g.setCaption(caption);
        g.setDisplayOrder(order);
        g.setIsFeatured(true);
        g.setIsPublished(true);
        return g;
    }

    private void seedEvents() {
        if (eventRepository.count() == 0) {
            List<Event> list = List.of(
                    createEvent("Annual Dance Gala Showcase 2026", "Our signature annual grand production featuring over 150 student performers, celebrity judges, and stage lighting at Sir Mutha Concert Hall.", "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop", LocalDateTime.now().plusDays(25), "6:00 PM", "9:30 PM", "Sir Mutha Venkatasubba Hall", "Showcase", 1),
                    createEvent("International Salsa Masterclass", "Exclusive 3-hour intensive workshop with international guest artists focusing on Cuban Salsa, shines, and musicality.", "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=800&auto=format&fit=crop", LocalDateTime.now().plusDays(14), "10:00 AM", "1:00 PM", "Main Studio Hall A", "Workshop", 2),
                    createEvent("Summer Dance Intensive Camp", "Two-week power-packed dance camp for kids and teens covering Hip Hop, Bollywood, Contemporary, and Stage Projection.", "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop", LocalDateTime.now().plusDays(40), "9:00 AM", "12:30 PM", "Studio Arena", "Special Class", 3)
            );
            eventRepository.saveAll(list);
        }
    }

    private Event createEvent(String title, String desc, String image, LocalDateTime date, String start, String end, String venue, String category, int order) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setImage(image);
        e.setEventDate(date);
        e.setStartTime(start);
        e.setEndTime(end);
        e.setVenue(venue);
        e.setCategory(category);
        e.setDisplayOrder(order);
        e.setRegistrationStatus("OPEN");
        e.setIsPublished(true);
        return e;
    }

    private void seedUsersAndMemberships() {
        // Admin Account
        if (userRepository.findByEmail("admin@dancestudio.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@dancestudio.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Studio");
            admin.setLastName("Owner");
            admin.setPhone("+91 98765 43210");
            admin.setRole(Role.ADMIN);
            admin.setStatus("ACTIVE");
            admin.setMembershipStatus("ACTIVE");
            admin.setAccountType("ONLINE");
            userRepository.save(admin);
        }

        // Sample Active Member with Paid Membership & Invoice
        if (userRepository.findByEmail("arun@example.com").isEmpty()) {
            User arun = new User();
            arun.setEmail("arun@example.com");
            arun.setPassword(passwordEncoder.encode("arun123"));
            arun.setFirstName("Arun");
            arun.setLastName("Kumar");
            arun.setPhone("+91 98840 12345");
            arun.setRole(Role.MEMBER);
            arun.setStatus("ACTIVE");
            arun.setMembershipStatus("ACTIVE");
            arun.setAccountType("ONLINE");
            arun = userRepository.save(arun);

            List<MembershipPlan> plans = planRepository.findAll();
            MembershipPlan monthlyPlan = plans.isEmpty() ? null : plans.get(0);

            if (monthlyPlan != null) {
                Membership mem = new Membership();
                mem.setMembershipNumber("MEM-2026-10024");
                mem.setUser(arun);
                mem.setPlan(monthlyPlan);
                mem.setStartDate(LocalDateTime.now().minusDays(5));
                mem.setExpiryDate(LocalDateTime.now().plusDays(25));
                mem.setTotalFee(1500.0);
                mem.setAmountPaid(1500.0);
                mem.setPendingAmount(0.0);
                mem.setStatus("ACTIVE");
                mem.setSource("ONLINE");
                mem = membershipRepository.save(mem);

                Payment pay = new Payment();
                pay.setUser(arun);
                pay.setMembership(mem);
                pay.setPlan(monthlyPlan);
                pay.setAmount(1500.0);
                pay.setStatus("COMPLETED");
                pay.setPaymentMethod("RAZORPAY");
                pay.setSource("ONLINE");
                pay.setDescription("Monthly Plan - Online Payment");
                pay.setPaidAt(LocalDateTime.now().minusDays(5));
                pay.setReferenceNumber("pay_sim_9283748234");
                pay = paymentRepository.save(pay);

                Invoice inv = new Invoice();
                inv.setInvoiceNumber("INV-2026-8001");
                inv.setUser(arun);
                inv.setPayment(pay);
                inv.setMembership(mem);
                inv.setPlanName(monthlyPlan.getName());
                inv.setAmount(1500.0);
                inv.setPaymentMethod("RAZORPAY");
                inv.setPaymentStatus("PAID");
                inv.setIssueDate(LocalDateTime.now().minusDays(5));
                inv.setStartDate(mem.getStartDate());
                inv.setEndDate(mem.getExpiryDate());
                inv.setTransactionId("pay_sim_9283748234");
                invoiceRepository.save(inv);
            }
        }

        // Sample Free Trial Lead / Member
        if (userRepository.findByEmail("priya@example.com").isEmpty()) {
            User priya = new User();
            priya.setEmail("priya@example.com");
            priya.setPassword(passwordEncoder.encode("priya123"));
            priya.setFirstName("Priya");
            priya.setLastName("Sundaram");
            priya.setPhone("+91 97730 65432");
            priya.setRole(Role.MEMBER);
            priya.setStatus("ACTIVE");
            priya.setMembershipStatus("FREE_TRIAL");
            priya.setAccountType("FREE_TRIAL");
            priya = userRepository.save(priya);

            FreeTrial trial = new FreeTrial();
            trial.setFullName("Priya Sundaram");
            trial.setEmail("priya@example.com");
            trial.setPhone("+91 97730 65432");
            trial.setAge(22);
            trial.setProgramName("Western Dance");
            trial.setPreferredBatch("Evening Batch (6:00 PM)");
            trial.setStatus("NEW");
            trial.setTrialStartDate(LocalDateTime.now().minusDays(1));
            trial.setTrialEndDate(LocalDateTime.now().plusDays(6));
            trial.setUser(priya);
            freeTrialRepository.save(trial);

            Notification notif = new Notification(
                    "ADMIN",
                    "🔔 New Free Trial Registration",
                    "Priya Sundaram registered for Western Dance (Phone: +91 97730 65432)",
                    "FREE_TRIAL",
                    "/admin?tab=free-trials"
            );
            notificationRepository.save(notif);
        }

        // Sample Member with Pending Payment
        if (userRepository.findByEmail("kavin@example.com").isEmpty()) {
            User kavin = new User();
            kavin.setEmail("kavin@example.com");
            kavin.setPassword(passwordEncoder.encode("kavin123"));
            kavin.setFirstName("Kavin");
            kavin.setLastName("Raj");
            kavin.setPhone("+91 96620 78901");
            kavin.setRole(Role.MEMBER);
            kavin.setStatus("ACTIVE");
            kavin.setMembershipStatus("PAYMENT_PENDING");
            kavin.setAccountType("OFFLINE");
            kavin = userRepository.save(kavin);

            List<MembershipPlan> plans = planRepository.findAll();
            MembershipPlan monthlyPlan = plans.isEmpty() ? null : plans.get(0);

            if (monthlyPlan != null) {
                Membership mem = new Membership();
                mem.setMembershipNumber("MEM-2026-10025");
                mem.setUser(kavin);
                mem.setPlan(monthlyPlan);
                mem.setStartDate(LocalDateTime.now());
                mem.setExpiryDate(LocalDateTime.now().plusDays(30));
                mem.setTotalFee(1500.0);
                mem.setAmountPaid(0.0);
                mem.setPendingAmount(1500.0);
                mem.setStatus("PAYMENT_PENDING");
                mem.setSource("OFFLINE");
                mem = membershipRepository.save(mem);

                Payment pay = new Payment();
                pay.setUser(kavin);
                pay.setMembership(mem);
                pay.setPlan(monthlyPlan);
                pay.setAmount(1500.0);
                pay.setStatus("PENDING");
                pay.setPaymentMethod("CASH");
                pay.setSource("OFFLINE");
                pay.setDescription("Monthly Plan - Cash Payment Pending");
                pay.setDueDate(LocalDateTime.now().plusDays(2));
                paymentRepository.save(pay);
            }
        }
    }
}
