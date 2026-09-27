// Utility to clean markdown text for Speech Synthesis
export function cleanTextForSpeech(markdown: string): string {
  if (!markdown) return "";
  
  // Replace code blocks with a short note
  let text = markdown.replace(/```[\s\S]*?```/g, " code block omitted. ");
  
  // Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, "$1");
  
  // Remove markdown headers (#, ##, ###)
  text = text.replace(/^#+\s+/gm, "");
  
  // Remove bold/italic formatting
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*]+)\*/g, "$1");

  // Remove list bullet signs
  text = text.replace(/^[\s]*[-*]\s+/gm, "");
  
  // Clean up excessive whitespace or linebreaks
  text = text.replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();
  
  return text;
}
