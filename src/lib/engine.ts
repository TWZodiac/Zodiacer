export type ZodiacSign =
    | "牡羊" | "金牛" | "雙子" | "巨蟹"
    | "獅子" | "處女" | "天秤" | "天蠍"
    | "射手" | "摩羯" | "水瓶" | "雙魚";

export const SIGNS: ZodiacSign[] = [
    "牡羊", "金牛", "雙子", "巨蟹",
    "獅子", "處女", "天秤", "天蠍",
    "射手", "摩羯", "水瓶", "雙魚",
];

export type QuestionType = "boolean" | "single";

export interface QuestionOption {
    id: string;
    text: string;
}

export interface QuestionData {
    id: number;
    type: QuestionType;
    text: string;
    options: QuestionOption[];
    weights: Record<string, number[]>;
    difficulty: number;
    tags: string[];
    info_gain_est_bits: number;
    top3_discriminative: string[];
    ig_rank: number;
}

/**
 * Perform Bayesian update for single/boolean choices
 * P(s|a) = P(s) * P(a|s)^alpha / Z
 */
export function calculateBayesianUpdateSingle(
    priors: number[],
    likelihoods: number[],
    alpha: number = 0.5
): number[] {
    let sum = 0;
    const unnormalized = priors.map((p, idx) => {
        const l = Math.pow(likelihoods[idx], alpha);
        const val = p * l;
        sum += val;
        return val;
    });

    return unnormalized.map((p) => p / sum);
}


export function calculateEntropy(probs: number[]): number {
    return probs.reduce((acc, p) => {
        if (p <= 0) return acc;
        return acc - p * Math.log2(p);
    }, 0);
}

/**
 * Calculates current information gain for a given question based on current priors
 */
export function getInformationGain(priors: number[], q: QuestionData): number {

    // P(a)
    const optionIds = Object.keys(q.weights);
    const pA: Record<string, number> = {};
    optionIds.forEach(optId => {
        const l_a_s = q.weights[optId]; // P(a|s)
        let p_a = 0;
        for (let s = 0; s < 12; s++) {
            p_a += priors[s] * l_a_s[s];
        }
        pA[optId] = p_a;
    });

    let ig = 0;
    for (let s = 0; s < 12; s++) {
        const p_s = priors[s];
        if (p_s === 0) continue;

        for (const optId of optionIds) {
            const p_a_s = q.weights[optId][s];
            if (p_a_s === 0) continue;
            const p_a = pA[optId];
            ig += p_s * p_a_s * Math.log2(p_a_s / p_a);
        }
    }

    return ig;
}

/**
 * Select the next best question based on dynamic Information Gain
 */
export function getNextQuestion(priors: number[], availableQuestions: QuestionData[]): QuestionData | null {
    if (availableQuestions.length === 0) return null;

    let bestIG = -1;
    let bestQ = availableQuestions[0];

    for (const q of availableQuestions) {
        const ig = getInformationGain(priors, q);
        if (ig > bestIG) {
            bestIG = ig;
            bestQ = q;
        }
    }

    return bestQ;
}
