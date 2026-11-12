// Draws CloudPrep's app icon, Android adaptive-icon layers and splash image as PNGs.
// Run from the project root: swift scripts/generate-icons.swift
import AppKit

let skyLight = NSColor(srgbRed: 0.055, green: 0.647, blue: 0.914, alpha: 1)  // sky-500
let skyDark = NSColor(srgbRed: 0.012, green: 0.412, blue: 0.631, alpha: 1)   // sky-700

/// A cloud with a check mark, drawn into `box` (the artwork's bounding square).
func drawArtwork(in box: CGRect, cloud: NSColor, check: NSColor?) {
  let w = box.width
  let x = box.minX, y = box.minY
  let cloudPath = NSBezierPath()
  cloudPath.append(NSBezierPath(roundedRect: CGRect(x: x + 0.08 * w, y: y + 0.22 * w, width: 0.84 * w, height: 0.30 * w), xRadius: 0.15 * w, yRadius: 0.15 * w))
  cloudPath.append(NSBezierPath(ovalIn: CGRect(x: x + 0.18 * w, y: y + 0.30 * w, width: 0.34 * w, height: 0.34 * w)))
  cloudPath.append(NSBezierPath(ovalIn: CGRect(x: x + 0.36 * w, y: y + 0.34 * w, width: 0.44 * w, height: 0.44 * w)))
  cloud.setFill()
  cloudPath.fill()
  guard let check else { return }
  let mark = NSBezierPath()
  mark.move(to: CGPoint(x: x + 0.37 * w, y: y + 0.42 * w))
  mark.line(to: CGPoint(x: x + 0.47 * w, y: y + 0.32 * w))
  mark.line(to: CGPoint(x: x + 0.66 * w, y: y + 0.53 * w))
  mark.lineWidth = 0.065 * w
  mark.lineCapStyle = .round
  mark.lineJoinStyle = .round
  check.setStroke()
  mark.stroke()
}

func png(_ path: String, size: Int = 1024, draw: (CGRect) -> Void) {
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  draw(CGRect(x: 0, y: 0, width: size, height: size))
  NSGraphicsContext.restoreGraphicsState()
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
  print("wrote \(path)")
}

func gradient(_ rect: CGRect) {
  NSGradient(starting: skyLight, ending: skyDark)!.draw(in: rect, angle: -90)
}

/// The middle part of the canvas: Android keeps only the central 66% of an adaptive icon visible.
func inset(_ rect: CGRect, _ fraction: CGFloat) -> CGRect {
  rect.insetBy(dx: rect.width * fraction, dy: rect.height * fraction)
}

// iOS and the generic icon: full-bleed, opaque (the system applies the rounded mask).
png("assets/images/icon.png") { rect in
  gradient(rect)
  drawArtwork(in: inset(rect, 0.12), cloud: .white, check: skyDark)
}
// Android adaptive icon layers.
png("assets/images/android-icon-background.png") { rect in gradient(rect) }
png("assets/images/android-icon-foreground.png") { rect in
  drawArtwork(in: inset(rect, 0.22), cloud: .white, check: skyDark)
}
png("assets/images/android-icon-monochrome.png") { rect in
  drawArtwork(in: inset(rect, 0.22), cloud: .white, check: nil)
}
// Splash: artwork on transparency; the background colour comes from app.json.
png("assets/images/splash-icon.png") { rect in
  drawArtwork(in: rect, cloud: .white, check: skyDark)
}
