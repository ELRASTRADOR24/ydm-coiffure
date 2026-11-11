"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eraser,
  Upload,
  Loader2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { uploadMediaClient } from "@/lib/uploadMedia";

export const SALON_IMAGE_PRESETS = [
  { label: "Knotless Traçage net", path: "/images/realisations/IMG_3401_still.jpeg" },
  { label: "Knotless Dos", path: "/images/realisations/IMG_3403_still.jpeg" },
  { label: "Knotless Classique", path: "/images/realisations/knotless-still.jpeg" },
  { label: "Small Knotless", path: "/images/realisations/small-knotless-still.jpeg" },
  { label: "French Curls Medium", path: "/images/realisations/french-curl-medium-still.jpeg" },
  { label: "Boho Braids", path: "/images/realisations/boho-braids-still.jpeg" },
  { label: "Boho Braids Caramel", path: "/images/realisations/FE8CAC4A-8B5A-4FDF-A6AF-67D0E81C5151_still.jpeg" },
  { label: "Fulani Classique", path: "/images/realisations/fulani-still.jpeg" },
  { label: "Fulani Bordeaux", path: "/images/realisations/IMG_3475_still.jpeg" },
  { label: "Vanille", path: "/images/realisations/vanille-still.jpeg" },
  { label: "Guide Court", path: "/guide-longueur-court.jpg" },
  { label: "Guide Mi-long", path: "/guide-longueur-mi-long.jpg" },
  { label: "Guide Long", path: "/guide-longueur-long.jpg" },
  { label: "Guide Extra-long", path: "/guide-longueur-extra-long.jpg" },
];

export function ToggleVisibilityButton({
  visible,
  onToggle,
  visibleLabel = "Affiché sur le site",
  hiddenLabel = "Masqué sur le site",
}) {
  const isShown = visible !== false;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`min-h-[44px] inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shrink-0 ${
        isShown
          ? "bg-emerald-50 text-emerald-900 border-emerald-400 hover:bg-emerald-100"
          : "bg-stone-200 text-stone-700 border-stone-400 hover:bg-stone-300"
      }`}
    >
      {isShown ? (
        <>
          <Eye className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{visibleLabel}</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4 text-stone-600 shrink-0" />
          <span>{hiddenLabel}</span>
        </>
      )}
    </button>
  );
}

