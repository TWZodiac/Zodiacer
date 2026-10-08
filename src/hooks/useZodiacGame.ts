import { useState, useMemo } from 'react';
import {
    QuestionData,
    SIGNS,
    calculateBayesianUpdateSingle,
    getNextQuestion
} from '../lib/engine';

export type GameStatus = "idle" | "playing" | "finished";

export interface HistoryItem {
    question: QuestionData;
    answerIds: string[]; // single
    priorsBefore: number[]; // to support undo
}

const INITIAL_PRIORS = Array(12).fill(1 / 12);
const MAX_QUESTIONS = 20;
const CONFIDENCE_THRESHOLD = 0.85;

export function useZodiacGame(allQuestions: QuestionData[]) {
    const [status, setStatus] = useState<GameStatus>("idle");
    const [priors, setPriors] = useState<number[]>(INITIAL_PRIORS);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<QuestionData[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);

    const startGame = () => {
        setStatus("playing");
        setPriors(INITIAL_PRIORS);
        setHistory([]);
        setAvailableQuestions([...allQuestions]);

        // Pick first question
        const firstQ = getNextQuestion(INITIAL_PRIORS, allQuestions);
        setCurrentQuestion(firstQ);
        if (firstQ) {
            setAvailableQuestions(prev => prev.filter(q => q.id !== firstQ.id));
        }
    };

    const handleAnswer = (answerIds: string[]) => {
        if (!currentQuestion) return;

        const priorsBefore = [...priors];
        let newPriors: number[] = [...priors];

        if (answerIds.length > 0) { // If not skipped or not sure
            const ansId = answerIds[0];
            newPriors = calculateBayesianUpdateSingle(priors, currentQuestion.weights[ansId], 1.0);
        }

        setPriors(newPriors);
        const newHistory = [...history, { question: currentQuestion, answerIds, priorsBefore }];
        setHistory(newHistory);

        checkEndCondition(newPriors, newHistory);
    };

    const skipQuestion = () => {
        if (!currentQuestion) return;
        const priorsBefore = [...priors];
        const newHistory = [...history, { question: currentQuestion, answerIds: [], priorsBefore }];
        setHistory(newHistory);
        checkEndCondition(priors, newHistory);
    };

    const checkEndCondition = (currentP: number[], h: HistoryItem[]) => {
        const maxProb = Math.max(...currentP);

        if (h.length >= MAX_QUESTIONS || maxProb >= CONFIDENCE_THRESHOLD) {
            setCurrentQuestion(null);
            setStatus("finished");
        } else {
            const nextQ = getNextQuestion(currentP, availableQuestions);
            setCurrentQuestion(nextQ);
            if (nextQ) {
                setAvailableQuestions(prev => prev.filter(q => q.id !== nextQ.id));
            } else {
                setStatus("finished");
            }
        }
    };

    const undo = () => {
        if (history.length === 0) return;
        if (status === "finished") setStatus("playing");

        const lastHistoryItem = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setPriors(lastHistoryItem.priorsBefore);

        // Restore current question to available pool and set the last question as current
        if (currentQuestion) {
            setAvailableQuestions(prev => [...prev, currentQuestion]);
        }
        setCurrentQuestion(lastHistoryItem.question);
    };

    const getTopSigns = (count: number = 3) => {
        const signsWithProbs = SIGNS.map((sign, idx) => ({ sign, prob: priors[idx] }));
        signsWithProbs.sort((a, b) => b.prob - a.prob);
        return signsWithProbs.slice(0, count);
    };

    return {
        status,
        priors,
        history,
        currentQuestion,
        startGame,
        handleAnswer,
        skipQuestion,
        undo,
        getTopSigns,
    };
}
