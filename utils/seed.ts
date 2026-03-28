/**
 * Run with: npx ts-node utils/seed.ts
 * Or add to package.json: "seed": "ts-node utils/seed.ts"
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "";

const seedData = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Dynamic imports to avoid module issues
  const User = (await import("../models/User")).default;
  const Property = (await import("../models/Property")).default;

  // Clear existing
  await User.deleteMany({});
  await Property.deleteMany({});

  // Create users
  const admin = await User.create({ username: "admin", email: "admin@stayfinder.com", password: "admin123", role: "admin" });
  const owner = await User.create({ username: "john_owner", email: "owner@stayfinder.com", password: "owner123", role: "owner" });
  await User.create({ username: "jane_tenant", email: "tenant@stayfinder.com", password: "tenant123", role: "tenant" });

  // Create properties
  const properties = [
    { title: "Luxury Beachfront Villa", description: "Stunning beachfront villa with panoramic ocean views, private pool, and direct beach access. Perfect for families and groups.", price: 450, location: { address: "123 Ocean Drive", city: "Miami", state: "FL", country: "USA" }, propertyType: "villa", bedrooms: 4, bathrooms: 3, maxGuests: 8, amenities: ["WiFi", "Pool", "Parking", "Kitchen", "AC"], images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"], ownerId: owner._id },
    { title: "Cozy Downtown Apartment", description: "Modern apartment in the heart of the city. Walking distance to restaurants, shops, and attractions.", price: 120, location: { address: "456 Main St", city: "New York", state: "NY", country: "USA" }, propertyType: "apartment", bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["WiFi", "AC", "TV"], images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"], ownerId: owner._id },
    { title: "Mountain Cabin Retreat", description: "Escape to this charming cabin nestled in the mountains. Perfect for hiking, skiing, and relaxation.", price: 200, location: { address: "789 Pine Road", city: "Aspen", state: "CO", country: "USA" }, propertyType: "cabin", bedrooms: 2, bathrooms: 1, maxGuests: 4, amenities: ["WiFi", "Kitchen", "Parking"], images: ["https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"], ownerId: owner._id },
    { title: "Modern Studio in Paris", description: "Chic studio apartment in the heart of Paris, steps from the Eiffel Tower.", price: 180, location: { address: "10 Rue de Rivoli", city: "Paris", state: "Île-de-France", country: "France" }, propertyType: "studio", bedrooms: 1, bathrooms: 1, maxGuests: 2, amenities: ["WiFi", "AC", "TV", "Kitchen"], images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"], ownerId: owner._id },
    { title: "Tropical Bali Villa", description: "Immerse yourself in Balinese culture with this stunning villa surrounded by rice terraces.", price: 300, location: { address: "Jl. Raya Ubud", city: "Ubud", state: "Bali", country: "Indonesia" }, propertyType: "villa", bedrooms: 3, bathrooms: 2, maxGuests: 6, amenities: ["WiFi", "Pool", "Breakfast", "AC"], images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800"], ownerId: owner._id },
    { title: "London City Condo", description: "Sleek condo in central London with stunning city views and easy access to all major attractions.", price: 220, location: { address: "1 Tower Bridge Rd", city: "London", state: "England", country: "UK" }, propertyType: "condo", bedrooms: 2, bathrooms: 2, maxGuests: 4, amenities: ["WiFi", "Gym", "Parking", "TV"], images: ["https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800"], ownerId: owner._id },
  ];

  await Property.insertMany(properties);
  console.log(`✅ Seeded: 3 users, ${properties.length} properties`);
  console.log("Admin: admin@stayfinder.com / admin123");
  console.log("Owner: owner@stayfinder.com / owner123");
  console.log("Tenant: tenant@stayfinder.com / tenant123");
  await mongoose.disconnect();
};

seedData().catch(console.error);
