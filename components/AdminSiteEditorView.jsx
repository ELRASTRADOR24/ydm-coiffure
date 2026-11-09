"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Layout,
  Layers,
  Globe,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  GripVertical,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Film,
  Upload,
  Loader2,
} from "lucide-react";

import { DEFAULT_SALON_SETTINGS } from "@/lib/seedData";
import { uploadMediaClient } from "@/lib/uploadMedia";

const DEFAULT_GALLERY_FALLBACK = DEFAULT_SALON_SETTINGS.galleryItems;

export default function AdminSiteEditorView({ initialSettings = {} }) {
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState("faq"); // "faq" | "gallery" | "footer" | "pages" | "home" | "rules"
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // FAQ
  const [faqList, setFaqList] = useState(
    Array.isArray(settings.faqItems) && settings.faqItems.length > 0
      ? settings.faqItems
      : [
          {
            question: "Comment se déroule la réservation en ligne ?",
            answer:
              "Vous choisissez votre coiffure et vos options en quelques clics. La coiffeuse valide manuellement votre demande selon son planning. Dès validation, vous recevez un lien pour verser l'acompte de 10 € sous 2 heures pour bloquer définitivement le créneau.",
            order: 1,
          },
          {
            question: "Mèches fournies ou mèches apportées : quelle différence ?",
            answer:
              "Pour les coiffures avec mèches incluses, la coiffeuse s'occupe de l'achat des mèches professionnelles et du déplacement (réservation demandée au moins 1 semaine à l'avance). Pour les coiffures sans mèches incluses, vous venez avec vos propres mèches.",
            order: 2,
          },
          {
            question: "Pourquoi un délai strict de 2 heures pour l'acompte de 10 € ?",
            answer:
              "L'acompte de 10 € (non remboursable) confirme votre engagement. Passé ce délai strict de 2 heures, le créneau est automatiquement libéré et remis à disposition d'autres clientes.",
            order: 3,
          },
          {
            question: "Comment fonctionne la réduction étudiante de -5 € ?",
            answer:
              "Une réduction de 5 € est offerte sur toutes les coiffures avec mèches incluses, sur simple présentation d'une carte étudiante en cours de validité le jour du rendez-vous.",
            order: 4,
          },
          {
            question: "Quelles sont les consignes de préparation et d'accueil ?",
            answer:
              "Merci d'arriver les cheveux propres, lavés et soigneusement démêlés des racines aux pointes. Un seul accompagnateur est autorisé lors du rendez-vous sur préavis.",
            order: 5,
          },
        ]
  );

  // Galerie & Portfolio
  const [galleryList, setGalleryList] = useState(
    Array.isArray(settings.galleryItems) && settings.galleryItems.length > 0
      ? settings.galleryItems
      : DEFAULT_GALLERY_FALLBACK
  );
  const [draggedGalleryIndex, setDraggedGalleryIndex] = useState(null);
  const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState(null);
  const [isCompactGallery, setIsCompactGallery] = useState(false);

  // Pages Visibilité
  const [pageVis, setPageVis] = useState(
    settings.pageVisibility || {
      galerie: true,
      aPropos: true,
      contact: true,
      prestations: true,
    }
  );

  // Conditions Footer
  const [footerConds, setFooterConds] = useState(
    Array.isArray(settings.footerConditions) && settings.footerConditions.length > 0
      ? settings.footerConditions
      : [
          "Acompte : 10 € obligatoire sous 2h pour confirmer",
          "Paiements : Wero, PayPal, virement ou espèces",
          "Retard max : 20 min (1h = rdv annulé)",
          "Mèches incluses : prévenir 1 semaine à l'avance",
          "Réduction étudiante : -5 € avec mèches incluses",
        ]
  );

  // Accueil
  const [homeInfo, setHomeInfo] = useState(
    settings.homeContent || {
      heroTitle: "L'art des tresses afro & finitions haute précision",
      heroSubtitle:
        "Knotless Braids, Fulani, Boho, nattes et créations sur-mesure à La Roche-sur-Yon. Atelier chaleureux et gestes experts pour sublimer vos cheveux.",
      studentPromoText:
        "Bénéficiez de -5 € de réduction sur toutes les coiffures avec mèches incluses (sur présentation d'un justificatif étudiant en cours de validité).",
    }
  );

  // Notice Footer
  const [footerNotice, setFooterNotice] = useState(
    settings.footerNoticeText ||
      "Atelier privé de coiffure afro à La Roche-sur-Yon. Rendez-vous sur validation manuelle pour garantir un service sur-mesure d'exception."
  );

  // Règlements
  const [policies, setPolicies] = useState({
    cancellationPolicyText:
      settings.cancellationPolicyText ||
      "Acompte obligatoire de 10 euros non remboursable à régler sous 2 heures après validation de la demande. Modification possible jusqu'à 48 heures avant le rendez-vous. Retards tolérés jusqu'à 20 minutes maximum (au-delà : supplément de 5 à 10 euros, 1h de retard = rendez-vous annulé).",
    depositPolicyText:
      settings.depositPolicyText ||
      "Un acompte de 10 euros est exigé dans les 2 heures suivant la validation de votre demande pour bloquer définitivement le créneau. Passé ce délai, le créneau est automatiquement libéré.",
    preparationGuidelinesText:
      settings.preparationGuidelinesText ||
      "Merci de venir les cheveux propres, lavés et soigneusement démêlés. Un seul accompagnateur est autorisé sur préavis.",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const markChanged = () => setHasUnsavedChanges(true);

  // ==========================================
  // GESTION FAQ
  // ==========================================
  const handleFaqChange = (index, field, value) => {
    const updated = [...faqList];
    updated[index][field] = value;
    setFaqList(updated);
    markChanged();
  };

  const handleAddFaq = () => {
    setFaqList([
      ...faqList,
      {
        question: "Nouvelle question",
        answer: "Écrivez votre réponse ici...",
        order: faqList.length + 1,
      },
    ]);
    markChanged();
  };

  const handleRemoveFaq = (index) => {
    setFaqList(faqList.filter((_, i) => i !== index));
    markChanged();
  };

  const moveFaq = (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= faqList.length) return;
    const updated = [...faqList];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setFaqList(updated);
    markChanged();
  };

  // ==========================================
  // GESTION GALERIE & DISPOSITION DES PHOTOS
  // ==========================================
  const handleGalleryChange = (index, field, value) => {
    const updated = [...galleryList];
    updated[index][field] = value;
    setGalleryList(updated);
    markChanged();
  };

  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryFileInputRef = useRef(null);

  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGallery(true);
    try {
      showToast("Téléversement vers Cloudinary en cours...");
      const res = await uploadMediaClient(file);
      if (res.success) {
        const isVid = res.resourceType === "video" || file.type.startsWith("video/");
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        const newItem = {
          id: Date.now(),
          type: isVid ? "video" : "photo",
          title: cleanName || "Nouvelle réalisation",
          category: "Knotless Braids",
          image: isVid ? res.thumbnailUrl || res.url : res.url,
          videoUrl: isVid ? res.url : "",
          aspect: "tall",
          order: 1,
        };
        const updated = [newItem, ...galleryList].map((it, idx) => ({
          ...it,
          order: idx + 1,
        }));
        setGalleryList(updated);
        markChanged();
        showToast(
          isVid
            ? "Vidéo téléversée sur Cloudinary avec succès !"
            : "Photo téléversée sur Cloudinary avec succès !"
        );
      } else {
        showToast(res.error || "Erreur lors du téléversement du média.");
      }
    } catch (err) {
      showToast("Échec de l'upload vers Cloudinary.");
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleAddGalleryItem = () => {
    const newItem = {
      id: Date.now(),
      type: "photo",
      title: "Nouvelle réalisation",
      category: "Knotless Braids",
      image: "/images/realisations/IMG_3401_still.jpeg",
      aspect: "tall",
      order: galleryList.length + 1,
    };
    setGalleryList([newItem, ...galleryList]);
    markChanged();
  };

  const handleRemoveGalleryItem = (index) => {
    if (!confirm("Voulez-vous retirer cette réalisation de la galerie ?")) return;
    setGalleryList(galleryList.filter((_, i) => i !== index));
    markChanged();
  };

  const moveGalleryItem = (index, direction) => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= galleryList.length) return;
    const updated = [...galleryList];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setGalleryList(updated);
    markChanged();
  };

  // Drag and drop gallery reordering
  const handleDragStartGallery = (e, index) => {
    setDraggedGalleryIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOverGallery = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverGalleryIndex !== index) {
      setDragOverGalleryIndex(index);
    }
  };

  const handleDropGallery = (e, targetIndex) => {
    e.preventDefault();
    if (draggedGalleryIndex === null || draggedGalleryIndex === targetIndex) {
      setDraggedGalleryIndex(null);
      setDragOverGalleryIndex(null);
      return;
    }
    const updated = [...galleryList];
    const [movedItem] = updated.splice(draggedGalleryIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    const reordered = updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setGalleryList(reordered);
    setDraggedGalleryIndex(null);
    setDragOverGalleryIndex(null);
    markChanged();
  };

  const handleDragEndGallery = () => {
    setDraggedGalleryIndex(null);
    setDragOverGalleryIndex(null);
  };

  // ==========================================
  // GESTION FOOTER CONDITIONS
  // ==========================================
  const handleFooterCondChange = (index, value) => {
    const updated = [...footerConds];
    updated[index] = value;
    setFooterConds(updated);
    markChanged();
  };

  const handleAddFooterCond = () => {
    setFooterConds([...footerConds, "Nouvelle condition"]);
    markChanged();
  };

  const handleRemoveFooterCond = (index) => {
    setFooterConds(footerConds.filter((_, i) => i !== index));
    markChanged();
  };

  // ==========================================
  // SAUVEGARDE GLOBALE
  // ==========================================
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        faqItems: faqList,
        galleryItems: galleryList,
        pageVisibility: pageVis,
        footerConditions: footerConds,
        footerNoticeText: footerNotice,
        homeContent: homeInfo,
        cancellationPolicyText: policies.cancellationPolicyText,
        depositPolicyText: policies.depositPolicyText,
        preparationGuidelinesText: policies.preparationGuidelinesText,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setHasUnsavedChanges(false);
        showToast("Toutes vos modifications ont été publiées en direct sur le site !");
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement des modifications.");
      }
    } catch (e) {
      showToast("Erreur de connexion lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Toast de confirmation */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-brun text-creme px-5 py-3.5 rounded-2xl shadow-xl border border-champagne flex items-center space-x-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barre d'action supérieure */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Contrôle Total du Site
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brun mt-0.5">
            Modifier le Contenu du Site
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Modifiez chaque texte, réorganisez les photos de la galerie, ajustez la FAQ et les règlements en toute autonomie.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className={`inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-semibold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 ${
            hasUnsavedChanges
              ? "bg-champagne-dark hover:bg-brun text-white ring-4 ring-champagne/30 scale-[1.02]"
              : "bg-brun hover:bg-brun-dark text-creme"
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Publication..." : "Publier sur le site"}</span>
        </button>
      </div>

      {/* Onglets thématiques */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("faq")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "faq"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-champagne-dark" />
          <span>Questions & FAQ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "gallery"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-champagne-dark" />
          <span>Galerie & Photos ({galleryList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "footer"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <Layout className="w-4 h-4 text-champagne-dark" />
          <span>Pied de page & Conditions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pages")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "pages"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <Layers className="w-4 h-4 text-champagne-dark" />
          <span>Masquer / Afficher Pages</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "home"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <Globe className="w-4 h-4 text-champagne-dark" />
          <span>Titres & Offre Étudiante</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "rules"
              ? "bg-white text-brun font-bold shadow-2xs"
              : "text-stone-600 hover:text-brun"
          }`}
        >
          <FileText className="w-4 h-4 text-champagne-dark" />
          <span>Règlements & Consignes</span>
        </button>
      </div>

      {/* ONGLET 1: FAQ */}
      {activeTab === "faq" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-brun">
                Foire aux Questions & Règlements Intérieurs
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Modifiez les questions, réponses et réorganisez leur ordre avec les flèches haut/bas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center space-x-1.5 bg-creme hover:bg-beige text-brun px-3.5 py-2 rounded-xl text-xs font-semibold border border-beige transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une question</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqList.map((faq, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-champagne/60 transition-colors space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Question #{index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveFaq(index, "up")}
                      className="p-1 rounded-md bg-white border border-stone-200 text-stone-600 hover:text-brun disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === faqList.length - 1}
                      onClick={() => moveFaq(index, "down")}
                      className="p-1 rounded-md bg-white border border-stone-200 text-stone-600 hover:text-brun disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                    title="Supprimer cette question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-brun block mb-1">
                    Titre de la question :
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs sm:text-sm font-semibold text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-brun block mb-1">
                    Réponse affichée aux clientes :
                  </label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs sm:text-sm text-stone-700 font-light leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET 2: GALERIE & DISPOSITION DES PHOTOS */}
      {activeTab === "gallery" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-brun">
                Disposition des Photos & Vidéos du Portfolio
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Glissez-déposez directement les cartes pour réorganiser l'affichage (comme sur Instagram), ou utilisez les flèches haut/bas.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsCompactGallery(!isCompactGallery)}
                className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isCompactGallery
                    ? "bg-champagne text-brun-dark border-champagne-dark shadow-xs ring-2 ring-champagne/40"
                    : "bg-white text-stone-700 border-stone-200 hover:border-champagne hover:bg-stone-50"
                }`}
                title={isCompactGallery ? "Revenir à la vue détaillée" : "Dézoomer pour déplacer facilement les photos"}
              >
                {isCompactGallery ? (
                  <>
                    <ZoomIn className="w-3.5 h-3.5 text-brun" />
                    <span>Vue détaillée</span>
                  </>
                ) : (
                  <>
                    <ZoomOut className="w-3.5 h-3.5 text-champagne-dark" />
                    <span>Dézoomer (Vue d'ensemble)</span>
                  </>
                )}
              </button>

              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleGalleryUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadingGallery}
                onClick={() => galleryFileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs border border-champagne/40 disabled:opacity-50"
                title="Téléverser directement une vidéo ou photo depuis cet appareil"
              >
                {uploadingGallery ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-champagne" />
                    <span>Envoi Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-champagne" />
                    <span>Uploader vidéo / photo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAddGalleryItem}
                className="inline-flex items-center space-x-1.5 bg-champagne hover:bg-champagne-dark text-brun-dark px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une réalisation</span>
              </button>
            </div>
          </div>

          {/* Message d'aide en mode dézoomé pour la galerie */}
          {isCompactGallery && (
            <div className="p-3.5 rounded-2xl bg-champagne-light/50 border border-champagne/50 flex items-center justify-between text-xs text-brun animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-champagne-dark shrink-0" />
                <span className="font-medium">
                  Mode dézoomé actif : l'ensemble des {galleryList.length} réalisations est visible d'un coup d'œil. Glissez-déposez n'importe quelle photo ou vidéo pour réordonner la galerie en 1 seconde.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCompactGallery(false)}
                className="text-[11px] font-bold text-brun underline hover:text-champagne-dark shrink-0 ml-3"
              >
                Retour vue détaillée
              </button>
            </div>
          )}

          {isCompactGallery ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {galleryList.map((item, index) => (
                <div
                  key={item.id || index}
                  draggable
                  onDragStart={(e) => handleDragStartGallery(e, index)}
                  onDragOver={(e) => handleDragOverGallery(e, index)}
                  onDrop={(e) => handleDropGallery(e, index)}
                  onDragEnd={handleDragEndGallery}
                  className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border cursor-grab active:cursor-grabbing transition-all duration-200 select-none shadow-xs bg-stone-900 ${
                    draggedGalleryIndex === index
                      ? "opacity-30 scale-90 border-dashed border-champagne shadow-inner"
                      : dragOverGalleryIndex === index && draggedGalleryIndex !== index
                      ? "ring-4 ring-champagne border-champagne scale-105 shadow-2xl z-20"
                      : "border-stone-200 hover:border-champagne hover:scale-[1.02] hover:shadow-md"
                  }`}
                  title={`${item.title || "Réalisation"} (#${index + 1}) - Glisser pour réorganiser`}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "Réalisation"}
                      fill
                      className="object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Badge numéro */}
                  <div className="absolute top-2 left-2 z-10 flex items-center space-x-1 bg-brun/90 backdrop-blur-md text-creme text-[10px] font-bold px-2 py-0.5 rounded-full border border-champagne/40 shadow-xs">
                    <GripVertical className="w-3 h-3 text-champagne" />
                    <span>#{index + 1}</span>
                  </div>

                  {/* Badge vidéo */}
                  {item.type === "video" && (
                    <div className="absolute top-2 right-2 z-10 bg-black/75 rounded p-1 text-white border border-white/10">
                      <Film className="w-3 h-3 text-champagne" />
                    </div>
                  )}

                  {/* Titre & catégorie */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <span className="text-[9px] uppercase tracking-wider text-stone-300 block truncate">
                      {item.category}
                    </span>
                    <h4 className="font-serif font-bold text-xs leading-tight line-clamp-1 drop-shadow-sm">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (

          <div className="space-y-4">
            {galleryList.map((item, index) => (
              <div
                key={item.id || index}
                draggable
                onDragStart={(e) => handleDragStartGallery(e, index)}
                onDragOver={(e) => handleDragOverGallery(e, index)}
                onDrop={(e) => handleDropGallery(e, index)}
                onDragEnd={handleDragEndGallery}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-4 ${
                  draggedGalleryIndex === index
                    ? "opacity-40 scale-[0.98] border-dashed border-champagne shadow-inner"
                    : dragOverGalleryIndex === index && draggedGalleryIndex !== index
                    ? "border-champagne-dark ring-2 ring-champagne/40 bg-champagne/10 scale-[1.01]"
                    : "bg-stone-50 border-stone-200 hover:border-champagne/60 hover:shadow-2xs"
                }`}
              >
                {/* Poignée de glisser-déposer */}
                <div
                  className="hidden md:flex items-center justify-center cursor-grab active:cursor-grabbing text-stone-400 hover:text-brun p-1"
                  title="Glisser pour réorganiser"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Miniature visuelle */}
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || "Réalisation"}
                      fill
                      className="object-cover object-center pointer-events-none"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  {item.type === "video" && (
                    <div className="absolute bottom-1 right-1 bg-black/70 rounded p-1 text-white">
                      <Film className="w-3 h-3 text-champagne" />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </span>
                </div>

                {/* Champs modifiables */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  <div>
                    <label className="font-semibold text-brun block mb-0.5">
                      Titre de la réalisation :
                    </label>
                    <input
                      type="text"
                      value={item.title || ""}
                      onChange={(e) => handleGalleryChange(index, "title", e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 font-medium text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="font-semibold text-brun block mb-0.5">
                        Format :
                      </label>
                      <select
                        value={item.type || "photo"}
                        onChange={(e) => handleGalleryChange(index, "type", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-champagne"
                      >
                        <option value="photo">Photo</option>
                        <option value="video">Vidéo</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-brun block mb-0.5">
                        Catégorie :
                      </label>
                      <input
                        type="text"
                        value={item.category || ""}
                        onChange={(e) => handleGalleryChange(index, "category", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-champagne"
                        placeholder="Ex: Knotless Braids, Fulani..."
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-brun block mb-0.5">
                        Image / Miniature :
                      </label>
                      <input
                        type="text"
                        value={item.image || ""}
                        onChange={(e) => handleGalleryChange(index, "image", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-champagne font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {item.type === "video" && (
                    <div>
                      <label className="font-semibold text-brun block mb-0.5 flex items-center space-x-1">
                        <Film className="w-3 h-3 text-champagne-dark" />
                        <span>Lien vidéo (Cloudinary / MP4) :</span>
                      </label>
                      <input
                        type="text"
                        value={item.videoUrl || ""}
                        onChange={(e) => handleGalleryChange(index, "videoUrl", e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl p-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-champagne font-mono text-[11px]"
                        placeholder="https://res.cloudinary.com/.../video.mp4"
                      />
                    </div>
                  )}
                </div>

                {/* Actions de réorganisation (Monter / Descendre / Supprimer) */}
                <div className="flex md:flex-col items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveGalleryItem(index, "up")}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 disabled:opacity-30 transition-colors"
                    title="Déplacer vers le haut dans la galerie"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === galleryList.length - 1}
                    onClick={() => moveGalleryItem(index, "down")}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 disabled:opacity-30 transition-colors"
                    title="Déplacer vers le bas dans la galerie"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryItem(index)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ONGLET 3: FOOTER & CONDITIONS */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-brun">
              Pied de Page & Conditions Clés
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Ces éléments apparaissent tout en bas de chaque page du site.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brun block">
              Texte de présentation sous le logo (Pied de page) :
            </label>
            <textarea
              rows={2}
              value={footerNotice}
              onChange={(e) => {
                setFooterNotice(e.target.value);
                markChanged();
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-brun">
                Liste des Conditions Clés (Puces) :
              </label>
              <button
                type="button"
                onClick={handleAddFooterCond}
                className="text-xs text-champagne-dark hover:text-brun font-semibold inline-flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="space-y-2">
              {footerConds.map((cond, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={cond}
                    onChange={(e) => handleFooterCondChange(idx, e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFooterCond(idx)}
                    className="text-stone-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 4: MASQUER / AFFICHER PAGES */}
      {activeTab === "pages" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-brun">
              Visibilité des Pages Publiques
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Activez ou masquez les pages en 1 clic. Une page masquée disparaît automatiquement du menu de navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "galerie", label: "Galerie de Réalisations", desc: "Page et aperçu du portfolio de coiffures" },
              { key: "prestations", label: "Prestations & Tarifs", desc: "Catalogue officiel des prestations et options" },
              { key: "aPropos", label: "À propos de la coiffeuse", desc: "Présentation de Maydie et son parcours" },
              { key: "contact", label: "Conditions & Contact", desc: "Page de contact et consignes de salon" },
            ].map(({ key, label, desc }) => {
              const isVisible = pageVis[key] !== false;
              return (
                <div
                  key={key}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-sm text-brun block">
                      {label}
                    </span>
                    <span className="text-xs text-stone-500 font-light block">
                      {desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPageVis({ ...pageVis, [key]: !isVisible });
                      markChanged();
                    }}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isVisible
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-stone-200 text-stone-600 border border-stone-300"
                    }`}
                  >
                    {isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                        <span>Masquée</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ONGLET 5: TITRES & ACCUEIL */}
      {activeTab === "home" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-brun">
              Textes Clés de la Page d'Accueil
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Ces accroches apparaissent sur la bannière principale dès l'ouverture du site.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-brun block mb-1">
                Grand titre d'accueil (Hero) :
              </label>
              <input
                type="text"
                value={homeInfo.heroTitle || ""}
                onChange={(e) => {
                  setHomeInfo({ ...homeInfo, heroTitle: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs sm:text-sm font-semibold text-brun leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Sous-titre d'accroche :
              </label>
              <textarea
                rows={2}
                value={homeInfo.heroSubtitle || ""}
                onChange={(e) => {
                  setHomeInfo({ ...homeInfo, heroSubtitle: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Texte du bandeau de réduction étudiante (-5 €) :
              </label>
              <textarea
                rows={2}
                value={homeInfo.studentPromoText || ""}
                onChange={(e) => {
                  setHomeInfo({ ...homeInfo, studentPromoText: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 6: RÈGLEMENTS */}
      {activeTab === "rules" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-brun">
              Politiques et Consignes de Réservation
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Ces textes apparaissent dans les conditions générales et dans le récapitulatif de réservation.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-brun block mb-1">
                Politique d'acompte (Délai 2h & 10 €) :
              </label>
              <textarea
                rows={3}
                value={policies.depositPolicyText}
                onChange={(e) => {
                  setPolicies({ ...policies, depositPolicyText: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Politique d'annulation & de retards (20 min max) :
              </label>
              <textarea
                rows={3}
                value={policies.cancellationPolicyText}
                onChange={(e) => {
                  setPolicies({ ...policies, cancellationPolicyText: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>

            <div>
              <label className="font-semibold text-brun block mb-1">
                Consignes de préparation (Cheveux propres et démêlés) :
              </label>
              <textarea
                rows={2}
                value={policies.preparationGuidelinesText}
                onChange={(e) => {
                  setPolicies({ ...policies, preparationGuidelinesText: e.target.value });
                  markChanged();
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
