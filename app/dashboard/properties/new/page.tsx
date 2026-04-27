"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyInput } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/properties/ImageUploader";
import VideoUploader, { PropertyVideos } from "@/components/properties/VideoUploader";
import Tour360Uploader from "@/components/properties/Tour360Uploader";
import AIDescriptionGenerator from "@/components/properties/AIDescriptionGenerator";
import { Sparkles, Zap, Calendar, ChevronRight, ChevronLeft, Check, Wifi, Car, UtensilsCrossed, Waves, Dumbbell, Wind, Tv, Coffee, WashingMachine, Shirt, Shield, Flame, Snowflake, Dog, Baby, Bike, Bus, Utensils, Bath, BedDouble, Sofa, Sun, Leaf, Lock, Camera, Bell, Zap as Lightning, Droplets, Trash2, Package } from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  // Essentials
  "WiFi":           <Wifi className="w-3.5 h-3.5" />,
  "AC":             <Wind className="w-3.5 h-3.5" />,
  "Heating":        <Flame className="w-3.5 h-3.5" />,
  "TV":             <Tv className="w-3.5 h-3.5" />,
  "Washer":         <WashingMachine className="w-3.5 h-3.5" />,
  "Dryer":          <Shirt className="w-3.5 h-3.5" />,
  // Kitchen
  "Kitchen":        <UtensilsCrossed className="w-3.5 h-3.5" />,
  "Breakfast":      <Coffee className="w-3.5 h-3.5" />,
  "Dining Area":    <Utensils className="w-3.5 h-3.5" />,
  "Refrigerator":   <Snowflake className="w-3.5 h-3.5" />,
  // Bathroom
  "Hot Water":      <Droplets className="w-3.5 h-3.5" />,
  "Bathtub":        <Bath className="w-3.5 h-3.5" />,
  // Outdoor & Parking
  "Parking":        <Car className="w-3.5 h-3.5" />,
  "Pool":           <Waves className="w-3.5 h-3.5" />,
  "Garden":         <Leaf className="w-3.5 h-3.5" />,
  "Balcony":        <Sun className="w-3.5 h-3.5" />,
  "Terrace":        <Sun className="w-3.5 h-3.5" />,
  // Fitness & Recreation
  "Gym":            <Dumbbell className="w-3.5 h-3.5" />,
  "Cycling":        <Bike className="w-3.5 h-3.5" />,
  // Family
  "Pet Friendly":   <Dog className="w-3.5 h-3.5" />,
  "Baby Cot":       <Baby className="w-3.5 h-3.5" />,
  // Furniture
  "Furnished":      <Sofa className="w-3.5 h-3.5" />,
  "Bed Linen":      <BedDouble className="w-3.5 h-3.5" />,
  // Security
  "CCTV":           <Camera className="w-3.5 h-3.5" />,
  "Security Guard": <Shield className="w-3.5 h-3.5" />,
  "Gated Society":  <Lock className="w-3.5 h-3.5" />,
  "Intercom":       <Bell className="w-3.5 h-3.5" />,
  // Utilities
  "Power Backup":   <Lightning className="w-3.5 h-3.5" />,
  "Water Supply":   <Droplets className="w-3.5 h-3.5" />,
  "Gas Pipeline":   <Flame className="w-3.5 h-3.5" />,
  "Waste Disposal": <Trash2 className="w-3.5 h-3.5" />,
  // Transport
  "Near Metro":     <Bus className="w-3.5 h-3.5" />,
  "Bus Stop":       <Bus className="w-3.5 h-3.5" />,
  // Storage
  "Storage Room":   <Package className="w-3.5 h-3.5" />,
};
const AMENITIES = Object.keys(AMENITY_ICONS);
const PROPERTY_TYPES = ["apartment", "house", "villa", "studio", "condo", "cabin"];
const STEPS = ["Basics", "Location", "Photos", "Amenities", "Settings"];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Italy", "Spain", "Netherlands",
  "Singapore", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait",
  "Japan", "South Korea", "China", "Thailand", "Malaysia",
  "Indonesia", "Philippines", "Vietnam", "Bangladesh", "Pakistan",
  "Sri Lanka", "Nepal", "New Zealand", "South Africa", "Nigeria",
  "Kenya", "Egypt", "Brazil", "Mexico", "Argentina",
  "Portugal", "Sweden", "Norway", "Denmark", "Finland",
  "Switzerland", "Austria", "Belgium", "Poland", "Turkey",
  "Russia", "Ukraine", "Israel", "Jordan", "Bahrain",
];

