import {
  useEffect,
  useState,
  useCallback,
  type ChangeEvent,
  type JSX,
} from "react";
import { FaCompressAlt, FaMoon, FaSun, FaUpload } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type ImageFormat = "image/jpeg" | "image/png";
type ThemeMode = "light" | "dark";

interface ImageInfo {
  url: string;
  size: string;
  name?: string;
}

const ImageCompress = (): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<ImageInfo | null>(null);
  const [compressed, setCompressed] = useState<ImageInfo | null>(null);
  const [quality, setQuality] = useState<number>(0.6);
  const [format, setFormat] = useState<ImageFormat>("image/jpeg");

  const [customWidth, setCustomWidth] = useState<number>(1200);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "light";
  });

  useEffect((): void => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>): void => {
    const selected: File | undefined = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setOriginal({
      url: URL.createObjectURL(selected),
      size: (selected.size / 1024 / 1024).toFixed(2),
      name: selected.name,
    });
  };

  const compressImage = useCallback(
    (file: File): void => {
      const img: HTMLImageElement = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = (): void => {
        let width: number = img.width;
        let height: number = img.height;

        if (customWidth > 0) {
          if (lockRatio) {
            const ratio: number = img.height / img.width;
            width = customWidth;
            height = Math.round(customWidth * ratio);
          } else if (customHeight > 0) {
            width = customWidth;
            height = customHeight;
          }
        }

        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
        if (!ctx) return;

        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob: Blob | null): void => {
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
    },
    [customWidth, customHeight, lockRatio, format, quality]
  );

  useEffect((): void => {
    if (file) compressImage(file);
  }, [file, compressImage]);

  const extension: string = format === "image/png" ? "png" : "jpg";

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bubble b1" />
      <div className="bubble b2" />
      <div className="bubble b3" />

      <motion.div
        className="card"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="top">
          <h1 className="title">
            <FaCompressAlt className="title-icon" /> Photo
            <span style={{ color: "#ec4899", marginLeft: "12px" }}>Shrink</span>
          </h1>

          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
        </div>

        <div className="preview-layout">
          <motion.div
            className="left-panel"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <label className="upload">
              <FaUpload /> Upload Image
              <input type="file" accept="image/*" hidden onChange={handleImage} />
            </label>

            <div className="format">
              <label>
                <input
                  type="radio"
                  checked={format === "image/jpeg"}
                  onChange={() => setFormat("image/jpeg")}
                /> JPG
              </label>
              <label>
                <input
                  type="radio"
                  checked={format === "image/png"}
                  onChange={() => setFormat("image/png")}
                /> PNG
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

            <div className="resize">
              <h4>Resize Image</h4>
              <div className="resize-inputs">
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                />
                <span>×</span>
                <input
                  type="number"
                  disabled={lockRatio}
                  value={customHeight || ""}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                />
              </div>

              <label className="lock">
                <input
                  type="checkbox"
                  checked={lockRatio}
                  onChange={() => setLockRatio(!lockRatio)}
                />
                Lock Aspect Ratio
              </label>
            </div>
          </motion.div>

          <AnimatePresence>
            {original && compressed && (
              <motion.div
                className="right-panel"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="box"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3>Original</h3>
                  <motion.img
                    src={original.url}
                    alt="Original"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <p>{original.size} MB</p>
                </motion.div>

                <motion.div
                  className="box highlight"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3>Compressed</h3>
                  <motion.img
                    src={compressed.url}
                    alt="Compressed"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <p>{compressed.size} MB</p>
                  <a href={compressed.url} download={`compressed.${extension}`}>
                    Download {extension.toUpperCase()}
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCompress;
