"use client";

import { useState, useEffect } from "react";
import { submitRSVP, getGuests } from "@/app/actions/rsvp";

interface Guest {
  id: number;
  name: string;
  surname: string;
}

const DRINK_OPTIONS = [
  { value: "aperol_spritz", label: "Aperol Spritz" },
  { value: "wine_white", label: "Bijelo vino" },
  { value: "cognac", label: "Cognac" },
  { value: "cosmopolitan", label: "Cosmopolitan" },
  { value: "wine_red", label: "Crno vino" },
  { value: "tea", label: "Čaj" },
  { value: "gin", label: "Gin" },
  { value: "gin_tonic", label: "Gin & Tonic" },
  { value: "hugo", label: "Hugo" },
  { value: "jack_daniels", label: "Jack Daniels" },
  { value: "coffee", label: "Kava" },
  { value: "margarita", label: "Margarita" },
  { value: "martini", label: "Martini" },
  { value: "mojito", label: "Mojito" },
  { value: "beer", label: "Pivo" },
  { value: "prosecco", label: "Prosecco" },
  { value: "brandy", label: "Rakija / Brandy" },
  { value: "wine_rose", label: "Rose vino" },
  { value: "rum", label: "Rum" },
  { value: "juice", label: "Sok" },
  { value: "champagne", label: "Šampanjac" },
  { value: "tequila", label: "Tequila" },
  { value: "water", label: "Voda" },
  { value: "vodka", label: "Votka" },
  { value: "whiskey", label: "Whiskey" },
  { value: "other", label: "Ostalo..." },
];

