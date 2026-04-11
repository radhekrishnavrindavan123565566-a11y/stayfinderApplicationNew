/**
 * Import all Mongoose models to ensure schemas are registered
 * before any .populate() calls. Required in Next.js 16 + Turbopack
 * because each route module runs in isolation.
 */
import "@/models/User";
import "@/models/Property";
import "@/models/Booking";
import "@/models/Review";
import "@/models/Message";
import "@/models/Notification";
import "@/models/Transaction";
import "@/models/ChatAction";
import "@/models/Dispute";
import "@/models/EcosystemService";
import "@/models/LocalityQA";
import "@/models/LocalityReview";
import "@/models/RentAgreement";
import "@/models/ServiceBooking";
import "@/models/TypingEvent";
import "@/models/UserPreferences";
