export default function Spinner() {
  return (
    <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-700">Боловсруулж байна...</p>
      </div>
    </div>
  );
}