export default function RSVPForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    drinkPreferences: [] as string[],
    otherDrink: "",
    otherPreferences: "",
    confirmingForOthers: false,
    selectedGuests: [] as number[],
  });

  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isDrinkDropdownOpen, setIsDrinkDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch available guests when checkbox is checked
  useEffect(() => {
    if (formData.confirmingForOthers) {
      fetchAvailableGuests();
    }
  }, [formData.confirmingForOthers]);

  const fetchAvailableGuests = async () => {
    try {
      const guests = await getGuests();
      setAvailableGuests(guests);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === "confirmingForOthers" && !checked ? { selectedGuests: [] } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleDrinkSelection = (drinkValue: string) => {
    setFormData((prev) => {
      const newDrinks = prev.drinkPreferences.includes(drinkValue)
        ? prev.drinkPreferences.filter((d) => d !== drinkValue)
        : [...prev.drinkPreferences, drinkValue];
      
      // Clear otherDrink if "other" is deselected
      const otherDrink = !newDrinks.includes("other") ? "" : prev.otherDrink;
      
      return {
        ...prev,
        drinkPreferences: newDrinks,
        otherDrink,
      };
    });
  };

  const getSelectedDrinkLabels = () => {
    return formData.drinkPreferences
      .map((value) => {
        if (value === "other") return formData.otherDrink || "Ostalo";
        const option = DRINK_OPTIONS.find((o) => o.value === value);
        return option?.label || value;
      })
      .join(", ");
  };

  const toggleGuestSelection = (guestId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedGuests: prev.selectedGuests.includes(guestId)
        ? prev.selectedGuests.filter((id) => id !== guestId)
        : [...prev.selectedGuests, guestId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Build drink preference string from selections
      const drinkPreference = formData.drinkPreferences
        .map((value) => {
          if (value === "other") return formData.otherDrink;
          const option = DRINK_OPTIONS.find((o) => o.value === value);
          return option?.label || value;
        })
        .filter(Boolean)
        .join(", ");

      const result = await submitRSVP({
        ...formData,
        drinkPreference,
      });

      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message });
        setFormData({
          name: "",
          surname: "",
          email: "",
          drinkPreferences: [],
          otherDrink: "",
          otherPreferences: "",
          confirmingForOthers: false,
          selectedGuests: [],
        });
      } else {
        setSubmitMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "Došlo je do greške. Molimo pokušajte ponovno." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedGuestNames = () => {
    return availableGuests
      .filter((guest) => formData.selectedGuests.includes(guest.id))
      .map((guest) => `${guest.name} ${guest.surname}`)
      .join(", ");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Surname Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-[#304254] text-sm font-medium mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Ime *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
            style={{ fontFamily: "var(--font-montserrat)" }}
            placeholder="Vaše ime"
          />
        </div>
        <div>
          <label
            htmlFor="surname"
            className="block text-[#304254] text-sm font-medium mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Prezime *
          </label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
            style={{ fontFamily: "var(--font-montserrat)" }}
            placeholder="Vaše prezime"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-[#304254] text-sm font-medium mb-2"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
          style={{ fontFamily: "var(--font-montserrat)" }}
          placeholder="vas@email.com"
        />
      </div>

      {/* Drink Preferences - Multi-select */}
      <div>
        <label
          className="block text-[#304254] text-sm font-medium mb-2"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Preferirana pića (možete odabrati više)
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDrinkDropdownOpen(!isDrinkDropdownOpen)}
            className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all text-left flex items-center justify-between"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            <span className={formData.drinkPreferences.length === 0 ? "text-[#304254]/50" : ""}>
              {formData.drinkPreferences.length === 0
                ? "Odaberite pića..."
                : getSelectedDrinkLabels()}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${isDrinkDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDrinkDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[#304254]/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {DRINK_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center px-4 py-3 hover:bg-[#f7ebe9] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.drinkPreferences.includes(option.value)}
                    onChange={() => toggleDrinkSelection(option.value)}
                    className="w-4 h-4 rounded border-[#304254]/20 text-[#a0bdca] focus:ring-[#a0bdca]"
                  />
                  <span
                    className="ml-3 text-[#304254] text-sm"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        {formData.drinkPreferences.length > 0 && (
          <p
            className="mt-2 text-[#304254]/70 text-sm"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Odabrano: {formData.drinkPreferences.length} {formData.drinkPreferences.length === 1 ? "piće" : "pića"}
          </p>
        )}
      </div>

      {/* Other Drink Input - Only shown when "Other" is selected */}
      {formData.drinkPreferences.includes("other") && (
        <div className="animate-fade-in">
          <label
            htmlFor="otherDrink"
            className="block text-[#304254] text-sm font-medium mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Navedite željeno piće
          </label>
          <input
            type="text"
            id="otherDrink"
            name="otherDrink"
            value={formData.otherDrink}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
            style={{ fontFamily: "var(--font-montserrat)" }}
            placeholder="Unesite željeno piće..."
          />
        </div>
      )}

      {/* Other Preferences */}
      <div>
        <label
          htmlFor="otherPreferences"
          className="block text-[#304254] text-sm font-medium mb-2"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Ostale napomene (alergije, posebni zahtjevi, itd.)
        </label>
        <textarea
          id="otherPreferences"
          name="otherPreferences"
          value={formData.otherPreferences}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all resize-none"
          style={{ fontFamily: "var(--font-montserrat)" }}
          placeholder="Npr. alergije na hranu, vegetarijanska prehrana, posebni zahtjevi..."
        />
      </div>

      {/* Confirming for Others Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="confirmingForOthers"
          name="confirmingForOthers"
          checked={formData.confirmingForOthers}
          onChange={handleInputChange}
          className="w-5 h-5 rounded border-[#304254]/20 text-[#a0bdca] focus:ring-[#a0bdca] cursor-pointer"
        />
        <label
          htmlFor="confirmingForOthers"
          className="ml-3 text-[#304254] text-sm font-medium cursor-pointer"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Potvrđujem dolazak za više osoba
        </label>
      </div>

      {/* Multi-select Dropdown for Other Guests */}
      {formData.confirmingForOthers && (
        <div className="animate-fade-in">
          <label
            className="block text-[#304254] text-sm font-medium mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Odaberite osobe za koje potvrđujete dolazak
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
              className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all text-left flex items-center justify-between"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              <span className={formData.selectedGuests.length === 0 ? "text-[#304254]/50" : ""}>
                {formData.selectedGuests.length === 0
                  ? "Odaberite osobe..."
                  : getSelectedGuestNames()}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isGuestDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isGuestDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#304254]/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {availableGuests.length === 0 ? (
                  <div
                    className="px-4 py-3 text-[#304254]/50 text-sm"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    Nema dostupnih gostiju
                  </div>
                ) : (
                  availableGuests.map((guest) => (
                    <label
                      key={guest.id}
                      className="flex items-center px-4 py-3 hover:bg-[#f7ebe9] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedGuests.includes(guest.id)}
                        onChange={() => toggleGuestSelection(guest.id)}
                        className="w-4 h-4 rounded border-[#304254]/20 text-[#a0bdca] focus:ring-[#a0bdca]"
                      />
                      <span
                        className="ml-3 text-[#304254] text-sm"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        {guest.name} {guest.surname}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          {formData.selectedGuests.length > 0 && (
            <p
              className="mt-2 text-[#304254]/70 text-sm"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Odabrano: {formData.selectedGuests.length} {formData.selectedGuests.length === 1 ? "osoba" : "osobe"}
            </p>
          )}
        </div>
      )}

      {/* Submit Message */}
      {submitMessage && (
        <div
          className={`p-4 rounded-lg ${
            submitMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {submitMessage.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.name.trim() || !formData.surname.trim() || !formData.email.trim()}
        className={`w-full text-white px-8 py-4 rounded-full text-lg font-medium transition-colors ${
          isSubmitting || !formData.name.trim() || !formData.surname.trim() || !formData.email.trim()
            ? "bg-[#a0bdca] opacity-50 cursor-not-allowed"
            : "bg-[#5b8fa8] hover:bg-[#4a7a91] cursor-pointer"
        }`}
        style={{ fontFamily: "var(--font-montserrat)" }}
      >
        {isSubmitting ? "Šaljem..." : "Potvrdi dolazak"}
      </button>
    </form>
  );
}
