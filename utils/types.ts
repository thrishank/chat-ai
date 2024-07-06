import { CoreMessage } from "ai";

export type ExtendedMessage = CoreMessage & {
    id?: number;
    feedback?: boolean;
};

export interface typeHistory {
    id: number;
    message_content: string;
    isAi: boolean;
    feedback: {
        id: number;
        isLiked: boolean;
    };
}