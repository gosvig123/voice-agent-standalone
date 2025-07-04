import { UI_TEXT } from '../utils/constants';

interface ErrorDisplayProps {
  error: string;
  connectionAttempts: number;
}

export const ErrorDisplay = ({ error, connectionAttempts }: ErrorDisplayProps) => {
  return (
    <div className="glass-card p-6 border-red-200 bg-red-50/50 animate-slide-up">
      <h3 className="text-lg font-semibold mb-3 text-red-600">
        {UI_TEXT.error.title}
      </h3>
      <div className="space-y-2">
        <p className="text-red-700">
          <strong>{UI_TEXT.error.errorLabel}</strong> {error}
        </p>
        {connectionAttempts > 0 && (
          <p className="text-red-600">
            <strong>{UI_TEXT.error.attemptsLabel}</strong> {connectionAttempts}/3
          </p>
        )}
      </div>
    </div>
  );
};