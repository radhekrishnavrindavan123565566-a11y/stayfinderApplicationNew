"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Trash2, Shield, Phone, User } from "lucide-react";
import { cn } from "@/utils/cn";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function EmergencyContactsPage() {
  const { ready, user } = useRequireAuth();
  const [contacts, setContacts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (!ready || !user) return;
    fetchContacts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user]);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/emergency-contacts");
      const data = await res.json();
      setContacts(data.contact);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) return;

    try {
      const updatedContacts = {
        ...contacts,
        contacts: [...(contacts?.contacts || []), newContact],
      };

      const res = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContacts),
      });

      if (res.ok) {
        fetchContacts();
        setNewContact({ name: "", relationship: "", phone: "", email: "", isPrimary: false });
      }
    } catch (error) {
      console.error("Failed to add contact:", error);
    }
  };

  const removeContact = async (index: number) => {
    try {
      const updatedContacts = {
        ...contacts,
        contacts: contacts.contacts.filter((_: any, i: number) => i !== index),
      };

      await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedContacts),
      });

      fetchContacts();
    } catch (error) {
      console.error("Failed to remove contact:", error);
    }
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Emergency Contacts
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage your emergency contacts and services
              </p>
            </div>
          </div>
        </motion.div>

        {/* Emergency Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="font-bold text-xl text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Emergency Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Police", number: "100", color: "from-blue-500 to-blue-600" },
              { name: "Ambulance", number: "108", color: "from-red-500 to-red-600" },
              { name: "Fire", number: "101", color: "from-orange-500 to-orange-600" },
            ].map((service) => (
              <motion.a
                key={service.name}
                href={`tel:${service.number}`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${service.color} text-white text-center shadow-lg`}
              >
                <Phone className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold text-lg">{service.name}</p>
                <p className="text-2xl font-black mt-1">{service.number}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Personal Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="font-bold text-xl text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            Personal Contacts
          </h2>

          {/* Add Contact Form */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addContact}
              className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </motion.button>
          </div>

          {/* Contact List */}
          <div className="space-y-3">
            {contacts?.contacts?.map((contact: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-white">{contact.name}</p>
                  <p className="text-sm text-zinc-500">{contact.relationship}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{contact.phone}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeContact(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}

            {(!contacts?.contacts || contacts.contacts.length === 0) && (
              <p className="text-center text-zinc-500 py-8">
                No emergency contacts added yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
