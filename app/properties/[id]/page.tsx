"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import axios from "axios";
import {
  MapPin, Bed, Bath, Users, Star, Wifi, Car, Utensils,
  Waves, Dumbbell, Wind, Tv, Coffee, MessageCircle, Zap, Shield, Reply,
} from "lucide-react";
import ImageGallery from "@/components/property/ImageGallery";
import BookingForm from "@/components/booking/BookingForm";
import MobileBookingBar from "@/components/booking/MobileBookingBar";
import AvailabilityCalendar from "@/components/booking/AvailabilityCalendar";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import { Property } from "@/store/propertyStore";
import Image from "next/image";
import { format } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import MatchScoreBadge from "@/components/properties/MatchScoreBadge";
import SmartTags from "@/components/properties/SmartTags";
import TrustProfile from "@/components/trust/TrustProfile";
import PriceIntelligence from "@/components/properties/PriceIntelligence";
import LocationIntelligence from "@/components/properties/LocationIntelligence";
import UrgencySignals from "@/components/properties/UrgencySignals";
import LocalityReviews from "@/components/community/LocalityReviews";
import LocalityQA from "@/components/community/LocalityQA";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-4 h-4" />, parking: <Car className="w-4 h-4" />,
  kitchen: <Utensils className="w-4 h-4" />, pool: <Waves className="w-4 h-4" />,
  gym: <Dumbbell className="w-4 h-4" />, ac: <Wind className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />, breakfast: <Coffee className="w-4 h-4" />,
};

