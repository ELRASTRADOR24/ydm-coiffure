"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Mail,
  Palette,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Upload,
  Loader2,
  Send,
  Smartphone,
  Monitor,
  Box,
  Square,
  Type,
  Minus,
  ExternalLink,
  CheckCircle2,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  DEFAULT_EMAIL_LOGO_URL,
  DEFAULT_EMAIL_SETTINGS,
  EMAIL_FONT_CHOICES,
  EMAIL_STYLE_PRESETS,
  EMAIL_TEMPLATE_META,
  EMAIL_VARIABLES,
  buildSamplePreviewVariables,
  renderEmailFromTemplate,
} from "@/lib/emailTemplates";
import { cloneValue } from "@/lib/siteContent";
import { uploadMediaClient } from "@/lib/uploadMedia";
import RichDocsEditor from "./RichDocsEditor";
import { ToggleVisibilityButton } from "./CmsControls";

function ColorControl({ label, value, onChange, fallback = "#FFFFFF" }) {
  const displayColor =
    value && /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : fallback;
  return (
    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
      <label className="text-xs font-bold text-brun block">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={displayColor.length === 4 ? fallback : displayColor}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-11 rounded-xl border border-stone-300 cursor-pointer shrink-0 bg-white p-0.5"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          className="w-full min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base lg:text-xs font-mono text-brun"
        />
      </div>
    </div>
  );
}

const BUTTON_LINK_OPTIONS = [
  { label: "Lien paiement acompte ({lien_paiement})", value: "{lien_paiement}" },
  { label: "Page suivi client ({lien_suivi})", value: "{lien_suivi}" },
  { label: "Page réservation ({lien_reservation})", value: "{lien_reservation}" },
  { label: "Espace Admin ({lien_admin})", value: "{lien_admin}" },
  { label: "Lien Instagram YDM", value: "https://instagram.com/ydm_coiffure" },
];

