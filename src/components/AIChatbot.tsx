import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Globe, MessageSquare, Terminal as TermIcon, ShieldAlert } from 'lucide-react';
import { playClickSound } from '../utils/audio';

// Chat translations & responses dictionary
type Language = 'en' | 'es' | 'de' | 'ja' | 'hi';

interface LocalizedContent {
  title: string;
  placeholder: string;
  suggestedQuestions: string[];
  welcomeMsg: string;
  answers: Record<string, string>;
  unknown: string;
}

const LOCALIZATION: Record<Language, LocalizedContent> = {
  en: {
    title: "S.BANK // AI SECURITY CO-PILOT",
    placeholder: "Ask S.BANK AI...",
    suggestedQuestions: [
      "What is Impossible Travel?",
      "Explain LWE Lattice Cryptography",
      "Why was Charlie Zhang suspended?",
      "How does Shor's Algorithm work?"
    ],
    welcomeMsg: "System online. I am S.BANK-AI, your security intelligence agent. How can I assist you with privileged access telemetry today?",
    answers: {
      "travel": "Impossible Travel detection occurs when the same user credentials are used to authenticate from geographically distant locations within an interval that would require travel speeds exceeding a standard commercial airliner (~900 km/h). This triggers auto-suspension to block credential replay attacks.",
      "lwe": "Lattice-Based Cryptography (such as Learning With Errors, or LWE) secures data against future quantum computers by using high-dimensional linear algebra structures. Unlike RSA/ECC, SVP (Shortest Vector Problem) has no known efficient quantum algorithm.",
      "charlie": "Charlie Zhang (VP of Wealth Management) had his credentials auto-suspended because a login attempt from London, UK was recorded just 5 minutes after a login from Chennai, India. This required an impossible speed of 98,530 km/h.",
      "shor": "Shor's Algorithm is a quantum computer algorithm capable of factoring prime numbers and solving discrete logarithms in polynomial time. This renders traditional RSA and Elliptic Curve Cryptography (ECC) insecure, necessitating Post-Quantum (QPC) systems like Dilithium and Kyber.",
      "suspend": "To suspend an account manually, navigate to the 'Manager Mailbox' tab, open the corresponding incident email, and click 'Suspend Account'. This revokes all active corporate banking credentials instantly.",
      "threat": "The SOC is currently monitoring for privilege escalation, off-hours administrative login, high data volume downloads, impossible travel, and untrusted foreign IPs."
    },
    unknown: "Command or query not fully mapped. Telemetry indicates keyword matches: 'travel', 'lwe', 'charlie', 'shor', 'suspend', or 'threat'."
  },
  es: {
    title: "S.BANK // CO-PILOTO DE IA",
    placeholder: "Preguntar a S.BANK AI...",
    suggestedQuestions: [
      "¿Qué es el Viaje Imposible?",
      "Explica la criptografía LWE",
      "¿Por qué se suspendió a Charlie?",
      "¿Cómo funciona Shor?"
    ],
    welcomeMsg: "Sistema en línea. Soy S.BANK-AI, su asistente de seguridad. ¿Cómo puedo ayudarle hoy con la telemetría de acceso?",
    answers: {
      "travel": "El 'Viaje Imposible' se detecta cuando se usan las mismas credenciales desde ubicaciones muy lejanas en un tiempo demasiado corto. Esto requiere velocidades mayores a 900 km/h, sugiriendo robo de sesión.",
      "lwe": "La criptografía basada en redes (como LWE) protege la información contra futuros ataques cuánticos utilizando problemas matemáticos multidimensionales que las computadoras cuánticas no pueden resolver.",
      "charlie": "Las credenciales de Charlie Zhang fueron suspendidas porque inició sesión en Londres 5 minutos después de Chennai (velocidad imposible de 98,530 km/h).",
      "shor": "El algoritmo de Shor es un algoritmo cuántico que puede descifrar RSA y ECC rápidamente. Por eso implementamos Criptografía Post-Cuántica (QPC).",
      "suspend": "Para suspender una cuenta, vaya a la pestaña 'Buzón del Administrador' y haga clic en 'Suspender cuenta'.",
      "threat": "Monitoreamos inicios de sesión fuera de hora, descargas masivas, IPs extranjeras sospechosas y viajes imposibles."
    },
    unknown: "Consulta no mapeada. Use palabras clave como 'travel', 'lwe', 'charlie', 'shor', 'suspend', o 'threat'."
  },
  de: {
    title: "S.BANK // KI-SICHERHEITSASSISTENT",
    placeholder: "Frage S.BANK KI...",
    suggestedQuestions: [
      "Was ist Unmögliche Reise?",
      "Erkläre LWE Gitter-Kryptographie",
      "Warum wurde Charlie gesperrt?",
      "Wie funktioniert Shor-Algorithmus?"
    ],
    welcomeMsg: "System bereit. Ich bin S.BANK-KI. Wie kann ich Sie heute bei der Sicherheitsanalyse unterstützen?",
    answers: {
      "travel": "Eine 'Unmögliche Reise' wird gemeldet, wenn Anmeldungen aus weit entfernten Städten in einem Zeitraum erfolgen, der schneller als ein normales Verkehrsflugzeug (>900 km/h) wäre.",
      "lwe": "Gitterbasierte Kryptographie (wie LWE) schützt Daten vor Quantencomputern, indem sie mathematische Gitterstrukturen nutzt, die nicht effizient geknackt werden können.",
      "charlie": "Charlie Zhangs Account wurde gesperrt, da er sich 5 Minuten nach Chennai in London anmeldete. Das erfordert eine physikalisch unmögliche Reisegeschwindigkeit.",
      "shor": "Der Shor-Algorithmus erlaubt es Quantencomputern, RSA- und ECC-Verschlüsselungen zu knacken. Post-Quanten-Kryptographie (QPC) verhindert dies.",
      "suspend": "Sperren Sie Konten manuell im 'Manager Posteingang' durch Klicken auf 'Konto sperren'.",
      "threat": "Wir überwachen verdächtige IPs, Downloads, Zugriffszeiten und unmögliche Reisemuster."
    },
    unknown: "Anfrage nicht verstanden. Nutzen Sie Stichworte wie 'travel', 'lwe', 'charlie', 'shor', 'suspend', oder 'threat'."
  },
  ja: {
    title: "S.BANK // AI セキュリティ共同操縦士",
    placeholder: "AIアシスタントに質問...",
    suggestedQuestions: [
      "不可能な移動とは何ですか？",
      "格子暗号(LWE)の説明",
      "チャーリーが停止された理由は？",
      "ショアのアルゴリズムの仕組み"
    ],
    welcomeMsg: "システムオンライン。セキュリティAIアシスタントです。本日のアクセス分析についてどのようなサポートが必要ですか？",
    answers: {
      "travel": "「不可能な移動」とは、同一の資格情報が、航空機の速度（時速900km）を超える短時間で地理的に離れた場所から認証された場合に検出され、アカウントを自動停止します。",
      "lwe": "格子暗号（LWEなど）は、高次元の線形代数格子問題を利用し、将来の量子コンピュータによる解読を防ぐポスト量子暗号方式です。",
      "charlie": "チャーリー・チャンのアカウントは、チェンナイでのログインからわずか5分後にロンドンからログインが試行されたため自動停止されました。",
      "shor": "ショアのアルゴリズムは、量子コンピュータ上でRSAや楕円曲線暗号(ECC)を高速に解読できるアルゴリズムで、これに対抗するためにQPCが必要です。",
      "suspend": "手動停止は「管理者メール」タブから該当インシデントを選択し「アカウント一時停止」をクリックしてください。",
      "threat": "時間外アクセス、大量ファイルダウンロード、不審な国外IPアドレス、不可能な移動を監視しています。"
    },
    unknown: "質問を解析できませんでした。「travel」(移動)、「lwe」(格子暗号)、「charlie」(チャーリー)、「shor」(ショア)、「suspend」(停止) などの語句を含めてください。"
  },
  hi: {
    title: "S.BANK // एआई सुरक्षा सहायक",
    placeholder: "एआई से पूछें...",
    suggestedQuestions: [
      "असंभव यात्रा (Impossible Travel) क्या है?",
      "LWE लैटिस क्रिप्टोग्राफी समझाएं",
      "चार्ली झांग को सस्पेंड क्यों किया गया?",
      "शोर का एल्गोरिदम कैसे काम करता है?"
    ],
    welcomeMsg: "सिस्टम ऑनलाइन। मैं S.BANK-AI हूँ। आज मैं आपकी सुरक्षा विश्लेषण में कैसे सहायता कर सकता हूँ?",
    answers: {
      "travel": "असंभव यात्रा तब होती है जब एक ही लॉगिन क्रेडेंशियल का उपयोग व्यावसायिक हवाई जहाज की गति (900 किमी/घंटा) से अधिक तेज़ी से दो दूर-दराज के स्थानों से किया जाता है। सुरक्षा के लिए खाता तुरंत सस्पेंड हो जाता है।",
      "lwe": "लैटिस-बेस्ड क्रिप्टोग्राफी (जैसे LWE) डेटा को भविष्य के क्वांटम कंप्यूटरों से सुरक्षित करती है। यह गणितीय लैटिस का उपयोग करती है जिसे तोड़ना असंभव है।",
      "charlie": "चार्ली झांग का खाता निलंबित किया गया क्योंकि चेन्नई में लॉगिन के ठीक 5 मिनट बाद लंदन से लॉगिन किया गया, जिसके लिए 98,530 किमी/घंटे की गति की आवश्यकता होती।",
      "shor": "शोर का एल्गोरिदम क्वांटम कंप्यूटर के लिए बनाया गया है जो वर्तमान RSA और ECC सुरक्षा को तोड़ सकता है। इसी से बचने के लिए क्वांटम-प्रूफ तकनीक (QPC) आवश्यक है।",
      "suspend": "मैन्युअल रूप से खाता निलंबित करने के लिए 'मैनेजर इनबॉक्स' टैब में जाएं और 'सस्पेंड अकाउंट' बटन पर क्लिक करें।",
      "threat": "हम संदिग्ध आईपी, समय के बाहर लॉगिन, बड़ी मात्रा में डाउनलोड और असंभव यात्राओं की निगरानी करते हैं।"
    },
    unknown: "प्रश्न पूरी तरह समझ नहीं आया। 'travel', 'lwe', 'charlie', 'shor', 'suspend' जैसे कीवर्ड्स का उपयोग करें।"
  }
};

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message when language changes
  useEffect(() => {
    setMessages([
      { sender: 'bot', text: LOCALIZATION[lang].welcomeMsg }
    ]);
  }, [lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    playClickSound();

    const userMsg = text.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');

    // Formulate response
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const content = LOCALIZATION[lang];
      let foundKey = "";

      if (lower.includes('travel') || lower.includes('viaje') || lower.includes('reise') || lower.includes('移動') || lower.includes('यात्रा')) {
        foundKey = "travel";
      } else if (lower.includes('lwe') || lower.includes('lattice') || lower.includes('格子') || lower.includes('लैटिस')) {
        foundKey = "lwe";
      } else if (lower.includes('charlie') || lower.includes('चार्ली')) {
        foundKey = "charlie";
      } else if (lower.includes('shor') || lower.includes('शोर')) {
        foundKey = "shor";
      } else if (lower.includes('suspend') || lower.includes('susc') || lower.includes('सस्पेंड')) {
        foundKey = "suspend";
      } else if (lower.includes('threat') || lower.includes('incident') || lower.includes('amena') || lower.includes('خطر')) {
        foundKey = "threat";
      }

      const botReply = foundKey ? content.answers[foundKey] : content.unknown;
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => { playClickSound(); setIsOpen(true); }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-bg-secondary border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:bg-neon-cyan hover:text-bg-primary transition-all duration-300 flex items-center justify-center pulse-slow"
        title="AI Security Assistant"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-neon-cyan text-[8px] text-bg-primary font-bold items-center justify-center">AI</span>
        </span>
      </button>

      {/* Chat Sidebar/Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[360px] bg-bg-primary/95 border-l border-border-glow/70 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 transform transition-transform duration-300 flex flex-col justify-between ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-border-glow bg-bg-secondary flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-neon-cyan text-glow-cyan" />
            <span className="text-xs font-mono font-bold text-text-bright tracking-wider">
              {LOCALIZATION[lang].title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector dropdown */}
            <div className="relative flex items-center bg-bg-primary border border-border-glow rounded px-1.5 py-0.5">
              <Globe className="w-3.5 h-3.5 text-text-muted mr-1" />
              <select
                value={lang}
                onChange={(e) => { playClickSound(); setLang(e.target.value as Language); }}
                className="bg-transparent text-text-bright text-[10px] font-mono border-none outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="de">DE</option>
                <option value="ja">JA</option>
                <option value="hi">HI</option>
              </select>
            </div>

            <button 
              onClick={() => { playClickSound(); setIsOpen(false); }}
              className="p-1 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-bright"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <span className="text-[9px] text-text-muted mb-1 flex items-center gap-1">
                {msg.sender === 'bot' ? (
                  <>
                    <TermIcon className="w-3 h-3 text-neon-cyan" /> S.BANK_AI
                  </>
                ) : 'OPERATOR'}
              </span>
              <div 
                className={`p-3 rounded text-left ${
                  msg.sender === 'user' 
                    ? 'bg-bg-tertiary border border-neon-cyan text-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.1)]' 
                    : 'bg-bg-secondary border border-border-glow/50 text-text-bright'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="p-3 border-t border-border-glow/30 bg-bg-secondary/40 space-y-1.5">
          <div className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Suggested Security Queries:</div>
          <div className="flex flex-wrap gap-1">
            {LOCALIZATION[lang].suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[10px] text-left py-1 px-2 bg-bg-primary hover:bg-bg-tertiary border border-border-glow hover:border-neon-cyan rounded text-text-bright transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="p-3 border-t border-border-glow bg-bg-secondary flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={LOCALIZATION[lang].placeholder}
            className="flex-1 bg-bg-primary text-text-bright text-xs font-mono border border-border-glow rounded px-3 py-2 outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,243,255,0.2)]"
          />
          <button
            type="submit"
            className="p-2 bg-neon-cyan text-bg-primary hover:bg-bg-primary hover:text-neon-cyan border border-neon-cyan rounded transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </>
  );
};
