import Foundation
import AVFoundation
import AppKit

let mapping: [String: String] = [
    "boho braids 2.mov": "boho-braids-2",
    "boho braids 3.mov": "boho-braids-3",
    "boho braids.mov": "boho-braids",
    "cornrow rouge.mov": "cornrow-rouge",
    "cornrows 2.mov": "cornrows-2",
    "fulani 2.mov": "fulani-2",
    "fulani 3.mov": "fulani-3",
    "fulani 4.mov": "fulani-4",
    "fulani 5.mov": "fulani-5",
    "fulani 6.mov": "fulani-6",
    "fulani sans rajout.mov": "fulani-sans-rajout",
    "fulani sup boucle 2(part 2).mov": "fulani-sup-boucle-2-part-2",
    "fulani sup boucle 2.mov": "fulani-sup-boucle-2",
    "fulani sup boucle 3.mov": "fulani-sup-boucle-3",
    "fulani sup boucle.mov": "fulani-sup-boucle",
    "fulani sur mesure.mov": "fulani-sur-mesure",
    "fulani.mov": "fulani",
    "knotless large.mov": "knotless-large",
    "knotless melange couleur.mov": "knotless-melange-couleur",
    "knotless.mov": "knotless",
    "natte collé sans rajout 2.mov": "natte-collee-sans-rajout-2",
    "natte collé sans rajout 3.mov": "natte-collee-sans-rajout-3",
    "natte collé sans rajout.mov": "natte-collee-sans-rajout",
    "small knotless.mov": "small-knotless",
    "soft locks (part 2).mov": "soft-locks-part-2",
    "soft locs.mov": "soft-locs",
    "vanille 2.mov": "vanille-2",
    "vanille sans rajout .mov": "vanille-sans-rajout",
    "vanille.mov": "vanille"
]

let inputDir = "photos YDM/photos et video pour galerie "
let outputDir = "public/images/realisations"

let fm = FileManager.default

for (file, slug) in mapping {
    let inputPath = (inputDir as NSString).appendingPathComponent(file)
    let outputPath = (outputDir as NSString).appendingPathComponent("\(slug)-still.jpeg")
    
    guard fm.fileExists(atPath: inputPath) else {
        print("File not found: \(inputPath)")
        continue
    }
    
    let url = URL(fileURLWithPath: inputPath)
    let asset = AVAsset(url: url)
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.requestedTimeToleranceBefore = .zero
    generator.requestedTimeToleranceAfter = .zero
    
    let time = CMTime(seconds: 1.0, preferredTimescale: 600)
    do {
        let cgImage = try generator.copyCGImage(at: time, actualTime: nil)
        let bitmapRep = NSBitmapImageRep(cgImage: cgImage)
        guard let jpegData = bitmapRep.representation(using: .jpeg, properties: [.compressionFactor: 0.88]) else {
            print("Failed JPEG encoding for \(slug)")
            continue
        }
        try jpegData.write(to: URL(fileURLWithPath: outputPath))
        print("Generated poster: \(outputPath)")
    } catch {
        print("Error processing \(file): \(error)")
    }
}

print("All posters extracted successfully.")