export default function EmailEditorTab({
  emailSettings,
  salonSettings = {},
  onChangeEmailSettings,
  onResetEmails,
  onToast,
}) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("approved");
  const [subPanel, setSubPanel] = useState("content"); // "content" | "style" | "headerFooter"
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [openFrameStyleIdx, setOpenFrameStyleIdx] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBlockIdx, setUploadingBlockIdx] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState(
    salonSettings?.email || ""
  );
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (!testEmailAddress && salonSettings?.email) {
      setTestEmailAddress(salonSettings.email);
    }
  }, [salonSettings?.email, testEmailAddress]);

  useEffect(() => {
    if (!showPreviewModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPreviewModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreviewModal]);

  const logoFileRef = useRef(null);

  const design = emailSettings?.design || DEFAULT_EMAIL_SETTINGS.design;
  const header = emailSettings?.header || DEFAULT_EMAIL_SETTINGS.header;
  const footer = emailSettings?.footer || DEFAULT_EMAIL_SETTINGS.footer;
  const activeTemplate =
    emailSettings?.templates?.[selectedTemplateKey] ||
    DEFAULT_EMAIL_SETTINGS.templates.approved;
  const activeMeta =
    EMAIL_TEMPLATE_META.find((m) => m.key === selectedTemplateKey) ||
    EMAIL_TEMPLATE_META[0];

  const updateDesign = (patch) => {
    onChangeEmailSettings({
      ...emailSettings,
      design: { ...design, ...patch },
    });
  };

  const updateHeader = (patch) => {
    onChangeEmailSettings({
      ...emailSettings,
      header: { ...header, ...patch },
    });
  };

  const updateFooter = (patch) => {
    onChangeEmailSettings({
      ...emailSettings,
      footer: { ...footer, ...patch },
    });
  };

  const updateActiveTemplate = (patch) => {
    onChangeEmailSettings({
      ...emailSettings,
      templates: {
        ...(emailSettings?.templates || {}),
        [selectedTemplateKey]: { ...activeTemplate, ...patch },
      },
    });
  };

  const updateBlock = (idx, patch) => {
    const blocks = [...(activeTemplate.blocks || [])];
    blocks[idx] = { ...blocks[idx], ...patch };
    updateActiveTemplate({ blocks });
  };

  const removeBlock = (idx) => {
    const blocks = (activeTemplate.blocks || []).filter((_, i) => i !== idx);
    updateActiveTemplate({ blocks });
  };

  const moveBlock = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    const blocks = [...(activeTemplate.blocks || [])];
    if (target < 0 || target >= blocks.length) return;
    const tmp = blocks[idx];
    blocks[idx] = blocks[target];
    blocks[target] = tmp;
    updateActiveTemplate({ blocks });
  };

  const addBlock = (kind) => {
    const uid = `blk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const blocks = [...(activeTemplate.blocks || [])];

    if (kind === "richtext") {
      blocks.push({
        id: uid,
        type: "richtext",
        visible: true,
        boxed: false,
        html: '<p style="margin:0;font-size:13px;line-height:1.6;">Nouveau paragraphe libre. Utilisez la barre de mise en forme ci-dessus pour ajuster le texte ou insérer des variables.</p>',
      });
    } else if (kind === "boxedText") {
      blocks.push({
        id: uid,
        type: "richtext",
        visible: true,
        boxed: true,
        html: '<p style="margin:0;font-size:13px;line-height:1.6;text-align:center;"><strong>Information importante :</strong> Écrivez ici dans un joli cadre personnalisable.</p>',
      });
    } else if (kind === "summaryCard") {
      blocks.push({
        id: uid,
        type: "summaryCard",
        visible: true,
        boxed: true,
        rows: [
          { id: `r_${uid}_1`, label: "Coiffure", value: "{coiffure}", visible: true, highlight: false },
          { id: `r_${uid}_2`, label: "Date & Heure", value: "{date} à {heure}", visible: true, highlight: false },
          { id: `r_${uid}_3`, label: "Tarif", value: "{prix}", visible: true, highlight: true },
        ],
        showFooterNote: false,
        footerNoteHtml: "",
      });
    } else if (kind === "button") {
      blocks.push({
        id: uid,
        type: "button",
        visible: true,
        text: "Voir mon rendez-vous",
        urlToken: "{lien_suivi}",
        align: "center",
        bgColor: "",
        textColor: "",
        borderRadius: null,
        uppercase: true,
      });
    } else if (kind === "image") {
      blocks.push({
        id: uid,
        type: "image",
        visible: true,
        url: DEFAULT_EMAIL_LOGO_URL,
        alt: "Visuel YDM Coiffure",
        widthPercent: 70,
        align: "center",
        borderRadius: 12,
        boxed: false,
      });
    } else if (kind === "divider") {
      blocks.push({
        id: uid,
        type: "divider",
        visible: true,
        color: design.cardBorderColor || "#ECE7E1",
        thickness: 1,
        widthPercent: 100,
      });
    } else if (kind === "addressCard") {
      blocks.push({
        id: uid,
        type: "addressCard",
        visible: true,
        boxed: true,
        eyebrow: "Adresse de la prestation",
        html: '<div style="font-family:Georgia,serif;font-size:16px;font-weight:bold;margin-bottom:4px;text-align:center;">{adresse_rue}</div><div style="font-size:13px;margin-bottom:8px;text-align:center;">{adresse_cp_ville}</div><div style="font-size:11px;font-style:italic;text-align:center;">{adresse_acces}</div>',
      });
    }

    updateActiveTemplate({ blocks });
  };

  const applyPreset = (preset) => {
    const nextTemplates = cloneValue(emailSettings?.templates || DEFAULT_EMAIL_SETTINGS.templates);
    if (preset.applyBoxMode === false) {
      const currentTpl = nextTemplates[selectedTemplateKey];
      if (currentTpl?.blocks) {
        currentTpl.blocks = currentTpl.blocks.map((b) => ({
          ...b,
          boxed: false,
          boxBorderEnabled: false,
        }));
      }
    }
    onChangeEmailSettings({
      ...emailSettings,
      design: { ...design, ...preset.design },
      templates: nextTemplates,
    });
    onToast?.(`Style « ${preset.label} » appliqué à la carte mail !`);
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      onToast?.("Envoi du logo vers Cloudinary...");
      const res = await uploadMediaClient(file);
      if (res.success && res.url) {
        updateHeader({ logoUrl: res.url, showLogo: true });
        onToast?.("Logo mis à jour dans l'en-tête des e-mails !");
      } else {
        onToast?.(res.error || "Erreur lors de l'envoi du logo.");
      }
    } catch (_) {
      onToast?.("Échec de l'envoi du logo.");
    } finally {
      setUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  };

  const handleUploadBlockImage = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBlockIdx(idx);
    try {
      onToast?.("Envoi de l'image vers Cloudinary...");
      const res = await uploadMediaClient(file);
      if (res.success && res.url) {
        updateBlock(idx, { url: res.url });
        onToast?.("Image ajoutée à la carte mail !");
      } else {
        onToast?.(res.error || "Erreur lors de l'envoi.");
      }
    } catch (_) {
      onToast?.("Échec de l'envoi de l'image.");
    } finally {
      setUploadingBlockIdx(null);
      if (e.target) e.target.value = "";
    }
  };

  const handleResetActiveTemplateOnly = () => {
    if (
      !confirm(
        `Rétablir le modèle « ${activeMeta.shortLabel} » à son texte d'origine ?`
      )
    ) {
      return;
    }
    updateActiveTemplate(
      cloneValue(DEFAULT_EMAIL_SETTINGS.templates[selectedTemplateKey])
    );
    onToast?.("Modèle rétabli (pensez à cliquer sur Enregistrer).");
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateKey: selectedTemplateKey,
          recipientEmail: testEmailAddress,
          emailSettings,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.simulated) {
          onToast?.(
            `Mode simulation local (pas de clé Resend configurée ici) : e-mail « ${data.subject} » généré pour ${data.recipient}.`
          );
        } else {
          onToast?.(`E-mail de test envoyé réellement à ${data.recipient} !`);
        }
      } else {
        onToast?.(data.error || "Erreur lors de l'envoi de l'e-mail test.");
      }
    } catch (_) {
      onToast?.("Erreur réseau lors de l'envoi test.");
    } finally {
      setSendingTest(false);
    }
  };

  const previewRendered = useMemo(() => {
    const vars = buildSamplePreviewVariables(salonSettings);
    return renderEmailFromTemplate({
      templateKey: selectedTemplateKey,
      emailSettings,
      variables: vars,
    });
  }, [selectedTemplateKey, emailSettings, salonSettings]);

  const blockTypeLabel = (type) => {
    switch (type) {
      case "richtext":
        return "Texte mis en forme";
      case "summaryCard":
        return "Fiche Détails / Récapitulatif";
      case "addressCard":
        return "Carte Adresse Confidentielle";
      case "reasonCard":
        return "Encadré Précision / Motif";
      case "button":
        return "Bouton Cliquable";
      case "image":
        return "Image / Visuel";
      case "divider":
        return "Ligne Séparatrice";
      default:
        return "Bloc";
    }
  };

  return (
    <div className="space-y-6">
      {/* BANDEAU DE SÉLECTION DU MODÈLE + PRESETS RAPIDES */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-champagne-dark" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brun">
                Studio Carte Mail &amp; Modèles Gmail
              </h2>
            </div>
            <p className="text-sm text-stone-600 mt-1">
              Personnalisez chaque e-mail envoyé aux clientes : polices, couleurs, logo, cadres et textes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="xl:hidden min-h-[44px] inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-champagne hover:bg-champagne-light text-brun-dark border border-champagne-dark text-xs sm:text-sm font-bold cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>Aperçu Gmail en direct</span>
            </button>
            <button
              type="button"
              onClick={handleResetActiveTemplateOnly}
              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rétablir ce modèle</span>
            </button>
            {onResetEmails && (
              <button
                type="button"
                onClick={onResetEmails}
                className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tout réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Sélecteur des 6 e-mails */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
            1. Choisissez l&apos;e-mail à modifier :
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
            {EMAIL_TEMPLATE_META.map((meta) => {
              const active = selectedTemplateKey === meta.key;
              return (
                <button
                  key={meta.key}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateKey(meta.key);
                    setOpenFrameStyleIdx(null);
                  }}
                  className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border text-left transition-all cursor-pointer ${
                    active
                      ? "bg-brun text-creme border-brun shadow-sm"
                      : "bg-stone-50 text-brun border-stone-200 hover:bg-champagne-light/40 hover:border-champagne"
                  }`}
                >
                  {meta.shortLabel}
                </button>
              );
            })}
          </div>
          <p className="text-xs sm:text-sm text-stone-600">{activeMeta.description}</p>
        </div>

        {/* Styles rapides en 1 clic */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-brun">
            <Palette className="w-4 h-4 text-champagne-dark shrink-0" />
            <span>Thèmes rapides (couleurs &amp; cadres en 1 clic) :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EMAIL_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                title={preset.description}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-champagne-light border border-stone-300 text-xs font-semibold text-brun transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation interne Studio + Test Email */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubPanel("content")}
              className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border cursor-pointer transition-all ${
                subPanel === "content"
                  ? "bg-champagne text-brun-dark border-champagne-dark shadow-2xs"
                  : "bg-white text-brun border-stone-300 hover:bg-stone-50"
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Contenu &amp; Blocs</span>
            </button>

            <button
              type="button"
              onClick={() => setSubPanel("style")}
              className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border cursor-pointer transition-all ${
                subPanel === "style"
                  ? "bg-champagne text-brun-dark border-champagne-dark shadow-2xs"
                  : "bg-white text-brun border-stone-300 hover:bg-stone-50"
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Couleurs, Police &amp; Cadres</span>
            </button>

            <button
              type="button"
              onClick={() => setSubPanel("headerFooter")}
              className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold border cursor-pointer transition-all ${
                subPanel === "headerFooter"
                  ? "bg-champagne text-brun-dark border-champagne-dark shadow-2xs"
                  : "bg-white text-brun border-stone-300 hover:bg-stone-50"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Logo, En-tête &amp; Pied de carte</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Adresse pour tester (optionnel)"
              className="flex-1 sm:flex-none min-w-[200px] min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-base lg:text-sm text-brun sm:w-56"
            />
            <button
              type="button"
              disabled={sendingTest}
              onClick={handleSendTestEmail}
              className="min-h-[44px] inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {sendingTest ? (
                <Loader2 className="w-4 h-4 animate-spin text-champagne" />
              ) : (
                <Send className="w-4 h-4 text-champagne" />
              )}
              <span>Envoyer un test</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORPS SPLIT : ÉDITEUR À GAUCHE + APERÇU GMAIL EN DIRECT À DROITE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE : CONTRÔLES ET ÉDITEUR DE CONTENU (7 colonnes) */}
        <div className="xl:col-span-7 space-y-6">
          {/* ========================================================== */}
          {/* SOUS-ONGLET 1 : CONTENU & BLOCS                            */}
          {/* ========================================================== */}
          {subPanel === "content" && (
            <div className="space-y-5">
              {/* Objet & Preheader */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-4 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-brun">
                  En-tête du message dans Gmail
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-brun block mb-1">
                      Objet de l&apos;e-mail
                    </label>
                    <input
                      type="text"
                      value={activeTemplate.subject || ""}
                      onChange={(e) =>
                        updateActiveTemplate({ subject: e.target.value })
                      }
                      className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-brun block mb-1">
                      Ligne d&apos;aperçu (affichée dans la boîte de réception avant ouverture)
                    </label>
                    <input
                      type="text"
                      value={activeTemplate.preheader || ""}
                      onChange={(e) =>
                        updateActiveTemplate({ preheader: e.target.value })
                      }
                      className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun"
                    />
                  </div>
                </div>
              </div>

              {/* Blocs modulaires de la carte */}
              <div className="space-y-4">
                {(activeTemplate.blocks || []).map((block, bIdx) => {
                  const isShown = block.visible !== false;
                  const canToggleFrame =
                    block.type === "richtext" ||
                    block.type === "summaryCard" ||
                    block.type === "addressCard" ||
                    block.type === "reasonCard" ||
                    block.type === "image";

                  return (
                    <div
                      key={block.id || bIdx}
                      className={`rounded-2xl border-2 p-4 sm:p-5 space-y-4 transition-colors shadow-2xs ${
                        isShown
                          ? "bg-white border-stone-200"
                          : "bg-stone-100 border-stone-300 opacity-75"
                      }`}
                    >
                      {/* Barre de contrôle du bloc */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-200">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-xs font-bold text-brun">
                            #{bIdx + 1} • {blockTypeLabel(block.type)}
                          </span>

                          <button
                            type="button"
                            disabled={bIdx === 0}
                            onClick={() => moveBlock(bIdx, "up")}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-brun disabled:opacity-30 cursor-pointer"
                            title="Monter ce bloc"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={bIdx === (activeTemplate.blocks?.length || 1) - 1}
                            onClick={() => moveBlock(bIdx, "down")}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-brun disabled:opacity-30 cursor-pointer"
                            title="Descendre ce bloc"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {canToggleFrame && (
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(bIdx, {
                                  boxed: block.boxed === false,
                                })
                              }
                              className={`min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                                block.boxed !== false
                                  ? "bg-champagne-light/80 text-brun border-champagne-dark"
                                  : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                              }`}
                              title="Ajouter ou enlever le cadre autour de ce bloc"
                            >
                              <Square className="w-3.5 h-3.5" />
                              <span>
                                {block.boxed !== false ? "Avec cadre" : "Sans cadre"}
                              </span>
                            </button>
                          )}

                          <ToggleVisibilityButton
                            visible={isShown}
                            visibleLabel="Affiché"
                            hiddenLabel="Masqué"
                            onToggle={() => updateBlock(bIdx, { visible: !isShown })}
                          />

                          <button
                            type="button"
                            onClick={() => removeBlock(bIdx)}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold cursor-pointer"
                            title="Supprimer ce bloc"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Personnalisation optionnelle du cadre de ce bloc */}
                      {canToggleFrame && block.boxed !== false && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFrameStyleIdx((prev) =>
                                prev === bIdx ? null : bIdx
                              )
                            }
                            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brun hover:text-champagne-dark underline cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>
                              {openFrameStyleIdx === bIdx
                                ? "Masquer le style du cadre"
                                : "Style du cadre (optionnel)"}
                            </span>
                          </button>

                          {openFrameStyleIdx === bIdx && (
                            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <ColorControl
                                label="Fond du cadre (bloc)"
                                value={block.boxBgColor || ""}
                                onChange={(val) => updateBlock(bIdx, { boxBgColor: val })}
                                fallback={design.boxBgColor || "#FAF8F5"}
                              />
                              <ColorControl
                                label="Bordure du cadre"
                                value={block.boxBorderColor || ""}
                                onChange={(val) => updateBlock(bIdx, { boxBorderColor: val })}
                                fallback={design.boxBorderColor || "#ECE7E1"}
                              />
                              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                                <label className="text-xs font-bold text-brun flex items-center justify-between">
                                  <span>Arrondi cadre</span>
                                  <span>{block.boxBorderRadius ?? design.boxBorderRadius ?? 12} px</span>
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="28"
                                  value={block.boxBorderRadius ?? design.boxBorderRadius ?? 12}
                                  onChange={(e) =>
                                    updateBlock(bIdx, {
                                      boxBorderRadius: Number(e.target.value),
                                    })
                                  }
                                  className="w-full accent-brun cursor-pointer"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contenu selon type de bloc */}
                      {(block.type === "richtext" ||
                        block.type === "addressCard" ||
                        block.type === "reasonCard") && (
                        <div className="space-y-3">
                          {block.type === "addressCard" && (
                            <div>
                              <label className="text-xs font-bold text-brun block mb-1">
                                Petit titre du cadre Adresse
                              </label>
                              <input
                                type="text"
                                value={block.eyebrow || ""}
                                onChange={(e) =>
                                  updateBlock(bIdx, { eyebrow: e.target.value })
                                }
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-brun"
                              />
                            </div>
                          )}

                          {block.type === "reasonCard" && (
                            <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-stone-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={block.onlyIfReason !== false}
                                onChange={(e) =>
                                  updateBlock(bIdx, { onlyIfReason: e.target.checked })
                                }
                                className="w-4 h-4 accent-brun rounded"
                              />
                              <span>
                                Afficher uniquement si vous saisissez un motif lors du refus
                              </span>
                            </label>
                          )}

                          <RichDocsEditor
                            editorKey={`${selectedTemplateKey}_${block.id || bIdx}`}
                            value={block.html || ""}
                            onChange={(nextHtml) =>
                              updateBlock(bIdx, { html: nextHtml })
                            }
                            variables={EMAIL_VARIABLES}
                            cardBgColor={
                              block.boxed !== false
                                ? block.boxBgColor || design.boxBgColor || "#FAF8F5"
                                : design.cardBgColor || "#FFFFFF"
                            }
                            defaultTextColor={design.textColor || "#1A1A1A"}
                            defaultFontFamily={design.fontFamily}
                            onToast={onToast}
                          />
                        </div>
                      )}

                      {block.type === "summaryCard" && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-brun">
                              Lignes de la fiche récapitulative :
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(bIdx, {
                                  rows: [
                                    ...(block.rows || []),
                                    {
                                      id: `row_${Date.now()}`,
                                      label: "Nouveau libellé",
                                      value: "{coiffure}",
                                      visible: true,
                                      highlight: false,
                                    },
                                  ],
                                })
                              }
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brun text-creme text-xs font-bold cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-champagne" />
                              <span>Ajouter une ligne</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(block.rows || []).map((row, rIdx) => (
                              <div
                                key={row.id || rIdx}
                                className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center ${
                                  row.visible !== false
                                    ? "bg-stone-50 border-stone-200"
                                    : "bg-stone-100 border-stone-300 opacity-60"
                                }`}
                              >
                                <div className="sm:col-span-4">
                                  <input
                                    type="text"
                                    value={row.label || ""}
                                    onChange={(e) => {
                                      const rows = [...(block.rows || [])];
                                      rows[rIdx] = { ...row, label: e.target.value };
                                      updateBlock(bIdx, { rows });
                                    }}
                                    placeholder="Libellé (ex: Coiffure)"
                                    className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                                  />
                                </div>
                                <div className="sm:col-span-5">
                                  <input
                                    type="text"
                                    value={row.value || ""}
                                    onChange={(e) => {
                                      const rows = [...(block.rows || [])];
                                      rows[rIdx] = { ...row, value: e.target.value };
                                      updateBlock(bIdx, { rows });
                                    }}
                                    placeholder="Valeur (ex: {coiffure})"
                                    className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 py-2 text-base lg:text-sm text-brun"
                                  />
                                </div>
                                <div className="sm:col-span-3 flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rows = [...(block.rows || [])];
                                      rows[rIdx] = { ...row, highlight: !row.highlight };
                                      updateBlock(bIdx, { rows });
                                    }}
                                    title="Mettre en valeur"
                                    className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                      row.highlight
                                        ? "bg-champagne text-brun-dark border-champagne-dark"
                                        : "bg-white text-stone-600 border-stone-300"
                                    }`}
                                  >
                                    Accent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rows = [...(block.rows || [])];
                                      rows[rIdx] = {
                                        ...row,
                                        visible: row.visible === false,
                                      };
                                      updateBlock(bIdx, { rows });
                                    }}
                                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white border border-stone-300 text-brun cursor-pointer"
                                    title="Afficher / Masquer cette ligne"
                                  >
                                    {row.visible !== false ? (
                                      <Eye className="w-4 h-4 text-emerald-700" />
                                    ) : (
                                      <EyeOff className="w-4 h-4 text-stone-500" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const rows = (block.rows || []).filter(
                                        (_, i) => i !== rIdx
                                      );
                                      updateBlock(bIdx, { rows });
                                    }}
                                    className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-700 cursor-pointer"
                                    title="Supprimer cette ligne"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                            <label className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-brun cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(block.showFooterNote)}
                                onChange={(e) =>
                                  updateBlock(bIdx, { showFooterNote: e.target.checked })
                                }
                                className="w-4 h-4 accent-brun rounded"
                              />
                              <span>Afficher une note en bas du cadre récapitulatif</span>
                            </label>
                            {block.showFooterNote && (
                              <input
                                type="text"
                                value={block.footerNoteHtml || ""}
                                onChange={(e) =>
                                  updateBlock(bIdx, { footerNoteHtml: e.target.value })
                                }
                                placeholder="Ex: Délai strict de {delai_heures}h..."
                                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-brun"
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {block.type === "button" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-brun block mb-1">
                                Texte du bouton
                              </label>
                              <input
                                type="text"
                                value={block.text || ""}
                                onChange={(e) =>
                                  updateBlock(bIdx, { text: e.target.value })
                                }
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-brun"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brun block mb-1">
                                Destination du clic (lien ou variable)
                              </label>
                              <select
                                value={
                                  BUTTON_LINK_OPTIONS.some(
                                    (o) => o.value === block.urlToken
                                  )
                                    ? block.urlToken
                                    : "__custom__"
                                }
                                onChange={(e) => {
                                  if (e.target.value !== "__custom__") {
                                    updateBlock(bIdx, { urlToken: e.target.value });
                                  }
                                }}
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-brun"
                              >
                                {BUTTON_LINK_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                                <option value="__custom__">Lien URL libre...</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-bold text-brun block mb-1">
                                URL / Jeton exact
                              </label>
                              <input
                                type="text"
                                value={block.urlToken || ""}
                                onChange={(e) =>
                                  updateBlock(bIdx, { urlToken: e.target.value })
                                }
                                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-brun"
                              />
                            </div>
                            <ColorControl
                              label="Couleur bouton (optionnel)"
                              value={block.bgColor || ""}
                              onChange={(val) => updateBlock(bIdx, { bgColor: val })}
                              fallback={design.buttonBgColor || "#1A1A1A"}
                            />
                            <ColorControl
                              label="Texte bouton (optionnel)"
                              value={block.textColor || ""}
                              onChange={(val) => updateBlock(bIdx, { textColor: val })}
                              fallback={design.buttonTextColor || "#FFFFFF"}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-brun">Position :</span>
                              {["left", "center", "right"].map((al) => (
                                <button
                                  key={al}
                                  type="button"
                                  onClick={() => updateBlock(bIdx, { align: al })}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                                    (block.align || "center") === al
                                      ? "bg-brun text-creme border-brun"
                                      : "bg-white text-brun border-stone-300"
                                  }`}
                                >
                                  {al === "left"
                                    ? "Gauche"
                                    : al === "center"
                                    ? "Centre"
                                    : "Droite"}
                                </button>
                              ))}
                            </div>

                            <label className="flex items-center space-x-2 text-xs font-bold text-brun cursor-pointer">
                              <input
                                type="checkbox"
                                checked={block.uppercase !== false}
                                onChange={(e) =>
                                  updateBlock(bIdx, { uppercase: e.target.checked })
                                }
                                className="w-4 h-4 accent-brun rounded"
                              />
                              <span>Texte en majuscules</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center space-x-2 bg-brun hover:bg-brun-dark text-creme px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                              {uploadingBlockIdx === bIdx ? (
                                <Loader2 className="w-4 h-4 animate-spin text-champagne" />
                              ) : (
                                <Upload className="w-4 h-4 text-champagne" />
                              )}
                              <span>
                                {uploadingBlockIdx === bIdx
                                  ? "Envoi..."
                                  : "Importer image depuis l'appareil"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadBlockImage(bIdx, e)}
                              />
                            </label>
                            <input
                              type="text"
                              value={block.url || ""}
                              onChange={(e) =>
                                updateBlock(bIdx, { url: e.target.value })
                              }
                              placeholder="https://..."
                              className="flex-1 min-w-[200px] bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-brun"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-bold text-brun flex justify-between mb-1">
                                <span>Largeur</span>
                                <span>{block.widthPercent || 100}%</span>
                              </label>
                              <input
                                type="range"
                                min="25"
                                max="100"
                                value={block.widthPercent || 100}
                                onChange={(e) =>
                                  updateBlock(bIdx, {
                                    widthPercent: Number(e.target.value),
                                  })
                                }
                                className="w-full accent-brun"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brun flex justify-between mb-1">
                                <span>Arrondi</span>
                                <span>{block.borderRadius ?? 12} px</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="30"
                                value={block.borderRadius ?? 12}
                                onChange={(e) =>
                                  updateBlock(bIdx, {
                                    borderRadius: Number(e.target.value),
                                  })
                                }
                                className="w-full accent-brun"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-brun block mb-1">
                                Alignement
                              </label>
                              <div className="flex gap-1">
                                {["left", "center", "right"].map((al) => (
                                  <button
                                    key={al}
                                    type="button"
                                    onClick={() => updateBlock(bIdx, { align: al })}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                                      (block.align || "center") === al
                                        ? "bg-brun text-creme border-brun"
                                        : "bg-white text-brun border-stone-300"
                                    }`}
                                  >
                                    {al === "left" ? "G" : al === "center" ? "C" : "D"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "divider" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <ColorControl
                            label="Couleur de la ligne"
                            value={block.color || ""}
                            onChange={(val) => updateBlock(bIdx, { color: val })}
                            fallback="#ECE7E1"
                          />
                          <div>
                            <label className="text-xs font-bold text-brun flex justify-between mb-1">
                              <span>Épaisseur</span>
                              <span>{block.thickness || 1} px</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="6"
                              value={block.thickness || 1}
                              onChange={(e) =>
                                updateBlock(bIdx, { thickness: Number(e.target.value) })
                              }
                              className="w-full accent-brun"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-brun flex justify-between mb-1">
                              <span>Largeur</span>
                              <span>{block.widthPercent || 100}%</span>
                            </label>
                            <input
                              type="range"
                              min="20"
                              max="100"
                              value={block.widthPercent || 100}
                              onChange={(e) =>
                                updateBlock(bIdx, {
                                  widthPercent: Number(e.target.value),
                                })
                              }
                              className="w-full accent-brun"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BARRE AJOUTER UN BLOC / CADRE */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-5 space-y-3">
                <span className="text-sm font-bold text-brun block">
                  + Ajouter un élément ou un cadre à cet e-mail :
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addBlock("richtext")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <Type className="w-4 h-4 text-champagne-dark" />
                    <span>+ Texte libre</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("boxedText")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <Square className="w-4 h-4 text-champagne-dark" />
                    <span>+ Encadré avec bordure</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("summaryCard")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <Box className="w-4 h-4 text-champagne-dark" />
                    <span>+ Fiche Détails / Tarif</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("button")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-champagne-dark" />
                    <span>+ Bouton cliquable</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("image")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-champagne-dark" />
                    <span>+ Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("divider")}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-champagne-light border border-stone-300 text-xs sm:text-sm font-bold text-brun cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-champagne-dark" />
                    <span>+ Trait séparateur</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SOUS-ONGLET 2 : COULEURS, POLICE & CADRES DE LA CARTE      */}
          {/* ========================================================== */}
          {subPanel === "style" && (
            <div className="space-y-5">
              {/* Polices globales */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-4 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-brun">
                  Typographie globale de toute la carte Gmail
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-brun block mb-1">
                      Police principale des textes
                    </label>
                    <select
                      value={design.fontFamily}
                      onChange={(e) => updateDesign({ fontFamily: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-brun"
                    >
                      {EMAIL_FONT_CHOICES.map((f) => (
                        <option key={f.id} value={f.css}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-bold text-brun block mb-1">
                      Police des titres &amp; en-tête
                    </label>
                    <select
                      value={design.headingFontFamily}
                      onChange={(e) =>
                        updateDesign({ headingFontFamily: e.target.value })
                      }
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-sm text-brun"
                    >
                      {EMAIL_FONT_CHOICES.map((f) => (
                        <option key={f.id} value={f.css}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold text-brun flex justify-between mb-1">
                    <span>Taille du texte de base</span>
                    <span>{design.baseFontSize || 13} px</span>
                  </label>
                  <input
                    type="range"
                    min="11"
                    max="18"
                    value={design.baseFontSize || 13}
                    onChange={(e) =>
                      updateDesign({ baseFontSize: Number(e.target.value) })
                    }
                    className="w-full accent-brun"
                  />
                </div>
              </div>

              {/* Cadre Principal de la Carte */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brun">
                      Cadre principal &amp; Structure de la carte
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Activez ou enlevez la bordure de la carte Gmail et ajustez ses couleurs et arrondis.
                    </p>
                  </div>
                  <ToggleVisibilityButton
                    visible={design.cardBorderEnabled !== false}
                    visibleLabel="Bordure carte activée"
                    hiddenLabel="Sans bordure (épuré)"
                    onToggle={() =>
                      updateDesign({
                        cardBorderEnabled: design.cardBorderEnabled === false,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ColorControl
                    label="Fond extérieur Gmail"
                    value={design.outerBgColor}
                    onChange={(val) => updateDesign({ outerBgColor: val })}
                    fallback="#F6F5F3"
                  />
                  <ColorControl
                    label="Fond de la carte centrale"
                    value={design.cardBgColor}
                    onChange={(val) => updateDesign({ cardBgColor: val })}
                    fallback="#FFFFFF"
                  />
                  <ColorControl
                    label="Couleur bordure de carte"
                    value={design.cardBorderColor}
                    onChange={(val) => updateDesign({ cardBorderColor: val })}
                    fallback="#ECE7E1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-brun flex justify-between mb-1">
                      <span>Arrondi des coins</span>
                      <span>{design.cardBorderRadius ?? 16} px</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={design.cardBorderRadius ?? 16}
                      onChange={(e) =>
                        updateDesign({ cardBorderRadius: Number(e.target.value) })
                      }
                      className="w-full accent-brun"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-brun flex justify-between mb-1">
                      <span>Largeur carte</span>
                      <span>{design.cardMaxWidth ?? 520} px</span>
                    </label>
                    <input
                      type="range"
                      min="420"
                      max="680"
                      step="10"
                      value={design.cardMaxWidth ?? 520}
                      onChange={(e) =>
                        updateDesign({ cardMaxWidth: Number(e.target.value) })
                      }
                      className="w-full accent-brun"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-brun cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(design.cardShadow)}
                        onChange={(e) =>
                          updateDesign({ cardShadow: e.target.checked })
                        }
                        className="w-4 h-4 accent-brun rounded"
                      />
                      <span>Ombre portée douce</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Couleurs des textes, encadrés intérieurs & boutons */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold text-brun">
                    Couleurs des textes, encadrés intérieurs &amp; boutons
                  </h3>
                  <ToggleVisibilityButton
                    visible={design.boxBorderEnabled !== false}
                    visibleLabel="Bordures d'encadrés ON"
                    hiddenLabel="Bordures d'encadrés OFF"
                    onToggle={() =>
                      updateDesign({
                        boxBorderEnabled: design.boxBorderEnabled === false,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <ColorControl
                    label="Texte principal"
                    value={design.textColor}
                    onChange={(val) => updateDesign({ textColor: val })}
                    fallback="#1A1A1A"
                  />
                  <ColorControl
                    label="Textes secondaires"
                    value={design.mutedTextColor}
                    onChange={(val) => updateDesign({ mutedTextColor: val })}
                    fallback="#666666"
                  />
                  <ColorControl
                    label="Couleur d'accent / Références"
                    value={design.accentColor}
                    onChange={(val) => updateDesign({ accentColor: val })}
                    fallback="#8C7B70"
                  />
                  <ColorControl
                    label="Fond des encadrés"
                    value={design.boxBgColor}
                    onChange={(val) => updateDesign({ boxBgColor: val })}
                    fallback="#FAF8F5"
                  />
                  <ColorControl
                    label="Bordure des encadrés"
                    value={design.boxBorderColor}
                    onChange={(val) => updateDesign({ boxBorderColor: val })}
                    fallback="#ECE7E1"
                  />
                  <ColorControl
                    label="Fond des boutons"
                    value={design.buttonBgColor}
                    onChange={(val) => updateDesign({ buttonBgColor: val })}
                    fallback="#1A1A1A"
                  />
                  <ColorControl
                    label="Texte des boutons"
                    value={design.buttonTextColor}
                    onChange={(val) => updateDesign({ buttonTextColor: val })}
                    fallback="#FFFFFF"
                  />
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                    <label className="text-xs font-bold text-brun flex justify-between">
                      <span>Arrondi boutons</span>
                      <span>{design.buttonBorderRadius ?? 50} px</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={design.buttonBorderRadius ?? 50}
                      onChange={(e) =>
                        updateDesign({ buttonBorderRadius: Number(e.target.value) })
                      }
                      className="w-full accent-brun"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SOUS-ONGLET 3 : LOGO, EN-TÊTE & PIED DE CARTE              */}
          {/* ========================================================== */}
          {subPanel === "headerFooter" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brun">
                      Logo &amp; En-tête de la carte mail
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Changez le logo, ajustez sa taille, déplacez-le à gauche/centre/droite ou masquez-le.
                    </p>
                  </div>
                  <ToggleVisibilityButton
                    visible={header.visible !== false}
                    visibleLabel="En-tête affiché"
                    hiddenLabel="En-tête masqué"
                    onToggle={() =>
                      updateHeader({ visible: header.visible === false })
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-sm font-bold text-brun">
                    Afficher le logo dans l&apos;e-mail
                  </span>
                  <ToggleVisibilityButton
                    visible={header.showLogo !== false}
                    visibleLabel="Logo affiché"
                    hiddenLabel="Logo masqué"
                    onToggle={() =>
                      updateHeader({ showLogo: header.showLogo === false })
                    }
                  />
                </div>

                {header.showLogo !== false && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      {header.logoUrl && (
                        <img
                          src={header.logoUrl}
                          alt="Logo e-mail actuel"
                          className="w-24 h-20 object-contain rounded-xl bg-white border border-stone-200 p-2 shrink-0"
                        />
                      )}
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={logoFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleUploadLogo}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={uploadingLogo}
                            onClick={() => logoFileRef.current?.click()}
                            className="inline-flex items-center space-x-1.5 bg-brun hover:bg-brun-dark text-creme px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
                          >
                            {uploadingLogo ? (
                              <Loader2 className="w-4 h-4 animate-spin text-champagne" />
                            ) : (
                              <Upload className="w-4 h-4 text-champagne" />
                            )}
                            <span>
                              {uploadingLogo
                                ? "Envoi..."
                                : "Changer le logo depuis mon appareil"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateHeader({ logoUrl: DEFAULT_EMAIL_LOGO_URL })
                            }
                            className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                          >
                            Logo YDM officiel
                          </button>
                        </div>
                        <input
                          type="text"
                          value={header.logoUrl || ""}
                          onChange={(e) => updateHeader({ logoUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-brun"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-brun flex justify-between mb-1">
                          <span>Largeur du logo</span>
                          <span>{header.logoWidth || 130} px</span>
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="260"
                          value={header.logoWidth || 130}
                          onChange={(e) =>
                            updateHeader({ logoWidth: Number(e.target.value) })
                          }
                          className="w-full accent-brun"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-brun block mb-1">
                          Position du logo
                        </label>
                        <div className="flex gap-1.5">
                          {[
                            { id: "left", label: "Gauche" },
                            { id: "center", label: "Centre" },
                            { id: "right", label: "Droite" },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => updateHeader({ logoAlign: pos.id })}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                                (header.logoAlign || "center") === pos.id
                                  ? "bg-brun text-creme border-brun"
                                  : "bg-stone-50 text-brun border-stone-300"
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-brun flex justify-between mb-1">
                          <span>Arrondi du logo</span>
                          <span>{header.logoBorderRadius ?? 0} px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={header.logoBorderRadius ?? 0}
                          onChange={(e) =>
                            updateHeader({
                              logoBorderRadius: Number(e.target.value),
                            })
                          }
                          className="w-full accent-brun"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorControl
                        label="Couleur de fond du haut de carte (optionnel)"
                        value={header.headerBgColor || ""}
                        onChange={(val) => updateHeader({ headerBgColor: val })}
                        fallback="#FFFFFF"
                      />
                      <ColorControl
                        label="Pastille couleur derrière le logo (optionnel)"
                        value={header.logoBgColor || ""}
                        onChange={(val) => updateHeader({ logoBgColor: val })}
                        fallback="#FFFFFF"
                      />
                    </div>
                  </div>
                )}

                {/* Titre texte optionnel sous le logo + Ligne séparatrice */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-brun">
                      Texte de marque affiché sous le logo
                    </span>
                    <ToggleVisibilityButton
                      visible={Boolean(header.brandTitleVisible)}
                      visibleLabel="Affiché"
                      hiddenLabel="Masqué"
                      onToggle={() =>
                        updateHeader({
                          brandTitleVisible: !header.brandTitleVisible,
                        })
                      }
                    />
                  </div>
                  {header.brandTitleVisible && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={header.brandTitle || ""}
                        onChange={(e) =>
                          updateHeader({ brandTitle: e.target.value })
                        }
                        placeholder="YDM COIFFURE"
                        className="bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm text-brun"
                      />
                      <ColorControl
                        label="Couleur du titre"
                        value={header.brandTitleColor ?? "#1A1A1A"}
                        onChange={(val) =>
                          updateHeader({ brandTitleColor: val })
                        }
                        fallback="#1A1A1A"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-brun">
                      Petit trait décoratif sous l&apos;en-tête
                    </span>
                    <ToggleVisibilityButton
                      visible={header.showDivider !== false}
                      visibleLabel="Trait affiché"
                      hiddenLabel="Trait masqué"
                      onToggle={() =>
                        updateHeader({ showDivider: header.showDivider === false })
                      }
                    />
                  </div>
                  {header.showDivider !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ColorControl
                        label="Couleur du trait"
                        value={header.dividerColor ?? "#C2A696"}
                        onChange={(val) => updateHeader({ dividerColor: val })}
                        fallback="#C2A696"
                      />
                      <div>
                        <label className="text-xs font-bold text-brun flex justify-between mb-1">
                          <span>Largeur du trait</span>
                          <span>{header.dividerWidth || 36} px</span>
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="320"
                          value={header.dividerWidth || 36}
                          onChange={(e) =>
                            updateHeader({ dividerWidth: Number(e.target.value) })
                          }
                          className="w-full accent-brun"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pied de carte */}
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-5 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-brun">
                      Pied de la carte mail (Signature &amp; Instagram)
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600">
                      Modifiez librement le bas de tous vos e-mails (signature et liens).
                    </p>
                  </div>
                  <ToggleVisibilityButton
                    visible={footer.visible !== false}
                    visibleLabel="Pied affiché"
                    hiddenLabel="Pied masqué"
                    onToggle={() =>
                      updateFooter({ visible: footer.visible === false })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ColorControl
                    label="Fond du pied de carte"
                    value={design.footerBgColor}
                    onChange={(val) => updateDesign({ footerBgColor: val })}
                    fallback="#FAF8F5"
                  />
                  <ColorControl
                    label="Couleur du texte"
                    value={design.footerTextColor}
                    onChange={(val) => updateDesign({ footerTextColor: val })}
                    fallback="#777777"
                  />
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center">
                    <label className="flex items-center space-x-2 text-xs font-bold text-brun cursor-pointer">
                      <input
                        type="checkbox"
                        checked={design.footerBorderEnabled !== false}
                        onChange={(e) =>
                          updateDesign({ footerBorderEnabled: e.target.checked })
                        }
                        className="w-4 h-4 accent-brun rounded"
                      />
                      <span>Trait séparateur en haut du pied</span>
                    </label>
                  </div>
                </div>

                <RichDocsEditor
                  editorKey="email_footer_editor"
                  value={footer.html || ""}
                  onChange={(nextHtml) => updateFooter({ html: nextHtml })}
                  variables={[]}
                  cardBgColor={design.footerBgColor || "#FAF8F5"}
                  defaultTextColor={design.footerTextColor || "#777777"}
                  defaultFontFamily={design.fontFamily}
                  minHeight={100}
                  onToast={onToast}
                />
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : APERÇU GMAIL EN DIRECT (5 colonnes sticky) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-3">
          <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-sm">
            {/* Barre aperçu Gmail */}
            <div className="bg-stone-100 border-b border-stone-200 px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-brun">
                  Aperçu en direct (Rendu Gmail)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-brun text-creme"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Ordi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-brun text-creme"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Simulation En-tête boîte Gmail */}
            <div className="px-4 py-3 border-b border-stone-200 bg-white space-y-1 text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-brun truncate">
                  {previewRendered.subject}
                </span>
                <span className="text-[11px] text-stone-400 shrink-0">À l&apos;instant</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                De : <strong>YDM Coiffure</strong> &bull; Aperçu : {previewRendered.preheader}
              </p>
            </div>

            {/* Iframe isolé rendant exactement le HTML envoyé */}
            <div className="bg-stone-200/70 p-2 sm:p-3 flex justify-center">
              <div
                className={`bg-white rounded-xl overflow-hidden shadow-inner border border-stone-300 transition-all ${
                  previewDevice === "mobile" ? "w-[360px] max-w-full" : "w-full"
                }`}
              >
                <iframe
                  title="Aperçu réel de la carte e-mail Gmail"
                  srcDoc={previewRendered.html}
                  className="w-full h-[640px] border-0 bg-transparent"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Aperçu Gmail en Direct pour iPad / Tablette (< xl) */}
      {showPreviewModal && (
        <div
          onClick={() => setShowPreviewModal(false)}
          className="xl:hidden fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-brun-dark/80 backdrop-blur-xs animate-fadeIn overscroll-contain"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90dvh] flex flex-col overflow-hidden border border-stone-300 shadow-2xl"
          >
            <div className="px-4 sm:px-6 py-3.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-bold text-brun truncate">
                  Aperçu Gmail en direct
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-brun text-creme"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Ordi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-brun text-creme"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  aria-label="Fermer l'aperçu"
                  className="w-11 h-11 rounded-full bg-white hover:bg-stone-200 border border-stone-300 inline-flex items-center justify-center text-brun cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 border-b border-stone-200 bg-white space-y-1 text-xs shrink-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-brun truncate">
                  {previewRendered.subject}
                </span>
                <span className="text-[11px] text-stone-400 shrink-0">À l&apos;instant</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                De : <strong>YDM Coiffure</strong> &bull; Aperçu : {previewRendered.preheader}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain bg-stone-200/70 p-3 sm:p-4 flex justify-center">
              <div
                className={`bg-white rounded-xl overflow-hidden shadow-inner border border-stone-300 transition-all ${
                  previewDevice === "mobile" ? "w-[360px] max-w-full" : "w-full"
                }`}
              >
                <iframe
                  title="Aperçu mobile et tablette de la carte e-mail Gmail"
                  srcDoc={previewRendered.html}
                  className="w-full h-[560px] sm:h-[640px] border-0 bg-transparent"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
