import { motion } from "framer-motion";

interface ImageZoomProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageZoom({ imageUrl, onClose }: ImageZoomProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="max-h-[90vh] w-[90%] max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <img
          src={imageUrl}
          alt="entry zoom"
          className="h-full w-full object-contain"
        />
      </div>
    </motion.div>
  );
}
