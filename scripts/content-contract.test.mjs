import assert from "node:assert/strict";
import { validateCourse, validateSourceCourse } from "./content-contract.mjs";

const codeExercise = {
  id: "saludo",
  type: "code",
  title: "Un saludo",
  prompt: "Muestra un saludo.",
  starter: "print(\"Hola\")",
  hints: [],
  check: '_output == "Hola"',
  success: "Mostraste el saludo.",
  retry: "Revisa la salida.",
};

const choiceExercise = {
  id: "asignacion",
  type: "choice",
  title: "Una asignación",
  prompt: "¿Qué hace edad = 7?",
  code: "edad = 7",
  hints: ["Piensa en el signo igual."],
  options: [
    { id: "asigna", text: "Guarda 7 en edad" },
    { id: "compara", text: "Compara edad con 7", retry: "Busca ==." },
  ],
  answerId: "asigna",
  retry: "Revisa el significado de =.",
  explanation: "Asigna un valor a una variable.",
};

function course(exercises) {
  return {
    schemaVersion: 1,
    id: "python-fundamentos",
    title: "Python Fundamentos",
    description: "Aprende Python.",
    topics: [{
      id: "valores-variables",
      title: "Valores y variables",
      summary: "Guarda datos.",
      explanation: ["Una variable guarda un valor."],
      example: "edad = 7",
      takeaway: "= asigna.",
      exercises,
    }],
  };
}

assert.doesNotThrow(() => validateSourceCourse(course([codeExercise, choiceExercise]), "python-fundamentos"));
assert.doesNotThrow(() => validateCourse(course([{ ...codeExercise, type: undefined }]), "python-fundamentos"));
assert.throws(
  () => validateSourceCourse(course([{ ...codeExercise, type: undefined }]), "python-fundamentos"),
  /exercise\.type/,
);
assert.throws(
  () => validateSourceCourse(course([{ ...choiceExercise, type: "quiz" }]), "python-fundamentos"),
  /exercise\.type/,
);
assert.throws(
  () => validateSourceCourse(course([{ ...choiceExercise, starter: "" }]), "python-fundamentos"),
  /no es válido aquí/,
);
assert.throws(
  () => validateSourceCourse(course([{ ...choiceExercise, code: "" }]), "python-fundamentos"),
  /exercise\.code/,
);
assert.throws(
  () => validateSourceCourse(course([{ ...choiceExercise, answerId: "missing" }]), "python-fundamentos"),
  /answerId/,
);

console.log("Source and historical exercise contracts validated.");