export default function NewPropertyPage() {
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<PropertyVideos>({});
  const [tour360, setTour360] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [priceSuggestion, setPriceSuggestion] = useState<{ suggested: number; range: { min: number; max: number } } | null>(null);
  const [instantBooking, setInstantBooking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState<"flexible" | "moderate" | "strict">("moderate");

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: { propertyType: "apartment", bedrooms: 1, bathrooms: 1, maxGuests: 2 },
  });

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  if (!user || user.role === "tenant") { router.push("/"); return null; }

  const nextStep = async () => {
    const fieldsPerStep: (keyof PropertyInput)[][] = [
      ["title", "description", "price", "propertyType", "bedrooms", "bathrooms", "maxGuests"],
      ["location"],
      [],
      [],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step] as (keyof PropertyInput)[]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: PropertyInput) => {
    if (images.length === 0) { toast.error("Please upload at least one image"); return; }
    try {
      await axios.post("/api/properties", {
        ...data,
        images,
        videos,
        tour360,
        amenities: selectedAmenities,
        instantBooking,
        isAvailable,
        cancellationPolicy,
      }, authHeaders());
      toast.success("Property listed successfully!");
      router.push("/dashboard/properties");
    } catch (err) {
      if (axios.isAxiosError(err)) toast.error(err.response?.data?.error || "Failed to create property");
    }
  };

  const fetchPriceSuggestion = async (city: string) => {
    if (!city) return;
    try {
      const type = watch("propertyType") || "apartment";
      const { data } = await axios.get(`/api/properties/price-suggest?city=${city}&type=${type}`, authHeaders());
      if (data.data?.suggested) setPriceSuggestion(data.data);
    } catch { /* silent */ }
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  return (
    <div className="min-h-screen bg-zinc-50 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-1">List Your Property</h1>
          <p className="text-zinc-500 text-sm">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-zinc-200">
              <motion.div
                className="h-full bg-rose-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* STEP 0: Basics */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 space-y-5">
                <h2 className="font-semibold text-zinc-900 text-lg">Basic Information</h2>
                <Input label="Property Title" placeholder="Cozy apartment in downtown..." error={errors.title?.message} {...register("title")} />
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">Description</label>
                  <textarea {...register("description")} rows={4} placeholder="Describe your property..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none transition-all ${errors.description ? "border-red-400" : "border-zinc-200"}`} />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                  <div className="mt-2">
                    <AIDescriptionGenerator
                      title={watch("title") || ""}
                      propertyType={watch("propertyType") || "apartment"}
                      bedrooms={watch("bedrooms") || 1}
                      bathrooms={watch("bathrooms") || 1}
                      amenities={selectedAmenities}
                      city={watch("location.city") || ""}
                      onGenerated={(desc) => setValue("description", desc)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 block mb-1.5">Property Type</label>
                    <select {...register("propertyType")} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white capitalize">
                      {PROPERTY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <Input label="Price / Month (₹)" type="number" placeholder="10000" error={errors.price?.message}
                      {...register("price", { valueAsNumber: true })} />
                    {priceSuggestion && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI suggests ₹{priceSuggestion.suggested} (₹{priceSuggestion.range.min}–₹{priceSuggestion.range.max})
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Bedrooms" type="number" min="1" error={errors.bedrooms?.message} {...register("bedrooms", { valueAsNumber: true })} />
                  <Input label="Bathrooms" type="number" min="1" error={errors.bathrooms?.message} {...register("bathrooms", { valueAsNumber: true })} />
                  <Input label="Max Guests" type="number" min="1" error={errors.maxGuests?.message} {...register("maxGuests", { valueAsNumber: true })} />
                </div>
                <Input label="Area (sq ft) — optional" type="number" placeholder="850" {...register("area", { valueAsNumber: true })} />
              </motion.div>
            )}

            {/* STEP 1: Location */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 space-y-4">
                <h2 className="font-semibold text-zinc-900 text-lg">Location</h2>
                <Input label="Street Address" placeholder="123 Main Street" error={errors.location?.address?.message} {...register("location.address")} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" placeholder="Mumbai" error={errors.location?.city?.message}
                    {...register("location.city", { onBlur: (e) => fetchPriceSuggestion(e.target.value) })} />
                  <Input label="State / Province" placeholder="Maharashtra" error={errors.location?.state?.message} {...register("location.state")} />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1.5">Country</label>
                  <select
                    {...register("location.country")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-zinc-800 dark:text-white ${errors.location?.country ? "border-red-400" : "border-zinc-200 dark:border-zinc-600"}`}
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.location?.country && <p className="text-xs text-red-500 mt-1">{errors.location.country.message}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Photos & Videos */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 space-y-6">
                <div>
                  <h2 className="font-semibold text-zinc-900 text-lg mb-1">Photos</h2>
                  <p className="text-sm text-zinc-500 mb-4">Upload up to 10 photos. The first image will be the main cover photo.</p>
                  <ImageUploader images={images} onChange={setImages} maxImages={10} />
                  {images.length === 0 && (
                    <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">⚠ At least 1 photo required to publish</p>
                  )}
                </div>

                <div className="border-t border-zinc-100 pt-6">
                  <VideoUploader videos={videos} onChange={setVideos} />
                </div>
                <div className="border-t border-zinc-100 pt-6">
                  <Tour360Uploader images={tour360} onChange={setTour360} />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Amenities */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                <h2 className="font-semibold text-zinc-900 text-lg mb-1">Amenities</h2>
                <p className="text-xs text-zinc-400 mb-4">{selectedAmenities.length} selected</p>

                {[
                  { label: "Essentials", items: ["WiFi", "AC", "Heating", "TV", "Washer", "Dryer"] },
                  { label: "Kitchen", items: ["Kitchen", "Breakfast", "Dining Area", "Refrigerator"] },
                  { label: "Bathroom", items: ["Hot Water", "Bathtub"] },
                  { label: "Outdoor & Parking", items: ["Parking", "Pool", "Garden", "Balcony", "Terrace"] },
                  { label: "Fitness & Recreation", items: ["Gym", "Cycling"] },
                  { label: "Family", items: ["Pet Friendly", "Baby Cot"] },
                  { label: "Furniture", items: ["Furnished", "Bed Linen"] },
                  { label: "Security", items: ["CCTV", "Security Guard", "Gated Society", "Intercom"] },
                  { label: "Utilities", items: ["Power Backup", "Water Supply", "Gas Pipeline", "Waste Disposal"] },
                  { label: "Transport & Storage", items: ["Near Metro", "Bus Stop", "Storage Room"] },
                ].map((group) => (
                  <div key={group.label} className="mb-5">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{group.label}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.items.map((a) => {
                        const selected = selectedAmenities.includes(a);
                        return (
                          <motion.button key={a} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => toggleAmenity(a)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                              selected ? "bg-rose-500 text-white border-rose-500 shadow-sm" : "bg-white text-zinc-600 border-zinc-200 hover:border-rose-300"
                            }`}>
                            {AMENITY_ICONS[a]}
                            <span className="truncate">{a}</span>
                            {selected && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* STEP 4: Settings */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 space-y-5">
                <h2 className="font-semibold text-zinc-900 text-lg">Booking Settings</h2>

                {/* Availability */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Available for Booking</p>
                    <p className="text-xs text-zinc-500">Guests can book this property right now</p>
                  </div>
                  <button type="button" onClick={() => setIsAvailable((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isAvailable ? "bg-rose-500" : "bg-zinc-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAvailable ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Instant Booking */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">Instant Booking</p>
                      <p className="text-xs text-zinc-500">Auto-approve without manual review</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setInstantBooking((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${instantBooking ? "bg-rose-500" : "bg-zinc-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${instantBooking ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Cancellation Policy */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> Cancellation Policy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["flexible", "moderate", "strict"] as const).map((p) => (
                      <button key={p} type="button" onClick={() => setCancellationPolicy(p)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all capitalize ${
                          cancellationPolicy === p ? "bg-rose-500 text-white border-rose-500" : "bg-white text-zinc-600 border-zinc-200 hover:border-rose-300"
                        }`}>{p}</button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    {cancellationPolicy === "flexible" && "Full refund up to 1 day before check-in"}
                    {cancellationPolicy === "moderate" && "Full refund up to 5 days, 50% up to 1 day before"}
                    {cancellationPolicy === "strict" && "50% refund up to 7 days before check-in"}
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-zinc-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-medium text-zinc-700 mb-2">Listing Summary</p>
                  <div className="flex justify-between text-zinc-600"><span>Title</span><span className="font-medium text-zinc-900 truncate max-w-[180px]">{watch("title") || "—"}</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Price</span><span className="font-medium text-zinc-900">₹{watch("price") || 0}/month</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Location</span><span className="font-medium text-zinc-900">{watch("location.city") || "—"}</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Photos</span><span className="font-medium text-zinc-900">{images.length} uploaded</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Interior Video</span><span className={`font-medium ${videos.interior ? "text-green-600" : "text-red-500"}`}>{videos.interior ? "✓ Uploaded" : "✗ Missing"}</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Exterior Video</span><span className={`font-medium ${videos.exterior ? "text-green-600" : "text-red-500"}`}>{videos.exterior ? "✓ Uploaded" : "✗ Missing"}</span></div>
                  <div className="flex justify-between text-zinc-600"><span>Amenities</span><span className="font-medium text-zinc-900">{selectedAmenities.length} selected</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} className="flex-1">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting} size="lg" className="flex-1">
                Publish Listing
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
