import { CircleX } from 'lucide-react';

type FormErrorProps = {
  message: string;
};

const FormError = ({ message }: FormErrorProps) => {
  return (
    <div className="mb-4 flexCol rounded-lg border border-red-300 bg-red-50 px-4 py-3 shadow-sm">
      <CircleX className="h-5 w-5 text-red-500 mb-1" />
      <p className="font-semibold text-black">Server Error</p>
      <p className="text-sm text-red-600 text-center">{message}</p>
      <p className="text-sm text-gray-700 mt-1">Please try again</p>
    </div>
  );
};

export default FormError;
