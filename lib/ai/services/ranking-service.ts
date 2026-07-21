export interface ScoreWeights {
  semantic: number
  popularity: number
  stock: number
  promotion: number
}

export interface CandidateItem {
  id: string
  entityId: string
  similarity: number        // Similitud de coseno (0.0 a 1.0)
  popularityScore: number  // Score de popularidad (0.0 a 1.0)
  stockScore: number       // Score de disponibilidad (0.0 a 1.0)
  promotionScore: number   // Score de promoción (0.0 a 1.0)
  details: any             // Entidad completa para retornar
}

export interface RankedItem extends CandidateItem {
  compositeScore: number
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  semantic: 0.65,
  popularity: 0.15,
  stock: 0.10,
  promotion: 0.10
}

/**
 * Servicio de Ordenamiento y Re-Ranking Computado
 */
export class RankingService {
  /**
   * Ordena una lista de candidatos utilizando una combinación lineal ponderada
   */
  public static rank(
    candidates: CandidateItem[],
    customWeights?: Partial<ScoreWeights>,
    topN: number = 5
  ): RankedItem[] {
    const weights: ScoreWeights = {
      ...DEFAULT_WEIGHTS,
      ...customWeights
    }

    // Normalizar pesos para asegurar que sumen 1.0
    const totalWeight = weights.semantic + weights.popularity + weights.stock + weights.promotion
    const normWeights: ScoreWeights = {
      semantic: weights.semantic / totalWeight,
      popularity: weights.popularity / totalWeight,
      stock: weights.stock / totalWeight,
      promotion: weights.promotion / totalWeight
    }

    const ranked: RankedItem[] = candidates.map(candidate => {
      // Cálculo del score compuesto híbrido
      const compositeScore = 
        (candidate.similarity * normWeights.semantic) +
        (candidate.popularityScore * normWeights.popularity) +
        (candidate.stockScore * normWeights.stock) +
        (candidate.promotionScore * normWeights.promotion)

      return {
        ...candidate,
        compositeScore: parseFloat(compositeScore.toFixed(4))
      }
    })

    // Ordenar descendente por el score compuesto
    return ranked
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, topN)
  }
}
