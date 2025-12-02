import { UserPlus, StretchHorizontal, FileSpreadsheet, Check } from 'lucide-react';

const stepsConfig = [
  {
    index: 0,
    key: 'ConfirmClient',
    label: 'Confirm Client',
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    index: 1,
    key: 'EditProducts',
    label: 'Edit Products',
    icon: <StretchHorizontal className="h-5 w-5" />,
  },
  {
    index: 2,
    key: 'InvoiceSummary',
    label: 'Invoice Summary',
    icon: <FileSpreadsheet className="h-5 w-5" />,
  },
] as const;

export type Steps = (typeof stepsConfig)[number]['key'];

type StepIndicatorProps = {
  activeStep: Steps;
};

const StepIndicator = ({ activeStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-evenly gap-4 w-full md:max-w-[600px] py-4 md:py-6 mx-auto bg-mv-orange/10 md:bg-mv-orange/0">
      <div className="relative w-10/12 flex flex-row justify-between -translate-y-1">
        <div className="absolute w-21/24 top-7 md:top-6.75 left-5 bg-gray-300 h-0.5 z-0" />

        {stepsConfig.map((step) => {
          const isActive = activeStep === step.key;
          const isComplete = stepsConfig.findIndex((step) => step.key === activeStep) > step.index;

          return (
            <div key={step.key} className="min-h-[70px] md:min-h-full flex flex-col items-center z-1">
              <div
                className={`flex items-center justify-center rounded-full h-14 w-14 border-8 border-[#FDF2E8] md:border-gray-50
                ${isActive ? 'bg-mv-orange text-white' : 'bg-gray-200 text-gray-400'}
                ${isComplete ? 'bg-green-500 text-green-100' : ''}
                transition-colors duration-200`}
              >
                {isComplete ? <Check className="h-5 w-5" /> : step.icon}
              </div>

              <span
                className={`mt-0 max-w-[65px] md:max-w-full text-center text-sm md:text-sm font-medium
                  ${isActive ? 'text-mv-orange' : 'text-gray-400'}
                  ${isComplete ? 'text-green-600' : ''}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
