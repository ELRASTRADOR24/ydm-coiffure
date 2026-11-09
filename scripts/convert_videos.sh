#!/usr/bin/env bash
set -e

DIR="photos YDM/photos et video pour galerie "
OUT="public/videos/realisations"

mkdir -p "$OUT"

convert_one() {
    src="$1"
    dst="$2"
    if [ ! -f "$OUT/$dst" ]; then
        echo "Converting $src -> $dst ..."
        avconvert -s "$DIR/$src" -p Preset1280x720 -o "$OUT/$dst" --replace
    else
        echo "Already exists: $dst"
    fi
}

convert_one "boho braids.mov" "boho-braids.mp4"
convert_one "boho braids 2.mov" "boho-braids-2.mp4"
convert_one "boho braids 3.mov" "boho-braids-3.mp4"
convert_one "small knotless.mov" "small-knotless.mp4"
convert_one "knotless.mov" "knotless.mp4"
convert_one "knotless large.mov" "knotless-large.mp4"
convert_one "knotless melange couleur.mov" "knotless-melange-couleur.mp4"
convert_one "fulani.mov" "fulani.mp4"
convert_one "fulani 2.mov" "fulani-2.mp4"
convert_one "fulani 3.mov" "fulani-3.mp4"
convert_one "fulani 4.mov" "fulani-4.mp4"
convert_one "fulani 5.mov" "fulani-5.mp4"
convert_one "fulani 6.mov" "fulani-6.mp4"
convert_one "fulani sans rajout.mov" "fulani-sans-rajout.mp4"
convert_one "fulani sup boucle.mov" "fulani-sup-boucle.mp4"
convert_one "fulani sup boucle 2.mov" "fulani-sup-boucle-2.mp4"
convert_one "fulani sup boucle 2(part 2).mov" "fulani-sup-boucle-2-part-2.mp4"
convert_one "fulani sup boucle 3.mov" "fulani-sup-boucle-3.mp4"
convert_one "fulani sur mesure.mov" "fulani-sur-mesure.mp4"
convert_one "vanille.mov" "vanille.mp4"
convert_one "vanille 2.mov" "vanille-2.mp4"
convert_one "vanille sans rajout .mov" "vanille-sans-rajout.mp4"
convert_one "cornrows 2.mov" "cornrows-2.mp4"
convert_one "cornrow rouge.mov" "cornrow-rouge.mp4"
convert_one "natte collé sans rajout.mov" "natte-collee-sans-rajout.mp4"
convert_one "natte collé sans rajout 2.mov" "natte-collee-sans-rajout-2.mp4"
convert_one "natte collé sans rajout 3.mov" "natte-collee-sans-rajout-3.mp4"
convert_one "soft locs.mov" "soft-locs.mp4"
convert_one "soft locks (part 2).mov" "soft-locks-part-2.mp4"

echo "All 29 videos converted to MP4 successfully!"
