"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Check,
  ChevronRight,
  ArrowRight,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { formatPrice, formatDuration, formatDateFrench } from "@/lib/utils";

export default function BookingWizard({ initialServices = [] }) {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("service");

  // Multi-step state: 1 to 6
  const [currentStep, setCurrentStep] = useState(1);

  // Form selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isStudent, setIsStudent] = useState(false); // -5 € discount on hair included
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    instagram: "",
    notes: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Async slot loading state
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotError, setSlotError] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);

  // Fetch blocked dates on mount
  useEffect(() => {
    fetch("/api/availability?mode=blocked")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.blockedDates)) {
          setBlockedDates(d.blockedDates);
        }
      })
      .catch(() => {});
  }, []);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  // Pre-select service from URL query if present
  useEffect(() => {
    if (preselectedSlug && initialServices.length > 0) {
      const match = initialServices.find((s) => s.slug === preselectedSlug);
      if (match) {
        setSelectedService(match);
        const defaultOpts = {};
        if (match.options) {
          match.options.forEach((opt) => {
            if (opt.choices && opt.choices.length > 0) {
              defaultOpts[opt.name] = opt.choices[0];
            }
          });
        }
        setSelectedOptions(defaultOpts);
        setCurrentStep(2);
      }
    }
  }, [preselectedSlug, initialServices]);

  // Dynamic calculations: deposit is strictly 10 €
  const { totalPrice, totalDuration, depositAmount, remainingBalance, endTime } =
    useMemo(() => {
      if (!selectedService) {
        return {
          totalPrice: 0,
          totalDuration: 0,
          depositAmount: 10,
          remainingBalance: 0,
          endTime: "",
        };
      }

      let price = selectedService.price;
      let duration = selectedService.duration;

      Object.values(selectedOptions).forEach((choice) => {
        if (choice) {
          price += Number(choice.priceDiff) || 0;
          duration += Number(choice.durationDiff) || 0;
        }
      });

      // -5 € student discount for services with hair included
      if (isStudent && selectedService.includesHair) {
        price = Math.max(0, price - 5);
      }

      const deposit = 10; // RÈGLE OFFICIELLE : ACOMPTE STRICT DE 10 €
      const balance = Math.max(0, price - deposit);

      let computedEnd = "";
      if (selectedTime) {
        const [h, m] = selectedTime.split(":").map(Number);
        const endTotalMinutes = h * 60 + m + duration;
        const endH = Math.floor(endTotalMinutes / 60);
        const endM = endTotalMinutes % 60;
        computedEnd = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`;
      }

      return {
        totalPrice: price,
        totalDuration: duration,
        depositAmount: deposit,
        remainingBalance: balance,
        endTime: computedEnd,
      };
    }, [selectedService, selectedOptions, selectedTime, isStudent]);

  // Fetch slots whenever selectedDate or totalDuration changes
  useEffect(() => {
    if (!selectedDate || !totalDuration) return;

    let isMounted = true;
    setLoadingSlots(true);
    setSlotError("");
    setSelectedTime("");

    fetch(`/api/availability?date=${selectedDate}&duration=${totalDuration}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          setAvailableSlots(data.slots || []);
          if (!data.isOpen) {
            setSlotError("Le salon est fermé à cette date. Choisissez un autre jour sur le calendrier.");
          } else if (data.slots.length === 0) {
            setSlotError(
              "Tous les créneaux de cette journée sont déjà réservés. Essayez la date suivante."
            );
          }
        } else {
          setSlotError(data.error || "Nous n'avons pas pu charger les horaires disponibles. Merci de rafraîchir la sélection.");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSlotError("La connexion a rencontré un contretemps lors du chargement des créneaux. Merci de réessayer.");
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, totalDuration]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    const defaultOpts = {};
    if (service.options) {
      service.options.forEach((opt) => {
        if (opt.choices && opt.choices.length > 0) {
          defaultOpts[opt.name] = opt.choices[0];
        }
      });
    }
    setSelectedOptions(defaultOpts);
    setSelectedTime("");
    setIsStudent(false);
    setCurrentStep(2);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleOptionChange = (optionName, choice) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: choice,
    }));
    setSelectedTime("");
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setSubmitError("");

    const formattedOptions = Object.entries(selectedOptions).map(
      ([name, choice]) => ({
        name,
        choice: choice.label,
        priceDiff: choice.priceDiff,
        durationDiff: choice.durationDiff,
      })
    );

    if (isStudent && selectedService.includesHair) {
      formattedOptions.push({
        name: "Réduction Étudiante",
        choice: "-5 € (justificatif requis)",
        priceDiff: -5,
        durationDiff: 0,
      });
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id || selectedService._id,
          selectedOptions: formattedOptions,
          date: selectedDate,
          startTime: selectedTime,
          customer,
          acceptedTerms,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmissionResult(data.booking);
        setCurrentStep(6);
        window.scrollTo({ top: 100, behavior: "smooth" });
      } else {
        setSubmitError(data.error || "Nous n'avons pas pu valider votre demande. Merci de vérifier vos informations.");
      }
    } catch (e) {
      setSubmitError("La connexion a été interrompue. Vos choix sont conservés, vous pouvez renvoyer votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableDateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 45; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d);
      const dayNumber = d.getDate();
      const monthName = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d);
      const isBlocked = blockedDates.includes(dateStr);

      dates.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        isSunday: d.getDay() === 0,
        isBlocked,
      });
    }
    return dates;
  }, [blockedDates]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps Header Minimaliste & Épuré */}
      {currentStep < 6 && (
        <div className="mb-8 max-w-md mx-auto px-4">
          <div className="flex items-center justify-between text-xs font-medium text-stone-500 mb-2.5">
            <span className="font-serif text-sm font-bold text-brun">
              {currentStep === 1 && "1. Sélection de votre coiffure"}
              {currentStep === 2 && "2. Longueur & Options mèches"}
              {currentStep === 3 && "3. Date & Créneau souhaité"}
              {currentStep === 4 && "4. Vos coordonnées"}
              {currentStep === 5 && "5. Récapitulatif de votre demande"}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-champagne-dark font-semibold">
              Étape {currentStep} sur 5
            </span>
          </div>
          {/* Segmented bar */}
          <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-full rounded-full transition-all duration-300 ${
                  s <= currentStep ? "bg-brun" : "bg-beige"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              Sélectionnez votre prestation
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm font-light mt-1">
              Coiffures sans rajouts, sans mèches fournies ou avec mèches incluses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialServices.map((service) => (
              <div
                key={service.id || service._id}
                onClick={() => handleSelectService(service)}
                className="bg-white rounded-2xl p-4 border border-beige hover:border-champagne hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-beige-light">
                    <Image
                      src={
                        service.images?.[0] ||
                        "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={service.name}
                      fill
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 text-brun text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border border-beige">
                      {service.category}
                    </div>
                  </div>

                  <h3 className="font-serif text-base font-bold text-brun group-hover:text-champagne-dark transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 font-light">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-beige flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold font-serif text-brun">
                      {formatPrice(service.price)}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Acompte 10 €
                    </div>
                  </div>
                  <button className="bg-creme group-hover:bg-champagne text-brun group-hover:text-brun-dark px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center space-x-1 border border-beige">
                    <span>Choisir</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: LENGTH & OPTIONS */}
      {currentStep === 2 && selectedService && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-beige pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
                Étape 2 sur 5
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                Longueur & Personnalisation
              </h2>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs text-stone-500 hover:text-brun underline"
            >
              Changer de coiffure
            </button>
          </div>

          {/* Current Selection Summary */}
          <div className="p-3.5 rounded-xl bg-creme border border-beige flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-brun block">{selectedService.name}</span>
              <span className="text-stone-500">{selectedService.category}</span>
            </div>
            <div className="text-right">
              <span className="font-serif font-bold text-sm text-brun block">
                {formatPrice(selectedService.price)}
              </span>
              <span className="text-[10px] text-stone-400">
                Acompte : 10 €
              </span>
            </div>
          </div>

          {/* Options (Longueur, Motifs...) */}
          {selectedService.options && selectedService.options.length > 0 ? (
            <div className="space-y-4">
              {selectedService.options.map((opt, optIndex) => {
                const isLengthOpt = opt.name.toLowerCase().includes("longueur");
                const getLengthThumbnail = (label) => {
                  const l = (label || "").toLowerCase();
                  if (l.includes("extra")) return "/guide-longueur-extra-long.jpg";
                  if (l.includes("mi-long")) return "/guide-longueur-mi-long.jpg";
                  if (l.includes("court")) return "/guide-longueur-court.jpg";
                  if (l.includes("long")) return "/guide-longueur-long.jpg";
                  return null;
                };

                return (
                  <div key={optIndex} className="space-y-2">
                    <div className="text-xs font-semibold text-brun">
                      {opt.name} :
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {opt.choices.map((choice, cIndex) => {
                        const isSelected =
                          selectedOptions[opt.name]?.label === choice.label;
                        const thumb = isLengthOpt ? getLengthThumbnail(choice.label) : null;

                        return (
                          <div
                            key={cIndex}
                            onClick={() => handleOptionChange(opt.name, choice)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                              isSelected
                                ? "bg-creme border-champagne ring-2 ring-champagne/40"
                                : "bg-white border-beige hover:border-stone-300"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {thumb && (
                                <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 border border-beige/80 bg-white">
                                  <Image
                                    src={thumb}
                                    alt={choice.label}
                                    fill
                                    className="object-cover object-top"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-brun">
                                    {choice.label}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-champagne-dark" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">
              Prestation à longueur ou format unique.
            </p>
          )}

          {/* Student Discount Toggle (only for hair included) */}
          {selectedService.includesHair && (
            <div className="p-3.5 rounded-xl bg-champagne-light/50 border border-champagne/40">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-brun focus:ring-champagne"
                />
                <div className="text-xs">
                  <span className="font-bold text-brun block">
                    Réduction Étudiante (-5 €)
                  </span>
                  <span className="text-stone-500 font-light text-[11px]">
                    Valable uniquement pour les coiffures avec mèches incluses. Un justificatif étudiant en cours de validité devra être présenté le jour J.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Footer recap */}
          <div className="pt-4 border-t border-beige flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-stone-400">Total estimé :</div>
              <div className="text-lg font-serif font-bold text-brun">
                {formatPrice(totalPrice)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-stone-600 hover:text-brun text-center"
              >
                ← Changer de coiffure
              </button>
              <button
                onClick={() => {
                  setCurrentStep(3);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-nude hover:bg-nude-dark text-white px-8 py-4 rounded-full text-sm sm:text-base font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
              >
                <span>Choisir le créneau</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-beige pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
                Étape 3 sur 5
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                Sélectionnez le créneau
              </h2>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs text-stone-500 hover:text-brun underline"
            >
              Modifier longueur
            </button>
          </div>

          <div className="text-xs text-stone-600 bg-creme p-3 rounded-xl border border-beige flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-champagne-dark shrink-0" />
            <span>
              Prestation choisie : <strong>{selectedService.name}</strong>
            </span>
          </div>

          {/* Dates Bar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-brun block">
              1. Choisissez une date disponible :
            </label>
            <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {availableDateOptions.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                const isDisabled = item.isSunday || item.isBlocked;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`shrink-0 min-w-14 py-2.5 px-2 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                      isSelected
                        ? "bg-brun text-creme shadow-xs ring-2 ring-champagne"
                        : isDisabled
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200 opacity-60"
                        : "bg-white text-brun border border-beige hover:border-champagne"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider">
                      {item.dayName}
                    </span>
                    <span className="text-base font-serif font-bold mt-0.5">
                      {item.dayNumber}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {item.isBlocked ? "Fermé" : item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots */}
          {selectedDate && (
            <div className="space-y-2 pt-3 border-t border-beige">
              <label className="text-xs font-semibold text-brun block">
                2. Choisissez une heure de début pour le {formatDateFrench(selectedDate)} :
              </label>

              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-stone-500">
                  Calcul des créneaux en cours...
                </div>
              ) : slotError ? (
                <div className="p-3 rounded-xl bg-creme border border-beige text-xs text-stone-600 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-champagne-dark shrink-0" />
                  <span>{slotError}</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                          isSelected
                            ? "bg-champagne text-brun-dark ring-2 ring-champagne-dark"
                            : "bg-creme text-brun border border-beige hover:border-champagne"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {selectedTime && (
            <div className="p-3 rounded-xl bg-beige-light border border-beige flex items-center justify-between text-xs text-brun">
              <span>
                Heure de début du rendez-vous : <strong>{selectedTime}</strong>
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-4 border-t border-beige flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-brun"
            >
              Retour
            </button>
            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => {
                setCurrentStep(4);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="inline-flex items-center space-x-1.5 bg-champagne disabled:opacity-40 disabled:cursor-not-allowed hover:bg-champagne-dark text-brun-dark px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Continuer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CLIENT CONTACT */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-xs space-y-6">
          <div className="border-b border-beige pb-4">
            <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
              Étape 4 sur 5
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
              Vos Coordonnées
            </h2>
            <p className="text-xs text-stone-500 font-light mt-1">
              Prénom, nom, e-mail et numéro pour la validation et l'adresse.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Votre prénom"
                  value={customer.firstName}
                  onChange={(e) =>
                    setCustomer({ ...customer, firstName: e.target.value })
                  }
                  className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Votre nom"
                  value={customer.lastName}
                  onChange={(e) =>
                    setCustomer({ ...customer, lastName: e.target.value })
                  }
                  className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Adresse e-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@exemple.com"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brun block mb-1">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="06 12 34 56 78"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brun block mb-1">
                Compte Instagram (recommandé pour le suivi)
              </label>
              <input
                type="text"
                placeholder="@votre_pseudo_instagram"
                value={customer.instagram}
                onChange={(e) =>
                  setCustomer({ ...customer, instagram: e.target.value })
                }
                className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-brun block mb-1">
                Remarques éventuelles (facultatif)
              </label>
              <textarea
                rows={2}
                placeholder="Précision sur vos mèches ou votre texture..."
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({ ...customer, notes: e.target.value })
                }
                className="w-full bg-creme border border-beige rounded-xl px-3.5 py-2 text-xs text-brun focus:outline-none focus:border-champagne"
              />
            </div>

            {/* Checkbox Terms with strict 2h notice */}
            <div className="pt-2 p-3.5 rounded-xl bg-creme border border-beige space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-stone-300 text-brun focus:ring-champagne"
                />
                <span className="text-[11px] text-stone-600 leading-relaxed">
                  J'accepte le{" "}
                  <Link
                    href="/conditions-reservation"
                    target="_blank"
                    className="underline text-brun font-semibold"
                  >
                    règlement intérieur
                  </Link>{" "}
                  : <strong>acompte obligatoire de 10 € sous 2 heures</strong> dès validation manuelle de la coiffeuse (non remboursable), retards tolérés de 20 min maximum, 1 seul accompagnateur sur préavis, cheveux propres et démêlés.
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-beige flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-brun"
            >
              Retour
            </button>
            <button
              disabled={
                !customer.firstName.trim() ||
                !customer.lastName.trim() ||
                !customer.email.trim() ||
                !customer.phone.trim() ||
                !acceptedTerms
              }
              onClick={() => {
                setCurrentStep(5);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="inline-flex items-center space-x-1.5 bg-nude disabled:opacity-40 disabled:cursor-not-allowed hover:bg-nude-dark text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-2xs"
            >
              <span>Vérifier le récapitulatif</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUMMARY & SUBMIT */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige shadow-xs space-y-6">
          <div className="border-b border-beige pb-4">
            <span className="text-[10px] uppercase tracking-wider text-champagne-dark font-bold">
              Étape 5 sur 5
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
              Récapitulatif de la demande
            </h2>
            <p className="text-xs text-stone-500 font-light mt-1">
              Votre demande sera examinée manuellement par la coiffeuse.
            </p>
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Prestation info */}
            <div className="p-4 rounded-xl bg-creme border border-beige space-y-2">
              <span className="font-bold text-brun uppercase tracking-wider block text-[10px]">
                Prestation demandée
              </span>
              <div className="font-serif font-bold text-sm text-brun">
                {selectedService.name}
              </div>
              <div className="text-stone-600">
                Cliente : {customer.firstName} {customer.lastName}
              </div>
              {customer.instagram && (
                <div className="text-stone-600">
                  Instagram : <span className="font-semibold text-brun">{customer.instagram}</span>
                </div>
              )}
              <div className="text-stone-600">
                Catégorie : {selectedService.category}
              </div>
              {Object.keys(selectedOptions).length > 0 && (
                <div className="pt-2 border-t border-beige/60 space-y-1">
                  {Object.entries(selectedOptions).map(([name, choice]) => (
                    <div key={name} className="flex justify-between text-stone-600">
                      <span>{name} :</span>
                      <span className="font-medium text-brun">{choice.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {isStudent && selectedService.includesHair && (
                <div className="pt-2 border-t border-beige/60 flex justify-between text-emerald-700 font-medium">
                  <span>Réduction Étudiante :</span>
                  <span>-5 €</span>
                </div>
              )}
            </div>

            {/* Financial & Time */}
            <div className="p-4 rounded-xl bg-creme border border-beige space-y-2">
              <span className="font-bold text-brun uppercase tracking-wider block text-[10px]">
                Date & Règlements
              </span>
              <div className="text-brun font-medium">
                {formatDateFrench(selectedDate)} à {selectedTime}
              </div>
              <div className="pt-2 border-t border-beige/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-600">Montant total :</span>
                  <span className="font-serif font-bold text-brun text-sm">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-champagne-light border border-champagne/40">
                  <span className="font-medium text-brun">Acompte exigé sous 2h :</span>
                  <span className="font-bold text-champagne-dark">
                    {formatPrice(depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Solde restant le jour J :</span>
                  <span className="font-semibold text-brun">
                    {formatPrice(remainingBalance)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-beige/60 text-[11px] text-stone-500">
                Paiements acceptés sur place : Wero, PayPal, virement ou espèces.
              </div>
            </div>
          </div>

          {/* Notice 2 hours */}
          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Validation manuelle requise :</strong> Aucun prélèvement immédiat. Dès que la coiffeuse approuve votre créneau, vous disposerez d'un délai strict de <strong>2 heures</strong> pour verser l'acompte de 10 € afin de bloquer définitivement votre heure.
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-brun"
            >
              Modifier
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmitBooking}
              className="inline-flex items-center space-x-2 bg-nude hover:bg-nude-dark text-white px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs"
            >
              {submitting ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Envoyer ma demande de rendez-vous</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUCCESS CONFIRMATION */}
      {currentStep === 6 && submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-champagne text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-champagne-light text-champagne-dark flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-champagne-dark">
              Demande transmise
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              Merci {customer.firstName}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm font-light max-w-md mx-auto">
              Votre demande pour {selectedService.name} a été transmise à la coiffeuse pour validation manuelle.
            </p>
          </div>

          {/* Reference box */}
          <div className="bg-creme rounded-2xl p-4 border border-beige max-w-sm mx-auto text-left text-xs space-y-2">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">
              Référence de votre dossier
            </div>
            <div className="text-xl font-mono font-bold text-brun">
              {submissionResult.bookingReference}
            </div>
            <div className="pt-2 border-t border-beige flex justify-between text-stone-600">
              <span>Date souhaitée :</span>
              <span className="font-medium text-brun">
                {submissionResult.date} à {submissionResult.startTime}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Acompte après validation :</span>
              <span className="font-medium text-brun">10 €</span>
            </div>
          </div>

          {/* 2-Hour Rule Alert */}
          <div className="p-4 rounded-xl bg-champagne-light/50 border border-champagne/40 max-w-md mx-auto text-left text-xs text-brun space-y-1">
            <span className="font-bold block">
              Délai strict de 2 heures :
            </span>
            <p className="font-light text-stone-600 leading-relaxed text-[11px]">
              Dès que votre demande sera acceptée par la coiffeuse, vous recevrez un lien pour régler l'acompte de 10 €. Vous disposerez de 2 heures maximum pour finaliser le versement, faute de quoi le créneau sera automatiquement remis en ligne.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/reserver/statut/${submissionResult.bookingReference}`}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-champagne hover:bg-champagne-dark text-brun-dark px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Suivre l'état de ma demande
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-medium text-stone-600 hover:text-brun border border-beige"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