interface Review {
  _id: string;
  userId: { username: string; avatar?: string };
  rating: number;
  comment: string;
  ownerReply?: string;
  ownerRepliedAt?: string;
  createdAt: string;
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function ReviewCard({ review, index, isOwner, onReplySubmit }: {
  review: Review; index: number; isOwner: boolean;
  onReplySubmit: (reply: string) => void;
}) {
  const { authHeaders } = useApi();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/reviews/${review._id}/reply`, { reply: replyText }, authHeaders());
      onReplySubmit(replyText);
      setShowReplyBox(false);
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800"
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-rose-500">{review.userId.username[0].toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-900 dark:text-white text-sm">{review.userId.username}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{format(new Date(review.createdAt), "MMM yyyy")}</p>
        </div>
        <StarRating value={review.rating} readonly size="sm" />
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{review.comment}</p>

      {/* Owner reply */}
      {review.ownerReply && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-rose-200 dark:border-rose-800">
          <p className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1">
            <Reply className="w-3 h-3" /> Owner replied
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.ownerReply}</p>
        </div>
      )}

      {/* Reply button for owner */}
      {isOwner && !review.ownerReply && (
        <div className="mt-3">
          {!showReplyBox ? (
            <button onClick={() => setShowReplyBox(true)}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
              <Reply className="w-3.5 h-3.5" /> Reply to this review
            </button>
          ) : (
            <div className="space-y-2">
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              <div className="flex gap-2">
                <button onClick={submitReply} disabled={submitting || !replyText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50">
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
                <button onClick={() => setShowReplyBox(false)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { openChat } = useChatStore();
  const router = useRouter();

  const handleMessageOwner = () => {
    if (!user) { router.push("/auth/login"); return; }
    if (!property?.ownerId?._id) return;
    const ids = [user._id, property.ownerId._id].sort();
    openChat(ids.join("_"));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [propRes, revRes] = await Promise.all([
          axios.get(`/api/properties/${id}`),
          axios.get(`/api/reviews?propertyId=${id}`),
        ]);
        setProperty(propRes.data.data.property);
        setReviews(revRes.data.data.reviews);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    load();
    const token = useAuthStore.getState().accessToken;
    axios.post(`/api/properties/${id}/view`, {}, token ? { headers: { Authorization: `Bearer ${token}` } } : {}).catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto"
        />
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading property...</p>
      </div>
    </div>
  );

  if (!property) return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated house icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-6 select-none"
        >
          🏚️
        </motion.div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          Property Not Found
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          This property may have been removed, or the link might be incorrect.
          Browse our available listings to find your perfect stay.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/properties")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-rose-500/25"
          >
            Browse Properties
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 pt-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2 leading-tight">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                {property.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <strong className="text-zinc-900 dark:text-white">{property.averageRating.toFixed(1)}</strong>
                    <span className="text-zinc-400">({property.totalReviews} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{property.location.address}, {property.location.city}, {property.location.country}</span>
                </span>
              </div>
            </div>
            <Badge variant="info" className="capitalize text-sm px-3 py-1 flex-shrink-0">
              {property.propertyType}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <MatchScoreBadge propertyId={id} />
            <SmartTags tags={[]} />
          </div>
          <div className="mt-3">
            <UrgencySignals
              propertyId={id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              weeklyBookings={(property as any).weeklyBookings}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              unitCount={(property as any).unitCount}
            />
          </div>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 rounded-2xl overflow-hidden"
        >
          <ImageGallery images={property.images} title={property.title} />
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left column */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="lg:col-span-2 space-y-8"
          >
            {/* Quick stats */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 sm:gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800">
              {[
                { icon: <Bed className="w-5 h-5" />, label: `${property.bedrooms} Bedrooms` },
                { icon: <Bath className="w-5 h-5" />, label: `${property.bathrooms} Bathrooms` },
                { icon: <Users className="w-5 h-5" />, label: `${property.maxGuests} Guests` },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="text-rose-400">{item.icon}</span>
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Owner */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 pb-8 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
              <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {property.ownerId?.avatar ? (
                  <Image src={property.ownerId.avatar} alt={property.ownerId.username} width={56} height={56} className="object-cover" />
                ) : (
                  <span className="text-xl font-bold text-rose-500">{property.ownerId?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-white">Hosted by {property.ownerId?.username}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{property.ownerId?.email}</p>
              </div>
              {user && user._id !== property.ownerId?._id && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleMessageOwner}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </motion.button>
              )}
            </motion.div>

            {property.ownerId?._id && (
              <motion.div variants={fadeUp}>
                <TrustProfile userId={property.ownerId._id} />
              </motion.div>
            )}

            {/* Description */}
            <motion.div variants={fadeUp}>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">About this place</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{property.description}</p>
            </motion.div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <motion.div variants={fadeUp}>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {property.amenities.map((amenity) => (
                    <motion.div
                      key={amenity}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800"
                    >
                      <span className="text-rose-400">{AMENITY_ICONS[amenity.toLowerCase()] || "✓"}</span>
                      <span className="capitalize">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Price Intelligence */}
            <motion.div variants={fadeUp}>
              <PriceIntelligence property={property as never} />
            </motion.div>

            {/* Location Intelligence */}
            <motion.div variants={fadeUp}>
              <LocationIntelligence property={property as never} />
            </motion.div>

            {/* Community */}
            {property.location?.city && property.location?.address && (
              <>
                <motion.div variants={fadeUp}>
                  <LocalityReviews city={property.location.city} locality={property.location.address} />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <LocalityQA city={property.location.city} locality={property.location.address} />
                </motion.div>
              </>
            )}

            {/* Reviews */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Reviews</h2>
                {property.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating value={Math.round(property.averageRating)} readonly size="sm" />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">({property.totalReviews})</span>
                  </div>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-zinc-400 dark:text-zinc-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, i) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      index={i}
                      isOwner={user?._id === property.ownerId?._id}
                      onReplySubmit={(reply) => {
                        setReviews(prev => prev.map(r =>
                          r._id === review._id ? { ...r, ownerReply: reply } : r
                        ));
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right column — booking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(property as any).instantBooking && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" /> Instant Booking
                </span>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(property as any).ownerVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" /> Verified Owner
                </span>
              )}
            </div>

            {/* Sticky booking form on desktop */}
            <div className="lg:sticky lg:top-24">
              <BookingForm
                propertyId={property._id}
                price={property.price}
                maxGuests={property.maxGuests}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                instantBooking={(property as any).instantBooking}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cancellationPolicy={(property as any).cancellationPolicy}
              />
              <div className="mt-4">
                <AvailabilityCalendar propertyId={property._id} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <MobileBookingBar
        propertyId={property._id}
        price={property.price}
        maxGuests={property.maxGuests}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        instantBooking={(property as any).instantBooking}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cancellationPolicy={(property as any).cancellationPolicy}
      />

      {/* Bottom padding on mobile to account for sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
