"use client";

import { motion } from "framer-motion";
import { Phone, AlertTriangle, Hospital, Shield, Flame, User } from "lucide-react";
import { useState, useEffect } from "react";

interface EmergencyContact {
  contacts: {
    name: string;
    relationship: string;
    phone: string;
    isPrimary: boolean;
  }[];
  localEmergencyServices: {
    police: string;
    ambulance: string;
    fire: string;
    hospital?: string;
  };
  ownerContact?: {
    name: string;
    phone: string;
  };
}

export default function EmergencyPanel() {
  const [contacts, setContacts] = useState<EmergencyContact | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/emergency-contacts");
      const data = await res.json();
      setContacts(data.contact);
    } catch (error) {
      console.error("Failed to fetch emergency contacts:", error);
    }
  };

  const makeCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const emergencyServices = [
    { name: "Police", icon: Shield, number: contacts?.localEmergencyServices.police || "100", color: "from-blue-500 to-blue-600" },
    { name: "Ambulance", icon: Hospital, number: contacts?.localEmergencyServices.ambulance || "108", color: "from-red-500 to-red-600" },
    { name: "Fire", icon: Flame, number: contacts?.localEmergencyServices.fire || "101", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl flex items-center justify-center"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(239, 68, 68, 0.7)",
            "0 0 0 20px rgba(239, 68, 68, 0)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AlertTriangle className="w-8 h-8" />
      </motion.button>

      {/* Emergency Panel */}
      {showPanel && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Emergency Contacts
            </h3>
            <p className="text-xs text-white/80 mt-1">Quick access to help</p>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Emergency Services */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">
                Emergency Services
              </p>
              <div className="grid grid-cols-3 gap-2">
                {emergencyServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <motion.button
                      key={service.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => makeCall(service.number)}
                      className={`p-3 rounded-xl bg-gradient-to-br ${service.color} text-white text-center`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <p className="text-xs font-semibold">{service.name}</p>
                      <p className="text-[10px] opacity-80">{service.number}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Personal Contacts */}
            {contacts?.contacts && contacts.contacts.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">
                  Personal Contacts
                </p>
                <div className="space-y-2">
                  {contacts.contacts.map((contact, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ x: 4 }}
                      onClick={() => makeCall(contact.phone)}
                      className="w-full flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {contact.name}
                        </p>
                        <p className="text-xs text-zinc-500">{contact.relationship}</p>
                      </div>
                      <Phone className="w-4 h-4 text-green-500" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Contact */}
            {contacts?.ownerContact && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase">
                  Property Owner
                </p>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => makeCall(contacts.ownerContact!.phone)}
                  className="w-full flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {contacts.ownerContact.name}
                    </p>
                    <p className="text-xs text-zinc-500">Property Owner</p>
                  </div>
                  <Phone className="w-4 h-4 text-green-500" />
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
