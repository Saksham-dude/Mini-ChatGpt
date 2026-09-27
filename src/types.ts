export type Mode = "general" | "math" | "writing" | "code" | "explain";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface SubjectMode {
  id: Mode;
  label: string;
  description: string;
  suggestions: string[];
}

export const SUBJECT_MODES: SubjectMode[] = [
  {
    id: "general",
    label: "General help",
    description: "Patient study assistant explaining reasoning and checking understanding.",
    suggestions: [
      "How do I create a study schedule for finals week?",
      "Can you quiz me on core biology concepts?",
      "Help me organize my research project ideas"
    ]
  },
  {
    id: "math",
    label: "Math / problem sets",
    description: "Walks through problems step-by-step with clear explanations.",
    suggestions: [
      "Solve step-by-step: 3x² - 12x + 9 = 0",
      "Explain the intuitive meaning of a derivative",
      "Help me prove that the sum of angles in a triangle is 180°"
    ]
  },
  {
    id: "writing",
    label: "Essays / writing",
    description: "Feedback on structure, thesis, clarity, and argument without doing the writing for you.",
    suggestions: [
      "Critique my thesis statement: 'Social media affects sleep patterns'",
      "How do I write a compelling essay conclusion?",
      "Check my paragraph transition for flow and coherence"
    ]
  },
  {
    id: "code",
    label: "Coding",
    description: "Debugging, code explanations, and programming guidance.",
    suggestions: [
      "Why am I getting an 'Unhandled Promise Rejection' in JS?",
      "Explain how binary search algorithm works with an example",
      "How do I optimize a nested loop array search in TypeScript?"
    ]
  },
  {
    id: "explain",
    label: "Explain a concept",
    description: "Simplifies complex academic topics with analogies and real-world examples.",
    suggestions: [
      "Explain Quantum Entanglement like I'm 15",
      "How does inflation work in economics?",
      "Explain how photosynthesis works step by step"
    ]
  }
];
