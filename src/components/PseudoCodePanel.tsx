import { useMemo, useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import type { FlowChartNodeData } from '../types/flowchart';
import { PseudoCodeConverter, formatPseudoCode } from '../utils/pseudocodeConverter';
import { Code2 } from 'lucide-react';

interface PseudoCodePanelProps {
  nodes: Node<FlowChartNodeData>[];
  edges: Edge[];
  currentNodeId: string | null;
}

export default function PseudoCodePanel({ nodes, edges, currentNodeId }: PseudoCodePanelProps) {
  const pseudoCode = useMemo(() => {
    if (nodes.length === 0) {
      return '';
    }

    const converter = new PseudoCodeConverter(nodes, edges);
    const lines = converter.convert();
    return formatPseudoCode(lines);
  }, [nodes, edges]);

  // Auto-scroll al nodo corrente
  useEffect(() => {
    if (currentNodeId) {
      const element = document.getElementById(`pseudo-${currentNodeId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentNodeId]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <Code2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-800">Pseudocodice</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Code2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Il pseudocodice apparirà qui</p>
              <p className="text-xs mt-1">Aggiungi blocchi al flow chart</p>
            </div>
          </div>
        ) : (
          <pre className="font-mono text-sm leading-relaxed">
            {pseudoCode.split('\n').map((line, index) => {
              // Trova il nodeId per questa linea (se esiste)
              const isCurrentLine = currentNodeId && line.includes(currentNodeId);

              return (
                <div
                  key={index}
                  id={`pseudo-line-${index}`}
                  className={`px-2 py-1 rounded ${
                    isCurrentLine
                      ? 'bg-yellow-100 border-l-4 border-yellow-500 font-bold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-gray-400 select-none mr-4">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-gray-800">{line || ' '}</span>
                </div>
              );
            })}
          </pre>
        )}
      </div>

      <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-200">
        <h3 className="text-xs font-bold text-indigo-800 mb-1">
          📚 Convenzioni Pseudocodice
        </h3>
        <ul className="text-xs text-indigo-700 space-y-1">
          <li><strong>INIZIO</strong> / <strong>FINE</strong>: delimitano il programma</li>
          <li><strong>LEGGI</strong> variabile: input dall'utente</li>
          <li><strong>SCRIVI</strong> espressione: output all'utente</li>
          <li><strong>SE</strong> condizione <strong>ALLORA</strong> ... <strong>FINE_SE</strong></li>
          <li><strong>MENTRE</strong> condizione <strong>ESEGUI</strong> ... <strong>FINE_MENTRE</strong></li>
          <li><strong>PER</strong> var DA ... A ... <strong>ESEGUI</strong> ... <strong>FINE_PER</strong></li>
        </ul>
      </div>
    </div>
  );
}
