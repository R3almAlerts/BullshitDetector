import { useState } from 'react';
import { Modal, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { CheckCircle2, Search, TrendingUp, History } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Welcome to Bullshit Detector', icon: CheckCircle2, content: 'Your AI-powered tool for detecting misinformation and bias in text content.' },
    { title: 'Choose Your Mode', icon: Search, content: 'Voter Mode for quick fact-checking or Professional Mode for detailed analysis.' },
    { title: 'Key Features', icon: TrendingUp, content: 'AI-powered analysis, bias detection, and sentiment tracking across social media.' },
    { title: 'Get Started', icon: History, content: "You're all set! Start analyzing claims or exploring sentiment on any topic." },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="lg" showCloseButton={false}>
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStep.title}</h3>
          <p className="text-gray-700 dark:text-gray-300 mt-4">{currentStep.content}</p>
        </div>

        <div className="flex justify-center gap-2 pb-4">
          {steps.map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${index === step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
          ))}
        </div>

        <ModalFooter>
          {step < steps.length - 1 && <Button variant="ghost" onClick={handleSkip}>Skip</Button>}
          <Button onClick={handleNext}>{step < steps.length - 1 ? 'Next' : 'Get Started'}</Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
