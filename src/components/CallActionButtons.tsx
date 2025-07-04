import { UI_TEXT } from '../utils/constants';

interface CallActionButtonsProps {
  onStartSDRCall: () => void;
  onStartRecruiterCall: () => void;
}

export const CallActionButtons = ({ onStartSDRCall, onStartRecruiterCall }: CallActionButtonsProps) => {
  return (
    <div className="glass-card p-8 mt-8">
      <h3 className="text-2xl font-semibold mb-6 text-gradient">
        {UI_TEXT.dynamicData.title}
      </h3>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={onStartSDRCall}
          className="btn-primary flex-1 min-w-[280px]"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🎯</span>
            {UI_TEXT.dynamicData.sdrButton}
          </span>
        </button>
        <button
          onClick={onStartRecruiterCall}
          className="btn-primary flex-1 min-w-[280px]"
        >
          <span className="flex items-center justify-center gap-2">
            <span>👔</span>
            {UI_TEXT.dynamicData.recruiterButton}
          </span>
        </button>
      </div>
      <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
        <strong>{UI_TEXT.dynamicData.proTip}</strong>
      </p>
    </div>
  );
};