export function SectionCard({
  title,
  description,
  visible = true,
  onToggleVisible,
  onDelete,
  onReset,
  children,
}) {
  const isShown = visible !== false;

  return (
    <div
      className={`bg-white rounded-2xl border-2 transition-all p-5 sm:p-7 space-y-5 shadow-2xs ${
        isShown ? "border-stone-200" : "border-stone-300 bg-stone-50/70"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-serif text-xl font-bold text-brun">{title}</h3>
            {!isShown && (
              <span className="px-2.5 py-0.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wide">
                Masqué
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-stone-600 leading-snug">{description}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onToggleVisible && (
            <ToggleVisibilityButton
              visible={isShown}
              onToggle={onToggleVisible}
            />
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Rétablir</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      </div>

      {!isShown && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-950 font-medium">
          Cette section est actuellement masquée : elle n&apos;apparaît pas sur le site public tant que vous ne cliquez pas sur &laquo; Masqué sur le site &raquo; pour la réafficher.
        </div>
      )}

      <div className={isShown ? "space-y-4" : "space-y-4 opacity-70"}>
        {children}
      </div>
    </div>
  );
}

export function TextField({
  label,
  value = "",
  onChange,
  multiline = false,
  rows = 3,
  placeholder = "",
  help = "",
  allowClear = true,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-bold text-brun block">{label}</label>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-red-700 hover:bg-red-50 border border-stone-200 transition-colors cursor-pointer"
            title="Effacer ce texte (champ vide = texte retiré du site)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Effacer le texte</span>
          </button>
        )}
      </div>

      {multiline ? (
        <textarea
          rows={rows}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3.5 text-base lg:text-sm text-brun leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne focus:border-champagne resize-y"
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[44px] bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-3 text-base lg:text-sm text-brun focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne focus:border-champagne"
        />
      )}

      {help && <p className="text-xs text-stone-500">{help}</p>}
    </div>
  );
}

export function ImageSelectorField({
  label = "Image affichée",
  imageUrl = "",
  onChangeUrl,
  showImagePickerDefault = false,
  onToast,
}) {
  const [showPicker, setShowPicker] = useState(showImagePickerDefault);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onToast?.("Envoi de l'image vers Cloudinary en cours...");
      const res = await uploadMediaClient(file);
      if (res.success && res.url) {
        onChangeUrl(res.url);
        onToast?.("Image téléversée avec succès !");
      } else {
        onToast?.(res.error || "Erreur lors de l'envoi de l'image.");
      }
    } catch (_) {
      onToast?.("Impossible d'envoyer l'image pour le moment.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-sm font-bold text-brun">{label}</span>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brun hover:bg-brun-dark text-creme transition-colors disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-champagne" />
            ) : (
              <Upload className="w-4 h-4 text-champagne" />
            )}
            <span>{uploading ? "Envoi..." : "Importer depuis mon appareil"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-stone-100 text-brun border border-stone-300 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-champagne-dark" />
            <span>{showPicker ? "Fermer la galerie" : "Choisir photo du salon"}</span>
          </button>

          {imageUrl && (
            <button
              type="button"
              onClick={() => onChangeUrl("")}
              className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Retirer l&apos;image</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-24 h-28 rounded-xl overflow-hidden bg-white border border-stone-300 shrink-0 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Aperçu"
              fill
              className="object-cover object-top"
            />
          ) : (
            <span className="text-xs text-stone-400 text-center px-2">
              Aucune image
            </span>
          )}
        </div>
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-semibold text-stone-600 block">
            Lien ou chemin de l&apos;image :
          </label>
          <input
            type="text"
            value={imageUrl || ""}
            onChange={(e) => onChangeUrl(e.target.value)}
            placeholder="/images/realisations/..."
            className="w-full min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm font-mono text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
          />
        </div>
      </div>

      {showPicker && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2 border-t border-stone-200">
          {SALON_IMAGE_PRESETS.map((preset) => {
            const selected = imageUrl === preset.path;
            return (
              <button
                key={preset.path}
                type="button"
                onClick={() => {
                  onChangeUrl(preset.path);
                  setShowPicker(false);
                }}
                className={`relative rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                  selected
                    ? "border-champagne-dark ring-2 ring-champagne/50"
                    : "border-stone-200 hover:border-champagne"
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-stone-100">
                  <Image
                    src={preset.path}
                    alt={preset.label}
                    fill
                    className="object-cover object-top"
                  />
                  {selected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="p-1.5 bg-white text-[11px] font-semibold text-brun truncate">
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Éditeur universel pour des articles structurés (Règlement, Mentions légales, Confidentialité, Blocs libres).
 */
export function RichArticleListEditor({
  articles = [],
  onChange,
  itemLabel = "Article / Section",
  addLabel = "Ajouter un article",
  allowClosingParagraph = false,
}) {
  const list = Array.isArray(articles) ? articles : [];

  const updateItem = (idx, patch) => {
    const next = list.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...list,
      {
        id: `sec_${Date.now()}`,
        visible: true,
        title: `Nouveau ${itemLabel.toLowerCase()}`,
        paragraphs: ["Écrivez votre texte ici..."],
        bullets: [],
      },
    ]);
  };

  const removeItem = (idx) => {
    onChange(list.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? (
        <div className="p-6 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-center space-y-3">
          <p className="text-sm text-stone-600">
            Aucun élément dans cette liste pour le moment.
          </p>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brun hover:bg-brun-dark text-creme text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4 text-champagne" />
            <span>{addLabel}</span>
          </button>
        </div>
      ) : (
        list.map((article, idx) => {
          const isShown = article.visible !== false;
          const paragraphs = Array.isArray(article.paragraphs)
            ? article.paragraphs
            : [];
          const bullets = Array.isArray(article.bullets) ? article.bullets : [];

          return (
            <div
              key={article.id || idx}
              className={`rounded-2xl border-2 p-5 space-y-4 transition-all ${
                isShown
                  ? "bg-stone-50 border-stone-200"
                  : "bg-stone-100/80 border-stone-300 opacity-75"
              }`}
            >
              {/* Barre du haut de l'article avec libellés explicites */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-white border border-stone-300 text-sm font-bold text-brun">
                    {itemLabel} #{idx + 1}
                  </span>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, "up")}
                    className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span>Monter</span>
                  </button>

                  <button
                    type="button"
                    disabled={idx === list.length - 1}
                    onClick={() => moveItem(idx, "down")}
                    className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-sm font-semibold text-brun disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span>Descendre</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ToggleVisibilityButton
                    visible={isShown}
                    onToggle={() => updateItem(idx, { visible: !isShown })}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>

              {/* Titre */}
              <TextField
                label="Titre"
                value={article.title || ""}
                onChange={(val) => updateItem(idx, { title: val })}
              />

              {/* Sous-titre optionnel pour blocs personnalisés */}
              {Object.prototype.hasOwnProperty.call(article, "subtitle") && (
                <TextField
                  label="Sous-titre (optionnel)"
                  value={article.subtitle || ""}
                  onChange={(val) => updateItem(idx, { subtitle: val })}
                />
              )}

              {/* Paragraphes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brun">Paragraphes</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateItem(idx, {
                        paragraphs: [...paragraphs, "Nouveau paragraphe..."],
                      })
                    }
                    className="min-h-[44px] inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-champagne-light border border-stone-300 text-sm font-semibold text-brun cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-champagne-dark" />
                    <span>Ajouter un paragraphe</span>
                  </button>
                </div>

                {paragraphs.map((para, pIdx) => (
                  <div key={pIdx} className="flex flex-col sm:flex-row gap-2 items-start">
                    <textarea
                      rows={2}
                      value={para}
                      onChange={(e) => {
                        const nextP = [...paragraphs];
                        nextP[pIdx] = e.target.value;
                        updateItem(idx, { paragraphs: nextP });
                      }}
                      className="flex-1 w-full bg-white border border-stone-300 rounded-xl p-3 text-base lg:text-sm text-brun leading-relaxed focus:outline-none focus:ring-2 focus:ring-champagne"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(idx, {
                          paragraphs: paragraphs.filter((_, i) => i !== pIdx),
                        })
                      }
                      className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-stone-300 hover:border-red-200 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Liste à puces */}
              <div className="space-y-2.5 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brun">
                    Liste à puces (optionnelle)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateItem(idx, {
                        bullets: [...bullets, "Nouveau point..."],
                      })
                    }
                    className="min-h-[44px] inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-champagne-light border border-stone-300 text-sm font-semibold text-brun cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-champagne-dark" />
                    <span>Ajouter une puce</span>
                  </button>
                </div>

                {bullets.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => {
                        const nextB = [...bullets];
                        nextB[bIdx] = e.target.value;
                        updateItem(idx, { bullets: nextB });
                      }}
                      className="flex-1 min-h-[44px] bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-base lg:text-sm text-brun focus:outline-none focus:ring-2 focus:ring-champagne"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateItem(idx, {
                          bullets: bullets.filter((_, i) => i !== bIdx),
                        })
                      }
                      className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-stone-300 hover:border-red-200 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Paragraphe de clôture (ex: RGPD) */}
              {allowClosingParagraph && (
                <TextField
                  label="Paragraphe de conclusion (optionnel)"
                  value={article.closingParagraph || ""}
                  multiline
                  rows={2}
                  onChange={(val) => updateItem(idx, { closingParagraph: val })}
                />
              )}
            </div>
          );
        })
      )}

      {list.length > 0 && (
        <button
          type="button"
          onClick={addItem}
          className="w-full inline-flex items-center justify-center space-x-2 py-3.5 rounded-2xl border-2 border-dashed border-stone-300 hover:border-champagne bg-stone-50 hover:bg-champagne-light/40 text-brun text-sm font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-champagne-dark" />
          <span>{addLabel}</span>
        </button>
      )}
    </div>
  );
}
