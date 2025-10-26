import { UserPlus, StretchHorizontal, FileText, Check } from 'lucide-react';

const stepsConfig = [
  {
    index: 0,
    key: 'AddClient',
    label: 'Add Client',
    icon: <UserPlus className="h-4 w-4 md:h-5 md:w-5" />,
  },
  {
    index: 1,
    key: 'AddProducts',
    label: 'Add Products',
    icon: <StretchHorizontal className="h-4 w-4 md:h-5 md:w-5" />,
  },
  {
    index: 2,
    key: 'QuoteSummary',
    label: 'Quote Summary',
    icon: <FileText className="h-4 w-4 md:h-5 md:w-5" />,
  },
] as const;

export type Steps = (typeof stepsConfig)[number]['key'];

type StepIndicatorProps = {
  activeStep: Steps;
};

const StepIndicator = ({ activeStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-evenly gap-4 w-full md:max-w-[700px] py-4 md:py-6 mx-auto bg-mv-orange/10 md:bg-mv-orange/0">
      {stepsConfig.map((step) => {
        const isActive = activeStep === step.key;
        const isComplete = stepsConfig.findIndex((step) => step.key === activeStep) > step.index;
        return (
          <div key={step.key} className="min-h-[70px] md:min-h-full flex flex-col items-center">
            <div
              className={`flex items-center justify-center rounded-full w-8 h-8 md:h-10 md:w-10
                ${isActive ? 'bg-mv-orange text-white' : 'bg-gray-200 text-gray-400'}
                transition-colors duration-200`}
            >
              {isComplete ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : step.icon}
            </div>
            <span
              className={`mt-2 max-w-[50px] md:max-w-full text-center text-sm md:text-sm font-medium ${isActive ? 'text-mv-orange' : 'text-gray-400'}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
