import React, { useState } from 'react';
import { UploadCloud, FileText, Activity, AlertTriangle, FileCheck, CheckCircle2 } from 'lucide-react';
import { analyzeFeedback, generatePRD } from './services/api';

function App() {
  const [sourceType, setSourceType] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);
  const [prdContent, setPrdContent] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setPrdContent('');

    try {
      if (sourceType === 'text' && !textInput.trim()) {
        throw new Error('Please paste some feedback text.');
      }
      if (sourceType === 'csv' && !fileInput) {
        throw new Error('Please select a CSV file.');
      }

      const result = await analyzeFeedback(sourceType, textInput, fileInput);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePRD = async () => {
    if (!analysisResult?.groupedFeedback) return;
    
    setError('');
    setIsGeneratingPRD(true);
    
    try {
      const prd = await generatePRD(analysisResult.groupedFeedback);
      setPrdContent(prd);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'PRD Generation failed.');
    } finally {
      setIsGeneratingPRD(false);
    }
  };

  return (
    <div className="container">
      <header className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem' }}>Claw</h1>
          <p className="text-muted">Product Feedback to PRD Autonomous Agent</p>
        </div>
        <div className="badge feature">Agent Status: Active</div>
      </header>

      {error && (
        <div className="glass-panel animate-fade-in" style={{ borderColor: 'var(--danger)', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> {error}
          </p>
        </div>
      )}

      {/* Input Section */}
      <section className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={20} className="text-gradient" /> Ingest Feedback
        </h2>
        
        <div className="flex gap-4" style={{ marginBottom: '1rem' }}>
          <button 
            className={`btn ${sourceType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSourceType('text')}
          >
            Paste Text
          </button>
          <button 
            className={`btn ${sourceType === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSourceType('csv')}
          >
            Upload CSV
          </button>
        </div>

        {sourceType === 'text' ? (
          <textarea 
            className="input-field" 
            placeholder="Paste raw customer feedback here (one item per line)..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        ) : (
          <input 
            type="file" 
            accept=".csv"
            className="input-field" 
            onChange={handleFileChange}
          />
        )}

        <div className="flex justify-end" style={{ marginTop: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <><div className="spinner"></div> Analyzing Data...</>
            ) : (
              <><Activity size={18} /> Analyze Feedback</>
            )}
          </button>
        </div>
      </section>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="animate-fade-in">
          
          {/* Metrics Summary */}
          <section className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
            {Object.entries(analysisResult.summary).map(([key, value]) => (
              <div key={key} className="glass-panel flex-col items-center justify-center">
                <span className="text-muted" style={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{value}</span>
              </div>
            ))}
          </section>

          {/* Grouped Feedback Table */}
          <section className="glass-panel" style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={20} className="text-gradient" /> Synthesized Insights
            </h2>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Count</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.groupedFeedback.map((group) => (
                    <tr key={group.id}>
                      <td style={{ fontWeight: 500 }}>{group.topic}</td>
                      <td>
                        <span className={`badge ${group.category.toLowerCase().replace(' ', '')}`}>
                          {group.category}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${group.priority.toLowerCase()}`}>
                          {group.priority}
                        </span>
                      </td>
                      <td>{group.count}</td>
                      <td className="text-muted">{group.description}</td>
                    </tr>
                  ))}
                  {analysisResult.groupedFeedback.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }} className="text-muted">No actionable insights found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end" style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleGeneratePRD}
                disabled={isGeneratingPRD || analysisResult.groupedFeedback.length === 0}
              >
                {isGeneratingPRD ? (
                  <><div className="spinner"></div> Drafting PRD...</>
                ) : (
                  <><FileText size={18} /> Generate PRD</>
                )}
              </button>
            </div>
          </section>

          {/* Human Review Required Section */}
          {analysisResult.humanReviewRequired && analysisResult.humanReviewRequired.length > 0 && (
            <section className="glass-panel" style={{ marginBottom: '2rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Human Review Required
              </h2>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                The agent had low confidence in categorizing the following feedback. Please review manually.
              </p>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Original Text</th>
                      <th>Agent Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.humanReviewRequired.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ maxWidth: '400px', whiteSpace: 'normal', wordWrap: 'break-word' }}>"{item.originalText}"</td>
                        <td className="text-muted" style={{ maxWidth: '400px', whiteSpace: 'normal', wordWrap: 'break-word' }}>{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* PRD Viewer */}
          {prdContent && (
            <section className="glass-panel animate-fade-in" style={{ borderColor: 'var(--success)' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} /> Generated PRD
              </h2>
              
              <div 
                className="glass-panel markdown-body" 
                style={{ background: 'rgba(0,0,0,0.2)', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)', fontSize: '0.95rem' }}
              >
                {prdContent}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
