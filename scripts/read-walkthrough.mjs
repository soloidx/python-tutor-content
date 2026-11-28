import { readFile, realpath } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { validateWalkthrough } from "./walkthrough.js";

async function readInside(base, reference) {
  const file = await realpath(resolve(base, reference));
  if (!file.startsWith(base + sep)) throw new Error(`Recorrido fuera del árbol de contenido: ${reference}`);
  return readFile(file, "utf8");
}

export async function readWalkthrough(root, reference, example, { lesson = false } = {}) {
  if (typeof reference !== "string" || !(lesson ? /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\\%?#:]+\.json$/.test(reference) : /^walkthroughs\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(reference))) {
    throw new Error("Referencia de recorrido inválida");
  }
  const base = await realpath(resolve(root, "content"));
  const walkthrough = JSON.parse(await readInside(base, reference));
  if (walkthrough?.type === "svg") {
    const graphics = walkthrough.graphics;
    if (!graphics || typeof graphics !== "object" || Array.isArray(graphics)) {
      throw new Error("El recorrido SVG requiere graphics");
    }
    const sources = new Map();
    for (const [id, path] of Object.entries(graphics)) {
      if (typeof path !== "string" || !/^walkthroughs\/graphics\/[a-z0-9]+(?:-[a-z0-9]+)*\.svg$/.test(path)) {
        throw new Error(`Gráfico inválido para ${id}: usa walkthroughs/graphics/<slug>.svg`);
      }
      if (!sources.has(path)) sources.set(path, await readInside(base, path));
      graphics[id] = sources.get(path);
    }
  }
  return validateWalkthrough(walkthrough, example);
}
