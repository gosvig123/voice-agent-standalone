import { UI_TEXT } from '../utils/constants';

export const AppHeader = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative px-6 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 animate-fade-in">
          {UI_TEXT.header.title}
        </h1>
        <p className="text-xl opacity-90 max-w-2xl mx-auto animate-slide-up">
          {UI_TEXT.header.subtitle}
        </p>
      </div>
    </header>
  );
};