"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  Highlighter,
  Palette,
  Minus,
  Loader2,
  Upload,
  Code,
  Tag,
  Eraser,
} from "lucide-react";
import { uploadMediaClient } from "@/lib/uploadMedia";

const QUICK_TEXT_COLORS = [
  { label: "Noir", hex: "#1A1A1A" },
  { label: "Brun YDM", hex: "#3A2417" },
  { label: "Champagne", hex: "#8C7B70" },
  { label: "Gris doux", hex: "#666666" },
  { label: "Vert validation", hex: "#2B7A4B" },
  { label: "Bordeaux", hex: "#9B2C2C" },
  { label: "Blanc", hex: "#FFFFFF" },
];

const QUICK_HILITE_COLORS = [
  { label: "Aucun", hex: "transparent" },
  { label: "Crème", hex: "#FAF8F5" },
  { label: "Champagne doux", hex: "#F3E6DA" },
  { label: "Jaune clair", hex: "#FEF08A" },
  { label: "Vert doux", hex: "#DCFCE7" },
];

const EDITOR_FONTS = [
  { label: "Sans Moderne (Gmail)", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia (Luxe)", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

const EDITOR_SIZES = [
  { label: "11 px (Très petit)", value: "1" },
  { label: "13 px (Normal)", value: "2" },
  { label: "15 px (Moyen)", value: "3" },
  { label: "18 px (Grand)", value: "4" },
  { label: "22 px (Sous-titre)", value: "5" },
  { label: "26 px (Grand titre)", value: "6" },
];

export default function RichDocsEditor({
  editorKey,
  value = "",
  onChange,
  variables = [],
  cardBgColor = "#FFFFFF",
  defaultTextColor = "#1A1A1A",
  defaultFontFamily = "Arial, Helvetica, sans-serif",
  placeholder = "Écrivez et mettez en forme votre message...",
  minHeight = 160,
  onToast,
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHiliteMenu, setShowHiliteMenu] = useState(false);
  const [showLinkBar, setShowLinkBar] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("https://");
  const [showHtmlSource, setShowHtmlSource] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Sync HTML uniquement quand l'identifiant du bloc/modèle change ou si reset externe
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [editorKey, showHtmlSource]);

  // Détecte aussi les réinitialisations externes (ex: bouton "Rétablir" ou "Effacer")
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const isFocused = document.activeElement === el;
    if (!isFocused && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (!sel || !editorRef.current) return;
    editorRef.current.focus();
    if (savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const emitChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const runCmd = (command, val = null) => {
    restoreSelection();
    try {
      document.execCommand("styleWithCSS", false, false);
    } catch (_) {}
    document.execCommand(command, false, val);
    saveSelection();
    emitChange();
  };

  const insertHtmlAtCursor = (htmlSnippet) => {
    restoreSelection();
    document.execCommand("insertHTML", false, htmlSnippet);
    saveSelection();
    emitChange();
  };

  const handleInsertVariable = (token) => {
    if (showHtmlSource) {
      onChange((value || "") + token);
      return;
    }
    insertHtmlAtCursor(token);
  };

  const handleApplyLink = () => {
    const url = (linkUrlInput || "").trim();
    if (!url || url === "https://") {
      setShowLinkBar(false);
      return;
    }
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      insertHtmlAtCursor(
        `<a href="${url}" style="color:#8C7B70;font-weight:600;text-decoration:underline;">${url}</a>`
      );
    } else {
      runCmd("createLink", url);
    }
    setShowLinkBar(false);
    setLinkUrlInput("https://");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      onToast?.("Envoi de l'image vers Cloudinary...");
      const res = await uploadMediaClient(file);
      if (res.success && res.url) {
        insertHtmlAtCursor(
          `<img src="${res.url}" alt="Image YDM Coiffure" style="max-width:100%;height:auto;border-radius:10px;margin:10px auto;display:block;" />`
        );
        onToast?.("Image insérée dans la carte mail !");
      } else {
        onToast?.(res.error || "Impossible d'envoyer l'image.");
      }
    } catch (_) {
      onToast?.("Échec de l'envoi de l'image.");
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border-2 border-stone-200 bg-white overflow-hidden shadow-2xs">
      {/* BARRE D'OUTILS MISE EN FORME */}
      <div className="bg-stone-100/90 border-b border-stone-200 p-2 sm:p-2.5 flex flex-wrap items-center gap-1.5">
        {/* Historique */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-stone-200 p-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("undo")}
            title="Annuler"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("redo")}
            title="Rétablir"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sélecteur de Police */}
        <select
          aria-label="Police d'écriture"
          onPointerDown={() => saveSelection()}
          onMouseDown={() => saveSelection()}
          onChange={(e) => {
            if (e.target.value) runCmd("fontName", e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm font-semibold text-brun cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne"
        >
          <option value="" disabled>
            Police...
          </option>
          {EDITOR_FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Sélecteur de Taille */}
        <select
          aria-label="Taille du texte"
          onPointerDown={() => saveSelection()}
          onMouseDown={() => saveSelection()}
          onChange={(e) => {
            if (e.target.value) runCmd("fontSize", e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="min-h-[44px] bg-white border border-stone-200 rounded-xl px-3 py-2 text-base xl:text-sm font-semibold text-brun cursor-pointer focus:outline-none focus:ring-2 focus:ring-champagne"
        >
          <option value="" disabled>
            Taille...
          </option>
          {EDITOR_SIZES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Formatage Gras / Italique / Souligné / Barré */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-stone-200 p-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("bold")}
            title="Gras"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("italic")}
            title="Italique"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("underline")}
            title="Souligné"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => runCmd("strikeThrough")}
            title="Barré"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Couleur texte & Surlignage */}
        <div className="relative flex items-center gap-0.5 bg-white rounded-xl border border-stone-200 p-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              setShowColorMenu(!showColorMenu);
              setShowHiliteMenu(false);
              setShowLinkBar(false);
            }}
            title="Couleur du texte"
            className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-stone-100 text-brun text-xs font-bold cursor-pointer"
          >
            <Palette className="w-4 h-4 text-champagne-dark" />
            <span className="hidden sm:inline">Couleur</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              setShowHiliteMenu(!showHiliteMenu);
              setShowColorMenu(false);
              setShowLinkBar(false);
            }}
            title="Couleur de fond / Surlignage"
            className="min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-stone-100 text-brun text-xs font-bold cursor-pointer"
          >
            <Highlighter className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Fond</span>
          </button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border-2 border-stone-200 rounded-2xl shadow-xl p-3 space-y-2.5 w-64 max-w-[calc(100vw-3rem)]">
              <span className="text-xs font-bold text-brun block">
                Couleur du texte sélectionné
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEXT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      saveSelection();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      runCmd("foreColor", c.hex);
                      setShowColorMenu(false);
                    }}
                    title={c.label}
                    className="w-10 h-10 compact-chip rounded-full border border-stone-300 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <label className="min-h-[44px] flex items-center justify-between text-xs font-medium text-stone-700 pt-1 border-t border-stone-100">
                <span>Autre couleur :</span>
                <input
                  type="color"
                  defaultValue="#8C7B70"
                  onChange={(e) => runCmd("foreColor", e.target.value)}
                  className="w-11 h-10 rounded cursor-pointer border border-stone-200"
                />
              </label>
            </div>
          )}

          {showHiliteMenu && (
            <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border-2 border-stone-200 rounded-2xl shadow-xl p-3 space-y-2.5 w-64 max-w-[calc(100vw-3rem)]">
              <span className="text-xs font-bold text-brun block">
                Surlignage derrière le texte
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_HILITE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      saveSelection();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      runCmd("hiliteColor", c.hex);
                      setShowHiliteMenu(false);
                    }}
                    title={c.label}
                    className="w-10 h-10 compact-chip rounded-lg border border-stone-300 shadow-2xs cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-xs"
                    style={{ backgroundColor: c.hex === "transparent" ? "#fff" : c.hex }}
                  >
                    {c.hex === "transparent" ? "Ø" : ""}
                  </button>
                ))}
              </div>
              <label className="min-h-[44px] flex items-center justify-between text-xs font-medium text-stone-700 pt-1 border-t border-stone-100">
                <span>Autre fond :</span>
                <input
                  type="color"
                  defaultValue="#FAF8F5"
                  onChange={(e) => runCmd("hiliteColor", e.target.value)}
                  className="w-11 h-10 rounded cursor-pointer border border-stone-200"
                />
              </label>
            </div>
          )}
        </div>

        {/* Alignement */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-stone-200 p-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("justifyLeft")}
            title="Aligner à gauche"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("justifyCenter")}
            title="Centrer"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("justifyRight")}
            title="Aligner à droite"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("justifyFull")}
            title="Justifier"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Listes, Lien, Image, Ligne, Nettoyer */}
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-stone-200 p-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("insertUnorderedList")}
            title="Liste à puces"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("insertOrderedList")}
            title="Liste numérotée"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => {
              setShowLinkBar(!showLinkBar);
              setShowColorMenu(false);
              setShowHiliteMenu(false);
            }}
            title="Ajouter un lien"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={uploadingImg}
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => fileInputRef.current?.click()}
            title="Insérer une image depuis l'appareil"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer disabled:opacity-50"
          >
            {uploadingImg ? (
              <Loader2 className="w-4 h-4 animate-spin text-champagne-dark" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              insertHtmlAtCursor(
                '<hr style="border:none;border-top:1px solid #ECE7E1;margin:14px 0;" />'
              )
            }
            title="Insérer un trait séparateur"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-brun cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => runCmd("removeFormat")}
            title="Enlever le style"
            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-600 cursor-pointer"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Source & Effacer */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHtmlSource(!showHtmlSource)}
            title="Voir / modifier le code HTML"
            className={`min-h-[44px] inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
              showHtmlSource
                ? "bg-brun text-creme border-brun"
                : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HTML</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (editorRef.current) editorRef.current.innerHTML = "";
            }}
            title="Effacer tout le contenu du bloc"
            className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-xs font-semibold bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 cursor-pointer"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* BARRE LIEN RAPIDE */}
      {showLinkBar && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2.5 flex flex-wrap items-center gap-2">
          <input
            type="url"
            value={linkUrlInput}
            onChange={(e) => setLinkUrlInput(e.target.value)}
            placeholder="https://instagram.com/ydm_coiffure"
            className="flex-1 min-w-[200px] min-h-[44px] bg-white border border-stone-300 rounded-xl px-3 py-2 text-base xl:text-sm text-brun"
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-brun text-creme text-xs sm:text-sm font-bold cursor-pointer"
          >
            Insérer le lien
          </button>
          <button
            type="button"
            onClick={() => setShowLinkBar(false)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-semibold text-stone-600 cursor-pointer"
          >
            Annuler
          </button>
        </div>
      )}

      {/* JETONS VARIABLES DYNAMIQUES (INSERTION EN 1 CLIC) */}
      {variables.length > 0 && (
        <div className="bg-stone-50 border-b border-stone-200 px-3 py-2.5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-dark flex items-center space-x-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Insérer :</span>
          </span>
          {variables.slice(0, 10).map((v) => (
            <button
              key={v.token}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
              }}
              onClick={() => handleInsertVariable(v.token)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-champagne-light border border-stone-300 text-xs font-semibold text-brun transition-colors cursor-pointer"
              title={`Insère ${v.token} (ex: ${v.sample})`}
            >
              + {v.label}
            </button>
          ))}
        </div>
      )}

      {/* FEUILLE ÉDITABLE */}
      {showHtmlSource ? (
        <textarea
          rows={6}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 font-mono text-base xl:text-sm bg-stone-900 text-emerald-300 focus:outline-none resize-y"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => {
            saveSelection();
            emitChange();
          }}
          onMouseUp={saveSelection}
          onTouchEnd={saveSelection}
          onKeyUp={saveSelection}
          data-placeholder={placeholder}
          className="w-full p-4 sm:p-5 text-base xl:text-sm focus:outline-none overflow-auto prose-sm max-w-none"
          style={{
            minHeight: `${minHeight}px`,
            backgroundColor: cardBgColor || "#FFFFFF",
            color: defaultTextColor || "#1A1A1A",
            fontFamily: defaultFontFamily || "Arial, Helvetica, sans-serif",
            lineHeight: 1.6,
          }}
        />
      )}
    </div>
  );
}
