interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">Welcome to Bullshit Detector!</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Choose your mode: <strong>Voter</strong> for simple checks or <strong>Professional</strong> for deep analysis.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}