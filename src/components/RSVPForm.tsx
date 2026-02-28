"use client";

import { useState, useEffect } from "react";
import { submitRSVP, getGuests } from "@/app/actions/rsvp";
import { ToastContainer, useToast } from "./Toast";

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
    guestDetails: {} as Record<number, { drinkPreferences: string[]; otherDrink: string; email: string }>,
  });

  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isDrinkDropdownOpen, setIsDrinkDropdownOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState("");

  // Filter guests based on search
  const filteredGuests = availableGuests.filter((guest) => {
    const searchLower = guestSearch.toLowerCase();
    const fullName = `${guest.name} ${guest.surname}`.toLowerCase();
    return fullName.includes(searchLower);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { messages: toastMessages, showToast, closeToast } = useToast();

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
    setFormData((prev) => {
      const isSelected = prev.selectedGuests.includes(guestId);
      const newSelectedGuests = isSelected
        ? prev.selectedGuests.filter((id) => id !== guestId)
        : [...prev.selectedGuests, guestId];
      
      const newGuestDetails = { ...prev.guestDetails };
      if (isSelected) {
        delete newGuestDetails[guestId];
      } else {
        newGuestDetails[guestId] = { drinkPreferences: [], otherDrink: "", email: "" };
      }
      
      return {
        ...prev,
        selectedGuests: newSelectedGuests,
        guestDetails: newGuestDetails,
      };
    });
  };

  const toggleGuestDrinkSelection = (guestId: number, drinkValue: string) => {
    setFormData((prev) => {
      const guestDetail = prev.guestDetails[guestId] || { drinkPreferences: [], otherDrink: "", email: "" };
      const newDrinks = guestDetail.drinkPreferences.includes(drinkValue)
        ? guestDetail.drinkPreferences.filter((d) => d !== drinkValue)
        : [...guestDetail.drinkPreferences, drinkValue];
      
      const otherDrink = !newDrinks.includes("other") ? "" : guestDetail.otherDrink;
      
      return {
        ...prev,
        guestDetails: {
          ...prev.guestDetails,
          [guestId]: { ...guestDetail, drinkPreferences: newDrinks, otherDrink },
        },
      };
    });
  };

  const updateGuestDetail = (guestId: number, field: "otherDrink" | "email", value: string) => {
    setFormData((prev) => ({
      ...prev,
      guestDetails: {
        ...prev.guestDetails,
        [guestId]: { ...prev.guestDetails[guestId], [field]: value },
      },
    }));
  };

  const getGuestDrinkLabels = (guestId: number) => {
    const guestDetail = formData.guestDetails[guestId];
    if (!guestDetail) return "";
    return guestDetail.drinkPreferences
      .map((value) => {
        if (value === "other") return guestDetail.otherDrink || "Ostalo";
        const option = DRINK_OPTIONS.find((o) => o.value === value);
        return option?.label || value;
      })
      .join(", ");
  };

  const [openGuestDrinkDropdowns, setOpenGuestDrinkDropdowns] = useState<Record<number, boolean>>({});

  const toggleGuestDrinkDropdown = (guestId: number) => {
    setOpenGuestDrinkDropdowns((prev) => ({
      ...prev,
      [guestId]: !prev[guestId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      // Build per-guest drink preferences for additional guests
      const guestDetailsList = formData.selectedGuests.map((guestId) => {
        const detail = formData.guestDetails[guestId];
        const guestDrinkPref = detail
          ? detail.drinkPreferences
              .map((value) => {
                if (value === "other") return detail.otherDrink;
                const option = DRINK_OPTIONS.find((o) => o.value === value);
                return option?.label || value;
              })
              .filter(Boolean)
              .join(", ")
          : "";
        return {
          id: guestId,
          drinkPreference: guestDrinkPref,
          email: detail?.email || "",
        };
      });

      const result = await submitRSVP({
        ...formData,
        drinkPreference,
        guestDetailsList,
      });

      if (result.success) {
        showToast("success", result.message);
        setFormData({
          name: "",
          surname: "",
          email: "",
          drinkPreferences: [],
          otherDrink: "",
          otherPreferences: "",
          confirmingForOthers: false,
          selectedGuests: [],
          guestDetails: {},
        });
        setOpenGuestDrinkDropdowns({});
      } else {
        showToast("error", result.message);
      }
    } catch (error) {
      showToast("error", "Došlo je do greške. Molimo pokušajte ponovno.");
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
            className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all text-left flex items-center justify-between cursor-pointer"
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
        <div className="animate-fade-in relative z-[100]">
          <label
            className="block text-[#304254] text-sm font-medium mb-2"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Odaberite osobe za koje potvrđujete dolazak
          </label>
          <div className="relative z-[100]">
            <button
              type="button"
              onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
              className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all text-left flex items-center justify-between cursor-pointer"
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
              <div className="absolute z-50 w-full mt-1 bg-white border border-[#304254]/20 rounded-lg shadow-lg">
                {/* Search Input */}
                <div className="p-2 border-b border-[#304254]/10">
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Pretraži goste..."
                    className="w-full px-3 py-2 rounded-md border border-[#304254]/20 bg-white text-[#304254] text-sm focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {/* Guest List */}
                <div className="max-h-48 overflow-y-auto z-50">
                  {availableGuests.length === 0 ? (
                    <div
                      className="px-4 py-3 text-[#304254]/50 text-sm"
                      style={{ fontFamily: "var(--font-montserrat)" }}
                    >
                      Nema dostupnih gostiju
                    </div>
                  ) : filteredGuests.length === 0 ? (
                    <div
                      className="px-4 py-3 text-[#304254]/50 text-sm"
                      style={{ fontFamily: "var(--font-montserrat)" }}
                    >
                      Nema rezultata za "{guestSearch}"
                    </div>
                  ) : (
                    filteredGuests.map((guest) => (
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

          {/* Per-guest drink selection and email */}
          {formData.selectedGuests.length > 0 && (
            <div className="mt-6 space-y-6">
              <p
                className="text-[#304254] text-sm font-medium"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Unesite preferencije za svaku odabranu osobu:
              </p>
              {formData.selectedGuests.map((guestId) => {
                const guest = availableGuests.find((g) => g.id === guestId);
                if (!guest) return null;
                const guestDetail = formData.guestDetails[guestId] || { drinkPreferences: [], otherDrink: "", email: "" };
                const isDropdownOpen = openGuestDrinkDropdowns[guestId] || false;

                return (
                  <div
                    key={guestId}
                    className="p-4 bg-white/50 rounded-lg border border-[#304254]/10 space-y-4"
                  >
                    <h4
                      className="text-[#304254] font-medium"
                      style={{ fontFamily: "var(--font-montserrat)" }}
                    >
                      {guest.name} {guest.surname}
                    </h4>

                    {/* Guest Drink Selection */}
                    <div>
                      <label
                        className="block text-[#304254] text-sm font-medium mb-2"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        Preferirana pića
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleGuestDrinkDropdown(guestId)}
                          className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all text-left flex items-center justify-between cursor-pointer"
                          style={{ fontFamily: "var(--font-montserrat)" }}
                        >
                          <span className={guestDetail.drinkPreferences.length === 0 ? "text-[#304254]/50" : ""}>
                            {guestDetail.drinkPreferences.length === 0
                              ? "Odaberite pića..."
                              : getGuestDrinkLabels(guestId)}
                          </span>
                          <svg
                            className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute z-[200] w-full mt-1 bg-white border border-[#304254]/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {DRINK_OPTIONS.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center px-4 py-3 hover:bg-[#f7ebe9] cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={guestDetail.drinkPreferences.includes(option.value)}
                                  onChange={() => toggleGuestDrinkSelection(guestId, option.value)}
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
                    </div>

                    {/* Guest Other Drink Input */}
                    {guestDetail.drinkPreferences.includes("other") && (
                      <div className="animate-fade-in">
                        <label
                          className="block text-[#304254] text-sm font-medium mb-2"
                          style={{ fontFamily: "var(--font-montserrat)" }}
                        >
                          Navedite željeno piće
                        </label>
                        <input
                          type="text"
                          value={guestDetail.otherDrink}
                          onChange={(e) => updateGuestDetail(guestId, "otherDrink", e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
                          style={{ fontFamily: "var(--font-montserrat)" }}
                          placeholder="Unesite željeno piće..."
                        />
                      </div>
                    )}

                    {/* Guest Email (Optional) */}
                    <div>
                      <label
                        className="block text-[#304254] text-sm font-medium mb-2"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                      >
                        Email (opcionalno)
                      </label>
                      <input
                        type="email"
                        value={guestDetail.email}
                        onChange={(e) => updateGuestDetail(guestId, "email", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-[#304254]/20 bg-white text-[#304254] focus:outline-none focus:ring-2 focus:ring-[#a0bdca] focus:border-transparent transition-all"
                        style={{ fontFamily: "var(--font-montserrat)" }}
                        placeholder="email@primjer.com"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer messages={toastMessages} onClose={closeToast} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.name.trim() || !formData.surname.trim() || !formData.email.trim()}
        className={`relative z-10 w-full text-white px-8 py-4 rounded-full text-lg font-medium transition-colors ${
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
