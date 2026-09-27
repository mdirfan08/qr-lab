interface QRPreviewProps {
  svg: string;
  size?: number;
  scanning?: boolean;
  loading?: boolean;
}

export function QRPreview({ svg, size = 280, scanning = false, loading = false }: QRPreviewProps) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-white shrink-0"
      style={{ width: size, height: size }}
    >
      {svg ? (
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full transition-opacity duration-150"
          style={{ opacity: loading ? 0.55 : 1 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-base-DEFAULT/40 text-xs">
          Preview
        </div>
      )}
      {scanning && (
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden rounded-2xl">
          <div
            className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-accent/25 to-transparent"
            style={{ animation: "scanline 2.6s ease-in-out infinite" }}
          />
        </div>
      )}
    </div>
  );
}
