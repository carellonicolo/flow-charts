import { StartNode, EndNode, ProcessNode, DecisionNode, InputNode, OutputNode, CommentNode, DeclareNode } from './CustomNodes';

export const nodeTypes = {
    start: StartNode,
    end: EndNode,
    declare: DeclareNode,
    process: ProcessNode,
    decision: DecisionNode,
    input: InputNode,
    output: OutputNode,
    comment: CommentNode,
};
