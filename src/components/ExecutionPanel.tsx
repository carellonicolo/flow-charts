import { useEffect, useRef } from 'react';
import type { ExecutionState } from '../types/flowchart';
import { Play, Pause, Square, Terminal } from 'lucide-react';

interface ExecutionPanelProps {
  executionState: ExecutionState;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function ExecutionPanel({
  executionState,
  onRun,
  onPause,
  onResume,
  onStop,
}: ExecutionPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll all'ultimo output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionState.output]);

  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      {/* Header con controlli */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Console Esecuzione</h2>
        </div>

        <div className="flex items-center gap-2">
          {!executionState.isRunning ? (
            <button
              onClick={onRun}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Play className="w-4 h-4" />
              Esegui
            </button>
          ) : (
            <>
              {executionState.isPaused ? (
                <button
                  onClick={onResume}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Play className="w-4 h-4" />
                  Riprendi
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                  <Pause className="w-4 h-4" />
                  Pausa
                </button>
              )}
              <button
                onClick={onStop}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Output */}
      <div ref={outputRef} className="flex-1 overflow-auto p-4 bg-gray-900 font-mono text-sm">
        {executionState.output.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Premi Esegui per avviare il programma</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {executionState.output.map((line, index) => (
              <div key={index} className="text-green-400">
                {line}
              </div>
            ))}
            {executionState.isRunning && !executionState.error && (
              <div className="text-yellow-400 animate-pulse">▊</div>
            )}
            {executionState.error && (
              <div className="text-red-400 font-bold mt-2">
                ❌ Errore: {executionState.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variabili */}
      {Object.keys(executionState.variables).length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2">📊 Variabili</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(executionState.variables).map(([name, value]) => (
              <div
                key={name}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg"
              >
                <div className="text-xs text-gray-600">{name}</div>
                <div className="text-sm font-bold text-gray-800">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
