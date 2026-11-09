export interface SpeechCurvePoint {
  intensityDb: number;
  percent: number;
}

// Radio máximo de (alpha, beta) que garantiza monotonía en Fritsch–Carlson.
const MONOTONE_TANGENT_LIMIT = 3;

/**
 * Pendientes de Fritsch–Carlson: la curva pasa por cada medición sin pasarse de los valores
 * medidos, se aplana en el máximo y conserva el rollover (caída después del máximo).
 * Los extremos van con pendiente 0 para que la curva entre y salga en "S".
 */
function getMonotoneTangents(points: SpeechCurvePoint[]): number[] {
  const secants = points.slice(1).map((point, index) => {
    const previous = points[index];
    return (point.percent - previous.percent) / (point.intensityDb - previous.intensityDb);
  });
  const tangents = points.map((_, index) => {
    if (index === 0 || index === points.length - 1) return 0;
    const before = secants[index - 1];
    const after = secants[index];
    if (before * after <= 0) return 0;
    return (before + after) / 2;
  });
  secants.forEach((secant, index) => {
    if (secant === 0) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }
    const alpha = tangents[index] / secant;
    const beta = tangents[index + 1] / secant;
    const magnitude = alpha * alpha + beta * beta;
    if (magnitude > MONOTONE_TANGENT_LIMIT ** 2) {
      const scale = MONOTONE_TANGENT_LIMIT / Math.sqrt(magnitude);
      tangents[index] = scale * alpha * secant;
      tangents[index + 1] = scale * beta * secant;
    }
  });
  return tangents;
}

function interpolateHermite(
  start: SpeechCurvePoint,
  end: SpeechCurvePoint,
  startTangent: number,
  endTangent: number,
  intensityDb: number,
): number {
  const width = end.intensityDb - start.intensityDb;
  const t = (intensityDb - start.intensityDb) / width;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * start.percent +
    (t3 - 2 * t2 + t) * width * startTangent +
    (-2 * t3 + 3 * t2) * end.percent +
    (t3 - t2) * width * endTangent
  );
}

/** Muestrea la curva monótona que pasa por los nodos, cada `stepDb`, incluyendo el último nodo. */
export function sampleMonotoneCurve(nodes: SpeechCurvePoint[], stepDb: number): SpeechCurvePoint[] {
  const tangents = getMonotoneTangents(nodes);
  const curve: SpeechCurvePoint[] = [];
  nodes.slice(1).forEach((end, index) => {
    const start = nodes[index];
    for (
      let intensityDb = start.intensityDb;
      intensityDb < end.intensityDb;
      intensityDb += stepDb
    ) {
      curve.push({
        intensityDb,
        percent: interpolateHermite(start, end, tangents[index], tangents[index + 1], intensityDb),
      });
    }
  });
  const last = nodes[nodes.length - 1];
  curve.push({ intensityDb: last.intensityDb, percent: last.percent });
  return curve;
}
