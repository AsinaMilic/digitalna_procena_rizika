"use client";

interface StepperProps {
    step: number;
    setStep: (step: number) => void;
    labels?: string[];
}

export default function Stepper({step, setStep, labels}: StepperProps) {
    return (
        <div className="flex justify-center gap-2 mt-2 mb-2">
            {(labels || Array.from({length: 11})).map((g, idx) => (
                <button
                    key={g ?? idx}
                    className={`h-4 w-4 rounded-full border-2 ${idx === step ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-400'} transition`}
                    style={{outline: idx === step ? '2px solid #2563eb' : 'none'}}
                    onClick={() => setStep(idx)}
                    aria-label={typeof g === 'string' ? g : `Korak ${idx + 1}`}
                />
            ))}
        </div>
    );
}
