/**
 * Utilitaires partagés pour la gestion des tarifs, acomptes et options de longueurs
 * YDM Coiffure
 */

export function roundPrice(value) {
  return Math.round(Number(value) * 100) / 100;
}

/**
 * Parse une saisie utilisateur (chaîne libre avec virgule ou point, ou nombre)
 * en nombre positif ou nul. Retourne null si la saisie est vide ou invalide.
 */
export function parseDecimalInput(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;
  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) && rawValue >= 0 ? roundPrice(rawValue) : null;
  }

  const trimmed = String(rawValue)
    .trim()
    .replace(/\s+/g, "")
    .replace(/€$/g, "")
    .replace(",", ".");

  if (!trimmed) return null;
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return roundPrice(parsed);
}

export function formatEuroAmount(amount) {
  const num = roundPrice(Number(amount) || 0);
  if (Number.isInteger(num)) {
    return String(num);
  }
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatInputNumberString(amount) {
  const num = roundPrice(Number(amount) || 0);
  return Number.isInteger(num) ? String(num) : String(num);
}

export function isLengthOption(option) {
  return Boolean(
    option &&
      typeof option.name === "string" &&
      option.name.toLowerCase().includes("longueur")
  );
}

export function stripPriceFromChoiceLabel(label) {
  if (label === null || label === undefined) return "";
  return String(label)
    .replace(/\s*\(\s*[+-]?\s*\d+(?:[.,]\d+)?\s*€\s*\)\s*$/i, "")
    .trim();
}

export function formatLengthChoiceLabel(name, totalPrice) {
  const cleanName = stripPriceFromChoiceLabel(name) || "Longueur";
  return `${cleanName} (${formatEuroAmount(totalPrice)} €)`;
}

export function formatOptionChoiceDisplayLabel(
  choice,
  basePrice = 0,
  optionOrIsLength = false
) {
  if (!choice || typeof choice !== "object") return "";
  const isLength =
    typeof optionOrIsLength === "boolean"
      ? optionOrIsLength
      : isLengthOption(optionOrIsLength);
  if (!isLength) {
    return String(choice.label || "").trim();
  }
  const computedTotal = Math.max(
    0,
    roundPrice((Number(basePrice) || 0) + (Number(choice.priceDiff) || 0))
  );
  return formatLengthChoiceLabel(choice.label, computedTotal);
}

export function normalizeServiceReadData(service) {
  if (!service || typeof service !== "object" || !Array.isArray(service.options)) {
    return service;
  }

  let changed = false;
  const basePrice = Math.max(0, Number(service.price) || 0);
  const normalizedOptions = service.options.map((opt) => {
    if (!isLengthOption(opt) || !Array.isArray(opt.choices)) {
      return opt;
    }
    const nextChoices = opt.choices.map((choice) => {
      const nextLabel = formatOptionChoiceDisplayLabel(choice, basePrice, true);
      if (nextLabel !== choice?.label) {
        changed = true;
      }
      return {
        ...choice,
        label: nextLabel,
      };
    });
    return {
      ...opt,
      choices: nextChoices,
    };
  });

  if (!changed) {
    return service;
  }

  return {
    ...service,
    options: normalizedOptions,
  };
}

export function inferIncludesHairFromCategory(category, fallback = false) {
  if (!category || typeof category !== "string") return Boolean(fallback);
  const norm = category.toLowerCase();
  if (norm.includes("sans mèches") || norm.includes("sans meches") || norm.includes("sans rajouts")) {
    return false;
  }
  if (norm.includes("mèches incluses") || norm.includes("meches incluses") || norm.includes("avec mèches")) {
    return true;
  }
  return Boolean(fallback);
}

function getEffectiveChoiceTotal(choice, basePrice) {
  if (!choice || typeof choice !== "object") return Math.max(0, roundPrice(basePrice));
  const explicit =
    choice.totalPrice !== undefined ? parseDecimalInput(choice.totalPrice) : null;
  if (explicit !== null) return explicit;
  const base = Math.max(0, roundPrice(Number(basePrice) || 0));
  const diff = Number(choice.priceDiff) || 0;
  return Math.max(0, roundPrice(base + diff));
}

/**
 * Construit l'état brouillon du formulaire d'édition/création de prestation
 * en conservant des chaînes de caractères éditables librement (vide autorisé).
 */
export function createServiceFormDraft(
  service = null,
  {
    defaultCategory = "Sans mèches incluses",
    videoMap = {},
  } = {}
) {
  if (!service) {
    return {
      name: "",
      category: defaultCategory,
      priceInput: "35",
      duration: 180,
      depositInput: "10",
      includesHair: inferIncludesHairFromCategory(defaultCategory, false),
      description: "",
      imageUrl: "/images/realisations/knotless-still.jpeg",
      videoUrl: "",
      lengthOption: null,
      otherOptions: [],
      isActive: true,
      isPopular: false,
    };
  }

  const rawOptions = Array.isArray(service.options) ? service.options : [];
  const rawLengthOpt = rawOptions.find((opt) => isLengthOption(opt)) || null;
  const otherOptions = rawOptions
    .filter((opt) => !isLengthOption(opt))
    .map((opt) => JSON.parse(JSON.stringify(opt)));

  const storedBase = Math.max(0, Number(service.price) || 0);
  const storedDeposit =
    service.depositAmount !== undefined && service.depositAmount !== null
      ? Math.max(0, Number(service.depositAmount) || 0)
      : 10;

  let lengthOption = null;
  let effectiveBase = storedBase;

  if (rawLengthOpt && Array.isArray(rawLengthOpt.choices)) {
    const rawTotals = rawLengthOpt.choices.map((c) =>
      getEffectiveChoiceTotal(c, storedBase)
    );
    effectiveBase = rawTotals.length > 0 ? Math.min(...rawTotals) : storedBase;

    lengthOption = {
      name: rawLengthOpt.name || "Longueur souhaitée",
      required: rawLengthOpt.required ?? true,
      choices: rawLengthOpt.choices.map((choice, idx) => {
        const total = rawTotals[idx];
        return {
          name: stripPriceFromChoiceLabel(choice.label),
          priceInput: formatInputNumberString(total),
          anchorDiff: roundPrice(total - effectiveBase),
          durationDiff: Number(choice.durationDiff) || 0,
        };
      }),
    };
  }

  const firstImage = service.images?.[0] || "/images/realisations/knotless-still.jpeg";

  return {
    name: service.name || "",
    category: service.category || defaultCategory,
    priceInput: formatInputNumberString(effectiveBase),
    duration: Number(service.duration) || 180,
    depositInput: formatInputNumberString(storedDeposit),
    includesHair:
      typeof service.includesHair === "boolean"
        ? service.includesHair
        : inferIncludesHairFromCategory(service.category, false),
    description: service.description || "",
    imageUrl: firstImage,
    videoUrl: service.videoUrl || videoMap[firstImage] || "",
    lengthOption,
    otherOptions,
    isActive: service.isActive ?? true,
    isPopular: service.isPopular ?? false,
  };
}

/**
 * Met à jour le champ Prix de base sans jamais bloquer l'effacement ("")
 * et répercute les écarts sur les longueurs lorsqu'un nombre valide est saisi.
 */
export function updateDraftBasePrice(draft, nextPriceInput) {
  const nextParsed = parseDecimalInput(nextPriceInput);
  if (!draft.lengthOption || !Array.isArray(draft.lengthOption.choices) || nextParsed === null) {
    return {
      ...draft,
      priceInput: nextPriceInput,
    };
  }

  const updatedChoices = draft.lengthOption.choices.map((choice) => {
    const diff = Number.isFinite(choice.anchorDiff) ? choice.anchorDiff : 0;
    const nextTotal = Math.max(0, roundPrice(nextParsed + diff));
    return {
      ...choice,
      priceInput: formatInputNumberString(nextTotal),
    };
  });

  return {
    ...draft,
    priceInput: nextPriceInput,
    lengthOption: {
      ...draft.lengthOption,
      choices: updatedChoices,
    },
  };
}

/**
 * Met à jour le prix d'une longueur sans jamais bloquer l'effacement ni les valeurs
 * inférieures à l'ancien prix de base, et synchronise automatiquement le prix minimum "Dès X €".
 */
export function updateDraftLengthPrice(draft, choiceIndex, nextPriceInput) {
  if (!draft.lengthOption || !Array.isArray(draft.lengthOption.choices)) {
    return draft;
  }

  const nextChoices = draft.lengthOption.choices.map((choice, idx) =>
    idx === choiceIndex ? { ...choice, priceInput: nextPriceInput } : { ...choice }
  );

  const validTotals = nextChoices
    .map((c) => parseDecimalInput(c.priceInput))
    .filter((v) => v !== null);

  let nextPriceInputForBase = draft.priceInput;
  let syncedChoices = nextChoices;

  if (validTotals.length > 0) {
    const minPrice = Math.min(...validTotals);
    nextPriceInputForBase = formatInputNumberString(minPrice);
    syncedChoices = nextChoices.map((choice) => {
      const parsed = parseDecimalInput(choice.priceInput);
      return {
        ...choice,
        anchorDiff: parsed !== null ? roundPrice(parsed - minPrice) : choice.anchorDiff,
      };
    });
  }

  return {
    ...draft,
    priceInput: nextPriceInputForBase,
    lengthOption: {
      ...draft.lengthOption,
      choices: syncedChoices,
    },
  };
}

export function updateDraftLengthName(draft, choiceIndex, nextName) {
  if (!draft.lengthOption || !Array.isArray(draft.lengthOption.choices)) {
    return draft;
  }
  return {
    ...draft,
    lengthOption: {
      ...draft.lengthOption,
      choices: draft.lengthOption.choices.map((choice, idx) =>
        idx === choiceIndex ? { ...choice, name: nextName } : choice
      ),
    },
  };
}

export function activateDraftLengthOptions(draft) {
  const base = parseDecimalInput(draft.priceInput) ?? 35;
  const presets = [
    { name: "Court", diff: 0, durationDiff: 0 },
    { name: "Mi-long", diff: 10, durationDiff: 30 },
    { name: "Long", diff: 20, durationDiff: 60 },
    { name: "Extra long", diff: 30, durationDiff: 90 },
  ];

  return {
    ...draft,
    priceInput: formatInputNumberString(base),
    lengthOption: {
      name: "Longueur souhaitée",
      required: true,
      choices: presets.map((p) => ({
        name: p.name,
        priceInput: formatInputNumberString(roundPrice(base + p.diff)),
        anchorDiff: p.diff,
        durationDiff: p.durationDiff,
      })),
    },
  };
}

export function deactivateDraftLengthOptions(draft) {
  return {
    ...draft,
    lengthOption: null,
  };
}

export function addDraftLengthChoice(draft) {
  if (!draft.lengthOption) return draft;
  const choices = draft.lengthOption.choices || [];
  const validTotals = choices
    .map((c) => parseDecimalInput(c.priceInput))
    .filter((v) => v !== null);
  const currentBase = parseDecimalInput(draft.priceInput) ?? 35;
  const nextTotal =
    validTotals.length > 0
      ? roundPrice(Math.max(...validTotals) + 10)
      : roundPrice(currentBase + choices.length * 10);

  const appended = [
    ...choices,
    {
      name: `Longueur ${choices.length + 1}`,
      priceInput: formatInputNumberString(nextTotal),
      anchorDiff: 0,
      durationDiff: 30,
    },
  ];

  const allValid = appended
    .map((c) => parseDecimalInput(c.priceInput))
    .filter((v) => v !== null);
  const minPrice = allValid.length > 0 ? Math.min(...allValid) : currentBase;

  return {
    ...draft,
    priceInput: formatInputNumberString(minPrice),
    lengthOption: {
      ...draft.lengthOption,
      choices: appended.map((c) => {
        const parsed = parseDecimalInput(c.priceInput);
        return {
          ...c,
          anchorDiff: parsed !== null ? roundPrice(parsed - minPrice) : 0,
        };
      }),
    },
  };
}

export function removeDraftLengthChoice(draft, choiceIndex) {
  if (!draft.lengthOption) return draft;
  const remaining = (draft.lengthOption.choices || []).filter(
    (_, idx) => idx !== choiceIndex
  );

  if (remaining.length === 0) {
    return {
      ...draft,
      lengthOption: null,
    };
  }

  const validTotals = remaining
    .map((c) => parseDecimalInput(c.priceInput))
    .filter((v) => v !== null);

  if (validTotals.length === 0) {
    return {
      ...draft,
      lengthOption: {
        ...draft.lengthOption,
        choices: remaining,
      },
    };
  }

  const minPrice = Math.min(...validTotals);
  return {
    ...draft,
    priceInput: formatInputNumberString(minPrice),
    lengthOption: {
      ...draft.lengthOption,
      choices: remaining.map((c) => {
        const parsed = parseDecimalInput(c.priceInput);
        return {
          ...c,
          anchorDiff: parsed !== null ? roundPrice(parsed - minPrice) : 0,
        };
      }),
    },
  };
}

/**
 * Valide et convertit le brouillon du modal en payload API propre et cohérent.
 */
export function buildServicePayloadFromDraft(
  draft,
  { categoryOverride, videoUrlOverride } = {}
) {
  const finalName = String(draft.name || "").trim();
  if (!finalName) {
    return { error: "Veuillez saisir un nom pour la prestation." };
  }

  const parsedBase = parseDecimalInput(draft.priceInput);
  if (parsedBase === null) {
    return { error: "Veuillez saisir un prix de base valide (nombre positif ou nul)." };
  }

  const parsedDeposit = parseDecimalInput(draft.depositInput);
  if (parsedDeposit === null) {
    return { error: "Veuillez saisir un montant d'acompte valide (nombre positif ou nul)." };
  }

  const normalizedOptions = [];

  if (draft.lengthOption && Array.isArray(draft.lengthOption.choices) && draft.lengthOption.choices.length > 0) {
    const parsedChoices = [];
    for (let i = 0; i < draft.lengthOption.choices.length; i += 1) {
      const choice = draft.lengthOption.choices[i];
      const total = parseDecimalInput(choice.priceInput);
      if (total === null) {
        const label = (choice.name || "").trim() || `#${i + 1}`;
        return {
          error: `Veuillez saisir un prix valide pour la longueur « ${label} ».`,
        };
      }
      parsedChoices.push({
        name: String(choice.name || "").trim() || "Longueur",
        total,
        durationDiff: Number(choice.durationDiff) || 0,
      });
    }

    const effectiveBase = Math.min(...parsedChoices.map((c) => c.total));

    normalizedOptions.push({
      name: draft.lengthOption.name || "Longueur souhaitée",
      required: draft.lengthOption.required ?? true,
      choices: parsedChoices.map((c) => ({
        label: formatLengthChoiceLabel(c.name, c.total),
        priceDiff: roundPrice(c.total - effectiveBase),
        durationDiff: c.durationDiff,
      })),
    });

    if (Array.isArray(draft.otherOptions)) {
      for (const opt of draft.otherOptions) {
        normalizedOptions.push(opt);
      }
    }

    return {
      payload: {
        name: finalName,
        category: categoryOverride || draft.category,
        price: effectiveBase,
        duration: Number(draft.duration) || 180,
        depositAmount: parsedDeposit,
        includesHair: Boolean(draft.includesHair),
        description: String(draft.description || "").trim(),
        images: [draft.imageUrl || "/images/realisations/knotless-still.jpeg"],
        videoUrl: videoUrlOverride !== undefined ? videoUrlOverride : draft.videoUrl || "",
        options: normalizedOptions,
        isActive: Boolean(draft.isActive),
        isPopular: Boolean(draft.isPopular),
      },
    };
  }

  if (Array.isArray(draft.otherOptions)) {
    for (const opt of draft.otherOptions) {
      normalizedOptions.push(opt);
    }
  }

  return {
    payload: {
      name: finalName,
      category: categoryOverride || draft.category,
      price: parsedBase,
      duration: Number(draft.duration) || 180,
      depositAmount: parsedDeposit,
      includesHair: Boolean(draft.includesHair),
      description: String(draft.description || "").trim(),
      images: [draft.imageUrl || "/images/realisations/knotless-still.jpeg"],
      videoUrl: videoUrlOverride !== undefined ? videoUrlOverride : draft.videoUrl || "",
      options: normalizedOptions,
      isActive: Boolean(draft.isActive),
      isPopular: Boolean(draft.isPopular),
    },
  };
}

/**
 * Normalise côté serveur un service lors d'un POST ou PATCH afin de garantir que :
 * - price correspond toujours au tarif minimum des longueurs s'il y en a,
 * - priceDiff commence à 0 pour la longueur la moins chère,
 * - chaque choice.label reflète toujours exact clientPrice (ex: "Court (35 €)").
 */
export function normalizeServiceServerPayload(body, existingService = null) {
  const sanitized = { ...body };

  const hasPriceUpdate =
    Object.prototype.hasOwnProperty.call(body, "price") &&
    body.price !== undefined;
  const hasDepositUpdate =
    Object.prototype.hasOwnProperty.call(body, "depositAmount") &&
    body.depositAmount !== undefined;
  const hasOptionsUpdate =
    Object.prototype.hasOwnProperty.call(body, "options") &&
    Array.isArray(body.options);

  if (hasPriceUpdate) {
    const parsed = parseDecimalInput(body.price);
    if (parsed === null) {
      throw new Error("Prix de base invalide.");
    }
    sanitized.price = parsed;
  }

  if (hasDepositUpdate) {
    const parsedDep = parseDecimalInput(body.depositAmount);
    if (parsedDep === null) {
      throw new Error("Montant d'acompte invalide.");
    }
    sanitized.depositAmount = parsedDep;
  }

  if (Object.prototype.hasOwnProperty.call(body, "duration") && body.duration !== undefined) {
    const dur = Number(body.duration);
    if (!Number.isFinite(dur) || dur < 15) {
      throw new Error("Durée invalide.");
    }
    sanitized.duration = Math.round(dur);
  }

  const effectiveBaseRef = hasPriceUpdate
    ? sanitized.price
    : Math.max(0, Number(existingService?.price) || 0);

  const sourceOptions = hasOptionsUpdate
    ? body.options
    : hasPriceUpdate && Array.isArray(existingService?.options)
    ? existingService.options
    : null;

  if (Array.isArray(sourceOptions)) {
    const normalizedOptions = sourceOptions.map((opt) => {
      if (!isLengthOption(opt) || !Array.isArray(opt.choices) || opt.choices.length === 0) {
        return opt;
      }

      const totals = opt.choices.map((c) => getEffectiveChoiceTotal(c, effectiveBaseRef));
      const minTotal = Math.min(...totals);
      sanitized.price = minTotal;

      return {
        name: opt.name || "Longueur souhaitée",
        required: opt.required ?? true,
        choices: opt.choices.map((c, idx) => {
          const total = totals[idx];
          const cleanName = stripPriceFromChoiceLabel(c.name || c.label) || "Longueur";
          return {
            label: formatLengthChoiceLabel(cleanName, total),
            priceDiff: roundPrice(total - minTotal),
            durationDiff: Number(c.durationDiff) || 0,
          };
        }),
      };
    });

    sanitized.options = normalizedOptions;
  }

  return sanitized;
}
