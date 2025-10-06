
export const speak = (text: string, lang = 'en-US') => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  } else {
    console.error("Web Speech API not supported in this browser.");
    alert("Sorry, your browser does not support text-to-speech.");
  }
};
