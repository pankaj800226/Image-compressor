import { useEffect, useState, type ChangeEvent } from "react";

type ImageFormat = "image/jpeg" | "image/png";
type ThemeMode = "light" | "dark";

interface ImageInfo {
  url: string;
  size: string;
  name?: string;
}

const ImageCompress = () => {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState<number>(0.6);
  const [format, setFormat] = useState<ImageFormat>("image/jpeg");

  // ✅ FIX: read theme before first render
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "light";
  });

  /* ---------------- THEME ---------------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  /* ---------------- IMAGE ---------------- */
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setOriginal({
      url: URL.createObjectURL(selected),
      size: (selected.size / 1024 / 1024).toFixed(2),
      name: selected.name,
    });
  };

  useEffect(() => {
    if (file) compressImage(file);
  }, [file, quality, format]);

  const compressImage = (file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const MAX_WIDTH = 1200;
      const scale = Math.min(1, MAX_WIDTH / img.width);

      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // JPG background fix
      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setCompressed({
            url: URL.createObjectURL(blob),
            size: (blob.size / 1024 / 1024).toFixed(2),
          });
        },
        format,
        format === "image/jpeg" ? quality : undefined
      );
    };
  };

  const extension = format === "image/png" ? "png" : "jpg";

  return (
    <div className="page">
      {/* background bubbles */}
      <div className="bubble b1" />
      <div className="bubble b2" />
      <div className="bubble b3" />

      <div className="card">
        <div className="top">
          <h1>🖼️ Image Compressor</h1>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>

        <label className="upload">
          Upload Image
          <input type="file" accept="image/*" hidden onChange={handleImage} />
        </label>

        <div className="format">
          <label>
            <input
              type="radio"
              name="format"
              checked={format === "image/jpeg"}
              onChange={() => setFormat("image/jpeg")}
            />
            JPG
          </label>

          <label>
            <input
              type="radio"
              name="format"
              checked={format === "image/png"}
              onChange={() => setFormat("image/png")}
            />
            PNG
          </label>
        </div>

        <div className="quality">
          <span>Quality: {quality}</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={quality}
            disabled={format === "image/png"}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>

        {original && compressed && (
          <div className="preview">
            <div className="box">
              <h3>Original</h3>
              <img src={original.url} />
              <p>{original.size} MB</p>
            </div>

            <div className="box highlight">
              <h3>Compressed</h3>
              <img src={compressed.url} />
              <p>{compressed.size} MB</p>
              <a
                href={compressed.url}
                download={`compressed.${extension}`}
              >
                Download {extension.toUpperCase()}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompress;
