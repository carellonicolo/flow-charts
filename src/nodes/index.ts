import { StartNode, EndNode, ProcessNode, DecisionNode, InputNode, OutputNode, CommentNode } from './CustomNodes';

export const nodeTypes = {
    start: StartNode,
    end: EndNode,
    process: ProcessNode,
    decision: DecisionNode,
    input: InputNode,
    output: OutputNode,
    comment: CommentNode,
};
