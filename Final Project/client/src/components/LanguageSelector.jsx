import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector({ style = {} }) {
  const { lang, setLang } = useLanguage();

  const options = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(6px)',
        borderRadius: '50px',
        padding: '2px 4px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        ...style
      }}
      title="Select Language / भाषा निवडा / भाषा चुनें"
    >
      <span style={{ fontSize: '.75rem', padding: '0 4px', opacity: 0.85 }}>🌐</span>
      {options.map((opt) => {
        const isActive = lang === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLang(opt.code)}
            style={{
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? '#1B5E20' : '#fff',
              border: 'none',
              borderRadius: '50px',
              padding: '3px 9px',
              fontSize: '.74rem',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              transition: 'all .15s ease',
              outline: 'none',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none'
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
